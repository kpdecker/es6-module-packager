var Compiler = require('es6-module-transpiler').Compiler,
    LocalsCompiler = require('../dist/lib/locals-compiler').default,
    fs = require('fs'),
    Path = require('path');

require('should');

describe('locals compiler', function() {
  var testDir =__dirname + '/artifacts/locals/';
  var tests = fs.readdirSync(testDir).filter(function(name) {
      return /\.locals\.js$/.test(name);
    })
    .map(function(name) {
      return name.replace(/\.locals\.js$/, '');
    });

  tests.forEach(function(name) {
    it(Path.basename(name), function() {
      var options = {
        imports: {
          path: 'path',
          ember: 'Ember',
          rsvp: 'rsvp',
          utils: 'utils'
        }
      };

      var compiler = new Compiler(fs.readFileSync(testDir + name + '.es6.js'), name, options),
          locals = new LocalsCompiler(compiler, compiler.options);

      locals.stringify().should.equal(fs.readFileSync(testDir + name + '.locals.js').toString());
    });
  });
});
