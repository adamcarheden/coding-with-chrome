/**
 * @fileoverview Tutorial Addnon Step.
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
goog.provide('cwc.addon.tutorial.Step');

goog.require('cwc.utils.Logger');

/**
 * @param {!cwc.utils.Helper} helper
 * @param {!string} instructions
 * @param {string} file
 * @constructor
 * @struct
 * @final
 */
cwc.addon.tutorial.Step = function(helper, instructions, file) {
  /** @type {!string} */
  this.name = 'Tutorial Step';

  /** @type {!cwc.utils.Helper} */
  this.helper = helper;

  /** @type {string} */
  this.prefix = this.helper.getPrefix('addon-tutorial-step');

  /** @private {!cwc.utils.Logger} */
  this.log_ = new cwc.utils.Logger(this.name);

	/** @private {!string} */
	this.instructions = instructions;

	/** @private {string} */
	this.file = file;

	this.log_.info('Created tutorial step for file "'+this.file+'" with instructions "'+this.instructions+'"');

};

/**
 * Loads the step's file into the editor, loads the step's 
 * instructions into the into the modal and activates the
 * modal.
 */
cwc.addon.tutorial.Step.prototype.load = function() {

  let tour = new Shepherd.Tour({
    'defaults': {
      'classes': 'shepherd-theme-arrows',
      'showCancelLink': true,
    },
  });
  tour.addStep('step1', { // TODO(carheden): unique step ids
    'title': i18t('Step 1'), // TODO(carheden): user-defined step name
    'text': this.instructions,
    'attachTo': '#cwc-blockly-chrome center', // TODO(carheden): Attach to user-specified element
    'buttons': [{
      'text': i18t('Exit'),
      'action': tour.cancel,
      'classes': 'shepherd-button-secondary',
    }, {
      'text': i18t('Next'),
      'action': tour.next,
      'classes': 'shepherd-button-example-primary',
    }],
  });
  tour.start();

	// TODO(carheden): Implement this
	this.log_.warn('TODO: load appropriate file');
}
