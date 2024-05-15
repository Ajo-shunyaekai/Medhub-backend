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

            objData.medicine_name         = 'Medicine Name is required';
            objData.description           = 'Description is required';
            objData.category_name         = 'Category Name  is required';
            objData.generic_name          = 'Generic Name is required';
            objData.manufacturer          = 'Manufacturer  is required';
            objData.prescription_required = 'Prescriptions is required';
            objData.storage_conditions    = 'Storage Conditions is required';
            objData.batch_number          = 'Batch Number is required';
            objData.expiry_date           = 'Expirty Date  is required';
            objData.location              = 'Location is required';
            objData.supplier              = 'Supplier is required';
            objData.received_date         = 'Recieved Date  is required';
            objData.quantity              = 'Qantity is required';
            objData.unit_price            = 'Unit Price is required';
            objData.indications           = 'Indications is required';
            objData.side_effects          = 'Side Effects is required';
            objData.strength              = 'Strength is required';
        }
        if(type == 'buyerRegister'){
            objData.buyer_name  = 'Buyer Name field is required';
            objData.mobile_no   = 'Mobile No field is required';
            objData.email       = 'Email Field is required';
            objData.password    = 'Password Field is required'
        }
        if(type === 'editBuyer') {
            objData.buyer_name  = 'First Name field is required';
            objData.mobile_no   = 'Mobile No field is required';
            objData.email       = 'Email Field is required';
        }
        if(type == 'sellerRegister'){
            objData.company_name      = 'Company Name field is required';
            objData.company_address   = 'Address field is required';
            objData.email             = 'Email Field is required';
            objData.password          = 'Password Field is required'
            objData.mobile_no           = 'Mobile Field is required';
            objData.business_type     = 'Business Type Field is required'
            objData.license_no        = 'License No Field is required';
        }
        if(type == 'supplierRegister'){
            objData.company_name      = 'Company Name field is required';
            objData.company_address   = 'Address field is required';
            objData.email             = 'Email Field is required';
            objData.password          = 'Password Field is required'
            objData.mobile_no         = 'Mobile Field is required';
            // objData.business_type     = 'Business Type Field is required'
            // objData.license_no        = 'License No Field is required';
        }
        if(type == 'sellerLogin'){
            objData.email             = 'Email Field is required';
            objData.password          = 'Password Field is required'
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
