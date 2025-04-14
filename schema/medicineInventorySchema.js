const mongoose = require("mongoose");

const medicineInventorySchema = new mongoose.Schema({
  product_id: {
    type: String,
    required: true,
    unique: true,
  },
  supplier_id: {
    type: String,
    required: true,
  },
  strength: [
    {
      type: String,
      required: true,
    },
  ],
  inventory_info: [
    {
      strength: String,
      quantity: String,
      unit_price: String,
      type_of_form: String,
      total_price: String,
      shelf_life: String,
      est_delivery_days: String,
    },
  ],
  status: {
    type: Number,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

const MedicineInventory = mongoose.model(
  "MedicineInventory",
  medicineInventorySchema
);

module.exports = MedicineInventory;
