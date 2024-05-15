const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  category_id: {
    type: String,
    required: true,
    unique: true
  },
  category_name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  // products: [{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Medicine'
  // }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Category', categorySchema);