var fs = require( 'fs' ),
		NodeMW = require( 'nodemw' ),
		path = require( 'path' ),
		url = require( 'url' ),
		webdriver = require( 'selenium-webdriver' ),
		promise = webdriver.promise,
		wiki = require( './wiki' ),
		runner;

/**
 * @singleton
 * @class malu.runner
 *
 * Test runner module providing interfaces for test context setup and
 * teardown, and saving of test artifacts.
 */
runner = {};

/**
 * @property
 * Directory in which artifact files can be saved.
 */
runner.ARTIFACT_DIR = 'log';

function ensureArtifactDir() {
	return new promise.Promise( function ( fulfill, reject ) {
		fs.stat( runner.ARTIFACT_DIR, function ( err ) {
			if ( err ) {
				fs.mkdir( runner.ARTIFACT_DIR, function ( err ) {
					if ( err ) {
						reject( err );
					} else {
						fulfill( runner.ARTIFACT_DIR );
					}
				} );
			} else {
				fulfill( runner.ARTIFACT_DIR );
			}
		} );
	} );
}

/**
 * Queries the configured MediaWiki server for its
 * [siteinfo](https://www.mediawiki.org/wiki/API:Siteinfo) and promises to
 * initialize a new runtime for use in creating contexts for each scenario.
 *
 * @param {Object} [env=process.env] Environment variables in which to look
 *  for `BROWSER`, `MW_SERVER`, and `MW_SCRIPT_PATH`.
 *
 * @return {webdriver.promise.Promise} Promise to be fulfilled with a new
 *  malu.runner.Runtime.
 */
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
				fulfill( new runner.Runtime( browser, siteinfo ) );
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

		return promise.all( startedDrivers.map( function ( driver ) {
			if ( test.state === 'failed' ) {
				return driver.takeScreenshot()
					.then( function ( png ) {
						return self.saveTestArtifact( test, '.png', new Buffer( png, 'base64' ) );
					} )
					.then( function () { return driver.quit(); } );
			} else {
				return driver.quit();
			}
		} ) );
	}
};

/**
 * @class malu.runner.Runtime
 *
 * Main entry-point for creating test contexts and site interfaces. Typically
 * there should only be one runtime per test-suite process (e.g. created in a
 * global before hook) and a runner.Context and wiki.Site created for each
 * scenario.
 *
 * @param {string} browser Name of browser that each instantiated context will create.
 * @param {Object} siteinfo MediaWiki siteinfo query result.
 */
runner.Runtime = function ( browser, siteinfo ) {
	this.browser = browser;
	this.siteinfo = siteinfo;
};

/**
 * Create a new malu.runner.Context for the configured browser.
 *
 * @return {malu.runner.Context}
 */
runner.Runtime.prototype.createContext = function () {
	return new runner.Context( this.browser );
};

/**
 * Create a new malu.wiki.Site for the configured browser.
 *
 * @return {malu.runner.Context}
 */
runner.Runtime.prototype.createSite = function () {
	return new wiki.Site( this.siteinfo.general );
};

module.exports = runner;
