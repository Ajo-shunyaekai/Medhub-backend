const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: [true, "User id is required for address"],
    },
    full_name: {
      type: String,
      required: [true, "Full name is required for address"],
    },
    mobile_number: {
      type: String,
      required: [true, "Phone number is required for address"],
    },
    building_name: {
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
      // required: [true, "City is required for address"],
    },
    state: {
      type: String,
      // required: [true, "State is required for address"],
    },
    country: {
      type: String,
      required: [true, "Country is required for address"],
    },
    pincode: { type: String },
    type: {
      type: String,
      enum: ["company", "shop", "warehouse", "factory", "other"],
      default: "company",
      required: [true, "Address type is required for address"],
    },
    // isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Address", addressSchema);
