const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const orderItemSchema = new Schema({
    medicine_id: {
        type: String,
        required: true
    },
    medicine_name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    unit_price: {
        type: String,
        required: true
    },
    unit_tax: {
        type: String,
        required: true
    },
    total_amount: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'in-transit', 'delivered','completed', 'cancelled', 'rejected' ],
        default: 'active'
    },
});

const logisticsSchema = new Schema({
    type: {
        type: String,
        // required: true
    },
    prefered_mode: {
        type: String,
        // required: true
    },
    drop_location: {
        name: {
            type: String,
            // required: true
        },
        mobile: {
            type: String,
            // required: true
        },
        address: {
            type: String,
            // required: true
        },
    },
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
    enquiry_id: {
        type: String,
        ref: 'Enquiry',
        required: true
    },
    purchaseOrder_id: {
        type: String,
        ref: 'purchaseorder',
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
    invoice_no: {
        type: String,
        required: true
    },
    invoice_date: {
        type: String,
        required: true
    },
    payment_due_date: {
        type: String,
        required: true
    },
    buyer_name: {
        type: String,
        required: true
    },
    buyer_email: {
        type: String,
        required: true
    },
    buyer_mobile: {
        type: String,
        required: true
    },
    buyer_address: {
        type: String,
        required: true
    },
    supplier_name: {
        type: String,
        required: true
    },
    supplier_email: {
        type: String,
        required: true
    },
    supplier_mobile: {
        type: String,
        required: true
    },
    supplier_address: {
        type: String,
        required: true
    },
    items: [orderItemSchema],
    total_due_amount: {
        type: String,
        required: true
    },
    logistics_details: logisticsSchema,
    
    order_status: {
        type: String,
        enum: ['pending', 'active', 'in-transit', 'delivered','completed', 'cancelled'],
        default: 'active'
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'in-transit', 'delivered','completed', 'cancelled'],
        default: 'active'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }

    // payment_terms: {
    //     type: String,
    //     // required: true
    // },
    // est_delivery_time: {
    //     type: String,
    //     // required: true
    // },
  
    // remarks: {
    //     type: String,
    //     // required: true
    // },

      // shipping_details: {
    //     type: {
    //         consignor_name: {
    //             type: String,
    //             required: true
    //         },
    //         mobile_no: {
    //             type: String,
    //             required: true
    //         },
    //         address: {
    //             type: String,
    //             required: true
    //         }
    //     },
    //     required: true
    // },
});

module.exports = mongoose.model('Order', orderSchema);

