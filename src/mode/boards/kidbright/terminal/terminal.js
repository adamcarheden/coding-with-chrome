/**
 * @fileoverview Terminal
 *
 * @license Copyright 2018 The Coding with Chrome Authors.
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
 * @author fstanis@google.com (Filip Stanis)
 */
goog.provide('cwc.mode.kidbright.Terminal');

goog.require('cwc.soy.mode.kidbright.Terminal');
goog.require('cwc.utils.Events');
goog.require('cwc.utils.Logger');

goog.require('goog.dom.classlist');


/**
 * Class represents the console the UI.
 * @param {!cwc.utils.Helper} helper
 * @constructor
 * @struct
 * @final
 */
cwc.mode.kidbright.Terminal = function(helper) {
  /** @type {string} */
  this.name = 'KIDBRIGHT Terminal';

  /** @type {!cwc.utils.Helper} */
  this.helper = helper;

  /** @type {string} */
  this.prefix = this.helper.getPrefix('kidbright-terminal');

  /** @type {Element} */
  this.node = null;

  /** @type {Element} */
  this.nodeContent = null;

  /** @private {!cwc.utils.Events} */
  this.events_ = new cwc.utils.Events(this.name, this.prefix, this);

  /** @private {!cwc.utils.Logger|null} */
  this.log_ = new cwc.utils.Logger(this.name);
};


/**
 * Decorates the given node and adds the terminal to the ui.
 * @param {Element} node The target node to add the status bar.
 */
cwc.mode.kidbright.Terminal.prototype.decorate = function(node) {
  this.node = node || goog.dom.getElement(this.prefix + 'chrome');
  if (!this.node) {
    this.log_.error('Invalid Terminal node:', this.node);
    return;
  }

  goog.soy.renderElement(
    this.node,
    cwc.soy.mode.kidbright.Terminal.template, {
      'prefix': this.prefix,
    }
  );

  this.nodeContent = goog.dom.getElement(this.prefix + 'content');

  this.events_.listen('clear', goog.events.EventType.CLICK, function() {
    this.clear();
  });
};


/**
 * Clears terminal including the history.
 */
cwc.mode.kidbright.Terminal.prototype.clear = function() {
  this.log_.info('Clear terminal');
  goog.dom.removeChildren(this.nodeContent);
};


/**
 * Write text content into terminal content.
 * @param {string} content
 * @param {string} className
 */
cwc.mode.kidbright.Terminal.prototype.write_ = function(content, className) {
  if (!content) {
    return;
  }
  if (this.nodeContent) {
    let nodeEntry = document.createElement('div');
    nodeEntry.appendChild(document.createTextNode(content));
    nodeEntry.className = this.prefix + 'content-entry';
    if (className) {
      nodeEntry.classList.add(className);
    }
    this.nodeContent.appendChild(nodeEntry);
    this.nodeContent.scrollTo(0, this.nodeContent.scrollHeight);
  }
};


/**
 * Write text content into terminal content.
 * @param {string} content
 */
cwc.mode.kidbright.Terminal.prototype.write = function(content) {
  this.write_(content);
};


/**
 * @param {string} content
 */
cwc.mode.kidbright.Terminal.prototype.writeln = function(content) {
  this.write(content + '\n');
};


/**
 * Write text content into terminal content that represents error messages
 * (e.g. STDERR).
 * @param {string} content
 */
cwc.mode.kidbright.Terminal.prototype.error = function(content) {
  this.write_(content, 'error');
};


/**
 * @param {string} content
 */
cwc.mode.kidbright.Terminal.prototype.errorln = function(content) {
  this.error(content + '\n');
};


/**
 * Write text content into terminal content that represents metadata (i.e.
 * not direct output).
 * @param {string} content
 */
cwc.mode.kidbright.Terminal.prototype.writemeta = function(content) {
  this.write_(content, 'meta');
};


/**
 * @param {string} content
 */
cwc.mode.kidbright.Terminal.prototype.writemetaln = function(content) {
  this.writemeta(content + '\n');
};


/**
 * @param {goog.events.EventLike} event
 * @private
 */
cwc.mode.kidbright.Terminal.prototype.handleKey_ = function(event) {
  switch (event.identifier) {
    case 'clear':
      this.clear();
      break;
    default:
      console.log(event);
  }
};
