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
 * @alias doco.Declarations
 * @inner
 */
var Declarations = require("./Declarations.js");

/**
 * @alias doco.Tag
 * @inner
 */
var Tag = require("../Tag.js");

/**
 * A Comment.
 * @param {string} title Title
 * @param {?Array.<!doco.Tag>} tags Tags
 * @param {?doco.Declarations} decls Declarations
 * @constructor
 */
function Comment(title, tags, decls) {

    // A comment (see above) consists of a leading title followed by some tags plus the follow-up declaration line.

    /**
     * Title.
     * @type {string}
     */
    this.title = title && title !== "" ? title : null;

    /**
     * Tags.
     * @type {!Array.<!doco.Tag>}
     */
    this.tags = tags || [];

    /**
     * Variable declarations.
     * @type {!Array.<!doco.Builder.VariableDeclaration>}
     */
    this.vars = decls && decls.vars ? decls.vars : [];

    /**
     * Function declaration.
     * @type {?doco.Builder.FunctionDeclaration}
     */
    this.func = decls && decls.func ? decls.func : null;

    /**
     * Primary name.
     * @type {?string}
     */
    this.name = null;

    /**
     * Alias names
     * @type {!Array.<string>}
     */
    this.aliases = [];

    // Find primary name and aliases, prefer @name tag
    var tag;
    if ((tag = this.getTag("name")) !== null && tag.name !== null) {
        this.name = tag.name.replace("#", ".prototype.");
    }
    // Variable definitions, prefer 1st
    this.vars.forEach(function(v) {
        if (this.name === null) this.name = v["name"];
        else this.aliases.push(v["name"]);
    }.bind(this));
    // Function name
    if (this.func !== null && this.func.name !== null) {
        if (this.name === null) this.name = this.func.name;
        else this.aliases.push(this.func.name);
    }
}

/**
 * Parses a comment string.
 * @param {string} str Comment string to parse
 * @param {string} declStr Following declaration string
 * @returns {!Comment} Parsed Comment
 * @throws {Error} If the comment cannot be parsed
 */
Comment.parse = function(str, declStr) {
    var title, tags;
    var p = str.search(/(?:^|\s)@/); // Make sure to match valid tags only (e.g not email addresses)
    if (p >= 0) {
        title = str.substring(0, p).trim();
        tags = Tag.interpretAll(str.substring(p).trim());
    } else {
        title = str;
        tags = [];
    }
    return new Comment(title, tags, Declarations.interpret(declStr));
};

/**
 * Gets all tags with the specified name.
 * @param {string|Array.<string>} tagNames Tag name or names to search for
 * @returns {!Array.<!doco.Tag>}
 */
Comment.prototype.getTags = function(tagNames) {
    if (typeof tagNames === 'string') tagNames = [tagNames];
    var tags = [];
    for (var i=0, k=this.tags.length; i<k; i++)
        if (tagNames.indexOf(this.tags[i].tagName) >= 0)
            tags.push(this.tags[i]);
    return tags;
};

/**
 * Gets the first tag with the specified name.
 * @param {string} tagName Tag name to search for
 * @returns {?doco.Tag} Tag or `null` if there is none
 */
Comment.prototype.getTag = function(tagName) {
    var tags = this.getTags(tagName);
    if (tags.length > 0) return tags[0];
    return null;
};

/**
 * Tests if there is at least one tag of the specified name.
 * @param {string|!Array.<string>} tagNames Tag name or names to search for
 * @returns {boolean} `true` if there is one, else `false`
 */
Comment.prototype.hasTag = function(tagNames) {
    return this.getTags(tagNames).length > 0;
};

module.exports = Comment;
