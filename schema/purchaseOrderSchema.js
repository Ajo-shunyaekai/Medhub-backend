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
        type: String,
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
        // required: true
    },
    status: {
        type: String,
        enum: ['pending',  ,'accepted', 'completed', 'cancelled', 'rejected' ],
        default: 'pending'
    },
     // est_delivery_days: {
    //     type: String,
    //     required: true
    // },
    // target_price: {
    //     type: String,
    //     required: true
    // },
});

const purchaseOrderSchema = new Schema({
    purchaseOrder_id: {
        type: String,
        required: true,
        unique: true
    },
    enquiry_id: {
        type: String,
        ref: 'Enquiry',
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
    po_number: {
        type: String,
        required: true
    },
    po_date: {
        type: String,
        required: true
    },
    buyer_name: {
        type: String,
        required: true
    },
    buyer_address: {
        type: String,
        required: true
    },
    buyer_locality: {
        type: String,
    },
    buyer_landmark: {
        type: String,
    },
    buyer_country: {
        type: String,
    },
    buyer_state: {
        type: String,
    },
    buyer_city: {
        type: String,
    },
    buyer_pincode: {
        type: String,
    },
    buyer_mobile: {
        type: String,
        required: true
    },
    buyer_country_code: {
        type: String,
        required: true
    },
    buyer_email: {
        type: String,
        required: true
    },
    buyer_regNo: {
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
    supplier_locality: {
        type: String,
    },
    supplier_landmark: {
        type: String,
    },
    supplier_country: {
        type: String,
    },
    supplier_state: {
        type: String,
    },
    supplier_city: {
        type: String,
    },
    supplierr_pincode: {
        type: String,
    },
    supplier_mobile: {
        type: String,
        required: true
    },
    supplier_country_code: {
        type: String,
        required: true
    },
    supplier_email: {
        type: String,
        required: true
    },
    supplier_regNo: {
        type: String,
        required: true
    },
    order_items: [orderItemSchema],
    total_amount: {
        type: String,
        required: true
    },
    additional_instructions: {
        type: String,
    },
    po_status: {
        type: String,
        enum: ['pending', 'active', 'completed', 'cancelled', 'order created'],
        default: 'active'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);