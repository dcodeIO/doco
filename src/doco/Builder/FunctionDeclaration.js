/*
 Copyright 2013 Daniel Wirtz <dcode@dcode.io>

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/**
 * A FunctionDeclaration.
 * @name doco.Builder.FunctionDeclaration
 * @constructor
 * @param {?string} name Function name
 * @param {Array.<string>} parameters Function parameter names
 */
var FunctionDeclaration = function(name, parameters) {

    /**
     * Function name.
     * @type {?string}
     */
    this.name = name;

    /**
     * Function parameter definitions to be interpreted.
     * @type {Array.<string>}
     */
    this.parameters = parameters;
};

/**
 * Expression used to parse function definitions.
 * @const {!RegExp}
 */
FunctionDeclaration.EXPRESSION = /function\s*([^\s\(]+)?\s*\(([^\)]*)\)/;

module.exports = FunctionDeclaration;
