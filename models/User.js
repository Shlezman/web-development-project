const mongo = require('mongoose');
const { v4: uuidv4 } = require('uuid');


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


  isAdmin:{
    type: Boolean,
    require: true,
    default: false
  }

});

module.exports = mongo.model('User', userSchema);