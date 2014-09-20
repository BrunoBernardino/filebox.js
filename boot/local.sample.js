
// # local

var path = require( 'path' );
var uploadsDir = path.join( __dirname, '..', 'uploads' );

exports = module.exports = function() {

    return {
        uploadsDir: uploadsDir,
        uploadsURL: 'http://localhost/uploads/',
        server: {
            host: '0.0.0.0',
            env: 'local',
            port: 3003,
        },
        mongo: {
            dbname: 'fileboxjs-local',
        },
        csrf: {
            enabled: false
        },
        redis: {
            prefix: 'fileboxjs-local'
        }
    };

};

exports[ '@singleton' ] = true;
