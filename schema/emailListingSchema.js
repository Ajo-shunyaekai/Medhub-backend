const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true,},
  subscribedAt: { type: Date, default: Date.now }
});

const Subscriber = mongoose.model('EmailListing', subscriberSchema);

module.exports = Subscriber;
