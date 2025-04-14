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
    },
    stock: {
      type: String,
      trim: true,
      required: [true, "Validation Error: Stock is required"],
      enum: ["In-stock", "Out of Stock", "On-demand"],
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
        // type: { type: String },
      },
    ],
    inventoryList: [
      {
        quantityFrom: {
          type: String,
          required: [
            true,
            "Validation Error: inventoryList quantity from is required",
          ],
        },
        quantityTo: {
          type: String,
          required: [
            true,
            "Validation Error: inventoryList quantity to is required",
          ],
        },
        price: {
          type: Number,
          required: [true, "Validation Error: inventoryList price is required"],
        },
        deliveryTime: {
          type: String,
          required: [
            true,
            "Validation Error: inventoryList deliveryTime is required",
          ],
        },
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
