const mongo = require('mongoose');

const userSchema = new mongo.Schema({
  username: { 
    type: String,
    required: true,
    unique: true 
    },

  email: {
    type: String,
    required: true,
    unique: true
    },

  password: {
    type: String,
    required: true
    },

  createdAt: {
    type: Date,
    default: Date.now 
    },

  credit: {
    type: Number,
    required: true,
    default: 0
    },
  // add function to generate uuid when creating user
  uuid: {
    type: String,
    required: true,
    unique: true },

  isSeller: {
    type: Boolean,
    require: true,
    default: false
  },

  // for sellers for making a map with google maps
  address: {
    type: String,
    unique: true,
    required: false
  }

});

module.exports = mongo.model('User', userSchema);