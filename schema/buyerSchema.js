const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const buyerSchema = new Schema(
  {
    buyer_id: {
      type: String,
      trim: true,
      required: [true, "Validation Error : buyer_id is required"],
      unique: true,
    },
    buyer_type: {
      type: String,
      enum: ["End User", "Distributor", "Medical Practitioner"],
      trim: true,
      required: [true, "Validation Error : buyer_type is required"],
    },
    buyer_name: {
      type: String,
      trim: true,
      required: [true, "Validation Error : buyer_name is required"],
    },
    buyer_address: {
      type: String,
      trim: true,
      // required: [true, "Validation Error : buyer_address is required"],
    },
    buyer_email: {
      type: String,
      trim: true,
      required: [true, "Validation Error : buyer_email is required"],
      unique: true,
    },
    buyer_mobile: {
      type: String,
      trim: true,
      required: [true, "Validation Error : buyer_mobile is required"],
    },
    buyer_country_code: {
      type: String,
      trim: true,
      required: [true, "Validation Error : buyer_country_code is required"],
    },
    registration_no: {
      type: String,
      trim: true,
      required: [true, "Validation Error : registration_no is required"],
    },
    vat_reg_no: {
      type: String,
      trim: true,
      required: [true, "Validation Error : vat_reg_no is required"],
    },
    trade_code: {
      type: String,
      trim: true,
      // required: [true, "Validation Error : vat_reg_no is required"],
    },
    contact_person_name: {
      type: String,
      trim: true,
      required: [true, "Validation Error : contact_person_name is required"],
    },
    designation: {
      type: String,
      trim: true,
      required: [true, "Validation Error : designation is required"],
    },
    contact_person_email: {
      type: String,
      trim: true,
      required: [true, "Validation Error : contact_person_email is required"],
    },
    contact_person_mobile: {
      type: String,
      trim: true,
      required: [true, "Validation Error : contact_person_mobile is required"],
    },
    contact_person_country_code: {
      type: String,
      trim: true,
      required: [
        true,
        "Validation Error : contact_person_country_code is required",
      ],
    },
    country_of_origin: {
      type: String,
      trim: true,
      required: [true, "Validation Error : country_of_origin is required"],
    },
    country_of_operation: [
      {
        type: String,
        trim: true,
        required: [true, "Validation Error : country_of_operation is required"],
      },
    ],
    approx_yearly_purchase_value: {
      type: String,
      trim: true,
      required: [
        true,
        "Validation Error : approx_yearly_purchase_value is required",
      ],
    },
    interested_in: [
      {
        type: String,
        trim: true,
        required: [true, "Validation Error : interested_in is required"],
      },
    ],
    license_no: {
      type: String,
      trim: true,
      required: [true, "Validation Error : license_no is required"],
    },
    license_expiry_date: {
      type: String,
      trim: true,
      required: [true, "Validation Error : license_expiry_date is required"],
    },
    tax_no: {
      type: String,
      trim: true,
      required: [true, "Validation Error : tax_no is required"],
    },

    description: {
      type: String,
      trim: true,
      required: [true, "Validation Error : description is required"],
    },
    license_image: [
      {
        type: String,
        trim: true,
        required: [true, "Validation Error : license_image is required"],
      },
    ],
    tax_image: [
      {
        type: String,
        trim: true,
        required: [true, "Validation Error : tax_image is required"],
      },
    ],
    certificate_image: [
      {
        type: String,
        trim: true,
        required: [true, "Validation Error : certificate_image is required"],
      },
    ],
    medical_certificate: [
      {
        type: String,
        trim: true,
        required: [true, "Validation Error : medical_certificate_image is required"],
      },
    ],
    buyer_image: [
      {
        type: String,
        trim: true,
        required: [true, "Validation Error : buyer_image is required"],
      },
    ],
    password: {
      type: String,
      trim: true,
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
      trim: true,
      required: [true, "Validation Error : token is required"],
      unique: true,
    },
    otp: {
      type: Number,
    },
    otpCount: {
      type: Number,
      default: 0,
    },
    otpLimitReachedAt: {
      type: Date, // This field will store the timestamp of when the OTP limit was reached
      default: null, // Default is null when the user hasn't reached the limit yet
    },
    otpExpiry: {
      type: Date,
      default: Date.now,
    },
    registeredAddress: {
      full_name: {
        type: String, // Conatct Person Name
        required: [true, "Full name is required for address"],
      },
      mobile_number: {
        type: String, // Conatct Person Mobile
        required: [true, "Phone number is required for address"],
      },
      country_code: {
        type: String, // Conatct Person Country code
        required: [true, "Country code is required for address"],
      },
      company_reg_address: {
        type: String, // Company Name
        required: [true, "Building Name is required for address"],
      },
      locality: {
        type: String, // Address Line 1
        required: [true, "Street is required for address"],
      },
      land_mark: {
        type: String, // Address Line 2
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
        default: "Registered",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Buyer", buyerSchema);
