/**
 * @fileoverview Custom file definition to handle file data.
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
goog.provide('cwc.file.File');

goog.require('cwc.utils.mime.getTypeByNameAndContent');


/**
 * @param {string} name
 * @param {string} content
 * @param {string=} type
 * @param {number=} size
 * @constructor
 * @struct
 * @final
 */
cwc.file.File = function(name, content, type, size) {
  /** @private {string} */
  this.name_ = name;

  /** @private {string} */
  this.content_ = content || '';

  /** @private {string} */
  this.type_ = type || cwc.utils.mime.getTypeByNameAndContent(name, content);

  /** @private {string} */
  this.mediaType_ = cwc.file.File.getMediaType(this.type_);

  /** @private {number} */
  this.size_ = size || this.content_.length || 0;

  /** @private {number} */
  this.version_ = 1;
};


/**
 * @param {string} content
 */
cwc.file.File.prototype.setContent = function(content) {
  this.content_ = content;
};


/**
 * @return {string}
 */
cwc.file.File.prototype.getContent = function() {
  return this.content_;
};


/**
 * @return {string}
 */
cwc.file.File.prototype.getRawContent = function() {
  if (this.content_.includes('data:')) {
    return atob(this.content_.split(',')[1]);
  }
  return atob(this.content_);
};


/**
 * @return {string}
 */
cwc.file.File.prototype.getName = function() {
  return this.name_;
};


/**
 * @return {string}
 */
cwc.file.File.prototype.getMacroName = function() {
  return '{{ file:' + this.getName() + ' }}';
};


/**
 * @return {string}
 */
cwc.file.File.prototype.getType = function() {
  return this.type_;
};


/**
 * @return {string}
 */
cwc.file.File.prototype.getMediaType = function() {
  return this.mediaType_;
};


/**
 * @return {number}
 */
cwc.file.File.prototype.getSize = function() {
  return this.size_;
};


/**
 * @return {Object}
 */
cwc.file.File.prototype.toJSON = function() {
  return {
    'content': this.content_,
    'name': this.name_,
    'size': this.size_,
    'type': this.type_,
    'version': this.version_,
  };
};


/**
 * @return {string}
 */
cwc.file.File.prototype.getJSON = function() {
  return JSON.stringify(this.toJSON(), null, 2);
};


/**
 * @param {string} mimeType
 * @return {string}
 */
cwc.file.File.getMediaType = function(mimeType) {
  let type = mimeType.split('/')[0];
  switch (type) {
    case 'application':
    case 'audio':
    case 'example':
    case 'image':
    case 'message':
    case 'model':
    case 'multipart':
    case 'text':
    case 'video':
      return type;
    default:
      return '';
  }
};
