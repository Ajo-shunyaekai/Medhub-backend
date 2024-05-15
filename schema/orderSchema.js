const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderItemSchema = new Schema({
    product_id: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    strength: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    status: {
        type: String
    },

});

const orderSchema = new Schema({
    order_id: {
        type: String,
        required: true
    },
    user_id: {
        type: String,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    total_price: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', orderSchema);

