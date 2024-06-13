const randomstring = require('randomstring');

module.exports = {
    
    validation : (reqObj, type) => {

        let objData = { }
        
        if(type == 'Register'){
            objData.first_name  = 'First Name field is required';
            objData.last_name   = 'Last Name field is required';
            objData.mobile_no   = 'Mobile No field is required';
            objData.email       = 'Email Field is required';
            objData.password    = 'Password Field is required'
        }
        if(type == 'Login'){
            objData.email     = 'Email Field is required';
            objData.password  = 'Password Field is required'
        }
        if(type === 'updatePassword') {
            objData.current_password = 'Current Password field is required';
            objData.new_password     = 'New Password field is required'
        }
        if(type === 'editProfile') {
            objData.first_name  = 'First Name field is required';
            objData.last_name   = 'Last Name field is required';
            objData.mobile_no   = 'Mobile No field is required';
            objData.email       = 'Email Field is required';
        }
        if(type === 'addProduct' || type === 'editProduct') {
            objData.supplier_id       = 'Supplier ID is required';
            objData.medicine_name     = 'Medicine Name is required';
            objData.composition       = 'composition is required';
            objData.dossier_type      = 'Dossier Type is required';
            objData.dossier_status    = 'Dossier Status is required';
            objData.gmp_approvals     = 'GMP Approval is required';
            objData.shipping_time     = 'Shipping Time is required';
            objData.tags              = 'Tags are required';
            objData.available_for     = 'Available For is required';
            objData.country_of_origin = 'Available For is required';
            objData.description       = 'Description is required';
            objData.registered_in     = 'Registered Countries are required';
            objData.strength          = 'Strength is required';
            objData.quantity          = 'Quantity is required';
            objData.unit_price        = 'Unit Price is required';
            objData.total_price       = 'Total Price is required';
            objData.shelf_life        = 'Shelf life is required';
            objData.type_of_form      = 'Type of form is required';
            objData.est_delivery_days = 'Estimated Delivery Days are required'
            
            // objData.comments           = 'Comment is required';
            // objData.country_of_origin  = 'Country of origin is required';
            // objData.dosage_form        = 'Dossage Form is required';
            // objData.category_name      = 'Category Name  is required';
            // qty_range                  = 'Quantity range is required',
            // price                      = 'Price is required'
            // objData.description           = 'Description is required';
            // objData.generic_name          = 'Generic Name is required';
            // objData.manufacturer          = 'Manufacturer  is required';
            // objData.prescription_required = 'Prescriptions is required';
            // objData.storage_conditions    = 'Storage Conditions is required';
            // objData.batch_number          = 'Batch Number is required';
            // objData.expiry_date           = 'Expirty Date  is required';
            // objData.location              = 'Location is required';
            // objData.supplier              = 'Supplier is required';
            // objData.received_date         = 'Recieved Date  is required';
            // objData.quantity              = 'Qantity is required';
            // objData.unit_price            = 'Unit Price is required';
            // objData.indications           = 'Indications is required';
            // objData.side_effects          = 'Side Effects is required';
            
        }
        if(type == 'buyerRegister'){
            objData.buyer_type                   = 'Buyer Type field is required';
            objData.buyer_name                   = 'Buyer Company name field is required';
            objData.buyer_address                = 'Buyer address field is required';
            objData.buyer_email                  = 'Buyer email Field is required';
            objData.buyer_mobile                 = 'Buyer mobile Field is required';
            objData.buyer_country_code           = 'Supplier mobile Field is required';
            objData.contact_person_name          = 'Contact person name Field is required';
            objData.designation                  = 'Designation Field is required';
            objData.contact_person_email         = 'Contact person email Field is required';
            objData.contact_person_mobile        = 'Contact person mobile Field is required';
            objData.contact_person_country_code  = 'Contact person country code  Field is required';
            objData.country_of_origin            = 'Country of origin Field is required';
            objData.country_of_operation         = 'Country of operation Field is required';
            objData.approx_yearly_purchase_value = 'Yearly Purchase value Field is required';
            objData.interested_in                = 'Interested in Field is required';
            objData.license_no                   = 'License no Field is required';
            objData.license_expiry_date          = 'License Expiry Date Field is required';
            objData.tax_no                       = 'Tax no Field is required';
            objData.description                  = 'Description Field is required';
        }

        if(type === 'editBuyer') {
            objData.buyer_name                  = 'Buyer Company name field is required';
            objData.buyer_address               = 'Buyer address field is required';
            objData.buyer_email                 = 'Buyer email Field is required';
            objData.buyer_mobile                = 'Buyer mobile Field is required';
            objData.buyer_country_code          = 'Supplier mobile Field is required';
            objData.contact_person_name         = 'Contact person name Field is required';
            objData.contact_person_mobile       = 'Contact person mobile Field is required';
            objData.contact_person_country_code = 'Contact person country code  Field is required';
            objData.contact_person_email        = 'Contact person email Field is required';
            objData.designation                 = 'Designation Field is required';
            objData.country_of_origin           = 'Country of origin Field is required';
            objData.country_of_operation        = 'Country of operation Field is required';
            objData.license_no                  = 'License no Field is required';
            objData.tax_no                      = 'Tax no Field is required';
            objData.description                 = 'Description Field is required';
        }

        
        if(type == 'sellerRegister'){
            objData.company_name      = 'Company Name field is required';
            objData.company_address   = 'Address field is required';
            objData.email             = 'Email Field is required';
            objData.password          = 'Password Field is required'
            objData.mobile_no         = 'Mobile Field is required';
            objData.business_type     = 'Business Type Field is required'
            objData.license_no        = 'License No Field is required';
        }

        if(type == 'supplierRegister'){
            objData.supplier_type               = 'Company type field is required';
            objData.supplier_name               = 'Company name field is required';
            objData.supplier_address            = 'Suppplier address field is required';
            objData.supplier_email              = 'Supplier email Field is required';
            objData.supplier_mobile_no          = 'Supplier mobile Field is required';
            objData.description                 = 'Description Field is required';
            objData.license_no                  = 'License no Field is required';
            objData.license_expiry_date         = 'License Expiry Date Field is required';
            objData.tax_no                      = 'Tax no Field is required';
            objData.country_of_origin           = 'Country of origin Field is required';
            objData.country_of_operation        = 'Country of operation Field is required';
            objData.contact_person_name         = 'Contact person name Field is required';
            objData.contact_person_mobile       = 'Contact person mobile Field is required';
            objData.contact_person_email        = 'Contact person email Field is required';
            objData.designation                 = 'Designation Field is required';
            objData.payment_terms               = 'payment_terms Field is required';
            objData.supplier_country_code       = 'Supplier country code  Field is required';
            objData.contact_person_country_code = 'Contact person country code  Field is required';
            objData.tags                        = 'Tags are required';
            estimated_delivery_time             = 'Estimated Delivery Time is required'
        }

        if(type == 'supplierEdit'){
            objData.supplier_name               = 'Company name field is required';
            objData.supplier_address            = 'Suppplier address field is required';
            objData.supplier_email              = 'Supplier email Field is required';
            objData.supplier_mobile_no          = 'Supplier mobile Field is required';
            objData.description                 = 'Description Field is required';
            objData.license_no                  = 'License no Field is required';
            objData.tax_no                      = 'Tax no Field is required';
            objData.country_of_origin           = 'Country of origin Field is required';
            objData.country_of_operation        = 'Country of operation Field is required';
            objData.contact_person_name         = 'Contact person name Field is required';
            objData.contact_person_mobile_no    = 'Contact person mobile Field is required';
            objData.contact_person_email        = 'Contact person email Field is required';
            objData.designation                 = 'Designation Field is required';
            objData.payment_terms               = 'payment_terms Field is required';
            objData.supplier_country_code       = 'Supplier country code  Field is required';
            objData.contact_person_country_code = 'Contact person country code  Field is required';
            objData.tags                        = 'Tags are required';
            estimated_delivery_time             = 'Estimated Delivery Time is required'
        }
        
        if(type == 'sellerLogin'){
            objData.email      = 'Email Field is required';
            objData.password   = 'Password Field is required'
        }

        if(type === 'orderRequest') {
            objData.items               = 'Order Item is required',
            objData.payment_terms       = "Payment term is reqiured",
            objData.est_delivery_time   = "Estimated delivery time is required",
            objData.shipping_details    = "Shipping Details is required"
        }

        if(type === 'cancelOrder') {
           objData.buyer_id   = "Buyer id is required",
           objData.order_id   = "Order id is required",
           objData.order_type = "Order Type is required",
           objData.reason     = "Reason is required"
        }

        if(reqObj == null){
            return objData;
        }
        let returnObj = {};
        for (const key in objData ){
            if(reqObj[key] === undefined || reqObj[key] == ''){
                returnObj[key] = objData[key];
            }
        }
        return returnObj;
    },

    handleResponse : (result) => {
        let message = '';
        
        switch (result.code) {
            case 200:
                message = result.message;
                break;
            case 401:
                message = result.message;
                break;
            case 402:
                message = result.message;
                break;
            case 404:
                    message = result.message;
                    break;
            case 409:
                message = result.message;
                break;
            case 500:
                message = result.message;
                break;
            default:
                message = result.message;
                break;
        }
    
        return { code: result.code, message: message, result: result.result };
    },

    generateOtp : () => {
        return randomstring.generate({
            length: 6,
            charset: 'numeric'
        });
    }
}
