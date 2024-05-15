require('dotenv').config();
const bcrypt   = require('bcrypt');
const jwt      = require('jsonwebtoken');
const Supplier = require('../schema/supplierSchema')


module.exports = {
    
    register : async(reqObj, callback) => {
        try {
          const emailExists = await Supplier.findOne({email : reqObj.email})
          if(emailExists) {
            return callback({code : 409, message: "Email already exists"})
          }
          const supplierId  = 'SUP-' + Math.random().toString(16).slice(2);
          let jwtSecretKey  = process.env.APP_SECRET; 
          let data          = {  time : Date(),  supplierId : supplierId } 
          const token       = jwt.sign(data, jwtSecretKey); 

          const newSupplier = new Supplier({
              supplier_id      : supplierId,
              company_name     : reqObj.company_name,
              company_address  : reqObj.company_address,
              mobile           : reqObj.mobile,
              country_code     : reqObj.countryCode,
              email            : reqObj.email,
              password         : reqObj.password,
            //   business_type    : reqObj.business_type,
            //   license_no       : reqObj.license_no,
              token            : token,
              status           : 1
            });
            
            const saltRounds = 10
            bcrypt.genSalt(saltRounds).then((salt) => {
              return bcrypt.hash(newSupplier.password, salt)
            })
            .then((hashedPassword) => {
                newSupplier.password = hashedPassword
                newSupplier.save() .then(() => {
                callback({code: 200, message: "Supplier Registration Successfull"})
              }).catch((err) => {
                console.log('err',err);
                callback({code: 400 , message: " Supplier Registration Failed"})
              })
            })
            .catch((error) => {
              callback({code: 401});
            }) 
        } catch (error) {
          console.log('err',error);
          callback({code: 500});
        }
    },

    login : async(reqObj, callback) => {
        const password  = reqObj.password
        const email     = reqObj.email
  
        try {
          const supplier = await Supplier.findOne({ email: email });
  
          if (!supplier) {
              console.log('Not found');
              return callback({code: 404, message: "Email doesn't exists"});
          }
  
          const isMatch = await bcrypt.compare(password, supplier.password);
  
          if (isMatch) {
              console.log('Validation successful');
              callback({code : 200, message: "Login Successfull"});
          } else {
              callback({code: 401, message: 'Incorrect Password'});
          }
        }catch (error) {
          console.error('Error validating user:', error);
          callback({code: 500});
       }
    },
}