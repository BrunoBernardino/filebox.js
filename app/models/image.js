
// # image

var mongoosePaginate = require('mongoose-paginate')

exports = module.exports = function(mongoose, iglooMongoosePlugin) {

  var Image = new mongoose.Schema({
    fileName: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    thumbnail: {
      type: String,
      required: true
    },
    sort: {
      type: Number,
      default: 99
    },
    tags: [ String ]
  })

  // plugins

  Image.plugin(mongoosePaginate)

  // keep last
  Image.plugin(iglooMongoosePlugin)

  return mongoose.model('Image', Image)
}

exports['@singleton'] = true
exports['@require'] = [ 'igloo/mongo', 'igloo/mongoose-plugin' ]
