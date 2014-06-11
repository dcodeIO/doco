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

var Reflect = require("../Reflect.js");

/**
 * Reflect base type.
 * @constructor Constructs a new base type with the specified name from the given comment.
 * @param {string} name Element name
 * @param {!doco.Builder.Comment} comment Comment
 * @abstract
 */
function T(name, comment) {

    /**
     * Parent namespace.
     * @type {?doco.Reflect.Namespace}
     */
    this.parent = null;

    /**
     * Element name.
     * @type {string}
     */
    this.name = name;

    /**
     * Element aliases.
     * @type {!Array.<string>}
     */
    this.aliases = [];

    /**
     * Element description.
     * @type {?string}
     */
    this.description = null;

    /**
     * Element tags.
     * @type {!Array.<!doco.Tag>}
     */
    this.tags = [];

    if (comment) {
        this.description = comment.title || null;
        this.tags = comment.tags || [];
    }
}

/**
 * Finds the first class on the way up to root.
 * @returns {?doco.Reflect.Class} First class
 */
T.prototype.firstClass = function() {
    var ptr = this;
    do {
        if (ptr instanceof Reflect.Class) {
            return ptr;
        }
        ptr = ptr.parent;
    } while (ptr !== null);
    return null;
};

/**
 * Gets the fully qualified name of this type.
 * @param {boolean=} asString Whether to return a string instead of an array
 * @returns {!Array.<string>|string} FQN either as an array or string
 */
T.prototype.fqn = function(asString) {
    var name = [], ptr = this;
    do {
        name.unshift(ptr.name);
        ptr = ptr.parent;
    } while (ptr !== null && ptr.name !== null);
    if (asString) {
        var str = "";
        for (var i=0; i<name.length; i++) {
            if (str.length > 0) {
                str += name[i] === "prototype" ? "#" : ".";
            }
            if (name[i] === "prototype") i++;
            str += name[i];
        }
        return str;
    }
    return name;
};

/**
 * Gets all tags with the specified name.
 * @param {string|!Array.<string>} names Tag name or names to search for
 * @returns {!Array.<!doco.Tag>} Found tags
 */
T.prototype.getTags = function(names) {
    if (typeof names === 'string') names = [names];
    var tags = [];
    for (var i=0, k=this.tags.length; i<k; i++) {
        if (names.indexOf(this.tags[i].tagName) >= 0) {
            tags.push(this.tags[i]);
        }
    }
    return tags;
};

/**
 * Gets the first tag with the specified name.
 * @param {string} name Tag name to search for
 * @returns {?doco.Tag} Found tag or `null` if there is none
 */
T.prototype.getTag = function(name) {
    var tags = this.getTags(name);
    return tags.length > 0 ? tags[0] : null;
};

/**
 * Tests if there is a tag with the specified name.
 * @param {string|!Array.<string>} names Tag name or names to look for
 * @returns {boolean} `true` if there is such a tag, else `false`
 */
T.prototype.hasTag = function(names) {
    return this.getTags(names).length > 0;
};

/**
 * Returns a string representation of this type.
 * @returns {string} In the form of "CLASS name"
 */
T.prototype.toString = function() {
    var name;
    if (this instanceof Reflect.Class) {
        name = "Class";
    } else if (this instanceof Reflect.File) {
        name = "File";
    } else if (this instanceof Reflect.Function) {
        name = "Function";
    } else if (this instanceof Reflect.Variable) {
        name = "Variable";
    } else if (this instanceof Reflect.Namespace) {
        name = "Namespace";
    } else {
        name = "T";
    }
    return name+" "+this.name;
};

module.exports = T;
