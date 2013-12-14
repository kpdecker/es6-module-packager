module.exports = function(grunt) {
  grunt.registerMultiTask('packager', 'Transpiles scripts written using ES6 to ES5.', function() {
    // Execute in here to prevent traceur private var blowup
    var Compiler = require('es6-module-transpiler').Compiler,
        Packager,
        fs = require('fs');

    var data = this.data,
        options = this.options(),
        type = options.type || data.type;

    this.files.forEach(function(file) {
      var output;

      if (type === 'global') {
        // Deferred loading so we can use this task for our own compilation
        Packager = Packager || require('../dist/lib/packager').default;

        var packager = new Packager(file.src[0], {export: options.export || data.export});
        output = packager.toLocals();
      } else {
        var moduleName = options.anonymous ? null : file.src[0],
            compiler = new Compiler(grunt.file.read(file.src[0]), moduleName, options);
        if (type === 'cjs') {
          output = compiler.toCJS();
        } else if (type === 'amd') {
          output = compiler.toAMD();
        } else {
          throw new Error('Unknown type: ' + type);
        }
      }

      grunt.file.write(file.dest, output);
    });
  });
};
