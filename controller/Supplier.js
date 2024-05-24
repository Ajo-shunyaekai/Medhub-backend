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
              supplier_id               : supplierId,
              supplier_name             : reqObj.supplier_name,
              supplier_image            : reqObj.supplier_image,
              supplier_address          : reqObj.supplier_address,
              description               : reqObj.description,
              license_no                : reqObj.license_no,
              country_of_origin         : reqObj. country_of_origin,
              contact_person_name       : reqObj.contact_person_name,
              designation               : reqObj.designation,
              payment_terms             : reqObj.payment_terms,
              estimated_delivery_time   : reqObj.estimated_delivery_time,
              tags                      : reqObj.tags,
              mobile                    : reqObj.mobile,
              country_code              : reqObj.countryCode,
              email                     : reqObj.email,
              password                  : reqObj.password,
              token                     : token,
              status                    : 1
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

    filterValues : async(reqObj, callback) => {
      try {
        // const countryData = await Supplier.find({}, { country_of_origin: 1, _id: 0 }).exec();
        const countryData = await Supplier.distinct("country_of_origin")

        const result = {
          country: countryData,
          // forms: formsData
      };

      callback({ code: 200, message: "Filter values", result: [result] });
      }catch (error) {
        console.error('Error:', error);
        callback({code: 500});
     }
    },

    editSupplier : async(reqObj, callback) => {
      try {
        
       const {
        supplier_id, supplier_name, description, supplier_address, 
        email, mobile_no, country_code, country_of_origin, contact_person_name,
        designation, payment_terms, tags, estimated_delivery_time, supplier_image
      } = reqObj

      const updateObj = {
        supplier_name,
        description,
        supplier_address,
        email,
        mobile : mobile_no,
        country_code,
        country_of_origin,
        contact_person_name,
        designation,
        payment_terms,
        tags,
        estimated_delivery_time,
        supplier_image
      };

      Object.keys(updateObj).forEach(key => updateObj[key] === undefined && delete updateObj[key]);

      const updatedSupplier = await Supplier.findOneAndUpdate(
        { supplier_id: supplier_id },
        // updateObj,
        { $set: updateObj },
        { new: true }
      );  

    if (!updatedSupplier) {
      return callback({ code: 404, message: 'Supplier not found' });
    }

    callback({ code: 200, message: 'Supplier updated successfully', result: updatedSupplier });


      // callback({ code: 200, message: "Filter values", result: [result] });
      }catch (error) {
        console.error('Error:', error);
        callback({code: 500});
     }
    },
}