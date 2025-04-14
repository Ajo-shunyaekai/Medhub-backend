const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listSchema = new Schema({
  list_id: {
    type: String,
    required: true,
    unique: true,
  },
  buyer_id: {
    type: String,
    required: true,
  },
  buyerId: {
    type: Schema.Types.ObjectId,
    ref: "Buyer",
    required: [true, "Buyer Id is required"],
  },
  supplier_id: {
    type: String,
    required: true,
  },
  supplierId: {
    type: Schema.Types.ObjectId,
    ref: "Supplier",
    required: [true, "Supplier Id is required"],
  },
  item_details: [
    {
      product_id: String,
      quantity: String,
      unit_price: String,
      unit_tax: Number,
      est_delivery_days: String,
      quantity_required: String,
      target_price: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("List", listSchema);
