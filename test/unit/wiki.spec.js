var expect = require( 'chai' ).expect,
		wiki = require( '../../lib/wiki' );

describe( 'wiki', function () {
	describe( '.Site', function () {
		it( 'requires siteinfo: articlepath, server, scriptpath', function () {
			expect( function () { wiki.Site( {} ); } )
				.to.throw( 'missing siteinfo: articlepath, scriptpath, server' );
		} );
	} );

	describe( '.Site', function () {
		var site = new wiki.Site( {
			server: 'http://foo.example',
			articlepath: 'bar/$1/baz',
			scriptpath: '/qux'
		} );

		describe( '.articleURL', function () {
			it( 'returns a fully qualified URL from the given article path', function () {
				expect( site.articleURL( 'Foo_page' ) ).to.eq( 'http://foo.example/bar/Foo_page/baz' );
			} );
		} );

		describe( '.pageURL', function () {
			var page = new wiki.Page( 'Foo_page' );

			it( 'returns a fully qualified URL from the given Page', function () {
				expect( site.pageURL( page ) ).to.eq( 'http://foo.example/bar/Foo_page/baz' );
			} );
		} );
	} );
} );
