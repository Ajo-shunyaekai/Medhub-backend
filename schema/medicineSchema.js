const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  medicine_id: {
    type: String,
    required: true,
    unique: true
  },
  supplier_id: {
    type: String,
    required: true,
  },
  medicine_name: {
    type: String,
    required: true
  },
  medicine_type : {
    type: String,
    required: true
  },
  purchased_on : { //for secondary market
    type: String,
    // required: true
  },
  country_available_in: [ //for secondary market
    {
      type: String,
      // required: true
    }
  ],
  min_purchase_unit: { //for secondary market
    type: String,
    // required: true
  },
  composition: {
    type: String,
    required: true
  },
  strength: {
    type: String,
    required: true
  },
  type_of_form : {
    type: String,
    required: true
  },
  shelf_life : {
    type: String,
    required: true
  },
  dossier_type: {
    type: String,
    required: true
  },
  dossier_status: {
    type: String,
    required: true
  },
  medicine_category: {
    type: String,
    required: true
  },
  total_quantity: {
    type: String,
    required: true
  },
  gmp_approvals: {
    type: String,
    required: true
  },
  shipping_time: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    required: true
  }],
  country_of_origin: {
    type: String,
    required: true
  },
  registered_in: [
    {
      type: String,
      required: true
    }
  ],
  available_for: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  //for secondary market
  unit_price: {
    type: String,
    // required: true
  },
  condition: {
    type: String,
    // required: true
  },
 //for secondary market
 
  
  inventory_info: [{
    quantity: String,
    unit_price: String,
    total_price : String,
    est_delivery_days: String,
  }],
  medicine_image: [{
    type: String,
    trim: true
  }],
  invoice_image: [{ //for secondary market
    type: String,
    trim: true
  }],
  status : {
    type: Number,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

const Medicine = mongoose.model('Medicine', medicineSchema);

module.exports = Medicine;