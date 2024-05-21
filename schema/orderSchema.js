const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderItemSchema = new Schema({
    product_id: {
        type: String,
        required: true
    },
    product_name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    // strength: {
    //     type: String
    // },
    price: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'in-transit', 'delivered','completed', 'cancelled', ],
        default: 'pending'
    },

});

const orderSchema = new Schema({
    order_id: {
        type: String,
        required: true
    },
    buyer_id: {
        type: String,
        ref: 'Buyer',
        required: true
    },
    supplier_id: {
        type: String,
        ref: 'Supplier',
        required: true
    },
    items: [orderItemSchema],
    payment_terms: {
        type: String,
        required: true
    },
    est_delivery_time: {
        type: String,
        required: true
    },
    shipping_details: {
        // type: String,
        // required: true
        type: {
            consignor_name: {
                type: String,
                required: true
            },
            mobile_no: {
                type: String,
                required: true
            },
            address: {
                type: String,
                required: true
            }
        },
        required: true
    },
    remarks: {
        type: String
    },
    // total_price: {
    //     type: Number,
    //     required: true
    // },
    order_status: {
        type: String,
        enum: ['pending', 'active', 'in-transit', 'delivered','completed', 'cancelled'],
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

