
// # tags

var _ = require( 'underscore' );
var paginate = require( 'express-paginate' );
var async = require( 'async' );

exports = module.exports = function( Tag, settings ) {

    function index( req, res, next ) {
        // Default to 10 tags
        if ( ! req.query.limit ) {
            req.query.limit = 10;
        }

        Tag.paginate( {}, req.query.page, req.query.limit, function( err, pageCount, tags, itemCount ) {
            if ( err ) {
                return next( err );
            }

            res.format({
                html: function() {
                    req.flash( 'error', 'This endpoint only accepts JSON' );
                    res.redirect( '/' );
                },
                json: function() {
                    // inspired by Stripe's API response for list objects
                    res.json({
                        object: 'list',
                        has_more: paginate.hasNextPages( req )( pageCount, tags.length ),
                        data: tags
                    });
                }
            });
        });
    }

    return {
        index: index
    };

};

exports[ '@singleton' ] = true;
exports[ '@require' ] = [ 'models/tag', 'igloo/settings' ];
