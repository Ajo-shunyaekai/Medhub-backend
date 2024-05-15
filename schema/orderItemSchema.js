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
    }
})

module.exports = mongoose.model('OrderItem', orderItemSchema);