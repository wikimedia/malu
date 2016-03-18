/*jshint node:true */
module.exports = function ( grunt ) {
	grunt.initConfig( {
		jshint: {
			files: [ 'Gruntfile.js', 'lib/**/*.js', 'test/**/*.js' ],
			options: {
				jshintrc: true
			}
		},
		jscs: {
			all: '.'
		},
		jsonlint: {
			all: [
				'.jscsrc',
				'**/*.json',
				'!node_modules/**'
			]
		},
		watch: {
			files: [
				'.js',
				'.json',
				'**/*',
				'!node_modules/**'
			],
			tasks: 'test'
		},
		mochaTest: {
			test: {
				options: {
					reporter: 'spec'
				},
				src: [ 'test/unit/*.spec.js' ]
			}
		}
	} );

	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-jscs' );
	grunt.loadNpmTasks( 'grunt-jsonlint' );
	grunt.loadNpmTasks( 'grunt-mocha-test' );

	grunt.registerTask( 'lint', [ 'jshint', 'jscs', 'jsonlint' ] );
	grunt.registerTask( 'test', [ 'mochaTest' ] );
	grunt.registerTask( 'default', 'test' );
};
