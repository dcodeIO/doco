/**
 * @alias doco.TypeDef
 */
var TypeDef = require("../TypeDef.js");

/**
 * @name doco.TypeDef.Parser
 * @type {Object.<string,*>}
 */
var Parser = {};

/**
 * Parses a type definition, e.g. `{number|?(Object.<string,!Array.<{key: string, value: number}>>))`. You name it.
 * @param {string} str Definition string
 * @param {boolean=} isFunctionArgument Whether this is a function argument or not
 * @returns {!{type: !doco.Type, remain: string}}
 * @throws {Error} If the type definition cannot be parsed
 */
Parser.parseTypeDef = function(str, isFunctionArgument) {
    str = str.trimLeft();
    if (str.length == 0) {
        throw(new Error("Unexpected end of input (type or delimiter expected"));
    }
    // It's recursive because doing this iteratively turned out to be pretty annoying at first. Should be ok for a
    // documentation generator.

    // Processes a new sub-type: Sets the current type if not already set or, if set, wraps it into an OrType. Updates
    // the input afterwards.
    function process(sub) {
        if (def === null) {
            def = sub['type'];
        } else {
            if (!(def instanceof TypeDef.OrType)) {
                throw(new Error("Illegal continuation of non-or-type: "+str));
            }
            def.add(sub['type']);
        }
        str = sub['remain'];
        maybeNull = undefined;
    }

    var def = null,
        maybeNull = undefined;
    while (str.length > 0) {
        switch (str.charAt(0)) {
            case '?':
            case '!':
                if (typeof maybeNull !== 'undefined') {
                    throw("Illegal '?': "+str+" (already defined as maybeNull="+maybeNull+")");
                }
                maybeNull = str.charAt(0) == '?';
                str = str.substring(1).trimLeft();
                break; // Next
            case '{':
                process(Parser.parseObjectType(str, maybeNull));
                break; // Next
            case '(':
                if (def === null) {
                    def = new TypeDef.OrType(maybeNull);
                    str = str.substring(1).trimLeft();
                } else {
                    process(Parser.parseTypeDef(str));
                }
                break; // Next
            case '|':
                if (def === null) {
                    throw("Illegal '|': "+str+" (type expected)");
                }
                if (!(def instanceof TypeDef.OrType)) { // Make it one
                    var parent = new TypeDef.OrType(undefined);
                    parent.add(def);
                    def = parent;
                }
                str = str.substring(1).trimLeft();
                break; // Skip this and process the next as at this point there might be an OrType only
            case '<':
                throw(new Error("Illegal '<': "+str+" (type delimiter expected)"));
            case ')':
                if (def instanceof TypeDef.OrType) {
                    str = str.substring(1).trimLeft();
                } // fallthrough
            case '}':
            case ',':
            case '>':
            case ']':
            case '=':
                if (def === null) {
                    throw(new Error("Illegal '"+str.charAt(0)+"': "+str+" (type expected)"));
                }
                if (str.charAt(0) === '=' && isFunctionArgument) {
                    if (def === null) {
                        throw("Illegal '=': "+str+" (type expected)");
                    }
                    def.optional = true;
                    str = str.substring(1).trimLeft();
                }
                return { 'type': def, 'remain': str }; // Pass this up a level including the delimiter
            default:
                if (/^function\b/.test(str)) {
                    process(Parser.parseFunctionType(str, maybeNull));
                } else {
                    process(Parser.parseNamedType(str, maybeNull));
                }
                break; // Next
        }
    }
    throw(new Error("Missing closing delimiter: "+str+" (end of input)"));
};

/**
 * Parses an object definition, e.g. `{key: string, value: !(RegExp|Object.<string,Array.<number>)>}`.
 * @param {string} str String to parse
 * @param {boolean|undefined} maybeNull Whether the type may be null or not
 * @returns {{type: !doco.TypeDef.ObjectType, remain: string}}
 * @throws {Error} If the type definition cannot be parsed
 */
