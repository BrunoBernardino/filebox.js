
// app - routes

var serveStatic = require( 'serve-static' );
var express = require( 'express' );

exports = module.exports = function( IoC, settings ) {

    var app = this;

    // home
    app.get( '/', IoC.create('controllers/home') );

    // images
    var images = IoC.create( 'controllers/images' );
    var imageRouter = express.Router();

    imageRouter.get( '/', images.index );
    imageRouter.post( '/', images.create );
    imageRouter.put( '/:id', images.update );
    imageRouter.delete( '/:id', images.destroy );

    app.use( '/image', imageRouter );

    // tags
    var tags = IoC.create( 'controllers/tags' );
    var tagRouter = express.Router();

    tagRouter.get( '/', tags.index );

    app.use( '/tag', tagRouter );

    // static server
    app.use( serveStatic(settings.publicDir, settings.staticServer) );

};

exports[ '@require' ] = [ '$container', 'igloo/settings' ];
