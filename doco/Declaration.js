module.exports = function(doco) {

    /**
     * Assignment expression.
     * @type {!RegExp}
     * @const
     * @inner
     */
    var assignmentExp = /(?:(var|let)\s)?\s*([^\s=]+)\s*=/g;

    /**
     * Function signature expression.
     * @type {!RegExp}
     * @const
     * @inner
     */
    var signatureExp = /function\s*([^\s\(]+)?\s*\(([^\)]*)\)/;
    
    /**
     * Interprets a declaration.
     * @param {string} str Declaration string
     * @return {!doco.Declaration}
     */
    doco.interpretDeclaration = function(str) {
        /** @type {!Array.<!doco.AssignmentDecl>} */
        var assignments = [];
        var match;
        while (match = assignmentExp.exec(str)) {
            assignments.push(new doco.AssignmentDecl(match[1] || null, match[2]));
        }
        var signature = null;
        if (match = signatureExp.exec(str)) {
            signature = new doco.SignatureDecl(
                match[1] || null,
                match[2].split(/,/).map(function(name) { return name.trim(); })
            );
        }
        return new doco.Declaration(assignments, signature);
    };

    /**
     * Constructs a new declaration.
     * @param {!Array.<!doco.AssignmentDecl>} assignments
     * @param {?doco.SignatureDecl} signature
     * @constructor
     */
    doco.Declaration = function(assignments, signature) {
        this.assignments = assignments;
        this.signature = signature;
    };

    /**
     * Constructs a new assignment declaration.
     * @param {string} type Assignment type, e.g. `var` or `let`
     * @param {string} name Variable name
     * @constructor
     */
    doco.AssignmentDecl = function(type, name) {
        this.type = type;
        this.name = name;
    };

    /**
     * Constructs a new function signature declaration.
     * @param {?string} name Function name
     * @param {Array.<string>} parameters Function parameter names
     * @constructor
     */
    doco.SignatureDecl = function(name, parameters) {
        this.name = name;
        this.parameters = parameters;
    };
    
};
