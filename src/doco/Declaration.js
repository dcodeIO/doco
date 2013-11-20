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
 * A Declaration built of variable and function definitions.
 * @name doco.Declaration
 * @param {!Array.<!doco.Declaration.Variable>} vars Variable definitions
 * @param {?doco.Declaration.Function} func Function definition
 * @constructor
 */
function Declaration(vars, func) {

    /**
     * Variable definitions.
     * @type {!Array.<!doco.Declaration.Variable>}
     */
    this.vars = vars;

    /**
     * Function definition.
     * @type {?doco.Declaration.Function}
     */
    this.func = func;
}

/**
 * Interprets a Declaration.
 * @param {string} str Declaration string
 * @returns {!doco.Declaration}
 */
Declaration.interpret = function(str) {
    var vars = [], match;
    while (match = Declaration.Variable.EXPRESSION.exec(str)) {
        if (match[1] || match[2] !== 'function') {
            vars.push(new Declaration.Variable(match[1] || null, match[2]));
        }
    }
    var func = null;
    if (match = Declaration.Function.EXPRESSION.exec(str)) {
        func = new Declaration.Function(
            match[1] || null,
            match[2].split(/,/).map(function(name) { return name.trim(); })
        );
    }
    return new Declaration(vars, func);
};

Declaration.Variable = require("./Declaration/Variable.js");
Declaration.Function = require("./Declaration/Function.js");

module.exports = Declaration;
