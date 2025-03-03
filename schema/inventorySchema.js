const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const inventorrySchema = new Schema(
  {
    uuid: {
      type: String,
      trim: true,
    },
    productId: {
      type: String,
      required: [true, "Validation Error: productId is required"],
    },
    sku: {
      type: String,
      trim: true,
    },
    stock: {
      type: String,
      trim: true,
      enum: ["In-stock", "Out of Stock", "On-demand"],
    },
    stockQuantity: {
      type: Number,
    },
    countries: [
      {
        type: String,
        trim: true,
      },
    ],
    date: {
      type: String,
      trim: true,
    },
    stockedInDetails: [
      {
        country: { type: String },
        quantity: { type: Number },
        type: { type: String },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", inventorrySchema);
