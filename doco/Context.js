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

    /**
     * Creates an object on the namespace and returns a pointer on it.
     * @param {string} name Name, e.g. "doco.Parser"
     */
    doco.Context.prototype.create = function(name) {
        var parts = name.split(/\./),
            pptr = this.ns,
            ptr = pptr;
        while (parts.length > 0) {
            name = parts.shift();
            if (!ptr.hasOwnProperty(name)) {
                ptr[name] = {};
            }
            pptr = ptr;
            ptr = ptr[name];
        }
        return {
            "ptr": pptr, // Pointer to parent
            "name": name // Name in namespace
        };
    };
    
    doco.Context.prototype.build = function() {
        var elements = this.elements.slice();
        while (elements.length > 0) {
            var elem = elements.shift(),
                title = elem["title"],
                decl = elem["decl"],
                tags = elem["tags"];
            
            var names = [];
            decl["assignments"].forEach(function(assignment) {
                names.push(assignment["name"]);
            });
            if (decl["signature"] !== null && decl["signature"]["name"] !== null) {
                names.push(decl["signature"]["name"]);
            }
            console.log(names);
            if (names.length > 0) {
                // Resolve names and, if they are new, put them into the namespace
                names.forEach(function(name) {
                    var ns = this.create(name);
                    ns["ptr"][ns["name"]] = elem;
                }.bind(this));
            }
        }
        console.log(doco.inspect(this.ns));
    }
    
};
