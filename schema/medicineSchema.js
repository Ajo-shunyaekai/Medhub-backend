// const mongoose = require('mongoose');
// const Schema   = mongoose.Schema;

// const medicineSchema = new Schema({
//     medicine_id: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     medicine_name: {
//         type: String,
//         required: true
//     },
//     description: {
//         type: String,
//         required: true
//     },
//     category_name: {
//         type: String,
//         ref: 'Category',
//         required: true
//     },
//     price: {
//         type: String,
//         required: true,
//         min: 0
//     },
//     inventory: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "MedicineInventory"
//     },
//     medicine_image: {
//         type: String,
//         trim: true
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now
//     },
//     updatedAt: {
//         type: Date,
//         default: Date.now
//     }
// })

// module.exports = mongoose.model('Medicine', medicineSchema);


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
  description: {
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
  // manufacturer: {
  //   type: String,
  //   required: true
  // },
  category_name: {
    type: String,
    required: true
  },
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
  medicine_image: {
    type: String,
    trim: true
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