/**
 * @fileoverview KIDBRIGHT modifications.
 *
 * @license Copyright 2019 Google Inc. All Rights Reserved.
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
 * @author acarheden@google.com (Adam Carheden)
 */
goog.provide('cwc.mode.kidbright.Mod');

goog.require('cwc.mode.kidbright.Connection');
goog.require('cwc.mode.kidbright.Terminal');
goog.require('cwc.mode.kidbright.Toolbar');
goog.require('cwc.mode.kidbright.Editor');
goog.require('cwc.mode.kidbright.Layout');
goog.require('cwc.mode.default.Mod');
goog.require('cwc.utils.Helper');
goog.require('cwc.protocol.aiy.Events');
goog.require('cwc.ui.Blockly');
goog.require('cwc.ui.EditorContent');
goog.require('cwc.utils.Dialog');
goog.require('cwc.utils.Events');
goog.require('cwc.soy.kidbright.Blocks');
goog.require('goog.dom');


/**
 * @constructor
 * @param {!cwc.utils.Helper} helper
 */
cwc.mode.kidbright.Mod = function(helper) {
  /** @type {!cwc.utils.Helper} */
  this.helper = helper;

  /** @type {!cwc.mode.kidbright.Layout} */
  this.layout = new cwc.mode.kidbright.Layout(helper);

  /** @type {!cwc.mode.kidbright.Editor} */
  this.editor = new cwc.mode.kidbright.Editor(helper);

  /** @type {!cwc.mode.kidbright.Terminal} */
  this.terminal = new cwc.mode.kidbright.Terminal(helper);

  /** @type {!cwc.mode.kidbright.Connection} */
  this.connection = new cwc.mode.kidbright.Connection(helper);

  /** @type {!cwc.mode.kidbright.Toolbar} */
  this.toolbar = new cwc.mode.kidbright.Toolbar(helper);

  /** @type {!cwc.utils.Events} */
  this.events = new cwc.utils.Events('KIDBRIGHT', '', this);

  /**  @type {!cwc.ui.Blockly} */
  this.blockly = null;
};


/**
 * Decorates the different parts of the modification.
 */
cwc.mode.kidbright.Mod.prototype.decorate = function() {
  this.layout.decorate();
  this.editor.decorate();
  this.toolbar.decorate();
  this.decorateBlockly();
  this.decorateTerminal();
  this.connection.init();
  this.tryConnect();
  this.initEvents();

  this.toolbar.on('run', this.run.bind(this));
  this.toolbar.on('disconnect', this.disconnect.bind(this));
  this.toolbar.on('terminate', this.terminate.bind(this));

  // Switch buttons
  this.blockly.addOption('Switch to Editor', this.showEditor_.bind(this),
    'Switch to the raw code editor view');
 /*
 // Fails because maybe the compiler is horribly broken
  this.editor.addOption('Switch to Blockly', this.showBlockly_.bind(this),
    'Switch to the Blockly editor mode');
  // Custom Events
  this.blockly.addEditorChangeHandler(
    this.editor.handleSyncEvent.bind(this.editor));
*/

  this.editor.editor.addOption('Switch to Blockly',
    this.showBlockly_.bind(this), 'Switch to the Blockly editor mode');
  // Custom Events
  this.blockly.addEditorChangeHandler(
    this.editor.editor.handleSyncEvent.bind(this.editor.editor));
  // Reset size
  this.blockly.adjustSize();

  this.switchToBlockly_();
};

/**
 * Decorates Blockly
 */
cwc.mode.kidbright.Mod.prototype.decorateBlockly = function() {
  this.blockly = new cwc.ui.Blockly(this.helper);
  this.helper.setInstance('blockly', this.blockly, true);
  this.blockly.decorate();
  this.blockly.setToolboxTemplate(cwc.soy.kidbright.Blocks.toolbox);
};


/**
 * Switches from the Blockly ui to the code editor.
 */
cwc.mode.kidbright.Mod.prototype.showEditor_ = function() {
  this.editor.showEditor(true);
  this.blockly.showBlockly(false);
  this.helper.getInstance('file').setUi('editor');
};


/**
 * Switches from the code editor to the Blockly ui.
 */
