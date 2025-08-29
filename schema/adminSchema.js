require("dotenv").config();
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminSchema = new Schema(
  {
    admin_id: {
      type: String,
      required: true,
      unique: true,
    },
    superAdmin: {
      type: Boolean,
      default: false,
    },
    user_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    otp: {
      type: Number,
    },
    otpExpiry: {
      type: Date,
      default: Date.now,
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
    accessControl: {
      buyer: {
        requests: {
          view: { type: Boolean, default: true, immutable: true },
          edit: { type: Boolean, default: false },
        },
        tansaction: {
          view: { type: Boolean, default: true, immutable: true },
          edit: { type: Boolean, default: false },
        },
        enquiry: {
          view: { type: Boolean, default: true, immutable: true },
          edit: { type: Boolean, default: false },
        },
        order: {
          view: { type: Boolean, default: true, immutable: true },
          edit: { type: Boolean, default: false },
        },
        invoice: {
          view: { type: Boolean, default: true, immutable: true },
          edit: { type: Boolean, default: false },
        },
        support: {
          view: { type: Boolean, default: true, immutable: true },
          edit: { type: Boolean, default: false },
        },
      },
      supplier: {
        requests: {
          view: { type: Boolean, default: true, immutable: true },
          edit: { type: Boolean, default: false },
        },
        tansaction: {
          view: { type: Boolean, default: true, immutable: true },
          edit: { type: Boolean, default: false },
        },
        enquiry: {
          view: { type: Boolean, default: true, immutable: true },
          edit: { type: Boolean, default: false },
        },
        order: {
          view: { type: Boolean, default: true, immutable: true },
          edit: { type: Boolean, default: false },
        },
        invoice: {
          view: { type: Boolean, default: true, immutable: true },
          edit: { type: Boolean, default: false },
        },
        support: {
          view: { type: Boolean, default: true, immutable: true },
          edit: { type: Boolean, default: false },
        },
      },
      products: {
        product: {
          view: { type: Boolean, default: true, immutable: true },
          edit: { type: Boolean, default: false },
        },
      },
    },
  },
  { timestamps: true }
);

// adminSchema?.pre("save", async function (next) {
//   if (!this.isModified("password")) return next(); // if password is NOT modified, skip hashing

//   this.password = await bcrypt.hash(
//     this.password,
//     Number(process.env.BCRYPT_SALT_ROUNDS)
//   );
//   next();
// });

adminSchema.methods.isPasswordCorrect = async function (password) {
  if (!password || !this.password) {
    throw new Error("Missing entered password or stored hashed password");
  }
  return await bcrypt.compare(password, this.password);
};

adminSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      user_id: this.admin_id,
    },
    process.env.JWT_ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY }
  );
};

adminSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.JWT_REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRY }
  );
};

module.exports = mongoose.model("Admin", adminSchema);
