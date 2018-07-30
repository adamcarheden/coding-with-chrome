/**
 * @fileoverview Menu Bar for the Coding with Chrome editor.
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
goog.provide('cwc.ui.MenuBar');

goog.require('cwc.lib.protocol.bluetoothChrome.Events');
goog.require('cwc.soy.MenuBar');
goog.require('cwc.ui.Helper');
goog.require('cwc.utils.Events');
goog.require('cwc.utils.Gamepad.Events');
goog.require('cwc.utils.Logger');

goog.require('goog.dom');
goog.require('goog.dom.fullscreen');
goog.require('goog.soy');


goog.scope(function() {
const BluetoothEvents =
  goog.module.get('cwc.lib.protocol.bluetoothChrome.Events');

/**
 * @param {!cwc.utils.Helper} helper
 * @constructor
 * @struct
 * @final
 */
cwc.ui.MenuBar = function(helper) {
  /** @type {string} */
  this.name = 'Menu Bar';

  /** @type {!cwc.utils.Helper} */
  this.helper = helper;

  /** @type {string} */
  this.prefix = this.helper.getPrefix('menu-bar');

  /** @type {Element} */
  this.node = null;

  /** @type {Element} */
  this.nodeAccountLogin = null;

  /** @type {Element} */
  this.nodeAccountLogout = null;

  /** @type {Element} */
  this.nodeBluetooth = null;

  /** @type {Element} */
  this.nodeBluetoothConnected = null;

  /** @type {Element} */
  this.nodeBluetoothDisabled = null;

  /** @type {Element} */
  this.nodeSerial = null;

  /** @type {Element} */
  this.nodeSerialConnected = null;

  /** @type {Element} */
  this.nodeSerialDisabled = null;

  /** @type {Element} */
  this.nodeGamepad = null;

  /** @type {Element} */
  this.nodeGamepadConnected = null;

  /** @type {Element} */
  this.nodeMaximizeButton = null;

  /** @type {Element} */
  this.nodeRestoreButton = null;

  /** @type {boolean|undefined} */
  this.bluetooth = undefined;

  /** @type {boolean|undefined} */
  this.bluetoothConnectStatus = undefined;

  /** @type {boolean|undefined} */
  this.serial = undefined;

  /** @type {boolean|undefined} */
  this.serialConnectStatus = undefined;

  /** @private {boolean} */
  this.isChromeApp_ = this.helper.checkChromeFeature('app');

  /** @private {boolean} */
  this.isChromeOS_ = this.helper.checkChromeFeature('os');

  /** @private {!cwc.utils.Events} */
  this.events_ = new cwc.utils.Events(this.name, this.prefix, this);

  /** @type {!cwc.utils.Logger} */
  this.log_ = new cwc.utils.Logger(this.name);
};


/**
 * Decorates the given node and adds the menu bar.
 * @param {Element} node The target node to add the menu bar.
 */
cwc.ui.MenuBar.prototype.decorate = function(node) {
  this.log_.info('Derocate into', node);
  this.node = node;

  goog.soy.renderElement(
    this.node,
    cwc.soy.MenuBar.template, {
      'prefix': this.prefix,
      'language': this.helper.getUserLanguage(),
    }
  );

  this.decorateApiButton();
  this.decorateHardwareButton();
  this.decorateGuiButton();
};


cwc.ui.MenuBar.prototype.decorateApiButton = function() {
  // Account body
  goog.style.setElementShown(goog.dom.getElement(this.prefix + 'account-body'),
    !this.isChromeOS_ && this.helper.checkChromeFeature('manifest.oauth2'));

  // Account login
  this.nodeAccountLogin = goog.dom.getElement(this.prefix + 'account');
  this.events_.listen(this.nodeAccountLogin, goog.events.EventType.CLICK,
    this.loginAccount, false, this);

  // Account logout
  this.nodeAccountLogout = goog.dom.getElement(this.prefix + 'account-logout');
  this.events_.listen(this.nodeAccountLogout, goog.events.EventType.CLICK,
    this.logoutAccount);
};


