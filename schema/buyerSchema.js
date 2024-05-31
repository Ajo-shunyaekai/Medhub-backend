const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const buyerSchema = new Schema({
  buyer_id: {
    type: String,
    required: true,
    unique: true
  },
  buyer_name: {
    type: String,
    required: true
  },
  company_name: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required : true,
  },
  country_code: {
    type: String,
    required : true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    // required: true
  },
  status: {
    type: Number,
    required: true
  },
  token: {
    type: String,
    required: true,
    unique : true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Buyer', buyerSchema);