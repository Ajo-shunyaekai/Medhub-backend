const mongoose = require('mongoose');
const Schema   = mongoose.Schema;


const enquiryItemSchema = new Schema({
    medicine_id: {
        type: String,
        required: true
    },
    unit_price: {
        type: String,
        required: true
    },
    quantity_required: {
        type: String,
        required: true
    },
    est_delivery_days: {
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
        enum: ['pending',  ,'accepted', 'cancelled', 'rejected' ],
        default: 'pending'
    },
});

const enquirySchema = new Schema({
    enquiry_id: {
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
    items: [enquiryItemSchema],
    payment_terms: {
        type: String,
    },
    est_delivery_time: {
        type: String,
    },
    shipping_details: {
        type: {
            consignor_name: {
                type: String,
            },
            mobile_no: {
                type: String,      
            },
            address: {
                type: String,
            }
        },
       
    },
    remarks: {
        type: String,
        
    },
    enquiry_status: {
        type: String,
        enum: ['pending', 'active', 'completed', 'cancelled'],
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

module.exports = mongoose.model('Enquiry', enquirySchema);