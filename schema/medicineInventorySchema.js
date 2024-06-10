const mongoose = require('mongoose');

const medicineInventorySchema = new mongoose.Schema({
  medicine_id: {
    type: String,
    required: true,
    unique: true
  },
  supplier_id: {
    type: String,
    required: true,
  },
  strength: [{
    type: String,
    required: true,
  }],
  inventory_info: [
  {
    strength: String,
    quantity: String,
    unit_price: String,
    type_of_form: String,
    est_delivery_days: String
  }
  ],
  status : {
    type: Number,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
  // batch_number: {
  //   type: String,
  //   required: true
  // },
  // expiry_date: {
  //   type: String,
  // },
  // quantity: {
  //   type: Map,
  //   of: Number,
  //   required: true
  // },
  // quantity: [
  //  {
  //   strength : String,
  //   value    : String
  //  },
  // ],
  // unit_price: {
  //   type: Map,
  //   of: Number,
  //   required: true
  // },
  // unit_price: [
  //   {
  //     strength : String,
  //     value    : String
  //   },
  // ],
  // location: {
  //   type: String,
  //   required: true
  // },
  // supplier: {
  //   type: String,
  //   required: true
  // },
  // received_date: {
  //   type: String,
  // },
  
});

const MedicineInventory = mongoose.model('MedicineInventory', medicineInventorySchema);

module.exports = MedicineInventory;
