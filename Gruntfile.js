module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        hash:((new Date()).valueOf().toString()) + (Math.floor((Math.random()*1000000)+1).toString()),
        concat: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            prod:{
                files: [
                    {
                        src: ['lib/jquery/jquery-1.9.1.min.js', 'lib/jquery-ui/js/jquery-ui-1.10.3.custom.min.js', 'lib/jquery-ui/js/jquery.ui.touch-punch.min.js', 'lib/bootstrap/js/bootstrap.min.js', 'lib/knockout/knockout-2.3.0.js', 'lib/lodash/lodash.min.js'],
                        dest: 'build/prod/js/lib.<%= hash %>.js'
                    },
                    {
                        src: ['lib/jquery-ui/css/smoothness/jquery-ui-1.10.3.custom.min.css', 'build/stage/css/bootstrap.min.css', "build/stage/css/bootstrap-theme.min.css"],
                        dest: 'build/prod/css/lib.<%= hash %>.css'
                    }
                ]
            },
            dev: {
                files: [
                    {
                        src: ['lib/jquery/jquery-1.9.1.js', 'lib/jquery-ui/js/jquery-ui-1.10.3.custom.js', 'lib/jquery-ui/js/jquery.ui.touch-punch.js', 'lib/bootstrap/js/bootstrap.js', 'lib/knockout/knockout-2.3.0.debug.js', 'lib/lodash/lodash.js'],
                        dest: 'build/dev/js/lib.<%= hash %>.js'
                    },
                    {src: ['app/**/*.js', '!app/main.js', 'lib/jquery-ui/js/jquery-ui-timepicker-addon.js', 'lib/jquery-plugins/**/*.js'], dest: 'build/dev/js/application.<%= hash %>.js'},
                    {src: ['app/main.js'], dest: 'build/dev/js/main.<%= hash %>.js'},
                    {
                        src: ['lib/jquery-ui/css/smoothness/jquery-ui-1.10.3.custom.css', 'build/stage/css/bootstrap.css', "build/stage/css/bootstrap-theme.css"],
                        dest: 'build/dev/css/lib.<%= hash %>.css'
                    }
                ]
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            prod: {
                files: [
                    {src: ['app/**/*.js', '!app/main.js', 'lib/jquery-ui/js/jquery-ui-timepicker-addon.js', 'lib/jquery-plugins/**/*.js'], dest: 'build/prod/js/application.<%= hash %>.js'},
                    {src: ['app/main.js'], dest: 'build/prod/js/main.<%= hash %>.js'}
                ]
            }
        },
        copy: {
            prod: {
                files: [
                    { src: 'lib/bootstrap/fonts/*', dest: 'build/prod/fonts/', expand: true, flatten: true },
                    { src: 'lib/jquery-ui/css/smoothness/images/*', dest: 'build/prod/images/', expand: true, flatten: true }
                ]
            },
            dev: {
                files: [
                    { src: 'lib/bootstrap/fonts/*', dest: 'build/dev/fonts/', expand: true, flatten: true },
                    { src: 'lib/jquery-ui/css/smoothness/images/*', dest: 'build/dev/images/', expand: true, flatten: true }
                ]
            }
        },
        less: {
            prod: {
                options: {
                    paths: ["lib/bootstrap/less", "css"],
                    yuicompress: true
                },
                files: [
                    {src: ["lib/bootstrap/less/bootstrap.less"], dest: "build/stage/css/bootstrap.min.css"},
                    {src: ["lib/bootstrap/less/theme.less"], dest: "build/stage/css/bootstrap-theme.min.css"},
                    {src: ["css/con-planner.less"], dest: "build/prod/css/app.<%= hash %>.css"}
                ]
            },
            dev: {
                options: {
                    paths: ["lib/bootstrap/less", "css"]
                },
                files: [
                    {src: ["lib/bootstrap/less/bootstrap.less"], dest: "build/stage/css/bootstrap.css"},
                    {src: ["lib/bootstrap/less/theme.less"], dest: "build/stage/css/bootstrap-theme.css"},
                    {src: ["css/con-planner.less"], dest: "build/dev/css/app.<%= hash %>.css"}
                ]
            }
        },
        clean: {
            prod: {
                src: ["build/prod"]
            },
            dev: {
                src: ["build/dev"]
            },
            stage:{
                src: ["build/stage"]
            }
        },
        env : {
            dev: {
                NODE_ENV : 'DEVELOPMENT'
            },
            prod : {
                NODE_ENV : 'PRODUCTION'
            }
        },
        preprocess : {
            options : {
                context : {
                    hash : '<%= hash %>'
                }
            },
            dev : {
                src : 'index.html',
                dest : 'build/dev/index.html'
            },
            prod : {
                src : 'index.html',
                dest : 'build/prod/index.html'
            }
        },
        watch: {
            scripts: {
                files: ['app/*.js', 'css/*.less', 'index.html'],
                tasks: ['dev']
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    require( 'matchdep' )
        .filterDev( 'grunt-*' )
        .forEach( grunt.loadNpmTasks );

    // Default task(s).
    grunt.registerTask('default', ['env', 'clean', 'less', 'concat', 'uglify', 'copy', 'preprocess', 'clean:stage']);
    grunt.registerTask('dev', ['env:dev', 'clean:dev', 'less:dev', 'concat:dev', 'copy:dev', 'preprocess:dev', 'clean:stage']);
    grunt.registerTask('prod', ['env:prod', 'clean:prod', 'less:prod', 'concat:prod', 'uglify:prod', 'copy:prod', 'preprocess:prod', 'clean:stage']);

};