module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    prettier: {
      files: {
        src: ['*.js', 'migrations/**/*.js', 'test/**/*.js', 'scripts/**/*.js'],
      },
    },
  })

  grunt.loadNpmTasks('grunt-prettier')
}
