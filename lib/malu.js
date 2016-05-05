/*!
 * Malu module index.
 *
 * @copyright 2016 Dan Duvall <dduvall@wikimedia.org> + contributors
 */

/**
 * @singleton
 * @class malu
 *
 * Malu provides a simple JS end-to-end test context, wiki/page objects, and
 * resource factory for testing MediaWiki installations. It's tested against
 * [Mocha](http://mochajs.org/) but is largely framework agnostic.
 */
module.exports = {
	wiki: require( './wiki' ),
	random: require( './random' ),
	runner: require( './runner' )
};
