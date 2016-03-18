var NodeMW = require( 'nodemw' ),
		url = require( 'url' ),
		webdriver = require( 'selenium-webdriver' ),

		REQUIRED_SITEINFO = [ 'articlepath', 'scriptpath', 'server' ],
    wiki = {};

wiki.Page = function ( path, elements ) {
	this.path = path;

	for ( var name in elements ) {
		if ( typeof elements[ name ] === 'object' ) {
			this[ name ] = elements[ name ];
		} else {
			this[ name ] = webdriver.By.css( elements[ name ] );
		}
	}
};

wiki.Site = function ( siteinfo ) {
	var missing = REQUIRED_SITEINFO.filter( function ( k ) { return !( k in siteinfo ); } );

	if ( missing.length ) {
		throw 'missing siteinfo: ' + missing.join( ', ' );
	}

	this.siteinfo = siteinfo;
	this.url = url.parse( siteinfo.server + siteinfo.scriptpath );
	this.api = new NodeMW( {
		protocol: this.url.protocol,
		server: this.url.hostname,
		port: this.url.port,
		path: this.url.path
	} );
};

wiki.Site.prototype.articleURL = function ( path ) {
	return url.resolve( this.url, this.siteinfo.articlepath.replace( '$1', path ) );
};

wiki.Site.prototype.pageURL = function ( page ) {
	return this.articleURL( page.path );
};

module.exports = wiki;
