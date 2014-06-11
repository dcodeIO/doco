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
 * @alias doco
 * @inner
 */
var doco = require("../src/doco.js");

/**
 * package.json.
 * @type {*}
 * @inner
 */
var pkg = require("../package.json");

/**
 * doco Markdown generator.
 * @param {!doco.Builder} builder
 * @returns {!Buffer} Markdown
 */
function docoMarkdown(builder) {
    var root = builder.ns,
        out = [],
        val;
    
    // Overview
    if (val = root.getTag("overview")) {
        out.push(val, "\n\n");
    }

    // Root
    for (var i=0; i<root.children.length; i++) {
        var child = root.children[i];
        if (child.hasTag("inner") || child.hasTag("private")) continue;
        if (child instanceof doco.Reflect.Class) {
            out.push("### ", makeClass(child, true));
        } else if (child instanceof doco.Reflect.Variable) {
            out.push("### ", makeVariable(child, true));
        } else if (child instanceof doco.Reflect.Function) {
            out.push("### ", makeFunction(child, true));
        }
    }
    
    return new Buffer(out.join(''), "utf8");
}

/**
 * Makes a class.
 * @param {!doco.Reflect.Class} c Class to make
 * @param {boolean=} fqn Whether to use the fully qualified name or not, defaults to `false`
 * @returns {string} Markdown
 * @inner
 */
function makeClass(c, fqn) {
    var out = [];

    // Constructor
    out.push("#### new ", makeFunction(c));
    out.push("---\n\n");
    
    // Static members
    var proto, child, hasStatic = false, hasProto = false;
    proto = c.getChild("prototype");
    c.sort();
    if ((c.children.length > 0 && !c.hasChild("prototype")) || (c.children.length > 1 && c.hasChild("prototype"))) {
        for (var i=0, k=c.children.length; i<k; i++) {
            child = c.children[i];
            if (child.name === 'prototype' || child.hasTag("inner")) continue;
            if (child instanceof doco.Reflect.Variable) {
                out.push("#### ", makeVariable(child, true));
                hasStatic = true;
            } else if (child instanceof doco.Reflect.Function) {
                out.push("#### ", makeFunction(child, true));
                hasStatic = true;
            }
        }
    }
    if (hasStatic) out.push("---\n\n");

    // Instance members
    if (proto && proto.children.length > 0) {
        for (i=0, k=proto.children.length; i<k; i++) {
            child = proto.children[i];
            if (child instanceof doco.Reflect.Variable) {
                out.push("#### ", makeVariable(child, true));
                hasProto = true;
            } else if (child instanceof doco.Reflect.Function) {
                out.push("#### ", makeFunction(child, true));
                hasProto = true;
            }
        }
    }

    // Name
    out.unshift("\n---\n\n");
    out.unshift("Class ", fqn ? c.fqn(true) : c.name, "\n", c.classDescription ? "\n"+c.classDescription+"\n" : "");

    out.push("---\n*Generated with ["+pkg['name']+"](https://github.com/dcodeIO/doco) v"+pkg['version']+"*\n");
    return out.join('');
}

/**
 * Makes a variable.
 * @param {!doco.Reflect.Variable} v Variable to make
 * @param {boolean=} fqn Whether to use the fully qualified name or not, defaults to `false`
 * @returns {string} Markdown
 * @inner
 */
function makeVariable(v, fqn) {
    var out = [];

    // Name
    var type = v.getType();
    type = type ? type.toString() : "?";
    out.push(fqn ? v.fqn(true) : v.name, "\n", v.description ? "\n"+makeComment(v.description, v)+"\n" : "", "\n");
    out.push("|               |               |\n");
    out.push("|---------------|---------------|\n");
    out.push("|", "**@type**".justify(15),"|", makeType(type).justify(15), "|", "\n");
    out.push("|", "**@access**".justify(15), "|");
    var access = v.access ? v.access : "public";
    if (v.const) {
        if (access !== "") access += " ";
        access += "const";
    }
    out.push(access.justify(15), "|\n");
    out.push("\n");
    return out.join('');
}

/**
 * Makes a type.
 * @param {?doco.TypeDef} t Type
 * @returns {string} Markdown
 * @inner
 */