cwc.mode.kidbright.Mod.prototype.showBlockly_ = function() {
  let dialogInstance = this.helper.getInstance('dialog');
  dialogInstance.showActionCancel(
    i18t('@@GENERAL__WARNING'),
    i18t('@@BLOCKLY__SWITCHING_TO_BLOCKLY'),
    i18t('@@GENERAL__CONTINUE')
  ).then((answer) => {
    if (answer) {
      this.switchToBlockly_();
    }
  });
};

/**
 * Switches from the code editor to the Blockly ui.
 */
cwc.mode.kidbright.Mod.prototype.switchToBlockly_ = function() {
  this.editor.showEditor(false);
  this.blockly.showBlockly(true);
  this.helper.getInstance('file').setUi('blockly');
};

cwc.mode.kidbright.Mod.prototype.initEvents = function() {
  const eventHandler = this.connection.getEventHandler();
  this.events.listen(eventHandler,
    cwc.protocol.aiy.Events.Type.RECEIVED_DATA_STDERR,
    this.receivedDataErr.bind(this)
  );
  this.events.listen(eventHandler,
    cwc.protocol.aiy.Events.Type.RECEIVED_DATA_STDOUT,
    this.receivedData.bind(this)
  );
  this.events.listen(eventHandler,
    cwc.protocol.aiy.Events.Type.EXIT,
    this.receivedExit.bind(this)
  );
  this.events.listen(eventHandler,
    cwc.protocol.aiy.Events.Type.CONNECTED,
    this.receivedConnected.bind(this)
  );
  this.events.listen(eventHandler,
    cwc.protocol.aiy.Events.Type.DISCONNECTED,
    this.receivedDisconnected.bind(this)
  );
};


/**
 * Decorates console
 */
cwc.mode.kidbright.Mod.prototype.decorateTerminal = async function() {
  this.helper.setInstance('terminal', this.terminal, true);
  await this.terminal.decorate();
  this.terminal.write('Waiting for connection ...');
};


/**
 * Run code
 */
cwc.mode.kidbright.Mod.prototype.run = async function() {
  const editorInstance = this.editor.editor;
  let pythonCode = editorInstance.getEditorContent(
    cwc.ui.EditorContent.PYTHON);
  try {
    await this.connection.connectAndSendRun(pythonCode);
    this.terminal.writemetaln('<process starting>');
  } catch (error) {
    // Rethrow unless the user cancelled
    if (String(error) !== 'Error: Cancelled') {
      throw error;
    }
  }
};


/**
 * Disconnect
 */
cwc.mode.kidbright.Mod.prototype.disconnect = function() {
  this.connection.disconnect();
};


/**
 * Terminates the running process
 */
cwc.mode.kidbright.Mod.prototype.terminate = function() {
  this.connection.sendTerminate();
};


/**
 * Handles the disconnect event.
 * @param {Event} opt_event
 * @private
 */
cwc.mode.kidbright.Mod.prototype.tryConnect = function(opt_event) {
  try {
    this.connection.connectUSB();
  } catch (error) {
    // USB is not connected - proceed without connection
  }
};


/**
 * Handles the received data event from KIDBRIGHT.
 * @param {Event} event
 * @private
 */
cwc.mode.kidbright.Mod.prototype.receivedData = function(event) {
  this.terminal.write(event.data);
};


/**
 * Handles the received stderr data event from KIDBRIGHT.
 * @param {Event} event
 * @private
 */
cwc.mode.kidbright.Mod.prototype.receivedDataErr = function(event) {
  this.terminal.error(event.data);
};


/**
 * Handles the process exit event.
 * @param {Event} opt_event
 * @private
 */
cwc.mode.kidbright.Mod.prototype.receivedExit = function(opt_event) {
  this.terminal.writemetaln('<process terminated>');
  this.connection.reconnect();
};


/**
 * Handles the connect event.
 * @param {Event} opt_event
 * @private
 */
cwc.mode.kidbright.Mod.prototype.receivedConnected = function(opt_event) {
  this.toolbar.setStatus('Connected');
};


/**
 * Handles the disconnect event.
 * @param {Event} opt_event
 * @private
 */
cwc.mode.kidbright.Mod.prototype.receivedDisconnected = function(opt_event) {
  this.toolbar.setStatus('Not connected');
};
