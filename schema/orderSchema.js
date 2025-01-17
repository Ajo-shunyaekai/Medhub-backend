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

const logisticsSchema = new Schema({
    door_to_door: {
        type: String,
        // required: true
    },
    custom_clearance: {
        type: String
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
        email: {
            type: String,
        },
        mobile: {
            type: String,
            // required: true
        },
        address: {
            type: String,
            // required: true
        },
        country: {
            type: String,
            // required: true
        },
        state: {
            type: String,
            // required: true
        },
        city_district: {
            type: String,
            // required: true
        },
        pincode: {
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

const shipmentSchema = new Schema({
   
    supplier_details: {
        name: {
            type: String,
            // required: true
        },
        mobile: {
            type: String,
            // required: true
        },
        email: {
            type: String,
            // required: true
        },
        address: {
            type: String,
            // required: true
        },
        country: {
            type: String,
            // required: true
        },
        state: {
            type: String,
            // required: true
        },
        ciyt_disctrict: {
            type: String,
            // required: true
        },
        pincode: {
            type: String,
            // required: true
        },
        prefered_pickup_date: {
            type: String,
        },
        prefered_pickup_time: {
            type: String,
            // required: true
        },
    },
    shipment_details : {
        no_of_packages: {
            type: String,
        },
        length: {
            type: String,
        },
        breadth: {
            type: String,
        },
        height: {
            type: String,
        },
        total_weight: {
            type: String,
        },
        total_volume: {
            type: String,
        },
    },
    buyer_details: {
        name: {
            type: String,
            // required: true
        },
        mobile: {
            type: String,
            // required: true
        },
        email: {
            type: String,
            // required: true
        },
        address: {
            type: String,
            // required: true
        },
        country: {
            type: String,
        },
        state: {
            type: String,
        },
        ciyt_disctrict: {
            type: String,
            // required: true
        },
        pincode: {
            type: String,
            // required: true
        },
        buyer_type: {
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

const buyerLogisticsSchema = new Schema({
    full_name: { type: String, required: true },
    email: { type: String, required: true },
    mobile_number: { type: String, required: true },
    house_name: { type: String, required: true },
    locality: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    pincode: { type: String, required: true },
    type_of_address: { type: String, enum: ['Warehouse', 'Shop', 'Other'], required: true },
    mode_of_transport: { type: String, enum: ['Air Cargo', 'Sea Freight', 'Road Freight', 'Ask Partner'], required: true },
    extra_services: [{
        type: String,
        enum: ['Door to Door', 'Include Custom Clearance']
    }]
})

const billOfMaterialSchema = new Schema({
    products: [{
        product_name   : { type: String, required: true }, 
        quantity       : { type: Number, required: true },     
        no_of_packages : { type: Number, required: true } 
    }]
});

const packageInformationSchema = new Schema({
    total_no_of_packages: { type: Number, required: true }, 
    package_details: [{               
        package_name: { type: String },
        dimensions: {                                       
            length: { type: Number, required: true },
            width:  { type: Number, required: true },
            height: { type: Number, required: true },
            volume: { type: Number, required: true }
        },
        weight: { type: Number, required: true }            
    }]
});

const supplierLogisticsSchema = new Schema({
    full_name           : { type: String, required: true },
    email               : { type: String, required: true },
    mobile_number       : { type: String, required: true },
    house_name          : { type: String, required: true },
    locality            : { type: String, required: true },
    country             : { type: String, required: true },
    state               : { type: String, required: true },
    city                : { type: String, required: true },
    pincode             : { type: String, required: true },
    type_of_address     : { type: String, enum: ['Warehouse', 'Shop', 'Other'], required: true },
    bill_of_material    : billOfMaterialSchema, 
    package_information : packageInformationSchema ,
    pickup_date         : { type: String, required: true},
    pickup_time         : { type: String, required: true},
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
    deposit_requested: {
        type: String,
        required: true
    },
    deposit_due: {
        type: String,
        required: true
    },
    payment_terms: [{
        type: String,
        required: true
    }],
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
    grand_total : {
        type: String,
        required: true
    },
    total_due_amount: {
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
    logistics_details: [logisticsSchema],
    shipment_details: shipmentSchema,
    // buyer_logistics_data: buyerLogisticsSchema,
    // supplier_logistics_data: supplierLogisticsSchema,
    
    order_status: {
        type: String,
        enum: ['pending', 'active', 'in-transit', 'delivered','completed', 'cancelled'],
        default: 'active'
    },
    status: {
        type: String,
        enum: ['pending', 'Active', 'in-transit', 'delivered','completed', 'cancelled'],
        default: 'Active'
    },
    invoice_status: {
        type: String,
        enum: ['pending', 'Active', 'in-transit', 'delivered','completed', 'cancelled', 'Invoice Created','Paid'],
        default: 'Invoice Created'
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

