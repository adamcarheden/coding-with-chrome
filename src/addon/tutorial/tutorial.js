/**
 * @fileoverview Tutorial addon.
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
goog.provide('cwc.addon.Tutorial');

goog.require('cwc.addon.tutorial.Step');
goog.require('cwc.mode.Modder.Events');
goog.require('cwc.mode.Type');
goog.require('cwc.soy.addon.Tutorial');
goog.require('cwc.ui.SelectScreen.Events');
goog.require('cwc.utils.Database');
goog.require('cwc.utils.Logger');


/**
 * @param {!cwc.utils.Helper} helper
 * @constructor
 * @struct
 * @final
 */
cwc.addon.Tutorial = function(helper) {
  /** @type {!string} */
  this.name = 'Addon Tutorial';

  /** @type {!cwc.utils.Helper} */
  this.helper = helper;

  /** @type {string} */
  this.prefix = this.helper.getPrefix('addon-tutorial');

  /** @private {!boolean} */
  this.chromeApp_ = this.helper.checkChromeFeature('app');

  /** @private {!string} */
  this.resourcesPath_ = '../resources/tutorial/';

  /** @private {!cwc.utils.Logger} */
  this.log_ = new cwc.utils.Logger(this.name);

  /** @private {!Array} */
  this.steps_ = []

};


cwc.addon.Tutorial.prototype.prepare = function() {
  if (!this.helper.experimentalEnabled()) {
    return;
  }

  this.log_.info('Preparing tutorial addon ...');

  let selectScreenInstance = this.helper.getInstance('selectScreen');
  if (selectScreenInstance) {
    goog.events.listen(selectScreenInstance.getEventHandler(),
      cwc.ui.SelectScreen.Events.Type.VIEW_CHANGE,
      this.decorate, false, this);
  }

  let modeInstance = this.helper.getInstance('mode');
  if (modeInstance) {
    goog.events.listen(modeInstance.getEventHandler(),
      cwc.mode.Modder.Events.Type.MODE_CHANGE,
      this.eventsModder, false, this);
  }
};


/**
 * @param {Event} opt_e
 */
cwc.addon.Tutorial.prototype.decorate = function(opt_e) {
  // Render cards
  let basicNode = document.getElementById(
    'cwc-select-screen-normal_basic-addon');
  if (basicNode) {
    let template = goog.soy.renderAsElement(cwc.soy.addon.Tutorial.basic, {
      prefix: this.prefix,
    });
    basicNode.appendChild(template);

    // Event handler for the cards
    let basicCard = document.getElementById('cwc-addon-tutorial-link-basic');
    goog.events.listen(basicCard, goog.events.EventType.CLICK, function() {
        this.loadFile_('simple/blocks/tutorial-1.cwc');
      }, false, this);
  }
};

/**
 * @param {Object} data
 * @return {!boolean}
 */
cwc.addon.Tutorial.prototype.setSteps = function(steps) {
  if (!Array.isArray(steps)) {
    this.log_.error('Invalid tutorial data. "steps" is not an array')
    return false;
  }
  this.steps_ = [];
  for (let i in steps) {
    let step = steps[i];
    let file = false;
    if ('file' in step) {
      file = step.file;
    }
    if ('instructions' in step) {
      this.steps_.push(new cwc.addon.tutorial.Step(this.helper, step['instructions'], step['file']));
      this.log_.info('Added step #'+i+' to tutorial');
    } else {
      this.steps_ = [];
      this.log_.error('Invalid tutorial data. Step #'+i+' has no "instructions" key');
      return false;
    }
  }
  return true;
}

/**
 * @param {number} step
 */
cwc.addon.Tutorial.prototype.loadStep = function(step) {
  if (step > this.steps_.length) {
    this.log_.error('Failed to load step #'+step+'. '+this.steps_.length+' is the last step in this tutorial');
    return;
  }
  let messageInstance = this.helper.getInstance('message');
  if (!messageInstance) {
    this.log_.error('Failed to get message pane');
    return;
  }
  messageInstance.show(true);
  messageInstance.renderContent(cwc.soy.addon.Tutorial.status, {
    prefix: this.prefix,
    step: step+1,
    numSteps: this.steps_.length,
  });
  let prev = goog.dom.getElement(this.prefix + 'prev');
  if (!prev) {
    this.log_.warn('Failed to get previous button (ID: '+this.prefix+prev+')');
  } else if (step > 0) {
    this.log_.info('Set prev to load step '+(step-1));
    prev.addEventListener('click', () => {
      this.log_.info('Loading step '+(step-1));
      this.loadStep(step - 1);
    });
  }
  let next = goog.dom.getElement(this.prefix + 'next');
  if (!next) {
    this.log_.warn('Failed to get next button (ID: '+this.prefix+next+')');
  } else if (step < this.steps_.length - 1) {
    this.log_.info('Set next to load step '+(step+1));
    next.addEventListener('click', () => {
      this.log_.info('Loading step '+(step+1));
      this.loadStep(step + 1);
    });
  }

  this.steps_[step].load();
}

/**
 * Starts the tutorial from the first step
 */
cwc.addon.Tutorial.prototype.start = function() {

  this.log_.info('Starting...');
  this.loadStep(0);
}

/**
 * @param {Event} e
 */
cwc.addon.Tutorial.prototype.eventsModder = function(e) {
  let file = e.data.file;
  let steps = this.helper.getInstance('file').getFile().getMetadata('steps',
		'tutorial');
  if (!steps) {
    this.log_.info('No tutorial for file', file);
  }
   this.log_.info('Loading tutorial for file', file);
  if (this.setSteps(steps)) {
    this.start();
  }
};


/**
 * Loads file into editor.
 * @param {string} file_name Example file name to load.
 * @private
 */
cwc.addon.Tutorial.prototype.loadFile_ = function(file_name) {
  let loaderInstance = this.helper.getInstance('fileLoader');
  if (loaderInstance) {
    loaderInstance.loadLocalFile(this.resourcesPath_ + file_name);
  }
  let editorWindow = this.chromeApp_ && chrome.app.window.get('editor');
  if (editorWindow) {
    editorWindow['clearAttention']();
  }
};
