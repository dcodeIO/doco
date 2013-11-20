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
var doco = require("../../doco.js");

/**
 * A Context Namespace holding the parsed comment, tags etc.
 * @constructor
 * @name doco.Context.Namespace
 * @param {?doco.Context.Namespace} parent Parent namespace
 * @param {?Array.<string>} names Name and aliases
 * @param {?string=} title Title
 * @param {?Array.<doco.Tag>=} tags Tags
 * @param {?doco.Declaration=} decl Declaration
 */
var Namespace = function(parent, names, title, tags, decl) {

    /**
     * Parent element.
     * @type {?doco.Context.Namespace}
     */
    this.parent = parent; // `null` for root and for unresolved elements
    
    /**
     * Element names.
     * @type {?Array.<string>}
     */
    this.names = names || [];
    
    /**
     * Element title.
     * @type {?string}
     */
    this.title = title || null;

    /**
     * Declared tags.
     * @type {!Array.<!Tag>}
     */
    this.tags = tags || [];

    /**
     * Following variable or function declaration.
     * @type {!doco.Declaration}
     */
    this.decl = decl || null;

    /**
     * Parent.
     * @type {?doco.Context.Namespace}
     */
    this.parent = null;

    /**
     * Children.
     * @type {Array.<!doco.Context.Namespace>}
     */
    this.children = [];
};

/**
 * Adds a child to this element.
 * @param {!doco.Context.Namespace} child Child to add
 */
Namespace.prototype.addChild = function(child) {
    this.children.push(child);
};

/**
 * Tests if this element already contains that child or a child with that name.
 * @param {!doco.Context.Namespace|string} child Child or child name to search for
 * @returns {boolean} `true` if it already contains it, else `false`
 */
Namespace.prototype.hasChild = function(child) {
    var i, k;
    if (typeof child === 'string') {
        for (i=0, k=this.children.length; i<k; i++) {
            if (this.children[i].names.indexOf(child) >= 0) return true;
        }
    } else {
        for (i=0, k=this.children.length; i<k; i++) {
            if (this.children[i] === child) return true;
        }
    }
    return false;
};

/**
 * Gets a child by name.
 * @param {string} name Child name
 * @returns {?doco.Context.Namespace} The first element with that name or `null` if there is none
 */
Namespace.prototype.getChild = function(name) {
    for (var i=0, k=this.children.length; i<k; i++) {
        if (this.children[i].names.indexOf(name) >= 0) {
            return this.children[i];
        }
    }
    return null;
};

module.exports = Namespace;
