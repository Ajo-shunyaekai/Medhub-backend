const mongoose = require("mongoose");

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
    token: {
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
    lastLogin: {
      type: Date
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
  {
    timestamps: true,
  }
);

const LogisticsPartner = mongoose.model(
  "LogisticsPartner",
  logisticsPartnerSchema
);

module.exports = LogisticsPartner;
