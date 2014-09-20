
var request = require( 'supertest' );
var app = require( '../app' );
var chai = require( 'chai' );
var sinon = require( 'sinon' );
var sinonChai = require( 'sinon-chai' );
var expect = chai.expect;
var utils = require( './utils' );
var async = require( 'async' );
var IoC = require( 'electrolyte' );

chai.should();
chai.use( sinonChai );

request = request( app );

describe( '/tag', function() {

    var Tag = IoC.create( 'models/tag' );

    // Clean DB and add 50 sample tags before tests start
    before( function( done ) {
        async.waterfall([
            utils.cleanDatabase,
            function createTestTags( callback ) {
                // Create 10 tags
                async.timesSeries( 10, function( i, _callback ) {
                    var tag = new Tag({
                        name: 'test-' + i
                    });

                    tag.save( _callback );
                }, callback );
            }
        ], done );
    });

    // Clean DB after all tests are done
    after( function( done ) {
        utils.cleanDatabase( done );
    });

    // Check if we can fetch 2 tags with limit and page
    it( 'GET /tag - should fetch 2 tags', function( done ) {
        request
            .get( '/tag?limit=2&page=1' )
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

                // Check there are 2 tags in res.body
                expect( res.body.data ).to.be.instanceof( Array );
                expect( res.body.data ).to.have.length( 2 );

                // Check all expected properties exist in the first tag
                expect( res.body.data[0] ).to.have.property( 'name' );
                expect( res.body.data[0] ).to.have.property( 'updated_at' );
                expect( res.body.data[0] ).to.have.property( 'created_at' );

                // Check in more detail types and values of the properties
                expect( res.body.data[0].name ).to.equal( 'test-0' );

                done();
            });
    });

    // Check if we can fetch 5 tags by changing the limit parameter
    it( 'GET /tag - should fetch 5 tags', function( done ) {
        request
            .get( '/tag?limit=5&page=1' )
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

                // Check there are 5 tags in res.body
                expect( res.body.data ).to.be.instanceof( Array );
                expect( res.body.data ).to.have.length( 5 );

                done();
            });
    });

    // Check if we can fetch 10 tags by default (not sending page or limit)
    it( 'GET /tag - should fetch 10 tags by default', function( done ) {
        request
            .get( '/tag' )
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

                // Check there are 10 tags in res.body
                expect( res.body.data ).to.be.instanceof( Array );
                expect( res.body.data ).to.have.length( 10 );

                done();
            });
    });

});