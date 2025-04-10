const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const logisticsSchema = new mongoose.Schema({
    logistics_id: {
        type: String,
        required: true,
        unique: true,
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
    orderId: {
        type: Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },
    buyerId: {
        type: Schema.Types.ObjectId,
        ref: 'Buyer',
        required: true
    },
    supplierId: {
        type: Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },
    status: {
        type: String, // P - pending, A - accepted ,   
        required: [true, "Validation Error : Status is required"],
      },
    last_login: {
    type: Date
    },
    login_history: [
    {
        date: {
        type: Date,
        default: Date.now,
        },
    },
    ],   
},{
    timestamps: true,
})

module.exports = mongoose.model('Logistics', logisticsSchema);