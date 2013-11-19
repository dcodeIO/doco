module.exports = function(doco) {
    'use strict';
    
///
// Types
///
    
    /**
     * Primitive types that may by default not become `null`.
     * @type {!Array.<string>}
     * @const
     */
    doco.PrimitiveTypes = ["number", "string", "boolean", "undefined"];
    // NOTE: There is neither a primitive type `object` nor `array`. Both are real objects, even if `typedef` returns a
    // lower case output. So: Never annotate something with `object` or `array` as this is wrong. Closure Compiler won't
    // understand that for example. If you do however, doco will actually try to resolve that to a class name as both
    // would be valid. Try it yourself!
    // For everything else, e.g. `function`, see: https://developers.google.com/closure/compiler/docs/js-for-compiler

    /////////////////////////// Abstract ///////////////////////////
    
    /**
     * Constructs a new Type. This is the base class of all the types we know of.
     * @param {boolean|undefined} maybeNull Whether the type may be null or not. May be explicitly `undefined`.
     * @constructor
     * @abstract
     */
    doco.Type = function Type(maybeNull) {
        
        /**
         * Whether this Type may become null.
         * @type {boolean|undefined}
         */
        this.maybeNull = maybeNull;

        /**
         * Whether this is a type of variable arguments. Used in function arguments only.
         * @type {boolean}
         */
        this.varargs = false;

        /**
         * Whether this Type is optional. Used in function arguments only.
         * @type {boolean|undefined}
         */
        this.optional = undefined;
    };

    /**
     * Constructs a new MultiType. This is the base class of all types that may contain multiple other types.
     * @param {boolean|undefined} maybeNull Whether the type may be null or not. May be explicitly `undefined`.
     * @constructor
     * @extends doco.Type
     * @abstract
     */
    doco.MultiType = function MultiType(maybeNull) {
        doco.Type.call(this, maybeNull);
        
        /**
         * Types contained in this MultiType.
         * @type {!Array.<!doco.Type>}
         **/
        this.types = [];
    };

    // Extends doco.Type
    doco.MultiType.prototype = Object.create(doco.Type.prototype);

    /**
     * Adds one more Type to this MultiType.
     * @param {!doco.Type} type Type to add
     */
    doco.MultiType.prototype.add = function(type) {
        if (!(type instanceof doco.Type)) {
            throw(new Error("Illegal type: "+type+" (not a doco.Type)"));
        }
        this.types.push(type);
    };

    ////////////////////////// Non-abstract /////////////////////////

    /**
     * Constructs a new OrType that wraps multiple alternative types, e.g. `(string|number)`.
     * @param {boolean|undefined} maybeNull Whether the type may be null or not. May be explicitly `undefined`.
     * @constructor
     * @extends doco.MultiType
     */
    doco.OrType = function OrType(maybeNull) {
        doco.MultiType.call(this, maybeNull);
    };

    // Extends doco.MultiType
    doco.OrType.prototype = Object.create(doco.MultiType.prototype);

    /**
     * Returns the string representation of this instance.
     * @returns {string}
     */
    doco.OrType.prototype.toString = function() {
        var str = [];
        this.types.forEach(function(type) {
            str.push(type.toString());
        });
        if (this.maybeNull === true) {
            return '?('+str.join('|')+')';
        } else if (this.maybeNull === false) {
            return '!('+str.join('|')+')';
        }
        return '('+str.join('|')+')';
    };

    /**
     * Constructs a new NamedType that represents a single type, e.g. `Array.<number,string>`.
     * @param {boolean|undefined} maybeNull Whether the type may be null or not. May be explicitly `undefined`.
     * @constructor
     * @extends doco.Type
     */
    doco.NamedType = function NamedType(maybeNull) {
        doco.Type.call(this, maybeNull);
        
        /**
         * The provided name.
         * @type {string}
         **/
        this.name = "";
        
        /**
         * Annotated generic types.
         * @type {?Array.<doco.Type>}
         */ 
        this.generics = null;
    };

    // Extends doco.Type
    doco.NamedType.prototype = Object.create(doco.Type.prototype);

    /**
     * Returns the string representation of this instance.
     * @returns {string}
     */
    doco.NamedType.prototype.toString = function() {
        var str = [];
        if (doco.PrimitiveTypes.indexOf(this.name) >= 0) { // Defaults to false
            if (this.maybeNull === true) {
                str.push('?');
            }
        } else { // Defaults to true
            if (this.maybeNull === false) {
                str.push('!');
            }
        }
        str.push(this.name);
        if (this.generics !== null && this.generics.length > 0 ) {
            str.push('.<');
            for (var i=0; i<this.generics.length; i++) {
                if (i>0) str.push(',');
                str.push(this.generics[i]);
            }
            str.push('>');
        }
        return str.join('');
    };

    /**
     * Constructs a new ObjectType that wraps all properties of an explicitly typed object, e.g. `{key: string}`.
     * @param {boolean|undefined} maybeNull Whether the type may be null or not. May be explicitly `undefined`.
     * @constructor
     * @extends doco.Type
     */
    doco.ObjectType = function ObjectType(maybeNull) {
        doco.Type.call(this, maybeNull);
        
        /**
         * Object properties as key/value pairs.
         * @type {!Object.<string,!doco.Type>}
         */
        this.properties = {};
    };

    // Extends doco.Type
    doco.ObjectType.prototype = Object.create(doco.Type.prototype);

    /**
     * Adds one more property to this ObjectType.
     * @param {string} name Property name
     * @param {!doco.Type} type Property type
     * @override
     */
    doco.ObjectType.prototype.add = function(name, type) {
        if (typeof name !== 'string') {
            throw(new Error("Illegal property name: "+name+" (not a string)"));
        }
        if (!type instanceof doco.Type) {
            throw(new Error("Illegal property type: "+type+" (not a doco.NamedType)"));
        }
        if (this.properties.hasOwnProperty(name)) {
            throw(new Error("Duplicate property name: "+name));
        }
        this.properties[name] = type;
    };

    /**
     * Returns the string representation of this instance.
     * @returns {string}
     */
    doco.ObjectType.toString = function() {
        var str = ['{'];
        Object.keys(this.properties).forEach(function(key, i) {
            if (i>0) str.push(', ');
            str.push(key);
            str.push(': ');
            str.push(this.properties[key].toString());
        });
        str.push('}');
    };

    /**
     * Constructs a new FunctionType that wraps its arguments.
     * @param {boolean|undefined} maybeNull
     * @constructor
     * @extends doco.MultiType
     */
    doco.FunctionType = function FunctionType(maybeNull) {
        doco.MultiType.call(this, maybeNull);

        /**
         * What `this` refers to in the context of the function.
         * @type {!doco.Type|undefined}
         */
        this.this = undefined;

        /**
         * The instance type created by the function when using the `new` keyword.
         * @type {!doco.Type|undefined}
         */
        this.new = undefined;

        /**
         * The returned type.
         * @type {!doco.Type|undefined}
         */
        this.returns = undefined;
    };
    
    // Extends doco.MultiType
    doco.FunctionType.prototype = Object.create(doco.MultiType.prototype);

    /**
     * Returns the string representation of this instance.
     * @returns {string}
     */
    doco.FunctionType.prototype.toString = function() {
        var str = [];
        for (var i=0; i<this.types.length; i++) {
            if (this.types[i].varargs) {
                str.push("...["+this.types[i].toString()+"]");
            } else {
                str.push(this.types[i].toString());
            }
        }
        var res = [];
        if (this.maybeNull === false) {
            res.push('!');
        }
        res.push("function("+str.join(', ')+")");
        if (typeof this.returns !== 'undefined') {
            res.push(":");
            res.push(this.returns.toString());
        }
        return res.join('');
    };
    
///
// Interpreter
///

    /**
     * Interprets a type definition.
     * @param {string} str Type definition and/or trailing comment
     * @returns {{type: ?doco.Type, remain: string}}
     * @throws {Error} If there is none or an invalid type definition
     */
    doco.interpretTypeDef = function(str) {
        str = str.trim();
        if (str.length == 0 || str.charAt(0) != '{') {
            return {
                'type': null,
                'remain': str
            };
        }
        // Welcome to the fun part
        var def = parseTypeDef(str.substring(1).trimLeft());
        var optional = false;
        str = def['remain']; // Already trimmed and at least one char
        if (str.charAt(0) == '=') {
            optional = true;
            str = str.substring(1).trimLeft();
        }
        if (str.length == 0 || str.charAt(0) != '}') {
            throw(new Error("Missing closing delimiter: "+str+" ('}' expected)"));
        }
        // Puh...
        var type = normalizeTypeDef(def['type']);
        type.optional = optional;
        return {
            'type': type,
            'remain': str.substring(1).trimLeft()
        };
    };

    /**
     * Normalizes an OrType by unwrapping all single-element OrTypes and adding `null` alternatives where annotated.
     * @param {!doco.OrType} def OrType to normalize
     * @return {!doco.Type} Normalized type that might no longer be an OrType if unwrapped
     */
    function normalizeOrType(def) {
        if (def instanceof doco.OrType) { // Normalize all sub-OrTypes
            for (var i=0; i<def.types.length; i++) {
                if (def.types[i] instanceof doco.OrType) {
                    def.types[i] = normalizeOrType(def.types[i]);
                }
            }
        }
        // Maybe unwrap
        while (def instanceof doco.OrType && def.types.length == 1) {
            def = def.types[0];
        }
        return def;
    }

    /**
     * Normalizes a type definition by unwrapping all single-element OrTypes and adding `null` alternatives where
     *  appropriate.
     * @param {!doco.Type} def Type definition to normalize
     * @returns {!doco.Type} def Normalized type definition
     */
    function normalizeTypeDef(def) {
        if (def instanceof doco.OrType) {
            def = normalizeOrType(def);
        }
        return def;
    }
    
///
// Parser
///

    /**
     * Parses a type definition, e.g. `{number|?(Object.<string,!Array.<{key: string, value: number}>>))`. You name it.
     * @param {string} str Definition string
     * @param {boolean=} isFunctionArgument Whether this is a function argument or not
     * @returns {{type: !doco.Type, remain: string}}
     * @throws {!Error} If the type definition cannot be parsed
     */
    function parseTypeDef(str, isFunctionArgument) {
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
                if (!(def instanceof doco.OrType)) {
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
            if (str.charAt(0) === '=' && isFunctionArgument && def) {
                def.optional = true;
                
            }
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
                    process(parseObjectType(str, maybeNull));
                    break; // Next
                case '(':
                    if (def === null) {
                        def = new doco.OrType(maybeNull);
                        str = str.substring(1).trimLeft();
                    } else {
                        process(parseTypeDef(str));
                    }
                    break; // Next
                case '|':
                    if (def === null) {
                        throw("Illegal '|': "+str+" (type expected)");
                    }
                    if (!(def instanceof doco.OrType)) { // Make it one
                        var parent = new doco.OrType(undefined);
                        parent.add(def);
                        def = parent;
                    }
                    str = str.substring(1).trimLeft();
                    break; // Skip this and process the next as at this point there might be an OrType only
                case '<':
                    throw(new Error("Illegal '<': "+str+" (type delimiter expected)"));
                case ')':
                    if (def instanceof doco.OrType) {
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
                        process(parseFunctionType(str, maybeNull));
                    } else {
                        process(parseNamedType(str, maybeNull));
                    }
                    break; // Next
            }
        }
        throw(new Error("Missing closing delimiter: "+str+" (end of input)"));
    }

    /**
     * Parses an object definition, e.g. `{key: string, value: !(RegExp|Object.<string,Array.<number>)>}`.
     * @param {string} str String to parse
     * @param {boolean|undefined} maybeNull Whether the type may be null or not
     * @returns {{type: !doco.ObjectType, remain: string}}
     * @throws {!Error} If the type definition cannot be parsed
     */
    function parseObjectType(str, maybeNull) {
        // It's known to start with `{`
        str = str.substring(1).trimLeft();

        // Processes a sub-type / property and updates the input afterwards.
        function process(sub) {
            def.add(name, sub['type']);
            str = sub['remain'];
            name = '';
        }

        var def = new doco.ObjectType(typeof maybeNull === 'undefined' ? true : maybeNull),
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
                    process(parseTypeDef(str));
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
    }

    /**
     * Parses a single named type definition, e.g. `!Object.<number,string>`.
     * @param {string} str String to parse
     * @param {boolean|undefined} maybeNull Whether the type may be null or not
     * @returns {{type: !doco.NamedType, remain: string}}
     * @throws {!Error} If the type definition cannot be parsed
     */
    function parseNamedType(str, maybeNull) {
        var def = new doco.NamedType(maybeNull),
            name = '';

        var i=0;
        while (i<str.length) {
            switch (str.charAt(i)) {
                case '<':
                    if (name.length == 0) {
                        throw(new Error("Illegal start of annotation: "+str+" (missing type name)"));
                    }
                    if (str.charAt(i-1) !== '.') {
                        throw(new Error("Illegal start of annotation: "+str+" ('.<' expected)"));
                    }
                    def.name = name.substring(0, name.length-1);
                    var sub = parseGenericTypes(str.substring(i));
                    if (typeof def.maybeNull === 'undefined') {
                        if (def.name === 'null') { // Normalized later
                            def.maybeNull = true;
                        } else {
                            if (doco.PrimitiveTypes.indexOf(def.name) >= 0) {
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
                            if (doco.PrimitiveTypes.indexOf(def.name) >= 0) {
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
    }

    /**
     * Parsesa a function type definition, e.g. `function(new: MyClass, string, ...[number])`.
     * @param {string} str String to parse
     * @param {boolean|undefined} maybeNull Whether this type may become null or not
     * @returns {{type: doco.FunctionType, remain: string}}
     * @throws (!Error} If the types cannot be parsed
     */
    function parseFunctionType(str, maybeNull) {
        // It's known to start with `function` before a word boundary
        str = str.substring(8).trimLeft();
        // Parses the next function argument
        function parse() {
            var match, sub;
            if (str.length == 0 || str.charAt(0) == ')') {
                // No args or invalid, continue
            } else if (match = /^(this\s*:)/.exec(str)) {
                str = str.substring(match[1].length).trimLeft();
                sub = parseTypeDef(str);
                def.this = sub['type'];
                str = sub['remain'];
            } else if (match = /^(new\s*:)/.exec(str)) {
                str = str.substring(match[1].length).trimLeft();
                sub = parseTypeDef(str);
                def.new = sub['type'];
                str = sub['remain'];
            } else if (match = /^(\.\.\.)/.exec(str)) {
                str = str.substring(match[1].length).trimLeft();
                if (str.charAt(0) == '[') {
                    sub = parseTypeDef(str.substring(1), true);
                    str = sub['remain'];
                    if (str.length == 0 ||str.charAt(0) != ']') {
                        throw(new Error("Missing enclosing delimiter in varargs type: "+str+" (']' expected)"));
                    }
                    str = str.substring(1).trimLeft();
                } else {
                    sub = parseTypeDef(str, true);
                    str = sub['remain'];
                }
                sub['type'].varargs = true;
                def.add(sub['type']);
            } else {
                sub = parseTypeDef(str, true);
                def.add(sub['type']);
                str = sub['remain'];
            }
        }
        
        var def = new doco.FunctionType(maybeNull);
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
                        var sub = parseTypeDef(str);
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
    }
    
    /**
     * Parses an generic type definition, e.g. `.<number,string>`
     * @param {string} str String to parse
     * @returns {types: !Array.<doco.Type>, remain: string}
     * @thorws {!Error} If the types cannot be parsed
     */
    function parseGenericTypes(str) {
        // It's known to start with `.<` but only the `<` is given
        /** @type {!Array.<doco.Types>} */
        var types = [];
        str = str.substring(1).trimLeft();
        while (str.length > 0) {
            var sub = parseTypeDef(str);
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
    }

};
