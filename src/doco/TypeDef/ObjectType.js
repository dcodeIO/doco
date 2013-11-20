/**
 * @alias doco.TypeDef
 */
var Type = require("./Type.js");

/**
 * Constructs a new ObjectType that wraps all properties of an explicitly typed object, e.g. `{key: string}`.
 * @name doco.TypeDef.ObjectType
 * @param {boolean|undefined} maybeNull Whether the type may be null or not. May be explicitly `undefined`.
 * @constructor
 * @extends doco.TypeDef.Type
 */
var ObjectType = function ObjectType(maybeNull) {
    Type.call(this, maybeNull);

    /**
     * Object properties as key/value pairs.
     * @type {!Object.<string,!doco.TypeDef.Type>}
     */
    this.properties = {};
};

ObjectType.prototype = Object.create(Type.prototype);

/**
 * Adds one more property to this ObjectType.
 * @param {string} name Property name
 * @param {!doco.TypeDef.Type} type Property type
 * @override
 */
ObjectType.prototype.add = function(name, type) {
    if (typeof name !== 'string') {
        throw(new Error("Illegal property name: "+name+" (not a string)"));
    }
    if (!type instanceof Type) {
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
ObjectType.prototype.toString = function() {
    var str = ['{'];
    Object.keys(this.properties).forEach(function(key, i) {
        if (i>0) str.push(', ');
        str.push(key);
        str.push(': ');
        str.push(this.properties[key].toString());
    });
    str.push('}');
    return str.join('');
};

module.exports = ObjectType;
