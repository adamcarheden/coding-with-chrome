/**
 * @fileoverview Message pane.
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
 * @author mbordihn@google.com (Markus Bordihn)
 */
goog.provide('cwc.ui.Message');

goog.require('cwc.soy.ui.Message');
goog.require('cwc.utils.Logger');


/**
 * Class represents the message pane inside the ui.
 * @param {!cwc.utils.Helper} helper
 * @constructor
 * @struct
 * @final
 */
cwc.ui.Message = function(helper) {
  /** @type {string} */
  this.name = 'Message';

  /** @type {!cwc.utils.Helper} */
  this.helper = helper;

  /** @type {string} */
  this.prefix = this.helper.getPrefix('message');

  /** @type {Element} */
  this.node = null;

  /** @type {Element} */
  this.nodeMain = null;

  /** @type {Element} */
  this.nodeHelp = null;

  /** @private {!cwc.utils.Logger|null} */
  this.log_ = new cwc.utils.Logger(this.name);
};


/**
 * @param {Element=} node
 */
cwc.ui.Message.prototype.decorate = function(node) {
  this.node = node || goog.dom.getElement(this.prefix + 'chrome');
  if (!this.node) {
    this.log_.error('Invalid Status node:', this.node);
    return;
  }

  goog.soy.renderElement(
      this.node,
      cwc.soy.ui.Message.template, {
        'prefix': this.prefix,
      }
  );

  this.show(false);
};


/**
 * @param {boolean} visible
 */
cwc.ui.Message.prototype.show = function(visible) {
  goog.style.setElementShown(this.node, visible);
};


/**
 * @param {!function (Object, null=, (Object<string,*>|null)=)} template
 * @param {!Object} values
 */
cwc.ui.Message.prototype.renderContent = function(template, values) {
  goog.soy.renderElement(
    goog.dom.getElement(this.prefix + 'main'), template, values);
};

/**
 * @param {!function (Object, null=, (Object<string,*>|null)=)} template
 * @param {!Object} values
 */
cwc.ui.Message.prototype.renderHelp = function(template, values) {
  goog.soy.renderElement(
    goog.dom.getElement(this.prefix + 'help'), template, values);
};
