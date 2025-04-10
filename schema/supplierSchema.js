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
      enum: ["Manufacturer", "Distributor", "Medical Practitioner"],
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
      // required: true,
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
    // tax_no: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },
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
    activity_code: {
      type: String,
      required: true,
      trim: true,
    },
    bank_details: {
      type: String,
      // required: true,
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
    certificateFileNDate: [
      {
        file: { type: String },
        date: { type: String },
      },
    ],
    medical_certificate: [
      {
        type: String,
        trim: true,
        // required: [true, "Validation Error : medical_practitioner_image is required"],
      },
    ],
    payment_terms: {
      type: String,
      // required: true,
      trim: true,
    },
    tags: {
      type: String,
      required: true,
      trim: true,
    },
    categories: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    activity_code: {
      type: String,
      required: true,
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
        enum: ["Registered"],
        default: "Registered",
      },
    },
    account_accepted_date: {
      type: String,
    },
    account_rejected_date: {
      type: String,
    },
    test_account: {
      type: Number,
      default: 0,
    },
    subscriptionEmail: {
      type: String,
      default: "",
    },
    currentSubscription: {
      type: Schema.Types.ObjectId,
      ref: "Subscription", // Referencing the Subscription model
    },
    subscriptionsHistory: [
      {
        subscriptionId: {
          type: Schema.Types.ObjectId,
          ref: "Subscription", // Referencing the Subscription model
          required: true,
        },
      },
    ],
    lastLogin: {
      type: Date,
    },
    loginHistory: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supplier", supplierSchema);