function makeType(t) {
    if (!t) return "";
    var str = t.toString();
    if (str.length > 2 && str.charAt(0) === "(" && str.charAt(str.length-1) == ")") {
        str = str.substring(1, str.length-1);
    }
    return "*"+str.replace(/\|/g, " &#124; ").replace(/</g, "&lt;").replace(/>/g, "&gt;")+"*"; // GitHub markdown has no escaping of table cells, so use the entity instead
}

/**
 * Makes a comment.
 * @param {string} c Comment
 * @param {!doco.Reflect.Namespace} ns Namespace
 * @returns {string} Markdown
 * @inner
 */
function makeComment(c, ns) {
    if (c === null) return "";
    return c.replace(/{@link ([^}]+)}/g, function($0, $1) { return "["+$1+"](#"+makeAnchor($1, ns)+")"; });
}

/**
 * Makes a GitHub friendly link anchor.
 * @param {string} link Link
 * @param {!doco.Reflect.Namespace=} ns Namespace
 * @returns {string} Anchor
 */
function makeAnchor(link, ns) {
    if (ns) {
        var resolved = ns.resolve(link);
        if (resolved && resolved instanceof doco.Reflect.Function) {
            link = makeFunctionTitle(resolved, true);
        }
    }
    return link.toLowerCase().replace(/\s/g, "-").replace(/[^a-z0-9\-_]/g, "");
}

/**
 * Makes a function.
 * @param {!doco.Reflect.Function} f Function to make
 * @param {boolean=} fqn Whether to use the fully qualified name or not, defaults to `false`
 * @returns {string} Markdown
 * @inner
 */
function makeFunction(f, fqn) {
    var out = [];
    out.push(makeFunctionTitle(f, fqn), "\n", f.description ? "\n"+makeComment(f.description, f)+"\n" : "", "\n");
    out.push(makeParametersTable(f), "\n");
    return out.join('');
}

/**
 * Makes a function's title.
 * @param {!doco.Reflect.Function} f Function to make
 * @param {boolean=} fqn Whether to use the fully qualified name or not, defaults to `false`
 * @returns {string} Function title
 */
function makeFunctionTitle(f, fqn) {
    var params = [], param;
    for (var i=0, k=f.parameters.length; i<k; i++) {
        param = f.parameters[i];
        if (param.type && param.type.omittable) {
            params.push(param.name+"==");
        } else if (param.type && param.type.optional) {
            params.push(param.name+"=");
        } else {
            params.push(param.name);
        }
    }
    return (fqn ? f.fqn(true) : f.name) + "(" + params.join(', ') + ")";
}

/**
 * Makes a function's parameters table.
 * @param {!doco.Reflect.Function} f Function to make a parameters table for
 * @returns {string} Markdown
 * @inner
 */
function makeParametersTable(f) {
    var out = [
        "|Parameter      |Type           |Description  \n",
        "|---------------|---------------|-------------\n"
    ];
    var param;
    for (var i=0, k=f.parameters.length; i<k; i++) {
        param = f.parameters[i];
        out.push("|", param.name.justify(15), "|");
        if (param.type) {
            out.push(makeType(param.type).justify(15), "|");
        } else {
            out.push(" ".justify(15), "|");
        }
        out.push(param.description ? makeComment(param.description.replace(/\r?\n/g, " ").replace("|", "&#124;"), f)+" " : "", "\n");
    }
    if (f.returns) {
        out.push("|", "**@returns**".justify(15),"|");
        if (f.returns.type) {
            out.push(makeType(f.returns.type).justify(15), "|");
        } else {
            out.push(" ".justify(15), "|");
        }
        out.push(f.returns.description ? makeComment(f.returns.description.replace(/\r?\n/g, " ").replace("|", "&#124;"), f)+" " : "", "\n");
    }
    var tags = f.getTags("throws");
    if (tags.length > 0) {
        for (i=0; i<tags.length; i++) {
            var tag = tags[i];
            out.push("|", "**@throws**".justify(15), "|");
            if (tag.type) {
                out.push(makeType(tag.type).justify(15), "|");
            } else {
                out.push(" ".justify(15), "|");
            }
            out.push(tag.comment ? makeComment(tag.comment.replace(/\r?\n/g, " ").replace("|", "&#124;"), f)+" " : "", "\n");
        }
    }
    return out.join('');
}

String.prototype.justify = function(len) {
    var str = this+"";
    while (str.length < len) str = str+" ";
    return str;
};

module.exports = docoMarkdown;
