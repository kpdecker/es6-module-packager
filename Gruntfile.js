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
    }
  });

  grunt.loadNpmTasks('grunt-es6-module-transpiler');

  // Load local tasks.
  grunt.task.loadTasks('./tasks');
};
