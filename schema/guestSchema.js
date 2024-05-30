const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const guestSchema = new Schema({
  email: {
    type: String
  },
  mobile: {
    type: String
  },
  otp: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '2m'
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    expires: '2m'
  }
});

module.exports = mongoose.model('Guest', guestSchema);