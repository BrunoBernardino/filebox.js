
var request = require( 'supertest' );
var app = require( '../app' );
var chai = require( 'chai' );
var sinon = require( 'sinon' );
var sinonChai = require( 'sinon-chai' );
var expect = chai.expect;
var utils = require( './utils' );
var async = require( 'async' );
var IoC = require( 'electrolyte' );
var path = require( 'path' );
var fs = require( 'fs' );

chai.should();
chai.use( sinonChai );

request = request( app );

describe( '/image', function() {

    var Image = IoC.create( 'models/image' );
    var settings = IoC.create( 'igloo/settings' );

    // Clean DB and add 5 sample images before tests start
    before( function( done ) {
        async.waterfall([
            utils.cleanDatabase,
            function createTestImages( callback ) {
                // Create 5 images
                async.timesSeries( 5, function( i, _callback ) {
                    var image = new Image({
                        fileName: 'image-' + i + '.jpg',
                        name: 'image-' + i,
                        thumbnail: 'image-' + i + '-thumbnail.jpg',
                        sort: i,
                        tags: [ 'test' ]
                    });

                    image.save( _callback );
                }, callback );
            }
        ], done );
    });

    // Clean DB after all tests are done
    after( function( done ) {
        utils.cleanDatabase( done );
    });

    // Check if we can fetch 2 images with limit and page
    it( 'GET /image - should fetch 2 images', function( done ) {
        request
            .get( '/image?limit=2&page=1' )
            .set( 'Accept', 'application/json' )
            .end( function( err, res ) {
                expect( err ).to.be.null;
                expect( res.body ).to.exist;
                expect( res.status ).to.equal( 200 );

                // Check body has a proper list object
                expect( res.body ).to.have.property( 'object' );
                expect( res.body ).to.have.property( 'has_more' );
                expect( res.body ).to.have.property( 'data' );

                expect( res.body.has_more ).to.equal( true );

                // Check there are 2 images in res.body
                expect( res.body.data ).to.be.instanceof( Array );
                expect( res.body.data ).to.have.length( 2 );

                // Check all expected properties exist in the first image
                expect( res.body.data[0] ).to.have.property( 'fileName' );
                expect( res.body.data[0] ).to.have.property( 'name' );
                expect( res.body.data[0] ).to.have.property( 'thumbnail' );
                expect( res.body.data[0] ).to.have.property( 'tags' );
                expect( res.body.data[0] ).to.have.property( 'sort' );
                expect( res.body.data[0] ).to.have.property( 'updated_at' );
                expect( res.body.data[0] ).to.have.property( 'created_at' );

                // Check in more detail types and values of the properties
                expect( res.body.data[0].tags ).to.be.instanceof( Array );
                expect( res.body.data[0].tags ).to.have.length( 1 );

                expect( res.body.data[0].fileName ).to.equal( 'image-0.jpg' );
                expect( res.body.data[0].sort ).to.equal( 0 );
                expect( res.body.data[0].tags[0] ).to.equal( 'test' );

                done();
            });
    });

    // Check if we can fetch 5 images by changing the limit parameter
    it( 'GET /image - should fetch 5 images', function( done ) {
        request
            .get( '/image?limit=5&page=1' )
            .set( 'Accept', 'application/json' )
            .end( function( err, res ) {
                expect( err ).to.be.null;
                expect( res.body ).to.exist;
                expect( res.status ).to.equal( 200 );

                // Check body has a proper list object
                expect( res.body ).to.have.property( 'object' );
                expect( res.body ).to.have.property( 'has_more' );
                expect( res.body ).to.have.property( 'data' );

                expect( res.body.has_more ).to.equal( false );

                // Check there are 5 images in res.body
                expect( res.body.data ).to.be.instanceof( Array );
                expect( res.body.data ).to.have.length( 5 );

                done();
            });
    });

    // Check if we can fetch 5 images by default (not sending page or limit)
    it( 'GET /image - should fetch 5 images by default', function( done ) {
        request
            .get( '/image' )
            .set( 'Accept', 'application/json' )
            .end( function( err, res ) {
                expect( err ).to.be.null;
                expect( res.body ).to.exist;
                expect( res.status ).to.equal( 200 );

                // Check body has a proper list object
                expect( res.body ).to.have.property( 'object' );
                expect( res.body ).to.have.property( 'has_more' );
                expect( res.body ).to.have.property( 'data' );

                expect( res.body.has_more ).to.equal( false );

                // Check there are 5 images in res.body
                expect( res.body.data ).to.be.instanceof( Array );
                expect( res.body.data ).to.have.length( 5 );

                done();
            });
    });

    // Check if we can update an image
    it( 'PUT /image - should update 1 image', function( done ) {
        async.waterfall([
            function getImage( callback ) {
                Image.findOne({
                    sort: 0
                }, callback );
            },
            function sendRequestToUpdate( image, callback ) {
                var updatedImage = {
                    fileName: 'image-updated.jpg',
                    name: 'image-updated',
                    thumbnail: 'image-updated-thumbnail.jpg',
                    sort: image.sort,
                    tags: image.tags
                };

                // Add another tag, why not?
                updatedImage.tags.push( 'test-updated' );

                request
                    .put( '/image/' + image.id )
                    .set( 'Accept', 'application/json' )
                    .send( updatedImage )
                    .end( function( err, res ) {
                        expect( err ).to.be.null;
                        expect( res.body ).to.exist;
                        expect( res.status ).to.equal( 200 );

                        // Check all expected properties exist in the image
                        expect( res.body ).to.have.property( 'fileName' );
                        expect( res.body ).to.have.property( 'name' );
                        expect( res.body ).to.have.property( 'thumbnail' );
                        expect( res.body ).to.have.property( 'tags' );
                        expect( res.body ).to.have.property( 'sort' );
                        expect( res.body ).to.have.property( 'updated_at' );
                        expect( res.body ).to.have.property( 'created_at' );

                        // Check in more detail types and values of the properties
                        expect( res.body.tags ).to.be.instanceof( Array );
                        expect( res.body.tags ).to.have.length( 2 );

                        expect( res.body.fileName ).to.equal( 'image-0.jpg' );// .fileName can't actually be updated
                        expect( res.body.name ).to.equal( 'image-updated' );
                        expect( res.body.thumbnail ).to.equal( 'image-0-thumbnail.jpg' );// .thumbnail can't actually be updated
                        expect( res.body.sort ).to.equal( 0 );
                        expect( res.body.tags[1] ).to.equal( 'test-updated' );

                        callback( null );
                    });
            }
        ], function( err ) {
            expect( err ).to.be.null;

            done();
        });
    });

    var sampleImageId;// To be used for removal later

    // Check if we can create 1 image
    it( 'POST /image - should create 1 image', function( done ) {
        async.waterfall([
            function sendRequestToCreate( callback ) {
                var fileName = 'test-image.jpg';
                var filePath = path.join( __dirname, 'assets', fileName );

                request
                    .post( '/image' )
                    .set( 'Accept', 'application/json' )
                    .attach( 'file', filePath )
                    .end( function( err, res ) {
                        expect( err ).to.be.null;
                        expect( res.body ).to.exist;
                        expect( res.status ).to.equal( 200 );

                        // Check all expected properties exist in the response (limited check since a thorough one is done in the next waterfall method)
                        expect( res.body ).to.have.property( 'id' );

                        callback( null, fileName, res.body );
                    });
            },
            function getImageAfterBeingCreated( fileName, returnedImage, callback ) {
                Image.findById( returnedImage.id , function( err, foundImage ) {
                    expect( err ).to.be.null;

                    // Check all expected properties exist in the image
                    expect( foundImage ).to.have.property( 'fileName' );
                    expect( foundImage ).to.have.property( 'name' );
                    expect( foundImage ).to.have.property( 'thumbnail' );
                    expect( foundImage ).to.have.property( 'tags' );
                    expect( foundImage ).to.have.property( 'sort' );
                    expect( foundImage ).to.have.property( 'updated_at' );
                    expect( foundImage ).to.have.property( 'created_at' );

                    // Check in more detail types and values of the properties
                    expect( foundImage.tags ).to.be.instanceof( Array );
                    expect( foundImage.tags ).to.have.length( 0 );

                    var fileNameExtension = fileName.split( '.' ).pop();
                    var foundImageFileNameExtension = foundImage.fileName.split( '.' ).pop();
                    var fileNameWithoutExtension = fileName.replace( /\.[^/.]+$/, '' );

                    expect( foundImage.fileName ).to.not.equal( fileName );// Filename should be changed
                    expect( foundImageFileNameExtension ).to.equal( fileNameExtension );// Extensions should match, though
                    expect( foundImage.name ).to.equal( fileNameWithoutExtension );// .name is automatically created from fileName
                    expect( foundImage.thumbnail ).to.equal( foundImage.fileName.replace('.' + fileNameExtension, '-thumbnail.png') );// .thumbnail is automatically created from fileName
                    expect( foundImage.sort ).to.equal( 99 );// Default

                    // To be used later in deletion
                    sampleImageId = returnedImage.id;

                    callback( null, foundImage );
                });
            },
            function checkIfFileExists( image, callback ) {
                var filePath = path.join( settings.uploadsDir, image.fileName );

                fs.stat( filePath, function( err, stats ) {
                    expect( err ).to.be.null;

                    expect( stats.isFile() ).to.equal( true );

                    callback( null, image );
                });
            },
            function checkIfThumbnailFileExists( image, callback ) {
                var filePath = path.join( settings.uploadsDir, image.thumbnail );

                fs.stat( filePath, function( err, stats ) {
                    expect( err ).to.be.null;

                    expect( stats.isFile() ).to.equal( true );

                    callback( null );
                });
            }
        ], function( err ) {
            expect( err ).to.be.null;

            done();
        });
    });

    // Check if we can create 1 file
    it( 'POST /image - should create 1 file', function( done ) {
        async.waterfall([
            function sendRequestToCreate( callback ) {
                var fileName = 'test-file.md';
                var filePath = path.join( __dirname, 'assets', fileName );

                request
                    .post( '/image' )
                    .set( 'Accept', 'application/json' )
                    .attach( 'file', filePath )
                    .end( function( err, res ) {
                        expect( err ).to.be.null;
                        expect( res.body ).to.exist;
                        expect( res.status ).to.equal( 200 );

                        // Check all expected properties exist in the response (limited check since a thorough one is done in the next waterfall method)
                        expect( res.body ).to.have.property( 'id' );

                        callback( null, fileName, res.body );
                    });
            },
            function getImageAfterBeingCreated( fileName, returnedImage, callback ) {
                Image.findById( returnedImage.id , function( err, foundImage ) {
                    expect( err ).to.be.null;

                    // Check all expected properties exist in the image
                    expect( foundImage ).to.have.property( 'fileName' );
                    expect( foundImage ).to.have.property( 'name' );
                    expect( foundImage ).to.have.property( 'thumbnail' );
                    expect( foundImage ).to.have.property( 'tags' );
                    expect( foundImage ).to.have.property( 'sort' );
                    expect( foundImage ).to.have.property( 'updated_at' );
                    expect( foundImage ).to.have.property( 'created_at' );

                    // Check in more detail types and values of the properties
                    expect( foundImage.tags ).to.be.instanceof( Array );
                    expect( foundImage.tags ).to.have.length( 0 );

                    var fileNameExtension = fileName.split( '.' ).pop();
                    var foundImageFileNameExtension = foundImage.fileName.split( '.' ).pop();
                    var fileNameWithoutExtension = fileName.replace( /\.[^/.]+$/, '' );

                    expect( foundImage.fileName ).to.not.equal( fileName );// Filename should be changed
                    expect( foundImageFileNameExtension ).to.equal( fileNameExtension );// Extensions should match, though
                    expect( foundImage.name ).to.equal( fileNameWithoutExtension );// .name is automatically created from fileName
                    expect( foundImage.thumbnail ).to.equal( foundImage.fileName.replace('.' + fileNameExtension, '-thumbnail.png') );// .thumbnail is automatically created from fileName
                    expect( foundImage.sort ).to.equal( 99 );// Default

                    callback( null, foundImage );
                });
            },
            function checkIfFileExists( image, callback ) {
                var filePath = path.join( settings.uploadsDir, image.fileName );

                fs.stat( filePath, function( err, stats ) {
                    expect( err ).to.be.null;

                    expect( stats.isFile() ).to.equal( true );

                    callback( null, image );
                });
            },
            function checkIfThumbnailFileExists( image, callback ) {
                var filePath = path.join( settings.uploadsDir, image.thumbnail );

                fs.stat( filePath, function( err, stats ) {
                    expect( err ).to.be.null;

                    expect( stats.isFile() ).to.equal( true );

                    callback( null, image );
                });
            },
            function removeFile( image, callback ) {
                var filePath = path.join( settings.uploadsDir, image.fileName );

                fs.unlink( filePath, function( err ) {
                    callback( err, image );
                });
            },
            function removeThumbnail( image, callback ) {
                var filePath = path.join( settings.uploadsDir, image.thumbnail );

                fs.unlink( filePath, callback );
            }
        ], function( err ) {
            expect( err ).to.be.null;

            done();
        });
    });

    // Check if we can delete 1 image
    it( 'DELETE /image - should delete 1 image', function( done ) {
        async.waterfall([
            function getImage( callback ) {
                Image.findById( sampleImageId , callback );
            },
            function sendRequestToDelete( image, callback ) {
                request
                    .delete( '/image/' + image.id )
                    .set( 'Accept', 'application/json' )
                    .end( function( err, res ) {
                        expect( err ).to.be.null;
                        expect( res.body ).to.exist;
                        expect( res.status ).to.equal( 200 );

                        // Check all expected properties exist in the response
                        expect( res.body ).to.have.property( 'id' );
                        expect( res.body ).to.have.property( 'deleted' );

                        // Check in more detail types and values of the properties
                        expect( res.body.id ).to.equal( image.id );
                        expect( res.body.deleted ).to.equal( true );

                        callback( null, image );
                    });
            },
            function getImageAfterBeingDeleted( image, callback ) {
                Image.findOne({
                    id: image.id
                }, function( err, foundImage ) {
                    expect( err ).to.be.null;
                    expect( foundImage ).to.be.null;

                    callback( null, image );
                });
            },
            function checkIfFileDoesNotExist( image, callback ) {
                var filePath = path.join( settings.uploadsDir, image.fileName );

                fs.stat( filePath, function( err, stats ) {
                    expect( err ).to.be.ok;

                    callback( null, image );
                });
            },
            function checkIfThumbnailFileDoesNotExist( image, callback ) {
                var filePath = path.join( settings.uploadsDir, image.thumbnail );

                fs.stat( filePath, function( err, stats ) {
                    expect( err ).to.be.ok;

                    callback( null );
                });
            }
        ], function( err ) {
            expect( err ).to.be.null;

            done();
        });
    });

});