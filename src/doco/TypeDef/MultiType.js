/**
 * @alias doco.TypeDef.Type
 */
var Type = require("./Type.js");

/**
 * Constructs a new MultiType. This is the base class of all types that may contain multiple other types.
 * @name doco.TypeDef.MultiType
 * @param {boolean|undefined} maybeNull Whether the type may be null or not. May be explicitly `undefined`.
 * @constructor
 * @extends doco.TypeDef.Type
 * @abstract
 */
var MultiType = function MultiType(maybeNull) {
    Type.call(this, maybeNull);

    /**
     * Types contained in this MultiType.
     * @type {!Array.<!doco.TypeDef.Type>}
     **/
    this.types = [];
};

MultiType.prototype = Object.create(Type.prototype);

/**
 * Adds one more Type to this MultiType.
 * @param {!doco.TypeDef.Type} type Type to add
 */
MultiType.prototype.add = function(type) {
    if (!(type instanceof Type)) {
        throw(new Error("Illegal type: "+type+" (not a doco.Type)"));
    }
    this.types.push(type);
};

module.exports = MultiType;
