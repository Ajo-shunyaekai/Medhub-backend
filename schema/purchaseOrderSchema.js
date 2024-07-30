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
    unit_price: {
        type: String,
        required: true
    },
    total_amount: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending',  ,'accepted', 'completed', 'cancelled', 'rejected' ],
        default: 'active'
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

// const enquiryQuotationchema = new Schema({
//     medicine_id: {
//         type: String,
//         required: true
//     },
//     unit_price: {
//         type: String,
//         required: true
//     },
//     quantity_required: {
//         type: String,
//         required: true
//     },
//     est_delivery_days: {
//         type: String,
//         required: true
//     },
//     target_price: {
//         type: String,
//         required: true
//     },
//     counter_price: {
//         type: String,
//     },
//     status: {
//         type: String,
//         enum: ['proceeded' ],
//         default: 'proceeded'
//     },
// });

const purchaseOrderSchema = new Schema({
    purchase_id: {
        type: String,
        ref: 'Enquiry',
        required: true
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
    items: [orderItemSchema],
    additional_instructions: {
        type: String,
        
    },
    ondragover_status: {
        type: String,
        enum: ['pending', 'active', 'completed', 'cancelled'],
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
     // quotation_items : [enquiryQuotationchema],
    // payment_terms: [{
    //     type: String,
    //     required: true,
    // }],
    // est_delivery_time: {
    //     type: String,
    // },
    // shipping_details: {
    //     type: {
    //         consignor_name: {
    //             type: String,
    //         },
    //         mobile_no: {
    //             type: String,      
    //         },
    //         address: {
    //             type: String,
    //         }
    //     },
       
    // },
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);