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
 * @alias doco.Builder.VariableDeclaration
 * @inner
 */
var VariableDeclaration = require("./VariableDeclaration.js");

/**
 * @alias doco.Builder.FunctionDeclaration
 * @inner
 */
var FunctionDeclaration = require("./FunctionDeclaration.js");

/**
 * Declarations container built of multiple variable and one function declaration.
 * @name doco.Declarations
 * @param {!Array.<!doco.Builder.VariableDeclaration>} vars Variable definitions
 * @param {?doco.Builder.FunctionDeclaration} func Function definition
 * @constructor
 */
function Declarations(vars, func) {

    /**
     * Variable declarations.
     * @type {!Array.<!doco.Declaration.Variable>}
     */
    this.vars = vars;

    /**
     * Function declaration.
     * @type {?doco.Declaration.Function}
     */
    this.func = func;
}

/**
 * Interprets a Declaration.
 * @param {string} str Declaration string
 * @returns {!doco.Declarations}
 */
Declarations.interpret = function(str) {
    var vars = [], match;
    while (match = VariableDeclaration.EXPRESSION.exec(str)) {
        if (match[1] || match[2] !== 'function') {
            vars.push(new VariableDeclaration(match[1] || null, match[2]));
        }
    }
    var func = null;
    if (match = FunctionDeclaration.EXPRESSION.exec(str)) {
        func = new FunctionDeclaration(
            match[1] || null,
            match[2].split(/,/).map(function(name) { return name.trim(); })
        );
    }
    return new Declarations(vars, func);
};

module.exports = Declarations;