cwc.ui.MenuBar.prototype.decorateHardwareButton = function() {
  let dialogInstance = this.helper.getInstance('dialog');

  // Bluetooth body
  goog.style.setElementShown(
    goog.dom.getElement(this.prefix + 'bluetooth-body'),
    this.helper.checkChromeFeature('bluetooth'));

  // Bluetooth enabled
  this.nodeBluetooth = goog.dom.getElement(this.prefix + 'bluetooth');
  this.events_.listen(this.nodeBluetooth, goog.events.EventType.CLICK,
    function() {
      let connectScreenInstance = this.helper.getInstance('connectScreen');
      connectScreenInstance.showBluetoothDevices();
    });

  // Bluetooth connected
  this.nodeBluetoothConnected = goog.dom.getElement(
    this.prefix + 'bluetooth-connected');
  this.events_.listen(this.nodeBluetoothConnected, goog.events.EventType.CLICK,
    function() {
      let connectScreenInstance = this.helper.getInstance('connectScreen');
      connectScreenInstance.showBluetoothDevices();
    });

  // Bluetooth disabled
  this.nodeBluetoothDisabled = goog.dom.getElement(
    this.prefix + 'bluetooth-disabled');
  this.events_.listen(this.nodeBluetoothDisabled, goog.events.EventType.CLICK,
    this.checkBluetoothState_);

  // Serial body
  goog.style.setElementShown(goog.dom.getElement(this.prefix + 'serial-body'),
    this.helper.checkChromeFeature('serial'));

  // Serial enabled
  this.nodeSerial = goog.dom.getElement(this.prefix + 'serial');
  this.events_.listen(this.nodeSerial, goog.events.EventType.CLICK, function() {
    let connectScreenInstance = this.helper.getInstance('connectScreen');
    connectScreenInstance.showSerialDevices();
  });

  // Serial connected
  this.nodeSerialConnected = goog.dom.getElement(
    this.prefix + 'serial-connected');
  this.events_.listen(this.nodeSerialConnected, goog.events.EventType.CLICK,
    function() {
      let connectScreenInstance = this.helper.getInstance('connectScreen');
      connectScreenInstance.showSerialDevices();
    });

  // Serial disabled
  this.nodeSerialDisabled = goog.dom.getElement(
    this.prefix + 'serial-disabled');

  if (this.helper.checkChromeFeature('serial')) {
    this.setSerialEnabled(true);
  }

  // Gamepad
  goog.style.setElementShown(goog.dom.getElement(this.prefix + 'gamepad-body'),
    this.helper.checkBrowserFeature('Gamepad'));
  let gamepadInstance = this.helper.getInstance('gamepad');
  this.nodeGamepad = goog.dom.getElement(this.prefix + 'gamepad');
  this.events_.listen(
    this.nodeGamepad, goog.events.EventType.CLICK, () => {
      dialogInstance.showAlert('Enable Gamepad support',
        'Please turn on the Gamepad and press any of the buttons.');
    });
  this.events_.listen(gamepadInstance.getEventTarget(),
    /** @type {string} */ (cwc.utils.Gamepad.Events.Type.CONNECTED), () => {
      dialogInstance.close('Enable Gamepad support');
      this.setGamepad(true);
    });
  this.events_.listen(gamepadInstance.getEventTarget(),
    /** @type {string} */ (cwc.utils.Gamepad.Events.Type.DISCONNECTED), () => {
      this.setGamepad(false);
    });
  this.nodeGamepadConnected = goog.dom.getElement(
    this.prefix + 'gamepad-connected');
  this.setGamepad(false);

  // Event Handling
  let bluetoothInstance = this.helper.getInstance('bluetoothChrome');
  if (bluetoothInstance) {
    this.events_.listen(bluetoothInstance.getEventTarget(),
      BluetoothEvents.Type.ADAPTER_STATE_CHANGE,
      this.handleBluetoothAdapterChange_);
    this.events_.listen(bluetoothInstance.getEventTarget(),
      BluetoothEvents.Type.DEVICE_STATE_CHANGE,
      this.handleBluetoothDeviceChange_);
  }
};


