
// # config

var path = require( 'path' );

var pkg = require( path.join(__dirname, '..', 'package') );
var assetsDir = path.join( __dirname, '..', 'assets' );
var publicDir = path.join( assetsDir, 'public' );
var uploadsDir = path.join( __dirname, '..', '..', 'uploads' );
var viewsDir = path.join( __dirname, '..', 'app', 'views' );
var maxAge = 24 * 60 * 60 * 1000;

exports = module.exports = function() {

    return {

        defaults: {
            pkg: pkg,
            showStack: true,
            // directories
            assetsDir: assetsDir,
            publicDir: publicDir,
            uploadsDir: uploadsDir,
            // views
            views: {
                dir: viewsDir,
                engine: 'jade'
            },
            session: {
                secret: 'filebox.js-change-me',
                key: 'filebox.js',
                cookie: {
                    maxAge: maxAge * 30
                },
                resave: true,
                saveUninitialized: true
            },
            trustProxy: true,
            updateNotifier: {
                enabled: true,
                dependencies: {},
                updateCheckInterval: 1000 * 60 * 60,
                updateCheckTimeout: 1000 * 20
            },
            staticServer: {
                maxAge: maxAge
            },
            server: {
                host: '0.0.0.0',
                cluster: false,
                ssl: {
                    enabled: false,
                    options: {}
                }
            },
            cookieParser: 'filebox.js-change-me',
            csrf: {
                enabled: true,
                options: {
                    cookie: {
                        maxAge: maxAge
                    }
                }
            },
            mongo: {
                host: 'localhost',
                port: 27017,
                opts: {},
                // faster - don't perform 2nd request to verify
                // log message was received/saved
                safe: false
            },
            redis: {
                host: 'localhost',
                port: 6379,
                maxAge: maxAge * 30,
                prefix: 'fileboxjs-change-me'
            },
            output: {
                handleExceptions: false,
                colorize: true,
                prettyPrint: false
            },
            logger: {
                'console': true,
                requests: true,
                mongo: false,
                file: false,
                hipchat: false
            },
            less: {
                path: publicDir,
                options: {
                    force: true
                }
            },
            jade: {
                amd: {
                    path: '/js/tmpl/',
                    options: {}
                }
            }
        },

        test: {
            csrf: {
                enabled: false
            },
            server: {
                env: 'test',
                port: 5000
            },
            mongo: {
                dbname: 'fileboxjs-test',
            },
            redis: {
                prefix: 'fileboxjs-test'
            }
        },

        development: {
            server: {
                env: 'development',
                port: 3000,
            },
            mongo: {
                dbname: 'fileboxjs-dev',
            }
        },

        production: {
            views: {
                dir: path.join(assetsDir, 'dist'),
            },
            publicDir: path.join(assetsDir, 'dist'),
            showStack: false,
            updateNotifier: {
                enabled: false,
            },
            server: {
                env: 'production',
                port: 3080,
                cluster: true
            },
            mongo: {
                dbname: 'fileboxjs',
            },
            output: {
                colorize: false
            },
            logger: {
                'console': true,
                requests: true,
                mongo: false,
                file: false
            }
        }

    };

};

exports[ '@singleton' ] = true;
