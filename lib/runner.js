var fs = require( 'fs' ),
		NodeMW = require( 'nodemw' ),
		path = require( 'path' ),
		url = require( 'url' ),
		webdriver = require( 'selenium-webdriver' ),
		Promise = webdriver.promise.Promise,
		wiki = require( './wiki' ),
		ARTIFACT_DIR = 'log',
    runner = {};

function ensureArtifactDir() {
	return new Promise( function ( fulfill, reject ) {
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

	return new Promise( function ( fulfill, reject ) {
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

runner.Runtime = function ( browser ) {
	this.browser = browser;
};

runner.Runtime.prototype.finish = function ( test, driver ) {
	var self = this;

	if ( test.state === 'failed' ) {
		return driver.takeScreenshot()
			.then( function ( png ) {
				return self.saveTestArtifact( test, '.png', new Buffer( png, 'base64' ) );
			} )
			.then( function () { return driver.quit(); } );
	} else {
		return driver.quit();
	}
};

runner.Runtime.prototype.saveArtifact = function ( name, data ) {
	return ensureArtifactDir().then( function ( dir ) {
		return new Promise( function ( fulfill, reject ) {
			fs.writeFile( path.join( dir, name ), data, function ( err ) {
				if ( err ) {
					reject( err );
				} else {
					fulfill();
				}
			} );
		} );
	} );
};

runner.Runtime.prototype.saveTestArtifact = function ( test, ext, data ) {
	return this.saveArtifact(
		test.fullTitle().replace( new RegExp( path.sep, 'g' ), '-' ) + ext,
		data
	);
};

runner.Runtime.prototype.startBrowser = function () {
	return new webdriver.Builder().forBrowser( this.browser ).build();
};

module.exports = runner;
