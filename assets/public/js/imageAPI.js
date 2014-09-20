(function( window, $, riot ) {
    'use strict';

    window.ImageAPI = function() {
        var url = 'image';

        return {
            get: function( limit, page ) {
                if ( ! limit ) {
                    limit = 2;
                }

                if ( ! page ) {
                    page = 1;
                }

                return $.get( url + '?limit=' + limit + '&page=' + page, null, null, 'json' );
            },

            remove: function( id ) {
                return $.ajax({
                    type: 'DELETE',
                    url: url + '/' + id,
                    dataType: 'json'
                });
            },

            update: function( id, image ) {
                return $.ajax({
                    type: 'PUT',
                    url: url + '/' + id,
                    data: image,
                    dataType: 'json'
                });
            }
        };
    };
})( window, jQuery, riot );
