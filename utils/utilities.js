const randomstring = require('randomstring');
const logErrorToFile = require('../logs/errorLogs');
const { sendErrorResponse, handleCatchBlockError } = require('./commonResonse');

module.exports = {

    validation: (reqObj, type) => {
        const objData = {};
    
        const requiredFields = {
            Register: [
                { field: 'first_name', message: 'First Name field is required' },
                { field: 'last_name', message: 'Last Name field is required' },
                { field: 'mobile_no', message: 'Mobile No field is required' },
                { field: 'email', message: 'Email Field is required' },
                { field: 'password', message: 'Password Field is required' }
            ],
            Login: [
                { field: 'email', message: 'Email Field is required' },
                { field: 'password', message: 'Password Field is required' }
            ],
            updatePassword: [
                { field: 'current_password', message: 'Current Password field is required' },
                { field: 'new_password', message: 'New Password field is required' }
            ],
            editProfile: [
                { field: 'first_name', message: 'First Name field is required' },
                { field: 'last_name', message: 'Last Name field is required' },
                { field: 'mobile_no', message: 'Mobile No field is required' },
                { field: 'email', message: 'Email Field is required' }
            ],
            addNewProduct: [
                { field: 'supplier_id', message: 'Supplier ID is required' },
                { field: 'medicine_name', message: 'Medicine Name is required' },
                { field: 'product_type', message: 'Product type is required' },
                // { field: 'composition', message: 'Composition is required' },
                { field: 'strength', message: 'Strength is required' },
                { field: 'type_of_form', message: 'Type of form is required' },
                { field: 'shelf_life', message: 'Shelf life is required' },
                { field: 'dossier_type', message: 'Dossier Type is required' },
                { field: 'dossier_status', message: 'Dossier Status is required' },
                { field: 'product_category', message: 'Product Category is required' },
                { field: 'total_quantity', message: 'Quantity is required' },
                { field: 'gmp_approvals', message: 'GMP Approval is required' },
                { field: 'shipping_time', message: 'Shipping Time is required' },
                { field: 'tags', message: 'Tags are required' },
                { field: 'available_for', message: 'Available For is required' },
                { field: 'country_of_origin', message: 'Available For is required' },
                { field: 'description', message: 'Description is required' },
                { field: 'registered_in', message: 'Registered Countries are required' },
                { field: 'quantity', message: 'Quantity is required' },
                { field: 'unit_price', message: 'Unit Price is required' },
                // { field: 'total_price', message: 'Total Price is required' },
                { field: 'est_delivery_days', message: 'Estimated Delivery Days are required' }
            ],
            addSecondaryProduct: [
                { field: 'supplier_id', message: 'Supplier ID is required' },
                { field: 'medicine_name', message: 'Medicine Name is required' },
                { field: 'product_type', message: 'Product type is required' },
                { field: 'purchased_on', message: 'Purchased on is required' },
                { field: 'country_available_in', message: 'Country available in is required' },
                { field: 'min_purchase_unit', message: 'Min purchase unit is required' },
                // { field: 'composition', message: 'Composition is required' },
                { field: 'strength', message: 'Strength is required' },
                { field: 'type_of_form', message: 'Type of form is required' },
                { field: 'shelf_life', message: 'Shelf life is required' },
                { field: 'dossier_type', message: 'Dossier Type is required' },
                { field: 'dossier_status', message: 'Dossier Status is required' },
                { field: 'product_category', message: 'Product Category is required' },
                { field: 'gmp_approvals', message: 'GMP Approval is required' },
                { field: 'shipping_time', message: 'Shipping Time is required' },
                { field: 'tags', message: 'Tags are required' },
                { field: 'available_for', message: 'Available For is required' },
                { field: 'country_of_origin', message: 'Available For is required' },
                { field: 'description', message: 'Description is required' },
                { field: 'registered_in', message: 'Registered Countries are required' },
                { field: 'quantity', message: 'Quantity is required' },
                { field: 'unit_price', message: 'Unit Price is required' },
                { field: 'condition', message: 'Condition is required' }
            ],
            buyerRegister: [
                { field: 'buyer_type', message: 'Buyer Type field is required' },
                { field: 'buyer_name', message: 'Buyer Company name field is required' },
                { field: 'buyer_address', message: 'Buyer address field is required' },
                { field: 'buyer_email', message: 'Buyer email Field is required' },
                { field: 'buyer_mobile', message: 'Buyer mobile Field is required' },
                { field: 'buyer_country_code', message: 'Supplier mobile Field is required' },
                { field: 'contact_person_name', message: 'Contact person name Field is required' },
                { field: 'designation', message: 'Designation Field is required' },
                { field: 'contact_person_email', message: 'Contact person email Field is required' },
                { field: 'contact_person_mobile', message: 'Contact person mobile Field is required' },
                { field: 'contact_person_country_code', message: 'Contact person country code  Field is required' },
                { field: 'country_of_origin', message: 'Country of origin Field is required' },
                { field: 'country_of_operation', message: 'Country of operation Field is required' },
                { field: 'approx_yearly_purchase_value', message: 'Yearly Purchase value Field is required' },
                { field: 'interested_in', message: 'Interested in Field is required' },
                { field: 'license_no', message: 'License no Field is required' },
                { field: 'license_expiry_date', message: 'License Expiry Date Field is required' },
                // { field: 'tax_no', message: 'Tax no Field is required' },
                { field: 'registration_no', message: 'Registration no Field is required' },
                { field: 'description', message: 'Description Field is required' }
            ],
            editBuyer: [
                { field: 'buyer_name', message: 'Buyer Company name field is required' },
                { field: 'buyer_address', message: 'Buyer address field is required' },
                { field: 'buyer_email', message: 'Buyer email Field is required' },
                { field: 'buyer_mobile', message: 'Buyer mobile Field is required' },
                { field: 'buyer_country_code', message: 'Supplier mobile Field is required' },
                { field: 'contact_person_name', message: 'Contact person name Field is required' },
                { field: 'contact_person_mobile', message: 'Contact person mobile Field is required' },
                { field: 'contact_person_country_code', message: 'Contact person country code  Field is required' },
                { field: 'contact_person_email', message: 'Contact person email Field is required' },
                { field: 'designation', message: 'Designation Field is required' },
                { field: 'country_of_origin', message: 'Country of origin Field is required' },
                { field: 'country_of_operation', message: 'Country of operation Field is required' },
                { field: 'license_no', message: 'License no Field is required' },
                // { field: 'tax_no', message: 'Tax no Field is required' },
                { field: 'registration_no', message: 'Registration no Field is required' },
                { field: 'description', message: 'Description Field is required' }
            ],
            sellerRegister: [
                { field: 'company_name', message: 'Company Name field is required' },
                { field: 'company_address', message: 'Address field is required' },
                { field: 'email', message: 'Email Field is required' },
                { field: 'password', message: 'Password Field is required' },
                { field: 'mobile_no', message: 'Mobile Field is required' },
                { field: 'business_type', message: 'Business Type Field is required' },
                { field: 'license_no', message: 'License No Field is required' }
            ],
            supplierRegister: [
                { field: 'supplier_type', message: 'Company type field is required' },
                { field: 'supplier_name', message: 'Company name field is required' },
                { field: 'supplier_address', message: 'Suppplier address field is required' },
                // { field: 'supplier_email', message: 'Supplier email Field is required' },
                { field: 'supplier_mobile_no', message: 'Supplier mobile Field is required' },
                { field: 'description', message: 'Description Field is required' },
                { field: 'license_no', message: 'License no Field is required' },
                { field: 'license_expiry_date', message: 'License Expiry Date Field is required' },
                // { field: 'tax_no', message: 'Tax no Field is required' },
                { field: 'categories', message: 'Trade In Categories Field is required' },
                { field: 'registration_no', message: 'Registration no Field is required' },
                { field: 'country_of_origin', message: 'Country of origin Field is required' },
                { field: 'country_of_operation', message: 'Country of operation Field is required' },
                { field: 'contact_person_name', message: 'Contact person name Field is required' },
                { field: 'contact_person_mobile', message: 'Contact person mobile Field is required' },
                { field: 'contact_person_email', message: 'Contact person email Field is required' },
                { field: 'designation', message: 'Designation Field is required' },
                {field: 'bank_details', message: 'Bank Details is required' },
                // { field: 'payment_terms', message: 'Payment Terms Field is required' },
                { field: 'supplier_country_code', message: 'Supplier country code  Field is required' },
                { field: 'contact_person_country_code', message: 'Contact person country code  Field is required' },
                { field: 'tags', message: 'Tags are required' },
                // { field: 'estimated_delivery_time', message: 'Estimated Delivery Time is required' }
            ],
            cancelOrder: [
                { field: 'buyer_id', message: 'Buyer id is required' },
                { field: 'order_id', message: 'Order id is required' },
                { field: 'order_type', message: 'Order Type is required' },
                { field: 'reason', message: 'Reason is required' }
            ]
        };
        // Get the required fields for the given type
        const fieldsToValidate = requiredFields[type] || [];
    
        // Check for missing fields 
        fieldsToValidate.forEach(({ field, message }) => {
            if (!reqObj || reqObj[field] === undefined || reqObj[field] === '') {
                objData[field] = message;
            }
        });
    
        return objData;
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
    },

    formatDate: (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    },
    getTodayFormattedDate: () => {
        const today = new Date();
        return module.exports.formatDate(today); 
    },

    // Common callback function to handle the response for both routes
    handleController: (controllerFunction, req, res, reqObj = null) => {
        try {
            const handleResponse = (result) => {
                let message = '';
                switch (result.code) {
                    case 200:
                    case 401:
                    case 402:
                    case 404:
                    case 409:
                    case 500:
                        message = result.message;
                        break;
                }
                return { code: result.code, message: message, result: result.result };
            }
            controllerFunction(req, res, (reqObj || req.body), result => {
                const response = handleResponse(result);  // Directly call handleResponse here
                res.send(response);
            });
        } catch (error) {
            handleCatchBlockError(req, res, error);
        }
    }
    
    


}
