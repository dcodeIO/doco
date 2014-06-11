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
 * @alias doco
 * @inner
 */
var doco = require("../doco.js");

/**
 * TypeDef base type holding the TypeDef namespace.
 * @name doco.TypeDef.Type
 * @param {boolean|undefined} maybeNull Whether the type may be null or not. May be explicitly `undefined`.
 * @constructor
 * @abstract
 */
function TypeDef(maybeNull) {

    /**
     * Whether this Type may become null.
     * @type {boolean|undefined}
     */
    this.maybeNull = maybeNull;

    /**
     * Whether this is a type of variable arguments. Used in function arguments only.
     * @type {boolean}
     */
    this.varargs = false;

    /**
     * Whether this Type is optional. Used in function arguments only.
     * @type {boolean|undefined}
     */
    this.optional = undefined;

    /**
     * Whether this Type is omittable. Used in function arguments only.
     * @type {boolean|undefined}
     */
    this.omittable = undefined;

    /**
     * Contained types. Used in function and object definitions only.
     * @type {!Array.<!doco.TypeDef>}
     */
    this.subTypes = [];
}

module.exports = TypeDef; // Must be known here for cyclic dependencies

//////////////////////////////////////////////////////// Types /////////////////////////////////////////////////////////
    
/**
 * Primitive types that might by default not become `null`.
 * @type {!Array.<string>}
 * @const
 */
TypeDef.PRIMITIVE_TYPES = ["number", "string", "boolean", "undefined"]; // "function" is special

TypeDef.OrDef       = require("./TypeDef/OrDef.js");
TypeDef.NamedDef    = require("./TypeDef/NamedDef.js");
TypeDef.ObjectDef   = require("./TypeDef/ObjectDef.js");
TypeDef.FunctionDef = require("./TypeDef/FunctionDef.js");

/////////////////////////////////////////////////////// Parser /////////////////////////////////////////////////////////

TypeDef.Parser = require("./TypeDef/Parser.js");

///////////////////////////////////////////////////// Interpreter //////////////////////////////////////////////////////

/**
 * Interprets a type definition.
 * @param {string} str Type definition and/or trailing comment
 * @returns {{type: ?doco.TypeDef.Type, remain: string}}
 * @throws {Error} If there is none or an invalid type definition
 */
TypeDef.interpret = function(str) {
    if (str === null || str === "") return null;
    str = str.trim();
    if (str.length == 0 || str.charAt(0) != '{') {
        return {
            'type': null,
            'remain': str
        };
    }
    // Welcome to the fun part
    var def = TypeDef.Parser.parseTypeDef(str.substring(1).trimLeft());
    var optional = false;
    str = def['remain']; // Already trimmed and at least one char
    if (str.charAt(0) == '=') {
        optional = true;
        str = str.substring(1).trimLeft();
    }
    if (str.length == 0 || str.charAt(0) != '}') {
        throw(new Error("Missing closing delimiter: "+str+" ('}' expected)"));
    }
    // Puh...
    var type = normalizeTypeDef(def['type']);
    type.optional = optional;
    return {
        'type': type,
        'remain': str.substring(1).trimLeft()
    };
};

/**
 * Normalizes an OrType by unwrapping all single-element OrTypes and adding `null` alternatives where annotated.
 * @param {!doco.TypeDef.OrType} def OrType to normalize
 * @return {!doco.TypeDef.Type} Normalized type that might no longer be an OrType if unwrapped
 * @inner
 */
function normalizeOrDef(def) {
    if (def instanceof TypeDef.OrDef) { // Normalize all sub-OrTypes
        for (var i=0; i<def.subTypes.length; i++) {
            if (def.subTypes[i] instanceof TypeDef.OrDef) {
                def.subTypes[i] = normalizeOrDef(def.subTypes[i]);
            }
        }
    }
    // Maybe unwrap
    while (def instanceof TypeDef.OrDef && def.subTypes.length == 1) {
        def = def.subTypes[0];
    }
    return def;
}

/**
 * Normalizes a type definition by unwrapping all single-element OrTypes and adding `null` alternatives where
 *  appropriate.
 * @param {!doco.TypeDef.Type} def Type definition to normalize
 * @returns {!doco.TypeDef.Type} def Normalized type definition
 * @inner
 */
function normalizeTypeDef(def) {
    if (def instanceof TypeDef.OrDef) {
        def = normalizeOrDef(def);
    }
    return def;
}
