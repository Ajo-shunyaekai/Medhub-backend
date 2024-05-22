const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const supportSchema = new Schema({
  support_id: {
    type: String,
    required: true,
    unique: true
  },
  support_type: {
    type: String,
    required: true
  },
  buyer_id: {
    type: String,
    required: true,
  },
  order_id: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
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

module.exports = mongoose.model('Support', supportSchema);