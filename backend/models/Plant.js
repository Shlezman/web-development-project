const mongo = require('mongoose');
const {Schema} = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');


const plantSchema = new mongo.Schema({
  name: {
    type: String,
    required: true
    },

  indoor: {
     type: Boolean,
     required: true
     },

  description: {
    type: String,
    required: true
    },

  price: {
    type: Number,
    required: true
    },

  seller: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
    },

// fruit, tree, vegetable, vain, etc...
  category: {
    type: String,
    required: true
    },

// country name for geocoding api and google map integration (UI) --> https://developers.google.com/maps/documentation/geocoding?hl=he
  originCountry: {
      type: String,
      required: true
      },

  inStock: {
    type: Boolean,
    default: true
    },

  createdAt: {
    type: Date,
    default: Date.now
    },
});

plantSchema.plugin(mongoosePaginate);
plantSchema.index({ name: 'text', description: 'text', category: 'text' });


// Export
module.exports = mongo.model('Plant', plantSchema);