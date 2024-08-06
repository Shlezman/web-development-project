const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const userSchema = new mongoose.Schema({
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
  isAdmin: {
    type: Boolean,
    required: true,
    default: false
  }
});

// Add indexes for improved search performance
userSchema.index({ username: 1, email: 1, isAdmin: 1, credit: 1 });

// Add the pagination plugin
userSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('User', userSchema);