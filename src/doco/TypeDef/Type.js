/**
 * Constructs a new Type. This is the base class of all the types we know of.
 * @name doco.TypeDef.Type
 * @param {boolean|undefined} maybeNull Whether the type may be null or not. May be explicitly `undefined`.
 * @constructor
 * @abstract
 */
var Type = function Type(maybeNull) {

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

module.exports = Type;
