(function( window, $, bootbox, riot ) {
    'use strict';

    window.imagePresenter = function( element, options ) {
        var $element = $( element ),
            template = options.template,
            imageModel = options.model,
            $list = $element.find( '#images-list' ),
            $window = $( window ),
            $document = $( document ),
            optimalLimit = 2,
            currentPage = 0,
            finishedLoading = false,
            emptyList = true,
            makingRequest = false,
            currentRequest = null;

        //
        // Bind events: START
        //

        // Show delete confirmation and request delete if accepted
        $element.on( 'click.app', '.image-delete', function( event ) {
            event.preventDefault();

            var imageData = JSON.parse( $(event.target).closest('.image').data('image').replace(/__'__/g, '"') );// Unescape chars for parsing

            bootbox.confirm( 'Are you sure you want to delete this file?', function( isOk ) {
                if ( isOk ) {
                    window.showLoading( '#images-list', true );

                    imageModel.remove( imageData, function( error ) {
                        window.hideLoading( '#images-list' );

                        if ( error ) {
                            bootbox.alert( '<strong>Error:</strong> ' + error );
                        }
                    });
                }
            });

            return false;
        });

        // Showing Edit Modal
        $element.on( 'click.app', '.image-edit', function( event ) {
            event.preventDefault();

            var imageData = JSON.parse( $(event.target).closest('.image').data('image').replace(/__'__/g, '"') );// Unescape chars for parsing

            var $editModal = $( '#image-edit' );

            $editModal.modal({
                backdrop: 'static'
            });

            // Set values in form
            $editModal.find( '#img-id' ).val( imageData.id );
            $editModal.find( '#img-fileName' ).text( imageData.fileName );
            $editModal.find( '#img-name' ).val( imageData.name );
            $editModal.find( '#img-sort' ).val( imageData.sort );
            $editModal.find( '#img-tags' ).val( imageData.tags.join(', ') );

            return false;
        });

        // When form is submitted, validate and request update
        $element.on( 'submit.app', '#frm-image-edit', function( event ) {
            event.preventDefault();

            var $editModal = $( '#image-edit' );

            var imageData = {
                id: $editModal.find( '#img-id' ).val(),
                name: $editModal.find( '#img-name' ).val(),
                sort: $editModal.find( '#img-sort' ).val(),
                tags: $editModal.find( '#img-tags' ).val().split( ',' )
            };

            // Trim tags
            imageData.tags.forEach( function( tag ) {
                tag = $.trim( tag );
            });

            // Validate name
            if ( ! imageData.name ) {
                bootbox.alert( '<strong>Error:</strong> You need to define a name for the image.' );
                return false;
            }

            window.showLoading( '#image-edit .modal-header' );

            imageModel.update( imageData, function( error ) {
                window.hideLoading( '#image-edit .modal-header' );

                if ( error ) {
                    bootbox.alert( '<strong>Error:</strong> ' + error );
                } else {
                    $editModal.modal( 'hide' );
                }
            });

            return false;
        });

        // Submit form on modal button press
        $element.on( 'click.app', '#image-edit .btn-primary', function( event ) {
            event.preventDefault();

            $( '#frm-image-edit' ).trigger( 'submit' );

            return false;
        });

        //
        // Bind events: END
        //

        // Load/Reload the list
        imageModel.on( 'load', load );
        imageModel.on( 'reload', reload );

        /* Private functions */
        function load() {
            // Don't make more requests if we've finished loading everything
            if ( finishedLoading ) {
                console.log( 'already loaded all images...' );
                return false;
            }

            // Don't make more requests if we're still making one
            if ( makingRequest ) {
                console.log( 'still making a request...' );
                return false;
            }

            // Stop subsequent requests
            makingRequest = true;

            // Show loading
            window.showLoading( '#images-list' );

            var pageToRequest = ++currentPage;

            console.log( 'optimal limit = ', optimalLimit );
            console.log( 'page requested = ', pageToRequest );

            currentRequest = imageModel.get({
                limit: optimalLimit,
                page: pageToRequest
            }, function( error, result ) {
                if ( error ) {
                    bootbox.alert( 'Error!<br>' + error );
                    return false;
                }

                // If there are no more results, set the flag
                if ( ! result.has_more ) {
                    finishedLoading = true;
                    console.log( 'loaded last...' );
                }

                var totalImages = $list.find( '.image' ).length;

                var imagesHTML = [];

                // Add images to template
                result.data.forEach( function( image ) {
                    // Format a json string to add in [data-image]
                    image.jsonData = JSON.stringify( image ).replace( /"/g, "__'__" );// Escape chars for later parsing

                    var imageHTML = $( riot.render(template, image) ).html();

                    imagesHTML.push( imageHTML );

                    ++totalImages;

                    if ( totalImages % 3 === 0 ) {
                        // Make sure we'll only have 3 images per row
                        imagesHTML.push( '<div class="clearfix"></div>' );
                    }
                });

                // Display message with "no images" if there are none
                if ( imagesHTML.length === 0 && currentPage === 1 ) {
                    imagesHTML.push( '<h3 class="align-center">There are no images to show</h3>' );
                }

                // Empty the list if requested
                if ( emptyList ) {
                    $list.empty();

                    // Set the next requests to not empty the list
                    emptyList = false;
                }

                $list.append( imagesHTML.join('') );

                // Allow subsequent requests
                makingRequest = false;

                // Reset current request
                currentRequest = null;

                // Hide loading
                window.hideLoading( '#images-list' );
            });
        }

        function reload() {
            // Reset flags
            currentPage = 0;
            finishedLoading = false;
            emptyList = true;
            makingRequest = false;

            // Calculate optimal limit
            calculateOptimalLimit();

            // Abort request
            if ( currentRequest ) {
                console.log( 'aborting request due to reload...' );
                currentRequest.abort();
                currentRequest = null;
            }

            // Empty the list
            $list.empty();

            // Show loading
            window.showLoading( '#images-list' );

            console.log( 'resetting flags...' );

            // Load images
            load();
        }

        // Calculates the optimal number of images to fetch "per page" based on screen area
        function calculateOptimalLimit() {
            var screenWidth = $window.width();
            var screenHeight = $window.height();
            var imageWidth = 500;// Max image width
            var imageHeight = 500;// Max image height

            var possibleImagesInWidth = Math.ceil( screenWidth / imageWidth );
            var possibleImagesInHeight = Math.ceil( screenHeight / imageHeight );

            // Minimum of 1 image per width, otherwise we don't have any image loading
            if ( possibleImagesInWidth <= 0 || isNaN(possibleImagesInWidth) ) {
                possibleImagesInWidth = 1;
            }

            // Minimum of 1 image per height, otherwise we don't have any image loading
            if ( possibleImagesInHeight <= 0 || isNaN(possibleImagesInHeight) ) {
                possibleImagesInHeight = 1;
            }

            // Optimal image limit is the possible fit between width and height
            optimalLimit = Math.ceil( possibleImagesInWidth * possibleImagesInHeight );

            // Reload loading listener
            reloadLoadingListener();
        }

        // Removes and adds the loading listener on scroll
        function reloadLoadingListener() {
            $window.off( 'scroll.app resize.app' );

            $window.on( 'scroll.app', function( event ) {
                var scrollPosition = $window.scrollTop();
                var positionToLoadMore = $document.height() - $window.height() - 200;

                if ( scrollPosition >= positionToLoadMore ) {
                    load();
                }
            });
        }

        // Re-calculate optimal limit if screen size changes, and prepare next load to be a "reload"
        $( window ).on( 'resize.app', function( event ) {
            calculateOptimalLimit();

            currentPage = 0;
            finishedLoading = false;
            emptyList = true;
        });

        return $element;
    };

})( window, jQuery, bootbox, riot );
