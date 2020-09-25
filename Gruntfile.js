module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    prettier: {
      files: {
        src: [
          '*.js',
          'migrations/**/*.js',
          'test/**/*.js',
          'scripts/**/*.js',
          'client/src/**/*.js',
        ],
      },
    },
  })

  grunt.loadNpmTasks('grunt-prettier')
}
