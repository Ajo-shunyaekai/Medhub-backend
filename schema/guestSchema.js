const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const guestSchema = new Schema({
//   guest_id: {
//     type: String,
//     required: true,
//     unique: true
//   },
  email: {
    type: String
  },
  mobile: {
    type: String
  },
  otp: {
    type: String
  },
//   token: {
//     type: String,
//     required: true,
//     unique : true
//   },
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