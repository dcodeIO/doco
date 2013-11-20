/**
 * @alias doco.TypeDef
 */
var TypeDef = require("../TypeDef.js");

/**
 * @alias doco.TypeDef.Type
 */
var Type = require("./Type.js");

/**
 * Constructs a new NamedType that represents a single type, e.g. `Array.<number,string>`.
 * @param {boolean|undefined} maybeNull Whether the type may be null or not. May be explicitly `undefined`.
 * @constructor
 * @extends doco.TypeDef.Type
 */
var NamedType = function NamedType(maybeNull) {
    Type.call(this, maybeNull);

    /**
     * The provided name.
     * @type {string}
     **/
    this.name = "";

    /**
     * Annotated generic types.
     * @type {?Array.<doco.TypeDef.Type>}
     */
    this.generics = null;
};

NamedType.prototype = Object.create(Type.prototype);

/**
 * Returns the string representation of this instance.
 * @returns {string}
 */
NamedType.prototype.toString = function() {
    var str = [];
    if (TypeDef.PrimitiveTypes.indexOf(this.name) >= 0) { // Defaults to false
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
            str.push(this.generics[i].toString());
        }
        str.push('>');
    }
    return str.join('');
};

module.exports = NamedType;
