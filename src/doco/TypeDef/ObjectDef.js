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
 * @alias doco.TypeDef.NamedDef
 * @inner
 */
var NamedDef = require("./NamedDef.js");

/**
 * Constructs a new TypeDef Object that wraps all properties of an explicitly typed object, e.g. `{key: string}`.
 * @name doco.TypeDef.ObjectDef
 * @param {boolean|undefined} maybeNull Whether the type may be null or not. May be explicitly `undefined`.
 * @constructor
 * @extends doco.TypeDef
 */
function ObjectDef(maybeNull) {
    TypeDef.call(this, maybeNull);

    /**
     * Object properties as key/value pairs.
     * @type {!Object.<string,!doco.TypeDef>}
     */
    this.properties = {};
}

ObjectDef.prototype = Object.create(TypeDef.prototype);

/**
 * Adds one more property to this ObjectType.
 * @param {string} name Property name
 * @param {!doco.TypeDef} type Property type
 * @override
 */
ObjectDef.prototype.add = function(name, type) {
    if (typeof name !== 'string') {
        throw(new Error("Illegal property name: "+name+" (not a string)"));
    }
    if (!type instanceof NamedDef) {
        throw(new Error("Illegal property type: "+type+" (not a doco.TypeDef.NamedType)"));
    }
    if (this.properties.hasOwnProperty(name)) {
        throw(new Error("Duplicate property name: "+name));
    }
    this.properties[name] = type;
};

/**
 * Returns the string representation of this instance.
 * @returns {string}
 */
ObjectDef.prototype.toString = function() {
    var str = [];
    if (this.maybeNull === false) str.push("!"); // Defaults to true
    str.push('{');
    Object.keys(this.properties).forEach(function(key, i) {
        if (i>0) str.push(', ');
        str.push(key);
        str.push(': ');
        str.push(this.properties[key].toString());
    }.bind(this));
    str.push('}');
    return str.join('');
};

module.exports = ObjectDef;
