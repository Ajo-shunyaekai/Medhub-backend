// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const medicineInventorySchema = new Schema({
//     medicine_id : {
//         type: String,
//         required: true,
//         unique: true
//     },
//     quantity: {
//         type: Number,
//         required: true,
//         min: 0
//     },
//     price: {
//         type: Number,
//         required: true,
//         min: 0
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

// module.exports = mongoose.model('MedicineInventory', medicineInventorySchema)

const mongoose = require('mongoose');

const medicineInventorySchema = new mongoose.Schema({
  medicine_id: {
    // type: mongoose.Schema.Types.ObjectId,
    // ref: 'Medicine',
    // required: true
    type: String,
    required: true,
    unique: true
  },
  batch_number: {
    type: String,
    required: true
  },
  expiry_date: {
    type: String,
    // required: true
  },
  // quantity: {
  //   type: Map,
  //   of: Number,
  //   required: true
  // },
  quantity: [
   {
    strength : String,
    value    : String
   },
  ],
  // unit_price: {
  //   type: Map,
  //   of: Number,
  //   required: true
  // },
  unit_price: [
    {
      strength : String,
      value    : String
    },
  ],
  location: {
    type: String,
    required: true
  },
  supplier: {
    type: String,
    required: true
  },
  received_date: {
    type: String,
    // required: true
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

const MedicineInventory = mongoose.model('MedicineInventory', medicineInventorySchema);

module.exports = MedicineInventory;
