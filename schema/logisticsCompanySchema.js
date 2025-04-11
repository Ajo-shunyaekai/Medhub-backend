require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const logisticsPartnerSchema = new mongoose.Schema(
  {
    partner_id: {
      type: String,
      required: true,
      unique: true,
    },
    company_name: {
      type: String,
      required: true,
    },
    contact_person: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    phone: {
      type: String,
      required: true,
      match: /^\+?\d{10,15}$/,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      zip_code: {
        type: String,
        match: /^\d{5}(-\d{4})?$/,
      },
    },
    otp: {
      type: Number,
    },
    otpExpiry: {
      type: Date,
      default: Date.now,
    },
    last_login: {
      type: Date
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
  },
  {
    timestamps: true,
  }
);

logisticsPartnerSchema?.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // if password is NOT modified, skip hashing

  this.password = await bcrypt.hash(
    this.password,
    Number(process.env.BCRYPT_SALT_ROUNDS)
  );
  next();
});

logisticsPartnerSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

logisticsPartnerSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      user_id: this.partner_id,
    },
    process.env.JWT_ACCESS_TOKEN_SECRET,
    { expiresIn: Number(process.env.JWT_ACCESS_TOKEN_EXPIRY) * Number(process.env.JWT_ACCESS_TOKEN_EXPIRY2)}
  );
};

logisticsPartnerSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.JWT_REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRY }
  );
};

const LogisticsPartner = mongoose.model(
  "LogisticsPartner",
  logisticsPartnerSchema
);

module.exports = LogisticsPartner;
