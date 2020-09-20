module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    prettier: {
      files: {
        src: ['Gruntfile.js', 'migrations/**/*.js', 'test/**/*.js'],
      },
    },
  })

  grunt.loadNpmTasks('grunt-prettier')
}
