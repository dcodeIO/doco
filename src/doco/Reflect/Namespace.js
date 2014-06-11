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
 * alias doco.Reflect.T
 * @inner
 */
var T = require("./T.js");

/**
 * @alias doco.Reflect.Variable
 * @inner
 */
var Variable = require("./Variable.js");

/**
 * A Reflect Namespace.
 * @constructor Constructs a new namespace with the specified name from the given comment.
 * @name doco.Reflect.Namespace
 * @param {string} name Name
 * @param {!doco.Builder.Comment} comment Comment
 * @extends doco.Reflect.T
 */
function Namespace(name, comment) {
    T.call(this, name, comment);

    /**
     * Children.
     * @type {!Array.<doco.Reflect.T>}
     */
    this.children = [];
}

Namespace.prototype = Object.create(T.prototype);

/**
 * Gets a child by name.
 * @param {string} name
 * @returns {?doco.Reflect.T}
 */
Namespace.prototype.getChild = function(name) {
    for (var i=0, k=this.children.length; i<k; i++) {
        if (this.children[i].name === name) {
            return this.children[i];
        }
    }
    return null;
};

/**
 * Tests if there is a child with the specified name.
 * @param {string} name
 * @returns {boolean} `true` if there is one, else `false`
 */
Namespace.prototype.hasChild = function(name) {
    return this.getChild(name) !== null;
};

/**
 * Adds a child to the Namespace.
 * @param {!doco.Reflect.T} child Child to add
 * @throws {Error} If there is already a child with that name
 */
Namespace.prototype.addChild = function(child) {
    if (this.hasChild(child.name)) {
        throw(new Error("Duplicate name in "+this+": "+child.name));
    }
    child.parent = this;
    this.children.push(child);
};

/**
 * Resolves a name inside of this namespace.
 * @param {string|!Array.<string>} name Name to resolve
 * @returns {?doco.Reflect.T} Resolved type or `null` if there is no exact match
 */
Namespace.prototype.resolve = function(name) {
    if (typeof name === 'string') {
        name = name.replace(/#/g, ".prototype.");
        name = name.split(".");
    }
    if (name.length === 0) return this;
    var ptr = this;
    while (ptr !== null) {
        if (ptr.hasChild(name[0])) {
            ptr = ptr.getChild(name[0]);
            if (name.length === 1)
                return ptr;
            if (!ptr instanceof Namespace)
                return null;
            return ptr.resolve(name.slice(1));
        }
        ptr = ptr.parent;
    }
    return null;
};

/**
 * Partially resolves a name inside of this namespace. The match may be partial, meaning that only the first part(s)
 * matches something, with the `name` argument being modified accordingly to contain the unresolved parts that still
 * have to be created on the returned namespace.
 * @param {!Array.<string>} name Name to resolve, being modified to contain the unresolved parts
 * @return {?doco.Reflect.Namespace} Resolved namespace or `null` if there is no match at all
 */
Namespace.prototype.resolvePartial = function(name) {
    if (name.length === 0) {
        return this;
    }
    // Walk all the way up to root and look for something equal to the first part
    var ptr = this, ptr2, ptr3;
    do {
        if ((ptr2 = ptr.getChild(name[0])) && ptr2 instanceof Namespace) {
            name.splice(0, 1);
            // Walk all the way down while the first part is matching 
            while ((ptr3 = ptr2.getChild(name[0])) && ptr3 instanceof Namespace) {
                name.splice(0, 1);
                ptr2 = ptr3;
            }
            return ptr2;
        }
        ptr = ptr.parent;
    } while (ptr !== null && ptr instanceof Namespace);
    return null;
};

/**
 * Creates additional namespaces on top of this namespace, if there is none already.
 * @param {!Array.<string>} path Path to create
 * @returns {!doco.Reflect.Namespace} Resolved or created namespace for `path`
 */
Namespace.prototype.create = function(path) {
    if (path.length === 0) return this;
    path = path.slice();
    var ptr = this, name;
    while (path.length > 0) {
        name = path.shift();
        if (ptr.hasChild(name)) {
            return ptr.create(path);
        } else {
            ptr.addChild(ptr = new Namespace(name));
        }
    }
    return ptr;
};

/**
 * Recursively sorts all children using the specified function.
 * @param {function(!doco.Reflect.T, !doco.Reflect.T):number=} func Sort function, defaults to {@link Namespace.alphaSort}
 */
Namespace.prototype.sort = function(func) {
    if (func === Namespace.noopSort) return;
    func = func || Namespace.defaultSort;
    this.children.sort(func);
    var child;
    for (var i=0, k=this.children.length; i<k; i++) {
        child = this.children[i];
        if (child instanceof Namespace) {
            child.sort(func);
        }
    }
};


/**
 * Alphabetical sort prioritizing variables and upper case.
 * @param {!doco.Reflect.T} a
 * @param {!doco.Reflect.T} b
 * @returns {number}
 */
Namespace.defaultSort = function(a, b) {
    if (a instanceof Variable && !(b instanceof Variable)) return -1;
    if (b instanceof Variable && !(a instanceof Variable)) return 1;
    return a.name == b.name ? 0 : (a.name < b.name ? -1 : 1);
};

/**
 * Noop sort function keeping code order.
 * @param {!doco.Reflect.T} a
 * @param {!doco.Reflect.T} b
 * @returns {number}
 */
Namespace.noopSort = function(a, b) {
    return 0;
};

module.exports = Namespace;
