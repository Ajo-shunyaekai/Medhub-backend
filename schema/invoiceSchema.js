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
    quantity_required: {
        type: Number,
        required: true
    },
    est_delivery_days: {
        type: String,
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
    target_price: {
        type: String,
        required: true
    },
    counter_price: {
        type: String,
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'in-transit', 'delivered','completed', 'cancelled', 'rejected' ],
        default: 'active'
    },
});

const invoiceSchema = new Schema({
    invoice_id: {
        type: String,
        required: true
    },
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
    // payment_due_date: {
    //     type: String,
    //     required: true
    // },
    buyer_name: {
        type: String,
        required: true
    },
    buyer_address: {
        type: String,
        required: true
    },
    buyer_country: {
        type: String,
        required: true
    },
    buyer_vat_reg_no: {
        type: String,
        required: true
    },
    supplier_name: {
        type: String,
        required: true
    },
    supplier_address: {
        type: String,
        required: true
    },
    supplier_country: {
        type: String,
        required: true
    },
    supplier_vat_reg_no: {
        type: String,
        required: true
    },
    items: [orderItemSchema],
    payment_terms : [{
        type: String,
        required: true
    }],
    // vat: {
    //     type: String,
    //     required: true
    // },
    grand_total: {
        type: String,
        required: true
    },
    total_payable_amount: {
        type: String,
        required: true
    },
    total_amount_paid: {
        type: String,
        required: true
    },
    pending_amount: {
        type: String,
        required: true
    },
    account_number: {
        type: String,
        required: true
    },
    sort_code: {
        type: String,
        required: true
    },
    mode_of_payment: {
        type: String,
    },
    amount_paid: {
        type: String,
    },
    transaction_id: {
        type: String,
    },
    payment_date: {
        type: String,
    },
    transaction_image: [{
        type: String,
    }],    
    invoice_status: {
        type: String,
        enum: ['pending', 'active', 'in-transit', 'delivered','completed', 'cancelled','paid'],
        default: 'pending'
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'in-transit', 'delivered','completed', 'cancelled','paid'],
        default: 'pending'
    },
    payment_status : {
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

    // buyer_email: {
    //     type: String,
    //     required: true
    // },
    // buyer_mobile: {
    //     type: String,
    //     required: true
    // },
    // supplier_email: {
    //     type: String,
    //     required: true
    // },
    // supplier_mobile: {
    //     type: String,
    //     required: true
    // },



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

module.exports = mongoose.model('Invoice', invoiceSchema);