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
var Tag = require("../Tag.js");

/**
 * Constructs a new Comment Tag.
 * @class A documented Comment Tag in the form of `@comment Hello World!`.
 * @param {string} tagName Tag Name
 * @param {string} def Comment
 * @constructor
 * @extends doco.Tag
 */
var Comment = function Comment(tagName, def) {
    Tag.call(this, tagName);

    /**
     * The comment.
     * @type {string}
     */
    this.comment = def;
};

Comment.prototype = Object.create(Tag.prototype);

module.exports = Comment;
