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
 */
var Tag = require("./Tag.js");

/**
 * @alias doco.Declaration
 */
var Declaration = require("./Declaration.js");

/**
 * Constructs a new Context.
 * @class A doco Context for putting together the parts.
 * @name doco.Context
 * @constructor
 */
function Context() {

    /**
     * Namespace.
     * @type {!doco.Context.Namespace}
     */
    this.ns = new Context.Namespace(null, []); // Root

    /**
     * Unresolved elements.
     * @type {!Array.<!doco.Context.Namespace>}
     */
    this.elements = [];
}

/**
 * Interprets a comment / declaration pair.
 * @param {string} comment Comment
 * @param {string} declaration Following declaration
 */
Context.prototype.interpret = function(comment, declaration) {
    // First, get the title out of it
    var title, tags;
    var p = comment.search(/(?:^|\s)@/); // Skip email addresses
    if (p > -1) {
        title = comment.substring(0, p).trim();
        tags = Tag.interpret(comment.substring(p).trim());
    } else {
        title = comment;
        tags = [];
    }
    var decl = Declaration.interpret(declaration);
    var names = [];
    decl.vars.forEach(function(assignment) {
        names.push(assignment["name"]);
    });
    if (decl.func !== null && decl.func.name !== null) {
        names.push(decl.func.name);
    }
    this.elements.push(new Context.Namespace(/* unresolved */ null, names, title, tags, decl));
};

/**
 * Creates an object on the namespace and returns a pointer on it.
 * @param {string} name Name, e.g. "doco.Parser"
 * @returns {!doco.Context.Namespace} Pointer to the existing or created namespace
 */
Context.prototype.create = function(name) {
    var parts = name.split(/\./),
        ptr = this.ns;
    while (parts.length > 0) {
        name = parts.shift();
        if (!ptr.hasChild(name)) {
            ptr.addChild(ptr = new Context.Namespace());
        } else {
            ptr = ptr.getChild(ptr);
        }
    }
    return ptr;
};

Context.prototype.build = function() {
    var elements = this.elements.slice();
    while (elements.length > 0) {
        var elem = elements.shift(),
            names = elem.names;
        
        // Create each name on the namespace
        if (names && names.length > 0) {
            names.forEach(function(name) {
                var parts = name.split("."),
                    ptr = this.ns;
                while (parts.length > 0) {
                    name = parts.shift();
                    if (!ptr.hasChild(name)) {
                        ptr.addChild(parts.length === 0 ? ptr = elem : ptr = new Context.Namespace(ptr, [name]));
                    } else {
                        ptr = ptr.getChild(name);
                    }
                }
                // Now resolved
            }.bind(this));
            
        // Or if it has no names, append tags to top level
        } else {
           this.ns.tags.push.apply(this.ns.tags, elem.tags);
        }
    }
    
    printDebug(this.ns);
    // console.log(doco.inspect(this.ns));
};

function printDebug(ns, indent) {
    indent = indent || 0;
    var tab = ''; for (var i=0; i<indent; i++) tab += ' ';
    console.log(indent+"|"+tab+ns.names.join(", "));
    for (i=0; i<ns.children.length; i++) {
        printDebug(ns.children[i], indent+2);
    }
}

Context.Namespace = require("./Context/Namespace.js");
    
module.exports = Context;
