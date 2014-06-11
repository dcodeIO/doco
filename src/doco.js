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
 * @license doco (c) 2013 Daniel Wirtz <dcode@dcode.io>
 * Released under the Apache License, Version 2.0
 * see: https://github.com/dcodeIO/doco for details
 */ //
var util = require("util");

/**
 * doco namespace and convenience parser.
 * @param {string} source Source to parse
 * @param {function(Error, doco.Builder=)} callback Callback receiving the Builder
 */
function doco(source, callback) {
    var parser = new doco.Parser(),
        builder = new doco.Builder();
    parser.on("comment", function(comment, decl) {
        builder.interpret(comment, decl);
    });
    parser.on("error", function(err) {
        callback(err);
    });
    parser.on("finish", function() {
        callback(null, builder);
    });
    parser.write(source);
    parser.end();
}

doco.Parser      = require("./doco/Parser.js");
doco.Tag         = require("./doco/Tag.js");
doco.TypeDef     = require("./doco/TypeDef.js");
doco.Reflect     = require("./doco/Reflect.js");
doco.Builder     = require("./doco/Builder.js");

/**
 * Inspects an object including all its private members.
 * @param {*} obj Object to inspect
 * @returns {string} Console friendly result
 */
doco.inspect = function(obj) {
    return util.inspect(obj, true, null, true);
};

module.exports = doco;
