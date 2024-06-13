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
  composition: {
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
  gmp_approvals: {
    type: String,
    required: true
  },
  shipping_time: {
    type: String,
    required: true
  },
  tags: {
    type: String,
    required: true
  },
  available_for: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
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
  inventory_info: [{
    strength: String,
    type_of_form: String,
    quantity: String,
    unit_price: String,
    total_price : String,
    est_delivery_days: String,
    shelf_life: String
  }],
  medicine_image: [{
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


  // country_of_origin: {
  //   type: String,
  //   required: true
  // },
  // dosage_form: {
  //   type: String,
  //   required: true
  // },
  // strength: [{
  //   type: String,
  //   required: true
  // }],
  // category_name: {
  //   type: String,
  //   required: true
  // },
  // quantity: {
  //   type: String,
  //   required: true
  // },
 
  // description: {
  //   type: String,
  //   required: true
  // },
  // manufacturer: {
  //   type: String,
  //   required: true
  // },
  // indications: [{
  //   type: String
  // }],
  // side_effects: [{
  //   type: String
  // }],
  // prescription_required: {
  //   type: Boolean,
  //   default: false
  // },
  // storage_conditions: {
  //   type: String,
  //   required: true
  // },
});

const Medicine = mongoose.model('Medicine', medicineSchema);

module.exports = Medicine;