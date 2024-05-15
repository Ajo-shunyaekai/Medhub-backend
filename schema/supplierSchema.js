const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const supplierSchema = new Schema({
    supplier_id: {
        type: String,
        required: true,
        unique: true
    },
    company_name: {
        type: String,
        required: true,
    },
    company_address: {
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