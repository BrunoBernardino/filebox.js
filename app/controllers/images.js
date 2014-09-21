
// # images

var _ = require( 'underscore' );
var paginate = require( 'express-paginate' );
var async = require( 'async' );
var path = require( 'path' );
var fs = require( 'fs' );
var easyimage = require( 'easyimage' );

exports = module.exports = function( Image, settings ) {

    var THUMBNAIL_MAX_WIDTH = 500;
    var THUMBNAIL_MAX_HEIGHT = 500;

    function index( req, res, next ) {
        // Default to 5 images
        if ( ! req.query.limit ) {
            req.query.limit = 5;
        }

        Image.paginate( {}, req.query.page, req.query.limit, function( err, pageCount, images, itemCount ) {
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
                        has_more: paginate.hasNextPages( req )( pageCount, images.length ),
                        data: images
                    });
                }
            });
        });
    }

    function create( req, res, next ) {
        if ( ! req.files || ! req.files.file ) {
            return next( new Error('No image uploaded') );
        }

        var reqFile = req.files.file;

        async.waterfall([
            // Parse fields from the fileName
            function parseName( callback ) {
                var nameStartingIndex = 17;// name length will be 32 - this number. Setting this to 32 would make the filename empty
                var imageData = {
                    fileName: reqFile.name.substr( nameStartingIndex ), // reqFile.name has 32 chars + extension
                    name: reqFile.originalname.replace( /\.[^/.]+$/, '' ), // remove extension from reqFile.originalname
                    thumbnail: reqFile.name.substr( nameStartingIndex, reqFile.name.length - (reqFile.extension.length + 1) - nameStartingIndex ) + '-thumbnail.png'
                };

                callback( null, imageData );
            },
            function changeFileName( imageData, callback ) {
                var newFilePath = path.join( settings.uploadsDir, imageData.fileName );

                fs.rename( reqFile.path, newFilePath, function( err ) {
                    callback( err, imageData );
                });
            },
            function figureOutWhichThumbnailToUse( imageData, callback ) {
                if ( reqFile.mimetype.indexOf('image/') !== -1 ) {
                    callback( null, imageData, true );// Is an image
                } else {
                    callback( null, imageData, false );// Not an image
                }
            },
            function generateImageThumbnail( imageData, isImage, callback ) {
                // Skip this if we're not dealing with an image
                if ( ! isImage ) {
                    return callback( null, imageData, isImage );
                }

                var filePath = path.join( settings.uploadsDir, imageData.fileName );
                var thumbnailPath = path.join( settings.uploadsDir, imageData.thumbnail );

                // Use gif's first frame only for the thumbnail
                if ( reqFile.extension.toLowerCase() === 'gif' ) {
                    filePath += '[0]';
                }

                // Generate thumbnail
                easyimage.rescrop(
                    {
                        src: filePath,
                        dst: thumbnailPath,
                        width: THUMBNAIL_MAX_WIDTH,
                        height: THUMBNAIL_MAX_HEIGHT,
                        quality: 95
                    })
                    .then( function( image ) {
                        callback( null, imageData, isImage );
                    }, function( err ) {
                        callback( err );
                    });
            },
            function generateGenericThumbnail( imageData, isImage, callback ) {
                // Skip this if we're dealing with an image
                if ( isImage ) {
                    return callback( null, imageData );
                }

                var genericImagePath = path.join( settings.uploadsDir, 'generic.png' );
                var thumbnailPath = path.join( settings.uploadsDir, imageData.thumbnail );
                var command = '-pointsize 100 -draw "gravity center fill grey40 text 0,0 \'.' + reqFile.extension.toUpperCase() + '\'"';

                // Prepend "in" file to command
                command = 'convert "' + genericImagePath + '" ' + command;

                // Append "out" file to command
                command += ' "' + thumbnailPath + '"';

                // Generate generic thumbnail
                easyimage.exec( command )
                    .then( function( image ) {
                        callback( null, imageData, isImage );
                    }, function( err ) {
                        callback( err );
                    });
            }
        ], function( err, imageData ) {

            if ( err ) {
                return next( err );
            }

            var newImage = {
                fileName: imageData.fileName,
                name: imageData.name,
                thumbnail: imageData.thumbnail
            };

            Image.create( newImage, function( err, image ) {
                if ( err ) {
                    return next( err );
                }

                res.format({
                    html: function() {
                        req.flash( 'success', 'Successfully created image' );
                        res.redirect( '/' );
                    },
                    json: function() {
                        res.json( image );
                    }
                });
            });
        });
    }

    function update( req, res, next ) {
        Image.findById( req.params.id, function( err, image ) {
            if ( err ) {
                return next( err );
            }

            if ( ! image ) {
                return next( new Error('Image does not exist') );
            }

            if ( ! req.body.name || ! _.isString( req.body.name ) ) {
                return next( new Error('.name is empty or not valid.') );
            }

            if ( req.body.sort === undefined || req.body.sort < 0 ) {
                return next( new Error('.sort is missing or not valid.') );
            }

            if ( ! req.body.tags || ! _.isArray(req.body.tags) ) {
                return next( new Error('.tags is missing or not valid.') );
            }

            image.name = req.body.name;
            image.sort = req.body.sort;
            image.tags = req.body.tags;

            image.save( function( err, image ) {
                if ( err ) {
                    return next( err );
                }

                res.format({
                    html: function() {
                        req.flash( 'success', 'Successfully updated image' );
                        res.redirect( '/' );
                    },
                    json: function() {
                        res.json( image );
                    }
                });
            });
        });
    }

    function destroy( req, res, next ) {
        Image.findById( req.params.id, function( err, image ) {
            if ( err ) {
                return next( err );
            }

            if ( ! image ) {
                return next( new Error('Image does not exist') );
            }

            async.parallel([
                function deleteFile( callback ) {
                    var filePath = path.join( settings.uploadsDir, image.fileName );
                    fs.unlink( filePath, callback );
                },
                function deleteThumbnail( callback ) {
                    var filePath = path.join( settings.uploadsDir, image.thumbnail );
                    fs.unlink( filePath, callback );
                },
                function removeImage( callback ) {
                    image.remove( callback );
                }
            ], function() {
                if ( err ) {
                    return next( err );
                }

                res.format({
                    html: function() {
                        req.flash( 'success', 'Successfully removed image' );
                        res.redirect( '/' );
                    },
                    json: function() {
                        res.json({
                            id: image.id,
                            deleted: true
                        });
                    }
                });
            });
        });
    }

    return {
        index: index,
        create: create,
        update: update,
        destroy: destroy
    };

};

exports[ '@singleton' ] = true;
exports[ '@require' ] = [ 'models/image', 'igloo/settings' ];