Parser.parseObjectType = function(str, maybeNull) {
    // It's known to start with `{`
    str = str.substring(1).trimLeft();

    // Processes a sub-type / property and updates the input afterwards.
    function process(sub) {
        def.add(name, sub['type']);
        str = sub['remain'];
        name = '';
    }

    var def = new TypeDef.ObjectType(typeof maybeNull === 'undefined' ? true : maybeNull),
        name = '';
    while (str.length > 0) {
        switch(str.charAt(0)) {
            case ' ':
                str = str.trimLeft();
                if (str.length == 0 || str.charAt(0) !== ':') {
                    throw(new Error("Unexpected ' ': "+str+" (':' expected)"));
                }
            // Fallthrough
            case ':':
                if (name.length == 0) {
                    throw(new Error("Unexpected ':': "+str+" (property name is empty)"));
                }
                str = str.substring(1).trimLeft();
                process(Parser.parseTypeDef(str));
                break; // Next
            case ',':
                if (name.length > 0) {
                    throw("Illegal ',': "+str+" (':' expected)");
                }
                str = str.substring(1).trimLeft();
                break; // Next
            case '}':
                if (name.length > 0) {
                    throw("Illegal '}': "+str+" (':' expected)");
                }
                return {
                    'type': def,
                    'remain': str.substring(1).trimLeft()
                };
                break; // Skip
            case '<':
            case '>':
            case '(':
            case ')':
                throw(new Error("Illegal '"+str.charAt(0)+": "+str+" (',' or '}' expected)"));
            default:
                name += str.charAt(0);
                str = str.substring(1);
        }
    }
    throw(new Error("Missing closing delimiter: "+str+" (end of input)"));
};

/**
 * Parses a single named type definition, e.g. `!Object.<number,string>`.
 * @param {string} str String to parse
 * @param {boolean|undefined} maybeNull Whether the type may be null or not
 * @returns {{type: !doco.TypeDef.NamedType, remain: string}}
 * @throws {Error} If the type definition cannot be parsed
 */
Parser.parseNamedType = function(str, maybeNull) {
    var def = new TypeDef.NamedType(maybeNull),
        name = '';

    var i=0;
    while (i<str.length) {
        switch (str.charAt(i)) {
            case '<':
                if (name.length == 0) {
                    throw(new Error("Illegal start of annotation: "+str+" (missing type name)"));
                }
                if (str.charAt(i-1) === '.') { // Do not require the "." between Array.<string> for compatibility
                    name = name.substring(0, name.length-1);
                }
                def.name = name;
                var sub = Parser.parseGenericTypes(str.substring(i));
                if (typeof def.maybeNull === 'undefined') {
                    if (def.name === 'null') { // Normalized later
                        def.maybeNull = true;
                    } else {
                        if (TypeDef.PrimitiveTypes.indexOf(def.name) >= 0) {
                            def.maybeNull = false;
                        }
                    }
                }
                def.generics = sub['types'];
                return {
                    'type': def,
                    'remain': sub['remain']
                };
            case '{':
            case '}':
            case '(':
            case ')':
            case ' ':
            case ',':
            case '|':
            case '>':
            case '=':
            case ']':
                if (name.length == 0) {
                    throw(new Error("Illegal '"+str.charAt(i)+"': "+str+" (missing type name)"));
                }
                def.name = name;
                if (typeof def.maybeNull === 'undefined') {
                    if (def.name === 'null') { // Normalized later
                        def.maybeNull = true;
                    } else {
                        if (TypeDef.PrimitiveTypes.indexOf(def.name) >= 0) {
                            def.maybeNull = false;
                        }
                    }
                }
                return {
                    'type': def,
                    'remain': str.substring(i).trimLeft() // Delimiter handling is done a level up
                };
            default:
                name += str.charAt(i++);
        }
    }
    throw(new Error("Missing delimiter after literal: "+str+" (end of input)"));
};

/**
 * Parsesa a function type definition, e.g. `function(new: MyClass, string, ...[number])`.
 * @param {string} str String to parse
 * @param {boolean|undefined} maybeNull Whether this type may become null or not
 * @returns {{type: !doco.TypeDef.FunctionType, remain: string}}
 * @throws (Error} If the types cannot be parsed
 */
