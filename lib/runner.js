var fs = require( 'fs' ),
		NodeMW = require( 'nodemw' ),
		path = require( 'path' ),
		url = require( 'url' ),
		webdriver = require( 'selenium-webdriver' ),
		promise = webdriver.promise,
		wiki = require( './wiki' ),
		ARTIFACT_DIR = 'log',
    runner = {};

function ensureArtifactDir() {
	return new promise.Promise( function ( fulfill, reject ) {
		fs.stat( ARTIFACT_DIR, function ( err ) {
			if ( err ) {
				fs.mkdir( ARTIFACT_DIR, function ( err ) {
					if ( err ) {
						reject( err );
					} else {
						fulfill( ARTIFACT_DIR );
					}
				} );
			} else {
				fulfill( ARTIFACT_DIR );
			}
		} );
	} );
}

runner.start = function ( env ) {
	env = env || process.env;

	var browser = env.BROWSER || 'firefox',
			server = env.MW_SERVER || 'http://127.0.0.1:8080',
			scriptPath = env.MW_SCRIPT_PATH || '/w',
			siteurl = url.parse( server + scriptPath );

	return new promise.Promise( function ( fulfill, reject ) {
		var api = new NodeMW( {
			protocol: siteurl.protocol,
			server: siteurl.hostname,
			port: siteurl.port,
			path: siteurl.path
		} );

		api.getSiteInfo( [ 'general' ], function ( err, siteinfo ) {
			if ( err ) {
				reject( err );
			} else {
				fulfill( {
					runtime: new runner.Runtime( browser ),
					wiki: new wiki.Site( siteinfo.general )
				} );
			}
		} );
	} );
};

runner.Context = function ( browser ) {
	this.browser = browser;
	this.drivers = [];
};

runner.Context.prototype = {
	newDriver: function ( capabilities ) {
		var driver = new webdriver.Builder()
			.withCapabilities( capabilities || {} )
			.forBrowser( this.browser )
			.build();

		this.drivers.push( driver );

		return driver;
	},

	saveArtifact: function ( name, data ) {
		return ensureArtifactDir().then( function ( dir ) {
			return new promise.Promise( function ( fulfill, reject ) {
				fs.writeFile( path.join( dir, name ), data, function ( err ) {
					if ( err ) {
						reject( err );
					} else {
						fulfill();
					}
				} );
			} );
		} );
	},

	saveTestArtifact: function ( test, ext, data ) {
		return this.saveArtifact(
			test.fullTitle().replace( new RegExp( path.sep, 'g' ), '-' ) + ext,
			data
		);
	},

	tearDown: function ( test ) {
		var self = this,
				startedDrivers = this.drivers;

		this.drivers = [];

		return promise.all( startedDrivers.map( function ( drv ) {
			if ( test.state === 'failed' ) {
				return drv.takeScreenshot()
					.then( function ( png ) {
						return self.saveTestArtifact( test, '.png', new Buffer( png, 'base64' ) );
					} )
					.then( function () { return drv.quit(); } );
			} else {
				return drv.quit();
			}
		} ) );
	}
};

runner.Runtime = function ( browser ) {
	this.browser = browser;
};

runner.Runtime.prototype.createContext = function () {
	return new runner.Context( this.browser );
};

module.exports = runner;
