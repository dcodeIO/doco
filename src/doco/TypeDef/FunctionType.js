/**
 * @alias doco.TypeDef.MultiType
 */
var MultiType = require("./MultiType.js");

/**
 * Constructs a new FunctionType that wraps its arguments.
 * @name doco.TypeDef.FunctionType
 * @param {boolean|undefined} maybeNull
 * @constructor
 * @extends doco.TypeDef.MultiType
 */
var FunctionType = function FunctionType(maybeNull) {
    MultiType.call(this, maybeNull);

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

FunctionType.prototype = Object.create(MultiType.prototype);

/**
 * Returns the string representation of this instance.
 * @returns {string}
 */
FunctionType.prototype.toString = function() {
    var str = [];
    for (var i=0; i<this.types.length; i++) {
        if (this.types[i].varargs) {
            str.push("...["+this.types[i].toString()+"]");
        } else {
            str.push(this.types[i].toString());
        }
    }
    var res = [];
    if (this.maybeNull === true) { // Defaults to false
        res.push('?');
    }
    res.push("function("+str.join(', ')+")");
    if (typeof this.returns !== 'undefined') {
        res.push(":");
        res.push(this.returns.toString());
    }
    return res.join('');
};

module.exports = FunctionType;