cwc.ui.MenuBar.prototype.decorateGuiButton = function() {
  // Close button
  let nodeCloseButton = goog.dom.getElement(this.prefix + 'close');
  this.events_.listen(nodeCloseButton, goog.events.EventType.CLICK,
    this.closeWindow);

  // Language icon
  this.events_.listen(
    'language', goog.events.EventType.CLICK, this.changeLanguage);

  // Minimize icon
  let nodeMinimizeButton = goog.dom.getElement(this.prefix + 'minimize');
  this.events_.listen(
    nodeMinimizeButton, goog.events.EventType.CLICK, this.minimizeWindow);

  // Maximize icon
  this.nodeMaximizeButton = goog.dom.getElement(this.prefix + 'maximize');
  this.events_.listen(
    this.nodeMaximizeButton, goog.events.EventType.CLICK, () => {
      let guiInstance = this.helper.getInstance('gui');
      if (guiInstance) {
        guiInstance.setFullscreen(true);
      }
    });

  // Restore icon
  this.nodeRestoreButton = goog.dom.getElement(this.prefix + 'restore');
  this.events_.listen(
    this.nodeRestoreButton, goog.events.EventType.CLICK, () => {
      let guiInstance = this.helper.getInstance('gui');
      if (guiInstance) {
        guiInstance.setFullscreen(false);
      }
    });

  // Shows maximize / restore icon based on available fullscreen support.
  if (this.isChromeApp_ && chrome.app.window) {
    this.setFullscreen(chrome.app.window.current()['isFullscreen']());
  } else if (goog.dom.fullscreen.isSupported()) {
    this.setFullscreen(goog.dom.fullscreen.isFullScreen());
  } else {
    goog.style.setElementShown(this.nodeMaximizeButton, false);
    goog.style.setElementShown(this.nodeRestoreButton, false);
  }

  // Fullscreen listener.
  if (this.isChromeApp_ && chrome.app.window) {
    chrome.app.window.current().onFullscreened.addListener(() => {
      this.setFullscreen(true);
    });
    chrome.app.window.current().onRestored.addListener(() => {
      this.setFullscreen(false);
    });
  } else if (goog.dom.fullscreen.isSupported()) {
    this.events_.listen(window, goog.dom.fullscreen.EventType.CHANGE, () => {
      this.setFullscreen(goog.dom.fullscreen.isFullScreen());
    });
  }

  // Show specific buttons for Chrome Apps only!
  if (!this.isChromeApp_) {
    goog.style.setElementShown(nodeCloseButton, false);
    goog.style.setElementShown(nodeMinimizeButton, false);
  }
};


/**
 * Changes the language.
 */
cwc.ui.MenuBar.prototype.changeLanguage = function() {
  this.helper.getInstance('language').selectLanguage();
};


/**
 * Sets authentication for the current view.
 * @param {boolean} auth Determinate if user is authenticated.
 */
cwc.ui.MenuBar.prototype.setAuthenticated = function(auth) {
  goog.style.setElementShown(this.nodeAccountLogin, !auth);
  goog.style.setElementShown(this.nodeAccountLogout, auth);
};


/**
 * Logs in into Google Account for gDrive integration.
 */
cwc.ui.MenuBar.prototype.loginAccount = function() {
  this.helper.getInstance('account').authenticate();
};


/**
 * Logs out of current Google Account.
 */
cwc.ui.MenuBar.prototype.logoutAccount = function() {
  this.helper.getInstance('account').deauthenticate();
};


/**
 * Shows new file dialog.
 */
cwc.ui.MenuBar.prototype.requestShowSelectScreen = function() {
  let selectScreenInstance = this.helper.getInstance('selectScreen');
  if (selectScreenInstance) {
    selectScreenInstance.requestShowSelectScreen();
  }
};


/**
 * Request to close the editor window.
 */
