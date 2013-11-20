var path = require("path"),
    util = require("util"),
    fs = require("fs"),
    doco = require(path.join(__dirname, '..', 'src', 'doco.js'));

module.exports = {
    
    'typedef': {
        
        'primitive': function(test) {
            var def = doco.TypeDef.interpret("{string}");
            test.strictEqual(def['remain'], '');
            test.ok(def['type'] instanceof doco.TypeDef.NamedType);
            test.strictEqual(def['type'].maybeNull, false);
            test.strictEqual(def['type'].name, 'string');
            test.strictEqual(def['type'].optional, false);
            test.done();
        },
        
        'nonPrimitive': function(test) {
            var def = doco.TypeDef.interpret("{Array}");
            test.strictEqual(def['remain'], '');
            test.ok(def['type'] instanceof doco.TypeDef.NamedType);
            test.strictEqual(def['type'].maybeNull, undefined);
            test.strictEqual(def['type'].name, 'Array');
            test.strictEqual(def['type'].optional, false);
            test.done();
        },
        
        'optional': function(test) {
            var def = doco.TypeDef.interpret("{number=} a");
            test.strictEqual(def['remain'], 'a');
            test.strictEqual(def['type'].optional, true);
            def = doco.TypeDef.interpret("{string|number=} b");
            test.strictEqual(def['remain'], 'b');
            test.strictEqual(def['type'].optional, true);
            def = doco.TypeDef.interpret("{(string|number)=} c");
            test.strictEqual(def['remain'], 'c');
            test.strictEqual(def['type'].optional, true);
            test.done();
        },
        
        'impliticOr': function(test) {
            var def = doco.TypeDef.interpret("{string|number} name Comment");
            test.strictEqual(def['remain'], 'name Comment');
            test.strictEqual(def['type'].optional, false);
            test.ok(def['type'] instanceof doco.TypeDef.OrType);
            test.strictEqual(def['type'].maybeNull, undefined);
            var ts = def['type'].types;
            test.ok(ts[0] instanceof doco.TypeDef.NamedType);
            test.ok(ts[1] instanceof doco.TypeDef.NamedType);
            test.strictEqual(ts[0].name, 'string');
            test.strictEqual(ts[0].maybeNull, false);
            test.strictEqual(ts[1].name, 'number');
            test.strictEqual(ts[1].maybeNull, false);
            test.strictEqual(def['type'].toString(), '(string|number)');
            test.done();
        },
        
        'explicitOr': function(test) {
            var def = doco.TypeDef.interpret("{(string|number)} name Comment");
            test.strictEqual(def['remain'], 'name Comment');
            test.strictEqual(def['type'].optional, false);
            test.ok(def['type'] instanceof doco.TypeDef.OrType);
            test.strictEqual(def['type'].maybeNull, undefined);
            var ts = def['type'].types;
            test.ok(ts[0] instanceof doco.TypeDef.NamedType);
            test.ok(ts[1] instanceof doco.TypeDef.NamedType);
            test.strictEqual(ts[0].name, 'string');
            test.strictEqual(ts[0].maybeNull, false);
            test.strictEqual(ts[1].name, 'number');
            test.strictEqual(ts[1].maybeNull, false);
            test.strictEqual(def['type'].toString(), '(string|number)');
            test.done();
        },
        
        'notNull': function(test) {
            var def = doco.TypeDef.interpret("{!Array} a");
            test.strictEqual(def['remain'], 'a');
            test.strictEqual(def['type'].optional, false);
            test.ok(def['type'] instanceof doco.TypeDef.NamedType);
            test.strictEqual(def['type'].maybeNull, false);
            test.strictEqual(def['type'].name, 'Array');
            test.done();
        },

        'null': function(test) {
            var def = doco.TypeDef.interpret("{?Array} a");
            test.strictEqual(def['remain'], 'a');
            test.strictEqual(def['type'].optional, false);
            test.ok(def['type'] instanceof doco.TypeDef.NamedType);
            test.strictEqual(def['type'].maybeNull, true);
            test.strictEqual(def['type'].name, 'Array');
            test.done();
        },
        
        'function': function(test) {
            var def = doco.TypeDef.interpret("{?function(Error, ...string):undefined=} callback");
            test.strictEqual(def['remain'], 'callback');
            test.strictEqual(def['type'].optional, true);
            test.ok(def['type'] instanceof doco.TypeDef.FunctionType);
            test.strictEqual(def['type'].toString(), '?function(Error, ...[string]):undefined');
            test.done();
        },
        
        'complex': function(test) {
            var typeDef = "?string|(!Array.<Array.<string>>|Object.<number,function(Error, ...[*]):(string|undefined)>)";
            var def = doco.TypeDef.interpret("{"+typeDef+"} a");
            test.strictEqual(def['remain'], 'a');
            test.strictEqual(def['type'].toString(), "("+typeDef+")");
            test.done();
        }
    },
    
    "self": function(test) {
        var source = fs.readFileSync(path.join(__dirname, '..', 'src', 'doco.js'));
        doco(source, function(err, context) {
            context.build();
            test.done();
        });
    }
};
