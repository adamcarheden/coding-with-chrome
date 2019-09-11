/**
 * @fileoverview Python for the Simple blocks.
 *
 * @license Copyright 2019 The Coding with Chrome Authors.
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
 * @author carheden@google.com (Adam Carheden)
 */


/**
 * Debug
 * @param {!Blockly.block} block
 * @return {string}
 */
Blockly.Python['kidbright_debug'] = function(block) {
  let text = Blockly.Python.valueToCode(block, 'text',
      Blockly.Python.ORDER_ATOMIC);
  return 'print(' + text + ')\n';
};
