const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const inventorrySchema = new Schema(
  {
    uuid: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    productId: {
      type: String,
      required: [true, "Validation Error: productId is required"],
    },
    sku: {
      type: String,
      trim: true,
      required: [true, "Validation Error: SKU is required"],
    },
    stock: {
      type: String,
      trim: true,
      required: [true, "Validation Error: Stock is required"],
      enum: ["In-stock", "Out of Stock", "On-demand"],
    },
    // stockQuantity: {
    //   type: Number,
    //   required: [true, "Validation Error: Stock Quantity is required"],
    // },
    countries: [
      {
        type: String,
        trim: true,
      },
    ],
    date: {
      type: String,
      trim: true,
      required: [true, "Validation Error: Date of Manufacture is required"],
    },
    stockedInDetails: [
      {
        country: { type: String },
        quantity: { type: Number },
        type: { type: String },
      },
    ],
    inventoryList: [
      {
        quantity: { type: String },
        price: { type: Number },
        deliveryTime: { type: String },
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
