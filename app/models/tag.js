
// # tag

var mongoosePaginate = require( 'mongoose-paginate' );

exports = module.exports = function( mongoose, iglooMongoosePlugin ) {

    var Tag = new mongoose.Schema({
        name: {
            type: String,
            required: true,
            unique: true
        }
    });

    // plugins

    Tag.plugin( mongoosePaginate );

    // keep last
    Tag.plugin( iglooMongoosePlugin );

    return mongoose.model( 'Tag', Tag );
};

exports[ '@singleton' ] = true;
exports[ '@require' ] = [ 'igloo/mongo', 'igloo/mongoose-plugin' ];
