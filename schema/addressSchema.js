const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const addressSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: [true, "Full name is required for address"],
    },
    mobile_number: {
      type: String,
      required: [true, "Phone number is required for address"],
    },
    company_reg_address: {
      type: String,
      required: [true, "Building Name is required for address"],
    },
    locality: {
      type: String,
      required: [true, "Street is required for address"],
    },
    land_mark: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
      required: [true, "Country is required for address"],
    },
    pincode: { type: String },
    address_type: {
      type: String,
      enum: ["Company", "Shop", "Warehouse", "Factory", "Other"],
      default: "Company",
      required: [true, "Address type is required for address"],
    },
  },
  { timestamps: true }
);

const userAddressSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, "User id is required for address"],
    },
    addresses: [addressSchema],
    default: {
      type: Schema.Types.ObjectId,
      ref: "Address",
    },
  },
  { timestamps: true }
);

// Exporting the models correctly
module.exports = {
  Address: mongoose.model("Address", addressSchema),
  UserAddress: mongoose.model("UserAddress", userAddressSchema),
};
