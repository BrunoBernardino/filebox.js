(function( window, $, riot, ImageModel, imagePresenter ) {
    'use strict';

    var image = new ImageModel();
    var $loaderHTML;

    // Init route
    riot.route( function() {
        image.trigger( 'reload' );
    });

    // Binds the Image Presenter
    imagePresenter( $('#fileboxjs'), {
        model: image,
        template: $( '#image-template' ).html()
    });

    $( document ).ready( function() {
        // Save loader's content
        $loaderHTML = '<div class="loader">' + $( '.loader' ).html() + '</div>';

        // Allow uploads from dedicated button
        $( '.upload-btn .fileupload' ).fileupload({
            dropZone: $( '#dropzone' ),
            url: 'image/',
            dataType: 'json',
            done: function( event, result ) {
                image.trigger( 'reload' );
            }
        });

        // Show loading when an upload starts
        $( document ).on( 'fileuploaddrop.app fileuploadchange.app', function( event, data ) {
            // TODO: Show progress bar instead
            window.showLoading( '#images-list', true );
        });

        // Hide loading when an upload ends
        $( document ).on( 'fileuploadalways.app', function( event, data ) {
            window.hideLoading( '#images-list' );
        });

        // Show #dropzone when files are dragged
        $( document ).on('dragover', function (e) {
            var $dropZone = $('#dropzone'),
                timeout = window.dropZoneTimeout;

            if ( ! timeout ) {
                $dropZone.addClass( 'in' );
                $dropZone.css( 'line-height', $dropZone.outerHeight() + 'px' );
            } else {
                clearTimeout( timeout );
            }

            var found = false,
                node = e.target;

            do {
                if ( node === $dropZone[0] ) {
                    found = true;
                    break;
                }

                node = node.parentNode;

            } while ( node !== null );

            if ( found ) {
                $dropZone.addClass( 'hover' );
            } else {
                $dropZone.removeClass( 'hover' );
            }

            window.dropZoneTimeout = setTimeout( function () {
                window.dropZoneTimeout = null;
                $dropZone.removeClass( 'in hover' );
            }, 100 );
        });

        // Allow uploads from navbar icon
        $( '.upload-icon .fileupload' ).fileupload({
            dropZone: false,// Don't allow drag and drop on this instance
            url: 'image/',
            dataType: 'json',
            done: function( event, result ) {
                image.trigger( 'reload' );
            }
        });
    });

    // Function to show a loading icon inside an element
    window.showLoading = function( element, prepend ) {
        var loaderExists = !! $( element ).find( '.loader' ).length;// Force boolean from a number

        // We won't add anything if a loader already exists
        if ( loaderExists ) {
            return false;
        }

        if ( prepend ) {
            $( element ).prepend( $loaderHTML );
        } else {
            $( element ).append( $loaderHTML );
        }
    };

    // Function to hide a loading icon inside an element
    window.hideLoading = function( element ) {
        var loaderExists = !! $( element ).find( '.loader' ).length;// Force boolean from a number

        // We won't remove anything if a loader doesn't exist
        if ( ! loaderExists ) {
            return false;
        }

        $( element ).find( '.loader' ).remove();
    };

})( window, jQuery, riot, ImageModel, imagePresenter );