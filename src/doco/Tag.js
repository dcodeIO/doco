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
 */
var TypeDef = require("./TypeDef.js");

/**
 * Represents a Tag in the form of `@tagName ...`.
 * @name doco.Tag
 * @constructor
 * @param {string} tagName Tag name, e.g. `param`
 */
function Tag(tagName) {

    /**
     * Tag name.
     * @type {string}
     */
    this.tagName = tagName;
}

/**
 * Interprets a block of tags.
 * @param {string} str Tag block
 * @returns {Array.<doco.Tag>} Interpreted tags
 */
Tag.interpretAll = function(str) {
    var exp = /@/g, match, tags = [], offset = 0;
    str = str.trim();
    while (match = exp.exec(str)) {
        if (match.index == 0) continue;
        if (/\s|\*/.test(str.charAt(match.index-1))) {
            tags.push(Tag.interpret(str.substring(offset, match.index).trim()));
            offset = match.index;
        }
    }
    if (offset < str.length) {
        tags.push(Tag.interpret(str.substring(offset)));
    }
    return tags;
};

/**
 * Interprets a single tag.
 * @param {string} str Tag string
 * @returns {?doco.Tag} Interpreted tag
 */
Tag.interpret = function(str) {
    if (str === null) return null;
    str = str.trim();
    if (str.length == 0) {
        return null;
    }
    if (str.charAt(0) == '@') {
        str = str.substring(1).trim();
        if (str.length == 0) {
            return null;
        }
    }
    var name;
    var end = str.indexOf(' ');
    if (end >= 0) {
        name = str.substring(0, end);
        str = str.substring(end+1).trimLeft();
    } else {
        name = str;
        str = null;
    }
    name = name.toLowerCase();
    var key = "@"+name;
    if (typeof Tag[key] !== 'undefined') {
        try {
            return new (Tag[key])(str);
        } catch (e) {
            throw(e);
        }
    }
    return new Tag.Unknown(name, str);
};

module.exports = Tag; // Must be known here for cyclic dependencies

Tag.Unknown            = require("./Tag/Unknown.js");
Tag.Comment            = require("./Tag/Comment.js");
Tag.TypeAndComment     = require("./Tag/TypeAndComment.js");
Tag.TypeAndName        = require("./Tag/TypeAndName.js");
Tag.NameAndComment     = require("./Tag/NameAndComment.js");
Tag.TypeNameAndComment = require("./Tag/TypeNameAndComment.js");

/**
 * Defines one more Tag.
 * @param {function(new:doco.Tag, ...[*])} clazz Base class
 * @param {string} name Tag name
 * @param {...string} varargs Tag aliases
 * @inner
 */
function defineTag(clazz, name, varargs) {
    var key = "@"+name,
        aliases = Array.prototype.slice.apply(arguments, [2]);
    
    // Register tag by name
    Tag[key] = function() {
        var args = [name.toLowerCase()];
        Array.prototype.push.apply(args, arguments);
        clazz.apply(this, args);
    };
    Tag[key].prototype = Object.create(clazz.prototype);
    
    // Register tag by aliases
    aliases.forEach(function(alias) {
        Tag["@"+alias] = Tag[key];
    });
}

////////////////////////////////////////////////////// General tags ////////////////////////////////////////////////////

defineTag(Tag.TypeNameAndComment, "param");
defineTag(Tag.TypeAndComment, "type");
defineTag(Tag.TypeAndComment, "const");
defineTag(Tag.TypeAndComment, "typedef");
defineTag(Tag.TypeAndComment, "returns", "return");
defineTag(Tag.TypeAndComment, "throws");
defineTag(Tag.NameAndComment, "constructor");
defineTag(Tag.NameAndComment, "function");
defineTag(Tag.NameAndComment, "method");
defineTag(Tag.NameAndComment, "extends");
defineTag(Tag.NameAndComment, "augments");
defineTag(Tag.NameAndComment, "implements");
defineTag(Tag.NameAndComment, "lends");
defineTag(Tag.TypeAndComment, "enum");
defineTag(Tag.TypeAndComment, "this");
defineTag(Tag.NameAndComment, "property");
defineTag(Tag.Comment, "interface");
defineTag(Tag.Comment, "override");
defineTag(Tag.Comment, "static");
defineTag(Tag.Comment, "see");
defineTag(Tag.Comment, "public");
defineTag(Tag.Comment, "protected");
defineTag(Tag.Comment, "private");
defineTag(Tag.Comment, "inner");
defineTag(Tag.Comment, "struct");
defineTag(Tag.Comment, "access");
defineTag(Tag.Comment, "abstract");
defineTag(Tag.Comment, "const", "constant");

///////////////////////////////////////////////// Closure Compiler /////////////////////////////////////////////////////

defineTag(Tag.TypeAndComment, "define");
defineTag(Tag.Comment, "dict");
defineTag(Tag.Comment, "externs");
defineTag(Tag.Comment, "nosideeffects");
defineTag(Tag.Comment, "expose");

/////////////////////////////////////////////////// Literal tags ///////////////////////////////////////////////////////

defineTag(Tag.Comment, "author");
defineTag(Tag.Comment, "version");
defineTag(Tag.Comment, "since");
defineTag(Tag.Comment, "deprecated");
defineTag(Tag.Comment, "fileoverview");
defineTag(Tag.Comment, "todo");
defineTag(Tag.Comment, "summary");
defineTag(Tag.Comment, "license");
defineTag(Tag.Comment, "preserve");