Parser.parseFunctionType = function(str, maybeNull) {
    // It's known to start with `function` before a word boundary
    str = str.substring(8).trimLeft();
    // Parses the next function argument
    function parse() {
        var match, sub;
        if (str.length == 0 || str.charAt(0) == ')') {
            // No args or invalid, continue
        } else if (match = /^(this\s*:)/.exec(str)) {
            str = str.substring(match[1].length).trimLeft();
            sub = Parser.parseTypeDef(str);
            def.this = sub['type'];
            str = sub['remain'];
        } else if (match = /^(new\s*:)/.exec(str)) {
            str = str.substring(match[1].length).trimLeft();
            sub = Parser.parseTypeDef(str);
            def.new = sub['type'];
            str = sub['remain'];
        } else if (match = /^(\.\.\.)/.exec(str)) {
            str = str.substring(match[1].length).trimLeft();
            if (str.charAt(0) == '[') {
                sub = Parser.parseTypeDef(str.substring(1), true);
                str = sub['remain'];
                if (str.length == 0 ||str.charAt(0) != ']') {
                    throw(new Error("Missing enclosing delimiter in varargs type: "+str+" (']' expected)"));
                }
                str = str.substring(1).trimLeft();
            } else {
                sub = Parser.parseTypeDef(str, true);
                str = sub['remain'];
            }
            sub['type'].varargs = true;
            def.add(sub['type']);
        } else {
            sub = Parser.parseTypeDef(str, true);
            def.add(sub['type']);
            str = sub['remain'];
        }
    }

    var def = new TypeDef.FunctionType(maybeNull);
    while (str.length > 0) {
        switch (str.charAt(0)) {
            case '(':
                str = str.substring(1).trimLeft();
                parse();
                break;
            case ')':
                str = str.substring(1).trimLeft();
                if (str.length > 0 && str.charAt(0) == ':') {
                    if (typeof def.returns !== 'undefined') {
                        throw(new Error("Illegal ':': "+str+" (return type already defined)"));
                    }
                    str = str.substring(1).trimLeft();
                    var sub = Parser.parseTypeDef(str);
                    def.returns = sub['type'];
                    str = sub['remain'];
                    return {
                        'type': def,
                        'remain': str
                    };
                }
                if (str.length > 0 && str.charAt(0) === "=") {
                    def.optional = true;
                    str = str.substring(1);
                } else {
                    def.optional = false;
                }
                return {
                    'type': def,
                    'remain': str
                };
            case ',':
                if (def.types.length > 0) {
                    str = str.substring(1).trimLeft();
                    parse();
                    break; // Next
                } // else fallthrough
            default:
                throw(new Error("Illegal '"+str.charAt(0)+"': "+str+" (function argument expected)"));
        }
    }
    throw(new Error("Missing delimiter after function declaration: "+str+" (end of input)"));
};

/**
 * Parses an generic type definition, e.g. `.<number,string>`
 * @param {string} str String to parse
 * @returns {{types: !Array.<!doco.TypeDef.Type>, remain: string}}
 * @throws {Error} If the types cannot be parsed
 */
Parser.parseGenericTypes = function(str) {
    // It's known to start with `.<` but only the `<` is given
    /** @type {!Array.<doco.Types>} */
    var types = [];
    str = str.substring(1).trimLeft();
    while (str.length > 0) {
        var sub = Parser.parseTypeDef(str);
        types.push(sub['type']);
        str = sub['remain'];
        if (str.length == 0) break;
        switch (str.charAt(0)) {
            case ',':
                str = str.substring(1).trimLeft();
                break; // Repeat
            case '>':
                return {
                    'types': types,
                    'remain': str.substring(1).trimLeft()
                };
            default:
                throw(new Error("Illegal '"+str.charAt(0)+"': "+str+" (',' or '>' expected)"))
        }
    }
    throw(new Error("Missing delimiter after generic type: "+str+" (end of input)"));
};

module.exports = Parser;
