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
  // medicine_id: {
  //     type: String,
  //     required: true,
  // },
  item_details: [
    {
      medicine_id: String,
      quantity: String,
      unit_price: String,
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
    default: Date.now
  }
  // quantity: {
  //     type: String,
  //     required: true,
  // },
  // unit_price: {
  //     type: String,
  //     required: true,
  // },
  // est_delivery_time: {
  //     type: String,
  //     required: true,
  // },
  // quantity_required: {
  //     type: String,
  //     required: true,
  // },
  // target_price: {
  //     type: String,
  //     required: true,
  // }
})

module.exports = mongoose.model("List", listSchema);