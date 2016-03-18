var crypto = require( 'crypto' ),
		random = {};

random.string = function ( prefix, length ) {
	return prefix + crypto.randomBytes( length || 10 ).toString( 'hex' );
};

module.exports = random;
