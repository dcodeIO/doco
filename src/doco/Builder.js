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
 * @alias doco.Tag
 * @inner
 */
var Tag = require("./Tag.js");

/**
 * @alias doco.Reflect
 * @inner
 */
var Reflect = require("./Reflect.js");

/**
 * The Builder putting together the parts.
 * @name doco.Builder
 * @constructor Constructs a new empty Builder.
 */
function Builder() {

    /**
     * Namespace.
     * @type {!doco.Reflect.Namespace}
     */
    this.ns = new Reflect.Namespace(null);

    /**
     * Unresolved elements.
     * @type {!Array.<string>}
     */
    this.stack = [];
}

/**
 * Interprets a comment / declaration pair.
 * @param {string} str Comment
 * @param {string} declStr Following declaration
 */
Builder.prototype.interpret = function(str, declStr) {
    this.stack.push(Builder.Comment.parse(str, declStr));
};

/**
 * Builds all comments to a common Namespace.
 * @returns {!Array.<string>} Warnings
 */
Builder.prototype.build = function() {
    var comment,
        obj = null,
        prev = this.ns,
        parts,
        warnings = [];

    /**
     * Creates an object on the current scope.
     * @param {!Array.<string>} path Object path
     * @param {!doco.Reflect.T} obj Object
     * @returns {doco.Reflect.T} The object itself
     * @inner
     */
    var create = function(path, obj) {
        var ptr = prev.resolvePartial(path); // Try to resolve
        if (ptr !== null) {
            ptr = ptr.create(path);
            if (ptr.hasChild(obj.name)) { // Replace
                // TODO
            }
            ptr.addChild(obj);
        } else { // Else create on the root namespace
            this.ns.create(path).addChild(obj);
        }
        return obj;
    }.bind(this);

    // Process stack
    while (this.stack.length > 0) {
        comment = this.stack.shift();
        if (comment.name !== null) {
            parts = comment.name.split(".");
            // Find out what this is
            if (comment.hasTag("constructor") || comment.hasTag("class")) { // Class, e.g. doco.Reflect.File, Reflect.File, @alias File
                obj = new Reflect.Class(parts.pop(), comment);
                create(parts, obj);
            } else if (comment.hasTag(["function", "param", "returns"]) || (comment.decl && comment.decl.func && comment.decl.func.name !== null)) { // Method or function
                obj = new Reflect.Function(parts.pop(), comment);
                create(parts, obj);
            } else if (comment.hasTag(["type"]) || (comment.decl && comment.decl.vars && comment.decl.vars.length > 0)) {
                if (parts[0] === "this") { // Relocate instance variables to prototype of last class
                    if (!obj || !(obj = obj.firstClass())) {
                        warnings.push("Unable to resolve class of "+comment.name);
                        continue;
                    }
                    Array.prototype.splice.apply(parts, [0, 1].concat(obj.fqn()).concat(['prototype']));
                }
                obj = new Reflect.Variable(parts.pop(), comment);
                create(parts, obj);
            } else {
                warnings.push("Unsupported element: "+comment.name);
            }
        } else { // Append to root
            Array.prototype.push.apply(this.ns, comment.tags);
        }
    }
    
    // this.printDebug(this.ns, 0);

    return warnings;
};

/**
 * Prints the internal structure to console.
 * @param {!doco.Reflect.T} ns Namespace or type
 * @param {number=} indent Indentation level
 */
Builder.prototype.printDebug = function(ns, indent) {
    indent = indent || 0;
    var tab = ''; for (var i=0; i<indent; i++) tab += ' ';
    console.log(tab+"["+ns.name+"] = " +ns);
    if (ns instanceof Reflect.Namespace) {
        for (i=0; i<ns.children.length; i++) {
            this.printDebug(ns.children[i], indent+2);
        }
    }
};

Builder.Comment = require("./Builder/Comment.js");
Builder.Declarations = require("./Builder/Declarations.js");
Builder.VariableDeclaration = require("./Builder/VariableDeclaration.js");
Builder.FunctionDeclaration = require("./Builder/FunctionDeclaration.js");

module.exports = Builder;
