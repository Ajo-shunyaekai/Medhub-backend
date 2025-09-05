require("dotenv").config();
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
      enum: [
        "Manufacturer",
        "Distributor",
        "Medical Practitioner",
        "Service Provider",
      ],
      required: true,
      trim: true,
    },
    supplier_name: {
      type: String,
      required: true,
      trim: true,
    },
    productsIndicator: {
      type: String,
      // required: true,
      trim: true,
    },
    product_contact_name: {
      type: String,
      trim: true,
    },
    product_contact_no: {
      type: String,
      trim: true,
    },
    product_contact_email: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    supplier_address: {
      type: String,
      trim: true,
    },
    supplier_email: {
      type: String,
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
      trim: true,
    },
    license_expiry_date: {
      type: String,
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
      trim: true,
    },
    sales_person_email: {
      type: String,
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
    product_catalogue: [
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
      trim: true,
    },
    tags: {
      type: String,
      // required: true,
      trim: true,
    },
    categories: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
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
        type: Schema.Types.ObjectId,
        ref: "Subscription", // Referencing the Subscription model
        required: true,
      },
    ],
    showSubscriptionUrl: {
      type: Boolean,
      default: false,
    },
    last_login: {
      type: Date,
    },
    login_history: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    refreshToken: {
      type: String,
    },
    websiteAddress: {
      type: String,
    },
    yrFounded: {
      type: Number,
    },
    annualTurnover: {
      type: Number,
    },
    tempSubsInvoice: {
      name: {
        type: String,
      },
      amount: {
        type: String,
      },
      subscriptionStartDate: {
        type: String,
      },
      invoiceNumber: {
        type: String,
      },
      file: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

// supplierSchema?.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();

//   this.password = await bcrypt.hash(
//     this.password,
//     Number(process.env.BCRYPT_SALT_ROUNDS)
//   );
//   next();
// });

supplierSchema.methods.isPasswordCorrect = async function (password) {
  if (!password || !this.password) {
    throw new Error("Missing entered password or stored hashed password");
  }
  return await bcrypt.compare(password, this.password);
};

supplierSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      user_id: this.supplier_id,
    },
    process.env.JWT_ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY }
  );
};

supplierSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.JWT_REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRY }
  );
};

module.exports = mongoose.model("Supplier", supplierSchema);
