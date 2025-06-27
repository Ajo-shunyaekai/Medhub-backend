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
    countries: [
      {
        type: String,
        trim: true,
      },
    ],
    stockedInDetails: [
      {
        country: {
          type: String,
          required: [
            true,
            "Validation Error: stockTradeIn Country is required",
          ],
        },
        quantity: { type: Number },
        type: { type: String, default: "Box" },
      },
    ],
    inventoryList: [
      {
        quantity: {
          type: String,
          required: [
            true,
            "Validation Error: inventory list quantity is required",
          ],
        },
        price: {
          type: Number,
          required: [true, "Validation Error: inventory list unit price is required"],
        },
        totalPrice: {
          type: Number,
          required: [true, "Validation Error: inventory list total price is required"],
        },
        deliveryTime: {
          type: String,
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
