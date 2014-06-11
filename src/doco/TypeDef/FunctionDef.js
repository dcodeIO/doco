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
 * @alias doco.TypeDef
 * @inner
 */
var TypeDef = require("../TypeDef.js");

/**
 * Constructs a new FunctionDef that wraps its arguments.
 * @name doco.TypeDef.FunctionDef
 * @param {boolean|undefined} maybeNull
 * @constructor
 * @extends doco.TypeDef
 */
function FunctionDef(maybeNull) {
    TypeDef.call(this, maybeNull);

    /**
     * What `this` refers to in the context of the function.
     * @type {!doco.TypeDef|undefined}
     */
    this.this = undefined;

    /**
     * The instance type created by the function when using the `new` keyword.
     * @type {!doco.TypeDef|undefined}
     */
    this.new = undefined;

    /**
     * The returned type.
     * @type {!doco.TypeDef|undefined}
     */
    this.returns = undefined;
}

FunctionDef.prototype = Object.create(TypeDef.prototype);

/**
 * Returns the string representation of this instance.
 * @returns {string}
 */
FunctionDef.prototype.toString = function() {
    var arg = [], t;
    if (this.this) {
        arg.push("this: "+this.this);
    }
    if (this.new) {
        arg.push("new: "+this.new);
    }
    for (var i=0; i<this.subTypes.length; i++) {
        t = this.subTypes[i];
        if (t.varargs) {
            arg.push("...["+t.toString()+"]");
        } else {
            arg.push(t.toString()+(t.omittable ? "==" : (t.optional ? "=" : "")));
        }
    }
    var res = [];
    if (this.maybeNull === true) { // Defaults to false
        res.push('?');
    }
    res.push("function("+arg.join(', ')+")");
    if (typeof this.returns !== 'undefined') {
        res.push(":");
        res.push(this.returns.toString());
    }
    if (this.omittable) {
        res.push("==");
    } else if (this.optional) {
        res.push("=");
    }
    return res.join('');
};

module.exports = FunctionDef;
