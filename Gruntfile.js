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
                        src: ['lib/jquery/jquery-1.9.1.min.js', 'lib/jquery-ui/js/jquery-ui-1.10.3.custom.min.js', 'lib/bootstrap/js/bootstrap.min.js', 'lib/knockout/knockout-2.3.0.js'],
                        dest: 'build/prod/js/lib.<%= hash %>.js'
                    },
                    {
                        src: ['lib/jquery-ui/css/smoothness/jquery-ui-1.10.3.custom.min.css', 'lib/bootstrap/css/bootstrap.min.css', "lib/bootstrap/css/bootstrap-theme.min.css"],
                        dest: 'build/prod/css/lib.<%= hash %>.css'
                    }
                ]
            },
            dev: {
                files: [
                    {
                        src: ['lib/jquery/jquery-1.9.1.js', 'lib/jquery-ui/js/jquery-ui-1.10.3.custom.js', 'lib/bootstrap/js/bootstrap.js', 'lib/knockout/knockout-2.3.0.debug.js'],
                        dest: 'build/dev/js/lib.<%= hash %>.js'
                    },
                    {src: ['app/**/*.js', '!app/main.js'], dest: 'build/dev/js/application.<%= hash %>.js'},
                    {src: ['app/main.js'], dest: 'build/dev/js/main.<%= hash %>.js'},
                    {
                        src: ['lib/jquery-ui/css/smoothness/jquery-ui-1.10.3.custom.css', 'lib/bootstrap/css/bootstrap.css', "lib/bootstrap/css/bootstrap-theme.css"],
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
                    {src: ['app/**/*.js', '!app/main.js'], dest: 'build/prod/js/application.<%= hash %>.js'},
                    {src: ['app/main.js'], dest: 'build/prod/js/main.<%= hash %>.js'}
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
                    {src: ["lib/bootstrap/less/bootstrap.less"], dest: "lib/bootstrap/css/bootstrap.min.css"},
                    {src: ["lib/bootstrap/less/theme.less"], dest: "lib/bootstrap/css/bootstrap-theme.min.css"},
                    {src: ["css/con-planner.less"], dest: "build/prod/css/app.<%= hash %>.css"}
                ]
            },
            dev: {
                options: {
                    paths: ["lib/bootstrap/less", "css"]
                },
                files: [
                    {src: ["lib/bootstrap/less/bootstrap.less"], dest: "lib/bootstrap/css/bootstrap.css"},
                    {src: ["lib/bootstrap/less/theme.less"], dest: "lib/bootstrap/css/bootstrap-theme.css"},
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
    grunt.registerTask('default', ['env', 'clean', 'less', 'concat', 'uglify', 'preprocess', 'watch']);
    grunt.registerTask('dev', ['env:dev', 'clean:dev', 'less:dev', 'concat:dev', 'preprocess:dev']);
    grunt.registerTask('prod', ['env:prod', 'clean:prod', 'less:prod', 'concat:prod', 'uglify:prod', 'preprocess:prod']);

};