const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const orderTrackingSchema = new Schema({
    order_id: {
        type: String,
        ref: 'Order',
        required: true
    },
    item_id: {
        type: String,
        ref: 'OrderItem',
        required: true
    },
    status: {
        type: String,
        required: true
    },
    // location: String,
    updated_at: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('OrderTracking', orderTrackingSchema);
