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
 * @alias doco.Reflect.T
 * @inner
 */
var T = require("./T.js");

/**
 * A Reflect Variable.
 * @constructor Constructs a new Variable with the specified name from the given comment.
 * @param {string} name Variable name
 * @param {!doco.Builder.Comment} comment Comment
 */
function Variable(name, comment) {
    T.call(this, name, comment);

    /**
     * Type definition.
     * @type {?doco.TypeDef}
     */
    this.type = null;

    /**
     * Whether this variable is (meant to have) a constant value.
     * @type {boolean}
     */
    this.const = false;

    /**
     * Access level.
     * @type {?string}
     */
    this.access = null;

    var tag;
    if (tag = this.getTag("type")) {
        if (tag.type) {
            this.type = tag.type;
        }
    }
    if (tag = this.getTag("const")) {
        this.const = true;
        if (tag.type) {
            this.type = tag.type;
        }
    }
    if (tag = this.getTag("public")) {
        this.access = "public";
    } else if (tag = this.getTag("private")) {
        this.access = "private";
    } else if (tag = this.getTag("access")) {
        this.access = tag.name;
    }
}

Variable.prototype = Object.create(T.prototype);

/**
 * Gets the variable's type.
 * @returns {?doco.TypeDef} Type
 */
Variable.prototype.getType = function() {
    var tag;
    if ((tag = this.getTag("type")) && tag.type) {
        return tag.type;
    } else if ((tag = this.getTag("const")) && tag.type) {
        return tag.type;
    }
    return null;
};

module.exports = Variable;
