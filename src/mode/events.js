/**
 * @fileoverview Select screen Event definitions.
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
goog.provide('cwc.mode.Modder.Events');

goog.require('cwc.utils.EventData');


/**
 * @enum {number}
 */
cwc.mode.Modder.Events.Type = {
  MODE_CHANGE: 1,
};


/**
 * @param {!string} mode
 * @param {string=} file
 * @return {!cwc.utils.EventData}
 * @final
 */
cwc.mode.Modder.Events.changeMode = function(mode, file) {
  return new cwc.utils.EventData(
      cwc.mode.Modder.Events.Type.MODE_CHANGE, {
        'mode': mode,
        'file': file || '',
      });
};
