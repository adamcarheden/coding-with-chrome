/**
 * @fileoverview Handles the pairing and communication with USB devices.
 *
 * @license Copyright 2015 The Coding with Chrome Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author mbordihn@google.com (Markus Bordihn)
 */
goog.provide('cwc.protocol.serial.Devices');

goog.require('cwc.protocol.serial.Device');
goog.require('cwc.protocol.Serial.supportedDevicePaths');
goog.require('cwc.protocol.Serial.supportedDevices');
goog.require('cwc.protocol.Serial.unsupportedDevicePaths');
goog.require('cwc.utils.Events');
goog.require('cwc.utils.Logger');

goog.require('goog.Timer');


/**
 * @param {!cwc.utils.Helper} helper
 * @constructor
 */
cwc.protocol.serial.Devices = function(helper) {
  /** @type {string} */
  this.name = 'Serial Devices';

  /** @type {!cwc.utils.Helper} */
  this.helper = helper;

  /** @type {Object} */
  this.devices = {};

  /** @type {Object} */
  this.connectionIds = {};

  /** @type {number} */
  this.updateDevicesInterval = 5000;

  /** @type {!goog.Timer} */
  this.deviceMonitor = new goog.Timer(this.updateDevicesInterval);

  /** @private {cwc.protocol.serial.Device} */
  this.connectedDevice_ = null;

  /** @private {!cwc.utils.Events} */
  this.events_ = new cwc.utils.Events(this.name);

  /** @private {string} */
  this.deviceCache_ = '';

  /** @private {!cwc.utils.Logger} */
  this.log_ = new cwc.utils.Logger(this.name);
};


/**
 * @export
 */
cwc.protocol.serial.Devices.prototype.prepare = function() {
  if (this.prepared) {
    return;
  }

  this.log_.debug('Preparing ...');
  this.events_.listen(this.deviceMonitor, goog.Timer.TICK,
      this.updateDevices.bind(this));
  this.deviceMonitor.start();
  this.updateDevices();
  this.preapred = true;
};


/**
 * @export
 */
cwc.protocol.serial.Devices.prototype.updateDevices = function() {
  chrome.serial.getDevices(this.handleGetDevices_.bind(this));
};


/**
 * @param {string} device_path
 * @return {cwc.protocol.serial.Device}
 * @export
 */
cwc.protocol.serial.Devices.prototype.getDevice = function(device_path) {
  if (device_path in this.devices) {
    return this.devices[device_path];
  }
  this.log_.error('The following device id is unknown:', device_path);
  return null;
};


/**
 * @return {cwc.protocol.serial.Device}
 * @export
 */
cwc.protocol.serial.Devices.prototype.getConnectedDevice = function() {
  if (this.connectedDevice_ && this.connectedDevice_.isConnected()) {
    return this.connectedDevice_;
  }
  this.log_.error('Unable to find any connected device!');
  return null;
};


/**
 * @return {Object}
 * @export
 */
cwc.protocol.serial.Devices.prototype.getDevices = function() {
  return this.devices;
};


/**
 * @param {string} connection_id
 * @param {ArrayBuffer} data
 * @export
 */
cwc.protocol.serial.Devices.prototype.receiveData = function(
    connection_id, data) {
  if (connection_id in this.connectionIds) {
    this.connectionIds[connection_id].handleData(data);
  }
};


/**
 * @param {string} connection_id
 * @param {string} error
 * @export
 */
cwc.protocol.serial.Devices.prototype.receiveError = function(
    connection_id, error) {
  if (connection_id in this.connectionIds) {
    this.connectionIds[connection_id].handleError(error);
  }
};


/**
 * @param {string} device_path
 * @param {number} connection_id
 * @private
 */
cwc.protocol.serial.Devices.prototype.handleConnect_ = function(
    device_path, connection_id) {
  this.log_.debug('Connect', device_path, connection_id);
  this.connectionIds[connection_id] = this.devices[device_path];
  this.connectedDevice_ = this.devices[device_path];

  let menubarInstance = this.helper.getInstance('menuBar');
  if (menubarInstance) {
    menubarInstance.setSerialConnected(true);
  }
};


/**
 * @param {string} device_path
 * @param {number} connection_id
 * @private
 */
cwc.protocol.serial.Devices.prototype.handleDisconnect_ = function(
    device_path, connection_id) {
  this.log_.debug('Disconnect', device_path, connection_id);
  this.connectionIds[connection_id] = null;
  this.connectedDevice_ = null;

  let menubarInstance = this.helper.getInstance('menuBar');
  if (menubarInstance) {
    menubarInstance.setSerialConnected(false);
  }
};


/**
 * @param {?} devices
 * @private
 */
cwc.protocol.serial.Devices.prototype.handleGetDevices_ = function(
    devices) {
  if (devices && this.deviceCache_ &&
      this.deviceCache_ === JSON.stringify(devices.sort())) {
    return;
  }

  let filteredDevices = [];
  if (!devices || devices.length == 0) {
    this.log_.warn('Did not find any serial devices!');
  } else {
    let unsupportedPaths = cwc.protocol.Serial.unsupportedDevicePaths;
    for (let i = 0; i < devices.length; i++) {
      if (devices[i].path in unsupportedPaths) {
        this.log_.debug('Ignored device:', devices[i]);
      } else {
        this.log_.debug('Found device:', devices[i]);
        filteredDevices.push(devices[i]);
      }
    }
  }

  if (!filteredDevices) {
    this.log_.warn('Did not find any supported serial device!');
  } else {
    let supportedDevices = cwc.protocol.Serial.supportedDevices;
    let supportedPaths = cwc.protocol.Serial.supportedDevicePaths;
    this.log_.debug('Found', filteredDevices.length, ' devices...');
    for (let i = 0; i < filteredDevices.length; i++) {
      let deviceEntry = filteredDevices[i];
      let devicePath = deviceEntry['path'];
      if (!(devicePath in this.devices)) {
        let displayName = deviceEntry['displayName'] || '';
        let productId = deviceEntry['productId'];
        let vendorId = deviceEntry['vendorId'];
        let device = new cwc.protocol.serial.Device(
          devicePath, vendorId, productId, displayName);

        if (vendorId in supportedDevices &&
            productId in supportedDevices[vendorId]) {
          device.setName(supportedDevices[vendorId][productId]['name']);
          device.setSupported(true);
        } else if (devicePath in supportedPaths) {
          device.setName(supportedPaths[devicePath]['name']);
          device.setSupported(true);
        }

        device.setConnectEvent(this.handleConnect_.bind(this));
        device.setDisconnectEvent(this.handleDisconnect_.bind(this));
        this.devices[devicePath] = device;
      }
    }
  }
  this.deviceCache_ = JSON.stringify(devices.sort());
};
