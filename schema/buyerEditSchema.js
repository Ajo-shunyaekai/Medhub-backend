const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const buyerEditSchema = new Schema({
  buyer_id: {
    type: String,
    required: true,
    // unique: true
  },
  buyer_name : {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  buyer_address: {
    type: String,
    required: true
  },
  buyer_mobile: {
    type: String,
    required : true,
  },
  buyer_country_code: {
    type: String,
    required : true,
  },
  buyer_email: {
    type: String,
    required: true,
    // unique: true
  },
  contact_person_name: {
    type: String,
    required: true,
  },
  designation: {
      type: String,
      required: true,
  },
  contact_person_mobile: {
    type: String,
    required: true,
  },
  contact_person_country_code: {
      type: String,
      required: true,
  },
  contact_person_email : {
      type: String,
      required: true,
  },
  country_of_origin: {
    type: String,
    required: true,
  },
  country_of_operation: [{
      type: String,
      required: true,
  }],
  tax_no: {
    type: String,
    required: true
  },
  license_no: {
    type: String,
    required: true
  },
  buyer_image: [{
    type: String,
    required: true,
  }],
  license_image: [{
    type: String,
    required: true,
  }],
  tax_image: [{
      type: String,
      required: true,
  }],
  password: {
    type: String,
    // required: true
  },
//   account_status: {
//     type: Number,
//     required: true
//   },
  edit_status: {
    type: Number,  // 0- pending, 1 - accepted, 2- rejected
    required: true
  },
//   token: {
//     type: String,
//     required: true,
//     unique : true
//   },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('BuyerProfileEdit', buyerEditSchema);