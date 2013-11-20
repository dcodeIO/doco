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
 * @alias doco.TypeDef
 */
var TypeDef = require("../TypeDef.js");

/**
 * Constrcuts a new TypeAndComment Tag.
 * @class A documented TypeAndComment Tag in the form of `@someTag {someType} Some comment`.
 * @param {string} tagName Tag name
 * @param {string} def Type definition and comment
 * @constructor
 * @extends doco.Tag
 */
var TypeAndComment = function(tagName, def) {
    Tag.call(this, tagName);
    var typeDef = TypeDef.interpret(def);
    this.type = typeDef['type'];
    this.comment = typeDef['remain'];
};

TypeAndComment.prototype = Object.create(Tag.prototype);

module.exports = TypeAndComment;
