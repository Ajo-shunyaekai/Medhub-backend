const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const supplierSchema = new Schema(
  {
    supplier_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    supplier_type: {
      type: String,
      required: true,
      trim: true,
    },
    supplier_name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    supplier_address: {
      type: String,
      required: true,
      trim: true,
    },
    supplier_email: {
      type: String,
      // required: true,
//       unique: true,
      trim: true,
    },
    supplier_mobile: {
      type: String,
      required: true,
      trim: true,
    },
    supplier_country_code: {
      type: String,
      required: true,
      trim: true,
    },
    license_no: {
      type: String,
      required: true,
      trim: true,
    },
    license_expiry_date: {
      type: String,
      required: true,
      trim: true,
    },
    tax_no: {
      type: String,
      required: true,
      trim: true,
    },
    registration_no: {
      type: String,
      required: true,
      trim: true,
    },
    vat_reg_no: {
      type: String,
      required: true,
      trim: true,
    },
    country_of_origin: {
      type: String,
      required: true,
      trim: true,
    },
    country_of_operation: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    sales_person_name: {
      type: String,
      // required: true,
      trim: true,
    },
    contact_person_name: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    contact_person_mobile_no: {
      type: String,
      required: true,
      trim: true,
    },
    contact_person_country_code: {
      type: String,
      required: true,
      trim: true,
    },
    contact_person_email: {
      type: String,
      required: true,
      trim: true,
    },
    supplier_image: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    license_image: [
      {
        type: String,
        trim: true,
        required: true,
      },
    ],
    tax_image: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    certificate_image: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    payment_terms: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: String,
      required: true,
      trim: true,
    },
    trade_code: {
      type: String,
      // required: true,
      trim: true,
    },
    estimated_delivery_time: {
      type: String,
//       required: true,
      trim: true,
    },
    password: {
      type: String,
      trim: true,
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
      trim: true,
      unique: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    otp: {
      type: Number,
    },
    otpCount: {
      type: Number,
      default: 0,
    },
    otpLimitReachedAt: {
      type: Date,  // This field will store the timestamp of when the OTP limit was reached
      default: null,  // Default is null when the user hasn't reached the limit yet
    },
    otpExpiry: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supplier", supplierSchema);
