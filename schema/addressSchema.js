const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  addresses: [
    {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      postalCode: { type: String, required: true },
      type: {
        type: String,
        enum: ['company', 'shop', 'warehouse', 'factory', 'other'], 
        default: 'home',
      },
      isDefault: { type: Boolean, default: false }, 
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Address', addressSchema);
