module.exports = function(grunt) {
  var path = require('path');

  grunt.initConfig({
    clean: [
      'dist'
    ],
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
    packager: {
      app: {
        type: 'cjs',
        files: [{
          expand: true,
          src: ['lib/**/*.js'],
          dest: 'tmp/transpiled/'
        }]
      }
    },
    es6ify: {
      app: {
        files: [{
          expand: true,
          cwd: 'tmp/transpiled/',
          src: ['lib/**/*.js'],
          dest: 'dist/'
        }]
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
  grunt.loadNpmTasks('grunt-simple-mocha');

  // Load local tasks.
  grunt.task.loadTasks('./internal-tasks');
  grunt.task.loadTasks('./tasks');

  // Note not exposing a build + test endpoint as there are conflicts with
  // transpile + es6ify (waiting for https://github.com/google/traceur-compiler/pull/323)
  grunt.registerTask('test', ['simplemocha']);

  grunt.registerTask('default', ['packager', 'test']);
};
