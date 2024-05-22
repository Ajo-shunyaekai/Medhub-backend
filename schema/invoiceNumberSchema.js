const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const invoiceNumberSchema = new Schema({
    last_invoice_number: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('InvoiceNumber', invoiceNumberSchema);
