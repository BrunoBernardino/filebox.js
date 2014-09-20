(function( window, ImageAPI, riot ) {
    'use strict';

    window.ImageModel = function() {
        var self = riot.observable( this ),
            api = new ImageAPI();

        self.get = function( options, callback ) {
            // Enforce callback is a callable function
            if ( typeof callback !== 'function' ) {
                callback = function() {};
            }

            if ( ! options || ! options.limit || ! options.page ) {
                options = {
                    limit: 2,
                    page: 1
                };
            }

            api.get( options.limit, options.page )
                .done( function( result ) {
                    callback( null, result );
                })
                .fail( function( error ) {
                    callback( error );
                });
        };

        self.update = function( image, callback ) {
            // Enforce callback is a callable function
            if ( typeof callback !== 'function' ) {
                callback = function() {};
            }

            api.update( image.id, image )
                .done( function( result ) {
                    callback( null, result );
                    self.trigger( 'update' );
                })
                .fail( function( error ) {
                    callback( error );
                });
        };

        self.remove = function( image, callback ) {
            // Enforce callback is a callable function
            if ( typeof callback !== 'function' ) {
                callback = function() {};
            }

            api.remove( image.id )
                .done( function( result ) {
                    callback( null, result );
                    self.trigger( 'remove' );
                })
                .fail( function( error ) {
                    callback( error );
                });
        };

        // Reload on removal or update
        self.on( 'remove update', function() {
            self.trigger( 'reload' );
        });
    };
})( window, ImageAPI, riot );
