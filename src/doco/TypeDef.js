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
 */
var doco = require("../doco.js");

/**
 * TypeDef interpreter.
 * @name doco.TypeDef
 * @type {Object.<string,*>}
 */
var TypeDef = {};

//////////////////////////////////////////////////////// Types /////////////////////////////////////////////////////////
    
/**
 * Primitive types that might by default not become `null`.
 * @type {!Array.<string>}
 * @const
 */
TypeDef.PrimitiveTypes = ["number", "string", "boolean", "undefined"]; // "function" is special

module.exports = TypeDef; // Must be known here for cyclic dependencies

// Abstract
TypeDef.Type         = require("./TypeDef/Type.js");
TypeDef.MultiType    = require("./TypeDef/MultiType.js");

// Non-abstract
TypeDef.OrType       = require("./TypeDef/OrType.js");
TypeDef.NamedType    = require("./TypeDef/NamedType.js");
TypeDef.ObjectType   = require("./TypeDef/ObjectType.js");
TypeDef.FunctionType = require("./TypeDef/FunctionType.js");

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
function normalizeOrType(def) {
    if (def instanceof TypeDef.OrType) { // Normalize all sub-OrTypes
        for (var i=0; i<def.types.length; i++) {
            if (def.types[i] instanceof TypeDef.OrType) {
                def.types[i] = normalizeOrType(def.types[i]);
            }
        }
    }
    // Maybe unwrap
    while (def instanceof TypeDef.OrType && def.types.length == 1) {
        def = def.types[0];
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
    if (def instanceof TypeDef.OrType) {
        def = normalizeOrType(def);
    }
    return def;
}
