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
var Namespace = require("./Namespace.js");

/**
 * @alias doco.TypeDef
 * @inner
 */
var TypeDef = require("../TypeDef.js");

/**
 * A Reflect Function.
 * @constructor Constructs a Function with the specified name from the given comment.
 * @param {string} name Function name
 * @param {!doco.Builder.Comment} comment Comment
 * @extends doco.Reflect.Namespace
 */
function Function(name, comment) {
    Namespace.call(this, name, comment);

    /**
     * Function definition.
     * @type {?doco.TypeDef.FunctionDef}
     */
    this.def = comment.def || null;

    /**
     * Function parameters.
     * @type {!Array.<{name: string, type: ?doco.TypeDef, description: ?string}>}
     */
    this.parameters = [];

    var params = comment.getTags("param");
    if (this.func) { // Get exact list of parameters and populate
        this.func.parameters.forEach(function(p) {
            var t = undefined, c = "";
            for (var i=0, k=params.length; i<k; i++) {
                if (params[i].name === p) {
                    t = params[i].type || undefined;
                    c = params[i].comment || "";
                }
            }
            this.parameters.push({ name: p, type: t, description: c });
        }.bind(this));
    } else { // Build from @param tags only
        params.forEach(function(p) {
            this.parameters.push({ name: p.name, type: p.type || undefined, description: p.comment || "" });
        }.bind(this));
    }

    /**
     * Return type.
     * @type {?{type: ?doco.TypeDef, description: ?string}}
     */
    this.returns = null;

    var tag;
    if (tag = comment.getTag(["returns", "return"])) {
        this.returns = { type: tag.type, description: tag.comment };
    }
}

Function.prototype = Object.create(Namespace.prototype);

module.exports = Function;
