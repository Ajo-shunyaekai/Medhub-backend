const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const supplierSchema = new Schema(
  {
    supplier_id: {
      type: String,
      required: true,
      unique: true,
    },
    supplier_type: {
      type: String,
      required: true,
    },
    supplier_name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    supplier_address: {
      type: String,
      required: true,
    },
    supplier_email: {
        type: String,
        // required: true,
        // unique : true
    },
    supplier_mobile: {
      type: String,
      required: true,
    },
    supplier_country_code: {
      type: String,
      required: true,
    },
    license_no: {
      type: String,
      required: true,
    },
    license_expiry_date: {
      type: String,
      required: true,
    },
    tax_no: {
      type: String,
      required: true,
    },
    registration_no: {
      type: String,
      required: true,
    },
    vat_reg_no: {
      type: String,
      required: true,
    },
    country_of_origin: {
      type: String,
      required: true,
    },
    country_of_operation: [
      {
        type: String,
        required: true,
      },
    ],
    contact_person_name: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    contact_person_mobile_no: {
      type: String,
      required: true,
    },
    contact_person_country_code: {
      type: String,
      required: true,
    },
    contact_person_email: {
      type: String,
      required: true,
    },
    supplier_image: [
      {
        type: String,
        required: true,
      },
    ],
    license_image: [
      {
        type: String,
        required: true,
      },
    ],
    tax_image: [
      {
        type: String,
        required: true,
      },
    ],
    certificate_image: [
      {
        type: String,
        required: true,
      },
    ],
    payment_terms: {
      type: String,
      required: true,
    },
    tags: {
      type: String,
      required: true,
    },
    estimated_delivery_time: {
      type: String,
      // required: true,
    },
    password: {
      type: String,
    },
    account_status: {
      type: Number, // 0 - pending, 1 - accepted || unblocked ,  2 - rejected,  3 - blocked
      required: true,
    },
    profile_status: {
      type: Number, // 0- pending, 1 - accepted, 2- rejected
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
      updatedAt: {
        type: Date,
        default: Date.now
    },
    otp: {
      type: Number,
    },
    otpExpiry: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supplier", supplierSchema);
