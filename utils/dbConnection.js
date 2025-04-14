const express = require("express");
const mongoose = require("mongoose");
const logErrorToFile = require("../logs/errorLogs");
const { sendErrorResponse } = require("./commonResonse");
const app = express();

require("dotenv").config();

const uri = process.env.MONGO_ATLAS_URI;
// const uri  = 'mongodb://localhost:27017/deliver';

const connection = () => {
  // mongoose.connect(uri)
  mongoose
    .connect(uri)
    .then(() => {
      console.log("connected to MongoDB");
    })
    .catch((err) => {
      console.error("Internal Server Error:", err);
      logErrorToFile(err, undefined);
      return sendErrorResponse(
        undefined,
        500,
        "Error in connecting to MongoDB",
        err
      );
    });
};

module.exports = connection;
