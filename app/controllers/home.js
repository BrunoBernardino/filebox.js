
// # home

exports = module.exports = function( IoC, settings ) {

    function home( req, res, next ) {
        res.format({
            html: function() {
                res.render( 'home', {
                    uploadsURL: settings.uploadsURL
                });
            },
            json: function() {
                res.status( 200 ).end();
            }
        });
    };

    return home;

};

exports[ '@singleton' ] = true;
exports[ '@require' ] = [ '$container', 'igloo/settings' ];
