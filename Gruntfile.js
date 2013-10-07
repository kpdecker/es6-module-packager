module.exports = function(grunt) {
  var path = require('path');

  grunt.initConfig({
    clean: [
      'dist'
    ],
    transpile: {
      app: {
        type: 'cjs',
        files: [{
          expand: true,
          src: ['bin/es6-module-packager', 'lib/**/*.js'],
          dest: 'tmp/transpiled/'
        }]
      }
    },
    es6ify: {
      app: {
        files: [{
          expand: true,
          cwd: 'tmp/transpiled/',
          src: ['bin/es6-module-packager', 'lib/**/*.js'],
          dest: 'dist/'
        }]
      }
    },
    jshint: {
      all: {
        src: [
          'Gruntfile.js',
          'lib/**/*.js'
        ]
      },
      options: {
        jshintrc: '.jshintrc',
        force: true
      }
    },
    simplemocha: {
      options: {
        globals: ['should'],
        timeout: 3000,
        ignoreLeaks: false
      },

      all: { src: ['test/*.js'] }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-es6-module-transpiler');
  grunt.loadNpmTasks('grunt-simple-mocha');

  // Load local tasks.
  grunt.task.loadTasks('./tasks');

  // Note not exposing a build + test endpoint as there are conflicts with
  // transpile + es6ify (waiting for https://github.com/google/traceur-compiler/pull/323)
  grunt.registerTask('test', ['simplemocha']);

  grunt.registerTask('default', ['test']);
};
