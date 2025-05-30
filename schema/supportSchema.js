const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const supportSchema = new Schema({
  support_id: {
    type: String,
    required: true,
    unique: true,
  },
  support_type: {
    type: String,
    required: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  user_type: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  support_image: [
    {
      type: String,
      // trim: true,
      required: true,
    },
  ],
  status: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Support", supportSchema);
