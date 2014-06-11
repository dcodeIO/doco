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
 * @alias {doco.Tag}
 * @inner
 */
var Tag = require("../Tag.js");

/**
 * Constructs a new NameAndComment Tag.
 * @class A NameAndComment Tag of the form `@someTag someName Some comment`.
 * @param {string} tagName Tag name
 * @param {string} def Name and comment
 * @constructor
 * @extends doco.Tag
 */
var NameAndComment = function(tagName, def) {
    Tag.call(this, tagName);
    def = def || "";
    var pos = def.indexOf(' ');
    if (pos >= 0) {
        this.name = def.substring(0, pos);
        this.comment = def.substring(pos+1).trimLeft();
    } else {
        this.name = def;
        this.comment = "";
    }
};

NameAndComment.prototype = Object.create(Tag.prototype);

module.exports = NameAndComment;
