module.exports = function(doco) {

    /**
     * Constructs a new Context.
     * @constructor
     */
    doco.Context = function() {

        /**
         * Namespace.
         * @type {!Object.<string,*>}
         */
        this.ns = {};

        /**
         * Context elements.
         * @type {!Array.<!doco.Context.Element>}
         */
        this.elements = [];
    };

    /**
     * Interprets a comment / declaration pair.
     * @param {string} comment Comment
     * @param {string} declaration Following declaration
     */
    doco.Context.prototype.interpret = function(comment, declaration) {
        // First, get the title out of it
        var title, tags, decl, match;
        var p = comment.search(/(?:^|\s)@/); // Skip email addresses
        if (p > -1) {
            title = comment.substring(0, p).trim();
            tags = doco.interpretTags(comment.substring(p).trim());
        } else {
            title = comment;
            tags = [];
        }
        decl = doco.interpretDeclaration(declaration);
        this.elements.push(new doco.Context.Element(title, tags, decl));
    };

    /**
     * Constructs a new Context Element.
     * @param {string} title
     * @param {!Array.<doco.Tag>} tags
     * @param {!doco.Declaration} decl
     * @constructor
     */
    doco.Context.Element = function(title, tags, decl) {
        this.title = title;
        this.tags = tags;
        this.decl = decl;
    };
    
    doco.Context.prototype.build = function() {
        
    }
    
};
