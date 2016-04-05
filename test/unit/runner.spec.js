var expect = require( 'chai' ).expect,
		NodeMW = require( 'nodemw' ),
		sinon = require( 'sinon' ),
		webdriver = require( 'selenium-webdriver' ),
		runner = require( '../../lib/runner' ),
		wiki = require( '../../lib/wiki' );

describe( 'runner', function () {
	var sandbox;

	beforeEach( function () {
		sandbox = sinon.sandbox.create();
	} );

	afterEach( function () {
		sandbox.restore();
	} );

	describe( '#start', function () {
		var siteinfo = {
					general: {
						scriptpath: '/foo',
						server: 'http://an.example',
						articlepath: '/bar/$1'
					}
				};

		beforeEach( function () {
			sandbox.stub( NodeMW.prototype, 'getSiteInfo' ).yields( undefined, siteinfo );
		} );

		it( 'promises a wiki.Site based on the API siteinfo', function () {
			return runner.start().then( function ( obj ) {
				expect( obj ).to.be.a( 'object' );

				expect( obj.runtime ).to.be.an.instanceof( runner.Runtime );
				expect( obj.wiki ).to.be.an.instanceof( wiki.Site );

				expect( obj.wiki.siteinfo ).to.equal( siteinfo.general );
				expect( obj.wiki.url.protocol ).to.equal( 'http:' );
				expect( obj.wiki.url.hostname ).to.equal( 'an.example' );
				expect( obj.wiki.url.path ).to.equal( '/foo' );
			} );
		} );

		it( 'honors the BROWSER environment variable', function () {
			return runner.start( { BROWSER: 'konqueror' } ).then( function ( obj ) {
				expect( obj.runtime.browser ).to.equal( 'konqueror' );
			} );
		} );

		it( 'defaults to using firefox', function () {
			return runner.start().then( function ( obj ) {
				expect( obj.runtime.browser ).to.equal( 'firefox' );
			} );
		} );
	} );

	describe( 'Context', function () {
		var context,
				browser = 'firefox',
				capabilities,
				driver;

		beforeEach( function () {
			capabilities = sinon.createStubInstance( webdriver.Capabilities );
			driver = sinon.createStubInstance( webdriver.WebDriver );

			context = new runner.Context( browser );
		} );

		function mockBuilder() {
			var builder = webdriver.Builder.prototype,
					mock = sandbox.mock( builder );

			mock.expects( 'withCapabilities' ).once().withArgs( capabilities ).returns( builder );
			mock.expects( 'forBrowser' ).once().withArgs( browser ).returns( builder );
			mock.expects( 'build' ).once().returns( driver );

			return mock;
		}

		describe( '#newDriver', function () {

			beforeEach( function () {
				mockBuilder();
			} );

			it( 'builds a new webdriver using the given capabilities', function () {
				expect( context.newDriver( capabilities ) ).to.equal( driver );
			} );

			it( 'maintains a reference to each new webdriver', function () {
				context.newDriver( capabilities );
				expect( context.drivers ).to.have.length( 1 );
				expect( context.drivers[ 0 ] ).to.equal( driver );
			} );
		} );

		describe( '#saveArtifact', function () {
			it( 'promises to write the given data to a file in the artifacts directory' );
		} );

		describe( '#saveTestArtifact', function () {
			it( 'promises to write the given data to a file named after the given test' );
		} );

		describe( '#tearDown', function () {
			beforeEach( function () {
				mockBuilder();
			} );

			describe( 'when the given test has succeeded', function () {
				var test = { state: 'success' };

				it( 'promises to quit all previously started drivers', function () {
					context.newDriver( capabilities );

					return context.tearDown( test ).then( function () {
						expect( driver.quit.called ).to.be.equal( true );
					} );
				} );
			} );

			describe( 'when the given test has succeeded', function () {
				it( 'promises to take a screenshot and quit the drivers' );
			} );
		} );
	} );

	describe( 'Runtime', function () {
		var runtime;

		beforeEach( function () {
			runtime = new runner.Runtime( 'konqueror' );
		} );

		describe( '#createContext', function () {
			it( 'returns a new Context', function () {
				expect( runtime.createContext() ).to.be.an.instanceof( runner.Context );
			} );

			it( 'assigns it the current browser', function () {
				expect( runtime.createContext() ).to.have.property( 'browser', 'konqueror' );
			} );
		} );
	} );
} );
