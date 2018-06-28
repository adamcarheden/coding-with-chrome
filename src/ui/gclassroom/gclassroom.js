/**
 * @fileoverview Google Classroom integration for the Coding with Chrome editor.
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
 * @author efuquen@google.com (Edwin Fuquen)
 */

goog.provide('cwc.ui.GClassroom');

/*goog.require('cwc.config.GClassroom');*/
goog.require('cwc.soy.GClassroom');
goog.require('cwc.ui.Helper');
goog.require('cwc.utils.Events');

goog.require('goog.dom.dataset');
goog.require('goog.events.EventType');


/**
 * @param {!cwc.utils.Helper} helper
 * @constructor
 * @struct
 * @final
 */
cwc.ui.GClassroom = function(helper) {
  /** @type {string} */
  this.name = 'GClassroom';

  /** @type {!cwc.utils.Helper} */
  this.helper = helper;

  /** @type {string} */
  this.prefix = this.helper.getPrefix('gclassroom');

  /** @type {Object} */
  this.data = null;

  /** @type {string} */
  this.dialogType = '';

  /** @type {!string} */
  this.mimeType = 'application/cwc';

  /** @private {!cwc.utils.Events} */
  this.events_ = new cwc.utils.Events(this.name);
};

cwc.ui.GClassroom.prototype.openDialog = function() {
    this.dialogType = 'open';
    this.getMyCourses_(this.handleCourses.bind(this))
}

/**
 * @param {Object} data List of courses.
 */
cwc.ui.GClassroom.prototype.handleCourses = function(data) {
    let courses = data['courses'];
    console.log(courses);
    let courseList = goog.dom.getElement(this.prefix + 'course_list');
    if (!courseList) {
        this.prepareDialog();
    }
    this.updateCourseList(courses);
}

/**
 * Decorates the classroom library.
 */
cwc.ui.GClassroom.prototype.decorate = function() {
  let layoutInstance = this.helper.getInstance('layout');
  if (layoutInstance) {
    let eventTarget = layoutInstance.getEventTarget();
    this.events_.listen(eventTarget, goog.events.EventType.UNLOAD,
        this.cleanUp_, false, this);
  }

  cwc.ui.Helper.mdlRefresh();
}


cwc.ui.GClassroom.prototype.prepareDialog = function() {
  let dialogInstance = this.helper.getInstance('dialog', true);
  let title = {
    title: 'Select course',
  };
  dialogInstance.showTemplate(title, cwc.soy.GClassroom.gClassroomTemplate, {
    prefix: this.prefix
  });
  this.decorate();
}
/**
 * Updates the GClassroom course list with the new courses.
 * @param {Object} files Course list with the result of the search.
 */
cwc.ui.GClassroom.prototype.updateCourseList = function(courses) {
  let courseList = goog.dom.getElement(this.prefix + 'course_list');
  goog.soy.renderElement(
    courseList,
    cwc.soy.GClassroom.gClassroomCourseListTemplate,
    {prefix: this.prefix, courses: courses}
  );
}

/**
 * @param {Object} params
 * @param {function(?)} callback
 * @private
 */
cwc.ui.GClassroom.prototype.getMyCourses_ = function(callback) {
  let accountInstance = this.helper.getInstance('account');
  if (accountInstance) {
    let opts = {
      subdomain: 'classroom',
      path: '/v1/courses',
      params:  {
          'studentId': 'me'
      },
    };
    accountInstance.request(opts, callback);
  } else {
    console.error('GClassroom.getMyCourses missing account');
  }
};

/**
 * @private
 */
cwc.ui.GClassroom.prototype.cleanUp_ = function() {
  this.events_.clear();
};