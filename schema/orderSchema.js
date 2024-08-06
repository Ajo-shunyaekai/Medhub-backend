const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

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
    price: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'in-transit', 'delivered','completed', 'cancelled', 'rejected' ],
        default: 'pending'
    },
});

const logisticsSchema = new Schema({
    type: {
        type: String,
        required: true
    },
    prefered_mode: {
        type: String,
        required: true
    },
    drop_location: [{
        name: {
            type: Number,
            required: true
        },
        mobile: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
    }],
    
    status: {
        type: String,
        enum: ['pending', 'active', 'in-transit', 'delivered','completed', 'cancelled', 'rejected' ],
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
    buyer_company: {
        type: String,
        required: true
    },
    supplier_id: {
        type: String,
        ref: 'Supplier',
        required: true
    },
    enquiry_id: {
        type: String,
        ref: 'Enquiry',
        // required: true
    },
    purchaseOrder_id: {
        type: String,
        ref: 'purchaseorder',
        // required: true
    },
    items: [orderItemSchema],
    logistics_details: [logisticsSchema],
    payment_terms: {
        type: String,
        required: true
    },
    est_delivery_time: {
        type: String,
        required: true
    },
    shipping_details: {
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
        type: String,
        required: true
    },
    order_status: {
        type: String,
        enum: ['pending', 'active', 'in-transit', 'delivered','completed', 'cancelled'],
        default: 'pending'
    },
    invoice_number: {
        type: String,
        required: true
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

