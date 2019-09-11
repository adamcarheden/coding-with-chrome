/**
 * @fileoverview Editor for the KIDBRIGHT modification.
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
goog.provide('cwc.mode.kidbright.Editor');

goog.require('cwc.ui.Editor');
goog.require('cwc.ui.Helper');


/**
 * @constructor
 * @param {!cwc.utils.Helper} helper
 * @struct
 * @final
 */
cwc.mode.kidbright.Editor = function(helper) {
  /** @type {Element} */
  this.node = null;

  /** @type {Element} */
  this.nodeEditor = null;

  /** @type {cwc.ui.Editor} */
  this.editor = new cwc.ui.Editor(helper, 'python');

  /** @type {!cwc.utils.Helper} */
  this.helper = helper;

  /** @type {string} */
  this.prefix = helper.getPrefix('kidbright-editor');
};


/**
 * Decorates the simple editor.
 */
cwc.mode.kidbright.Editor.prototype.decorate = function() {
  this.node = goog.dom.getElement(this.prefix + 'editor-chrome');
  this.helper.setInstance('editor', this.editor, true);
  this.editor.decorate(this.node);
  this.editor.showMode(false);
  this.editor.showExpandButton(false);
};

/**
 * Shows/Hides the editor.
 * @param {boolean} visible
 */
cwc.mode.kidbright.Editor.prototype.showEditor = function(visible) {
  this.editor.showEditor(visible);
};

/**
 * @param {string} name
 * @param {!function()} func
 * @param {string=} tooltip
 */
cwc.mode.kidbright.Editor.prototype.addOption = function(name, func, tooltip) {
  this.editor(name, func, tooltip);
};
