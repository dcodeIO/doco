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
 * @alias doco.Reflect.Namespace
 * @inner
 */
var Function = require("./Function.js");

/**
 * A Reflect Class.
 * @constructor Constructs a new Class with the specified name from the given comment.
 * @param {string} name Class name
 * @param {!doco.Builder.Comment} comment Comment
 * @extends doco.Reflect.Function
 */
function Class(name, comment) {
    Function.call(this, name, comment);
    var tag;

    /**
     * Class description.
     * @type {?string}
     */
    this.classDescription = null;

    if ((tag = comment.getTag("class")) && tag.comment) {
        this.classDescription = tag.comment;
    }

    /**
     * Whether the Class is abstract (meant to be extended) or not.
     * @type {boolean}
     */
    this.abstract = comment.hasTag("abstract");

    /**
     * Extended Class.
     * @type {?string}
     */
    this.extends = null;
    if ((tag = comment.getTag("extends")) && tag.name) {
        this.extends = tag.name;
    }

    /**
     * Mixed in Classes.
     * @type {!Array.<string>}
     */
    this.mixins = [];
    if ((tag = comment.getTags("mixin")) && tag.length > 0) {
        for (var i=0, k=tag.length; i<k; i++) {
            if (tag[i].name) {
                this.mixins.push(tag[i].name);
            }
        }
    }
}

Class.prototype = Object.create(Function.prototype);

module.exports = Class;
