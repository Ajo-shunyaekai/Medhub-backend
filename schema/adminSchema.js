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
  { timestamps: true }
);

adminSchema?.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // if password is NOT modified, skip hashing

  this.password = await bcrypt.hash(
    this.password,
    Number(process.env.BCRYPT_SALT_ROUNDS)
  );
  next();
});

adminSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

adminSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      user_id: this.admin_id,
    },
    process.env.JWT_ACCESS_TOKEN_SECRET,
    { expiresIn: Number(process.env.JWT_ACCESS_TOKEN_EXPIRY) * Number(process.env.JWT_ACCESS_TOKEN_EXPIRY2)}
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
