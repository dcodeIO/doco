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
 * Constructs a new NamedDef that represents a single type, e.g. `Array`.
 * @param {boolean|undefined} maybeNull Whether the type may be null or not. May be explicitly `undefined`.
 * @constructor
 * @extends doco.TypeDef
 */
function NamedDef(maybeNull) {
    TypeDef.call(this, maybeNull);

    /**
     * The provided name.
     * @type {string}
     **/
    this.name = "";

    /**
     * Annotated generic types.
     * @type {?Array.<!doco.TypeDef>}
     */
    this.generics = null;
}

NamedDef.prototype = Object.create(TypeDef.prototype);

/**
 * Returns the string representation of this instance.
 * @returns {string}
 */
NamedDef.prototype.toString = function() {
    var str = [];
    if (TypeDef.PRIMITIVE_TYPES.indexOf(this.name) >= 0) { // Defaults to false
        if (this.maybeNull === true) {
            str.push('?');
        }
    } else { // Defaults to true
        if (this.maybeNull === false) {
            str.push('!');
        }
    }
    str.push(this.name);
    if (this.generics !== null && this.generics.length > 0 ) {
        str.push('.<');
        for (var i=0; i<this.generics.length; i++) {
            if (i>0) str.push(',');
            str.push(this.generics[i].toString());
        }
        str.push('>');
    }
    return str.join('');
};

module.exports = NamedDef;
