const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const buyerSchema = new Schema(
  {
    buyer_id: {
      type: String,
      required: [true, "Validation Error : buyer_id is required"],
      unique: true,
    },
    buyer_type: {
      type: String,
      required: [true, "Validation Error : buyer_type is required"],
    },
    buyer_name: {
      type: String,
      required: [true, "Validation Error : buyer_name is required"],
    },
    buyer_address: {
      type: String,
      required: [true, "Validation Error : buyer_address is required"],
    },
    buyer_email: {
      type: String,
      required: [true, "Validation Error : buyer_email is required"],
      unique: true,
    },
    buyer_mobile: {
      type: String,
      required: [true, "Validation Error : buyer_mobile is required"],
    },
    buyer_country_code: {
      type: String,
      required: [true, "Validation Error : buyer_country_code is required"],
    },
    registration_no: {
      type: String,
      required: [true, "Validation Error : registration_no is required"],
    },
    vat_reg_no: {
      type: String,
      required: [true, "Validation Error : vat_reg_no is required"],
    },
    contact_person_name: {
      type: String,
      required: [true, "Validation Error : contact_person_name is required"],
    },
    designation: {
      type: String,
      required: [true, "Validation Error : designation is required"],
    },
    contact_person_email: {
      type: String,
      required: [true, "Validation Error : contact_person_email is required"],
    },
    contact_person_mobile: {
      type: String,
      required: [true, "Validation Error : contact_person_mobile is required"],
    },
    contact_person_country_code: {
      type: String,
      required: [
        true,
        "Validation Error : contact_person_country_code is required",
      ],
    },
    country_of_origin: {
      type: String,
      required: [true, "Validation Error : country_of_origin is required"],
    },
    country_of_operation: [
      {
        type: String,
        required: [true, "Validation Error : country_of_operation is required"],
      },
    ],
    approx_yearly_purchase_value: {
      type: String,
      required: [
        true,
        "Validation Error : approx_yearly_purchase_value is required",
      ],
    },
    interested_in: [
      {
        type: String,
        required: [true, "Validation Error : interested_in is required"],
      },
    ],
    license_no: {
      type: String,
      required: [true, "Validation Error : license_no is required"],
    },
    license_expiry_date: {
      type: String,
      required: [true, "Validation Error : license_expiry_date is required"],
    },
    tax_no: {
      type: String,
      required: [true, "Validation Error : tax_no is required"],
    },

    description: {
      type: String,
      required: [true, "Validation Error : description is required"],
    },
    license_image: [
      {
        type: String,
        required: [true, "Validation Error : license_image is required"],
      },
    ],
    tax_image: [
      {
        type: String,
        required: [true, "Validation Error : tax_image is required"],
      },
    ],
    certificate_image: [
      {
        type: String,
        required: [true, "Validation Error : certificate_image is required"],
      },
    ],
    buyer_image: [
      {
        type: String,
        required: [true, "Validation Error : buyer_image is required"],
      },
    ],
    password: {
      type: String,
      // required:[true, 'password is required from mongoose' ]
    },
    account_status: {
      type: Number, // 0 - pending, 1 - accepted || unblocked ,  2 - rejected,  3 - blocked
      required: [true, "Validation Error : account_status is required"],
    },
    profile_status: {
      type: Number, // 0- pending, 1 - accepted, 2- rejected
      required: [true, "Validation Error : profile_status is required"],
    },
    token: {
      type: String,
      required: [true, "Validation Error : token is required"],
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
    otpExpiry: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Buyer", buyerSchema);
