const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  notification_id: {
    type: String,
    required: true,
    unique: true
  },
  event: {
    type: String,
    required: true
  },
  event_type: {
    type: String,
    required: true
  },
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  from_id: {
    type: String,
    required: true,
  },
  to_id: {
    type: String,
    required: true,
  },
  event_id: {
    type: String,
    required: true,
  },
  connected_id : {
    type: String,
  },
  link_id : {
    type: String,
  },
  message: {
    type: String,
    required: true,
  },
  status : {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema);