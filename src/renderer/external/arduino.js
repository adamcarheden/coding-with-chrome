/**
 * @fileoverview Arduino renderer.
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
goog.provide('cwc.renderer.external.Arduino');

goog.require('cwc.ui.EditorContent');
goog.require('cwc.file.Files');
goog.require('cwc.framework.Internal');
goog.require('cwc.renderer.Helper');
goog.require('cwc.utils.Helper');


/**
 * @constructor
 * @param {!cwc.utils.Helper} helper
 * @struct
 * @final
 */
cwc.renderer.external.Arduino = function(helper) {
  /** @type {!cwc.utils.Helper} */
  this.helper = helper;

  /** @private {cwc.Cache} */
  this.cache_ = this.helper.getInstance('cache');

  /** @private {!Array} */
  this.frameworks_ = [
    cwc.framework.Internal.ARDUINO,
  ];
};


/**
 * Initializes and defines the Arduino renderer.
 * @return {!Promise}
 */
cwc.renderer.external.Arduino.prototype.init = function() {
  this.helper.getInstance('renderer').setRenderer(this.render.bind(this));
  return this.cache_.preloadFiles(this.frameworks_);
};


/**
 * Arduino render logic.
 * @param {Object} editorContent
 * @param {cwc.file.Files} libraryFiles
 * @param {cwc.renderer.Helper} rendererHelper
 * @return {string}
 * @export
 */
cwc.renderer.external.Arduino.prototype.render = function(
    editorContent,
    libraryFiles,
    rendererHelper) {
  let header = rendererHelper.getCacheFilesHeader(
    this.frameworks_, this.cache_);
  let body = '\n<script>' +
      '  let customCode = function(arduino) {\n' +
      editorContent[cwc.ui.EditorContent.DEFAULT] +
      '\n};\n' + '  let runner = new cwc.framework.Runner();\n' +
      '  let customFramework = new cwc.framework.Arduino(runner);\n' +
      '  customFramework.listen(customCode);\n' +
      '</script>\n';
  return rendererHelper.getHTML(body, header);
};
