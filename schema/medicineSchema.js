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
  drugs_name: {
    type: String,
    required: true
  },
  country_of_origin: {
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
  medicine_image: [{
    type: String,
    trim: true
  }],
  registered_in: [
    {
      type: String,
      required: true
    }
  ],
  comments: {
    type: String,
    required: true
  },
  dosage_form: {
    type: String,
    required: true
  },
  strength: [{
    type: String,
    required: true
  }],
  category_name: {
    type: String,
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