module.exports = function(doco) {

///
// Interpreter
///
    
    /**
     * Interprets a block of tags.
     * @param {string} str Tag block
     * @returns {Array.<doco.Tag>} Interpreted tags
     */
    doco.interpretTags = function(str) {
        var exp = /@/g, match, tags = [], offset = 0;
        str = str.trim();
        while (match = exp.exec(str)) {
            if (match.index == 0) continue;
            if (/\s|\*/.test(str.charAt(match.index-1))) {
                tags.push(doco.interpretTag(str.substring(offset, match.index).trim()));
                offset = match.index;
            }
        }
        if (offset < str.length) {
            tags.push(doco.interpretTag(str.substring(offset)));
        }
        return tags;
    };

    /**
     * Interprets a single tag.
     * @param {string} str Tag string
     * @returns {doco.Tag} Interpreted tag
     */
    doco.interpretTag = function(str) {
        if (str === null) return null;
        str = str.trim();
        if (str.length == 0) {
            return null;
        }
        if (str.charAt(0) == '@') {
            str = str.substring(1).trim();
            if (str.length == 0) {
                return null;
            }
        }
        var name;
        var end = str.indexOf(' ');
        if (end >= 0) {
            name = str.substring(0, end);
            str = str.substring(end+1).trimLeft();
        } else {
            name = str;
            str = null;
        }
        // NOTE: Prefixed with "@" because of properties like `constructor`
        if (typeof doco.TagTypes['@'+name] !== 'undefined') {
            try {
                return new (doco.TagTypes['@'+name])(str);
            } catch (e) {
                throw(e); // console.trace(e);
            }
        }
        return new doco.UnknownTag(name, str);
    };
    
///
// Tags
///

    /**
     * Constructs a new Tag.
     * @param {string} tagName Tag name, e.g. `param`
     * @constructor
     */
    doco.Tag = function(tagName) {
        this.tagName = tagName;
    };

    /**
     * Constructs a new Unknown Tag.
     * @param {string} tagName Tag name
     * @param {string} def Definition
     * @constructor
     * @extends doco.Tag
     */
    doco.UnknownTag = function UnknownTag(tagName, def) {
        doco.Tag.call(this, tagName);
        this.def = def;
    };
    doco.UnknownTag.prototype = Object.create(doco.Tag.prototype);

    /**
     * Constructs a new Comment Tag.
     * @param {string} tagName Tag Name
     * @param {string} def Comment
     * @constructor
     * @extends doco.Tag
     */
    doco.CommentTag = function CommentTag(tagName, def) {
        doco.Tag.call(this, tagName);
        this.comment = def;
    };
    doco.CommentTag.prototype = Object.create(doco.Tag.prototype);

    /**
     * Constrcuts a new TypeAndComment Tag.
     * @param {string} tagName Tag name
     * @param {string} def Type definition and comment
     * @constructor
     * @extends doco.Tag
     */
    doco.TypeAndCommentTag = function(tagName, def) {
        doco.Tag.call(this, tagName);
        var typeDef = doco.interpretTypeDef(def);
        this.type = typeDef['type'];
        this.comment = typeDef['remain'];
    };
    doco.TypeAndCommentTag.prototype = Object.create(doco.Tag.prototype);

    /**
     * Constructs a new TypeAndNameTag.
     * @param {string} tagName Tag name
     * @param {string} def Type defintion and name
     * @constructor
     * @extends doco.Tag
     */
    doco.TypeAndNameTag = function(tagName, def) {
        doco.Tag.call(this, tagName);
        var typeDef = doco.interpretTypeDef(def);
        this.type = typeDef['type'];
        this.name = typeDef['remain'];
    };
    doco.TypeAndNameTag.prototype = Object.create(doco.Tag.prototype);

    /**
     * Constructs a new NameAndCommentTag.
     * @param {string} tagName Tag name
     * @param {string} def Name and comment
     * @constructor
     * @extends doco.Tag
     */
    doco.NameAndCommentTag = function(tagName, def) {
        doco.Tag.call(this, tagName);
        var pos = def.indexOf(' ');
        if (pos >= 0) {
            this.name = def.substring(0, pos);
            this.comment = def.substring(pos+1).trimLeft();
        } else {
            this.name = def;
            this.comment = "";
        }
    };
    doco.NameAndCommentTag.prototype = Object.create(doco.Tag.prototype);

    /**
     * Constructs a new TypeNameAndComment Tag.
     * @param {string} tagName Tag name
     * @param {string} def Type defintion, name and comment
     * @constructor
     */
    doco.TypeNameAndCommentTag = function(tagName, def) {
        doco.Tag.call(this, tagName);
        var typeDef = doco.interpretTypeDef(def);
        this.type = typeDef['type'];
        def = typeDef['remain'];
        var pos = def.indexOf(' ');
        if (pos >= 0) {
            this.name = def.substring(0, pos);
            this.comment = def.substring(pos+1).trimLeft();
        } else {
            this.name = def;
            this.comment = "";
        }
    };
    doco.TypeNameAndCommentTag.prototype = Object.create(doco.Tag.prototype);

    /**
     * Defines another Tag.
     * @param {Function} clazz Base class
     * @param {string} name Tag name
     */
    function defineTag(clazz, name) {
        doco.Tag[name] = function() {
            var args = [name.toLowerCase()];
            Array.prototype.push.apply(args, arguments);
            clazz.apply(this, args);
        };
        doco.Tag[name].prototype = Object.create(clazz.prototype);
    }

    /////////////////////// General tags ////////////////////////

    defineTag(doco.TypeNameAndCommentTag, "Param");
    defineTag(doco.TypeAndCommentTag, "Type");
    defineTag(doco.TypeAndCommentTag, "TypeDef");
    defineTag(doco.TypeAndCommentTag, "Returns");
    defineTag(doco.TypeAndCommentTag, "Throws");
    defineTag(doco.NameAndCommentTag, "Constructor");
    defineTag(doco.NameAndCommentTag, "Function");
    defineTag(doco.NameAndCommentTag, "Method");
    defineTag(doco.NameAndCommentTag, "Extends");
    defineTag(doco.NameAndCommentTag, "Augments");
    defineTag(doco.NameAndCommentTag, "Implements");
    defineTag(doco.NameAndCommentTag, "Lends");
    defineTag(doco.CommentTag, "Interface");
    defineTag(doco.CommentTag, "Override");
    defineTag(doco.CommentTag, "Const");
    defineTag(doco.CommentTag, "Static");
    defineTag(doco.CommentTag, "See");
    defineTag(doco.CommentTag, "Public");
    defineTag(doco.CommentTag, "Protected");
    defineTag(doco.CommentTag, "Private");
    defineTag(doco.TypeAndCommentTag, "Enum");
    defineTag(doco.CommentTag, "Struct");
    defineTag(doco.TypeAndCommentTag, "This");

    doco.Tag.Access = function AccessTag(def) {
        doco.Tag.call(this, 'access');
        this.level = def;
    };
    doco.Tag.Access.prototype = Object.create(doco.Tag.prototype);

    defineTag(doco.NameAndCommentTag, "Property");
    defineTag(doco.CommentTag, "Abstract");

    /////////////////////// Closure Compiler ////////////////////////
    
    defineTag(doco.CommentTag, "Dict");
    defineTag(doco.CommentTag, "Externs");
    defineTag(doco.TypeAndCommentTag, "Define");
    defineTag(doco.CommentTag, "NoSideEffects");
    defineTag(doco.CommentTag, "Expose");

    /////////////////////// Literal tags ///////////////////////////

    defineTag(doco.CommentTag, "Author");
    defineTag(doco.CommentTag, "Version");
    defineTag(doco.CommentTag, "Since");
    defineTag(doco.CommentTag, "Deprecated");
    defineTag(doco.CommentTag, "FileOverview");
    defineTag(doco.CommentTag, "Todo");
    defineTag(doco.CommentTag, "Summary");
    defineTag(doco.CommentTag, "License");
    defineTag(doco.CommentTag, "Preserve");
    
    ///////////////////////// TagTypes ///////////////////////////

    /**
     * Tag types.
     * @type {Object.<string,doco.Tag>}
     */
    doco.TagTypes = {};

    Object.keys(doco.Tag).forEach(function(tagName) {
        doco.Tag[tagName].prototype = Object.create(doco.Tag.prototype);
        doco.TagTypes["@"+tagName.toLowerCase()] = doco.Tag[tagName];
        if (typeof doco.Tag[tagName]['aliases'] !== 'undefined') {
            doco.Tag[tagName]['aliases'].forEach(function(aliasName) {
                doco.TagTypes["@"+aliasName.toLowerCase()] = doco.Tag[tagName];
            });
        }
    });
    
};
