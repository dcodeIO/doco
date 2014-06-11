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
 * A VariableDeclaration.
 * @name doco.Builder.VariableDeclaration
 * @constructor
 * @param {string} type Variable type, e.g. `var` or `let`
 * @param {string} name Variable name
 */
var VariableDeclaration = function(type, name) {

    /**
     * Variable type, e.g. `var` or `let`.
     * @type {string}
     */
    this.type = type;

    /**
     * Variable name.
     * @type {string}
     */
    this.name = name;
};

/**
 * Returns a string representation of this declaration.
 * @returns {string} `variableType variableName`
 */
VariableDeclaration.prototype.toString = function() {
    return this.type+" "+this.name;
};

/**
 * Expression used to parse variable definitions.
 * @const {!RegExp}
 */
VariableDeclaration.EXPRESSION = /^(?:(var|let)\s)?\s*([^=;\s]+)\s*(?:=|;|\s)/g;

module.exports = VariableDeclaration;
