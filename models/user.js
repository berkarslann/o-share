const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  bachelor: {
    type: String,
    required: true
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        commentId: {
          type: Schema.Types.ObjectId,
          ref: 'Comment',
          required: true
        },
        
      }
    ]
  }
});
  
  



module.exports = mongoose.model('User', userSchema);