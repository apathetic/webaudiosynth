/*global module:false*/
module.exports = function(grunt) {

	var port = grunt.option('port') || 8000,
		testPort = 8765;

	// Load all grunt-related tasks
	// grunt.loadNpmTasks( 'grunt-contrib-qunit' );
	// grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	// grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	// grunt.loadNpmTasks( 'grunt-contrib-watch' );
	// grunt.loadNpmTasks( 'grunt-contrib-connect' );
	// grunt.loadNpmTasks( 'grunt-karma' );


	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		meta: {
			banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
					'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
					'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
					'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
					' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
		},

		jshint: {
			options: {
				curly: true,
				// eqeqeq: true,
				// immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				boss: true,
				eqnull: true,
				browser: true,
				globals: {
					'DocumentTouch': true
				}
				/*jslint eqeq:true, debug:true, evil:false, devel:true, smarttabs:true, immed:false */
			},
			files: ['Gruntfile.js', 'src/**/*.js', /*'test/** /*.js'*/]
		},

		karma: {
			options: {
				autoWatch: false,
				browsers: ['PhantomJS'],
				colors: true,
				files: [
					'src/*.js',
					'test/*.js',
					{ pattern: 'test/fixture.html', watched:true, served:true, included:false },
				],
				frameworks: ['jasmine'],
				port: testPort,
				reporters: ['progress'],
				singleRun: true
			},
			// build: {
			// 	browsers: ["Chrome"],
			// },
			unit: {
			// 	//background: true,
				// autoWatch:true,
			// 	browsers: ["Chrome"],
				// singleRun: false
			}
		},

		uglify: {
			options: {
				banner: '<%= meta.banner %>\n'
			},
			build: {
				files: {
					'dist/jquery.<%= pkg.name %>.min.js': ['src/<%= pkg.name %>.js', 'src/jquery.<%= pkg.name %>.js'],
					'dist/<%= pkg.name %>.min.js': ['src/<%= pkg.name %>.js']
				}
			}
		},

		connect: {
			server: {
				options: {
					port: port,
					base: '.'
				}
			}
		},

		watch: {
			main: {
				files: [ 'Gruntfile.js', 'src/<%= pkg.name %>.js', 'src/jquery.<%= pkg.name %>.js', 'src/<%= pkg.name %>.css' ],
				tasks: 'default'
			}
		}

	});


	grunt.registerTask( 'default', [
		'jshint',
		'uglify',
		'karma'
	]);

	grunt.registerTask('build', [
		'jshint',
		'uglify'
	]);

	grunt.registerTask('test', [
		'jshint',
		'karma:unit'
	]);

	grunt.registerTask('serve', [
		'connect',
		'watch'
	]);

};
