/**
 * @alias doco.TypeDef.MultiType
 */
var MultiType = require("./MultiType.js");

/**
 * Constructs a new OrType that wraps multiple alternative types, e.g. `(string|number)`.
 * @name doco.TypeDef.OrType
 * @param {boolean|undefined} maybeNull Whether the type may be null or not. May be explicitly `undefined`.
 * @constructor
 * @extends doco.TypeDef.MultiType
 */
var OrType = function OrType(maybeNull) {
    MultiType.call(this, maybeNull);
};

OrType.prototype = Object.create(MultiType.prototype);

/**
 * Returns the string representation of this instance.
 * @returns {string}
 */
OrType.prototype.toString = function() {
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

module.exports = OrType;
