const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const supplierSchema = new Schema({
    supplier_id: {
        type: String,
        required: true,
        unique: true
    },
    supplier_name: {
        type: String,
        required: true,
    },
    supplier_address: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    license_no: {
        type: String,
        required: true,
    },
    country_of_origin: {
        type: String,
        required: true,
    },
    contact_person_name: {
        type: String,
        required: true,
    },
    designation: {
        type: String,
        required: true,
    },
    payment_terms: {
        type: String,
        required: true
      },
    tags: {
        type: String,
        required: true
    },
    estimated_delivery_time: {
        type: String,
        required: true, 
    },
    email: {
        type: String,
        required: true,
        unique: true  
    },
    mobile: {
        type: String,
        required: true,
    },
    country_code: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true, 
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
})

module.exports = mongoose.model('Supplier', supplierSchema);