cwc.ui.MenuBar.prototype.closeWindow = function() {
  let guiInstance = this.helper.getInstance('gui');
  if (guiInstance) {
    guiInstance.requestClose();
  }
};


/**
 * Minimize editor window.
 */
cwc.ui.MenuBar.prototype.minimizeWindow = function() {
  let guiInstance = this.helper.getInstance('gui');
  if (guiInstance) {
    guiInstance.minimize();
  }
};


/**
 * @param {boolean} fullscreen
 */
cwc.ui.MenuBar.prototype.setFullscreen = function(fullscreen) {
  goog.style.setElementShown(this.nodeMaximizeButton, !fullscreen);
  goog.style.setElementShown(this.nodeRestoreButton, fullscreen);
};


/**
 * @param {Event=} opt_event
 * @private
 */
cwc.ui.MenuBar.prototype.checkBluetoothState_ = function(opt_event) {
  this.helper.showInfo('Checking bluetooth state ...');
  let bluetoothInstance = this.helper.getInstance('bluetoothChrome');
  if (bluetoothInstance) {
    bluetoothInstance.updateAdapterState();
  }
};


/**
 * @param {boolean} enabled
 */
cwc.ui.MenuBar.prototype.setSerialEnabled = function(enabled) {
  if (this.helper.checkChromeFeature('serial')) {
    if (this.serial != enabled) {
      this.log_.info('Set Serial to', enabled ? 'enabled' : 'disabled');
    }
    goog.style.setElementShown(this.nodeSerial, enabled);
    goog.style.setElementShown(this.nodeSerialConnected, false);
    goog.style.setElementShown(this.nodeSerialDisabled, !enabled);
  }
  this.serial = enabled;
};


/**
 * @param {boolean} connected
 */
cwc.ui.MenuBar.prototype.setSerialConnected = function(connected) {
  if (this.helper.checkChromeFeature('serial') && this.serial) {
    if (this.serialConnectStatus != connected) {
      this.log_.info('Set Serial status to',
        connected ? 'connected' : 'disconnected');
    }
    goog.style.setElementShown(this.nodeSerial, !connected);
    goog.style.setElementShown(this.nodeSerialConnected, connected);
    goog.style.setElementShown(this.nodeSerialDisabled, false);
  } else {
    this.setSerialEnabled(false);
  }
  this.serialConnectStatus = connected;
};


/**
 * @param {boolean} connected
 */
cwc.ui.MenuBar.prototype.setGamepad = function(connected) {
  goog.style.setElementShown(this.nodeGamepad, !connected);
  goog.style.setElementShown(this.nodeGamepadConnected, connected);
};


/**
 * @param {string} language
 */
cwc.ui.MenuBar.prototype.setLanguage = function(language) {
  goog.dom.getElement(this.prefix + 'badge-language').dataset.badge = language;
};


/**
 * @param {?} e
 * @private
 */
cwc.ui.MenuBar.prototype.handleBluetoothAdapterChange_ = function(e) {
  if (this.bluetooth === e.data.enabled) {
    return;
  }
  goog.style.setElementShown(this.nodeBluetooth, e.data.enabled);
  goog.style.setElementShown(this.nodeBluetoothConnected, false);
  goog.style.setElementShown(this.nodeBluetoothDisabled, !e.data.enabled);
  this.bluetooth = e.data.enabled;
};


/**
 * @param {?} e
 * @private
 */
cwc.ui.MenuBar.prototype.handleBluetoothDeviceChange_ = function(e) {
  if (this.bluetoothConnectStatus === e.data.connected) {
    return;
  }
  goog.style.setElementShown(this.nodeBluetooth, !e.data.connected);
  goog.style.setElementShown(this.nodeBluetoothConnected, e.data.connected);
  goog.style.setElementShown(this.nodeBluetoothDisabled, false);
  this.bluetoothConnectStatus = e.data.connected;
};


/**
 * Cleans up the event listener and any other modification.
 * @private
 */
cwc.ui.MenuBar.prototype.cleanUp_ = function() {
  this.events_.clear();
};
});
