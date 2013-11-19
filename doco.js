/**
 * @license doco (c) 2013 Daniel Wirtz <dcode@dcode.io>
 * Released under the Apache License, Version 2.0
 * see: http://www.dojojs.org for details
 */
//
module.exports = (function () {

    var util = require("util");
    
    /**
     * doco namespace and convenience parser.
     * @param {string} source Source to parse
     * @param {!function(Error, doco.Context=)} callback Callback receiving the parsed and interpreted context
     */
    function doco(source, callback) {
        var parser = new doco.Parser();
        var context = new doco.Context();
        parser.on("comment", function(comment, decl) {
            context.interpret(comment, decl);
        });
        parser.on("finish", function() {
            callback(null, context);
        });
        parser.write(source);
        parser.end();
    }

    /**
     * Inspects an object including all its private members.
     * @param {*} obj Object to inspect
     * @returns {string} Console friendly result
     */
    doco.inspect = function(obj) {
        return util.inspect(obj, true, null, true);
    };

    /**
     * @type {!Object.<string,number>} asd
     */
    var bleh;

    require("./doco/TypeDef.js")(doco);
    require("./doco/Tag.js")(doco);
    require("./doco/Declaration.js")(doco);
    require("./doco/Context.js")(doco);
    require("./doco/Parser.js")(doco);
    
    return doco;
})();
