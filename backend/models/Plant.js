const mongo = require('mongoose');
const {Schema} = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

// Define the Review schema for plant reviews
const reviewSchema = new mongo.Schema({
  user: {
    type: mongo.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Define the Plant schema structure
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
  reviews: [reviewSchema],
  avgRating: {
      type: Number,
      default: 0
    },
    numReviews: {
      type: Number,
      default: 0
    }
});

// Add pagination functionality to the plant schema
plantSchema.plugin(mongoosePaginate);

// Add a text index for full-text search on name, description, and category
plantSchema.index({ name: 'text', description: 'text', category: 'text' });


// Export the Plant model
module.exports = mongo.model('Plant', plantSchema);