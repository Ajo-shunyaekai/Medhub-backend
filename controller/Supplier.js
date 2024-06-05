require('dotenv').config();
const bcrypt       = require('bcrypt');
const jwt          = require('jsonwebtoken');
const Supplier     = require('../schema/supplierSchema')
const Order        = require('../schema/orderSchema')
const SupplierEdit = require('../schema/supplierEditSchema')

module.exports = {
    
    register : async(reqObj, callback) => {
        try {
          const emailExists = await Supplier.findOne({supplier_email : reqObj.supplier_email})
          if(emailExists) {
            return callback({code : 409, message: "Email already exists"})
          }
          const supplierId  = 'SUP-' + Math.random().toString(16).slice(2);
          let jwtSecretKey  = process.env.APP_SECRET; 
          let data          = {  time : Date(),  supplierId : supplierId } 
          const token       = jwt.sign(data, jwtSecretKey); 

          const newSupplier = new Supplier({
              supplier_id                 : supplierId,
              supplier_name               : reqObj.supplier_name,
              supplier_address            : reqObj.supplier_address,
              description                 : reqObj.description,
              supplier_email              : reqObj.supplier_email,
              supplier_mobile             : reqObj.supplier_mobile,
              supplier_country_code       : reqObj.supplier_country_code,
              license_no                  : reqObj.license_no,
              tax_no                      : reqObj.tax_no,
              country_of_origin           : reqObj.country_of_origin,
              country_of_operation        : reqObj.country_of_operation,
              contact_person_name         : reqObj.contact_person_name,
              designation                 : reqObj.designation,
              contact_person_mobile_no    : reqObj.contact_person_mobile_no,
              contact_person_country_code : reqObj.contact_person_country_code,
              contact_person_email        : reqObj.contact_person_email,
              supplier_image              : reqObj.supplier_image,
              license_image               : reqObj.license_image,
              tax_image                   : reqObj.tax_image,
              payment_terms               : reqObj.payment_terms,
              estimated_delivery_time     : reqObj.estimated_delivery_time,
              tags                        : reqObj.tags,
              token                       : token,
              account_status              : 0,
              profile_status              : 0
          });

            newSupplier.save() .then(() => {
              callback({code: 200, message: "Supplier Registration Successfull"})
            }).catch((err) => {
              console.log('err',err);
              callback({code: 400 , message: " Supplier Registration Failed"})
            })
            
        } catch (error) {
          console.log('err',error);
          callback({code: 500});
        }
    },

    login : async(reqObj, callback) => {
      try {
        const password  = reqObj.password
        const email     = reqObj.email

        const supplier = await Supplier.findOne({ supplier_email: email });

        if (!supplier) {
            return callback({code: 404, message: "Email doesn't exists"});
        }

        const isMatch = await bcrypt.compare(password, supplier.password);

        if (isMatch) {
          const supplierData = {
            supplier_id                 : supplier.supplier_id,
            supplier_name               : supplier.supplier_name,
            supplier_address            : supplier.supplier_address,
            description                 : supplier.description,
            supplier_email              : supplier.supplier_email,
            supplier_country_code       : supplier.supplier_country_code,
            supplier_mobile             : supplier.supplier_mobile,
            contact_person_country_code : supplier.contact_person_country_code,
            contact_person_email        : supplier.contact_person_email,
            contact_person_mobile       : supplier.contact_person_mobile,
            contact_person_name         : supplier.contact_person_name,
            country_of_operation        : supplier.country_of_operation,
            designation                 : supplier.designation,
            supplier_image              : supplier.supplier_image,
            license_image               : supplier.license_image,
            license_no                  : supplier.license_no,
            tax_image                   : supplier.tax_image,
            tax_no                      : supplier.tax_no,
            description                 : supplier.description,
            country_of_origin           : supplier.country_of_origin,
            token                       : supplier.token
         }
            callback({code : 200, message: "Login Successfull", result: supplierData});
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
          supplier_email, supplier_mobile, supplier_country_code, contact_person_name,
          contact_person_mobile_no, contact_person_country_code, contact_person_email, designation,
          country_of_origin, country_of_operation, license_no, tax_no, payment_terms, tags, 
          estimated_delivery_time, supplier_image, tax_image, license_image
        } = reqObj

      const updateObj = {
        supplier_id, 
        supplier_name, 
        description, 
        supplier_address, 
        supplier_email, 
        supplier_mobile, 
        supplier_country_code, 
        contact_person_name,
        contact_person_mobile_no, 
        contact_person_country_code, 
        contact_person_email, 
        designation,
        country_of_origin, 
        country_of_operation, 
        license_no, 
        tax_no, 
        payment_terms, 
        tags, 
        estimated_delivery_time, 
        supplier_image, 
        tax_image, 
        license_image,
        edit_status: 0
      };

      const supplier = await Supplier.findOne({ supplier_id: supplier_id });
  
        if (!supplier) {
            return callback({ code: 404, message: 'Supplier Not Found' });
        }

        if(supplier.profile_status === 0) {
          return callback({code: 202, message: 'Edit request already exists for the supplier'})
        }


      Object.keys(updateObj).forEach(key => updateObj[key] === undefined && delete updateObj[key]);

      const supplierEdit = new SupplierEdit(updateObj)

      supplierEdit.save().then((data) => {
        Supplier.findOneAndUpdate({supplier_id : supplier_id},
          {
            $set: {
              profile_status: 0
            }
          }).then((result) => {
            callback({ code: 200, message: 'Profile edit request send successfully', result: data});
          })
          .catch((err) => {
            callback({ code: 400, message: 'Error while sending profile update request', result: err});
          })
      })
    //   const updatedSupplier = await Supplier.findOneAndUpdate(
    //     { supplier_id: supplier_id },
    //     { $set: updateObj },
    //     { new: true }
    //   );  

    // if (!updatedSupplier) {
    //   return callback({ code: 404, message: 'Supplier not found' });
    // }

    // callback({ code: 200, message: 'Supplier updated successfully', result: updatedSupplier });


      // callback({ code: 200, message: "Filter values", result: [result] });
      }catch (error) {
        console.error('Error:', error);
        callback({ code: 500, message: 'Internal Server Error', error: error});
     }
    },

    supplierProfileDetails : async(reqObj, callback) => {
      try {
        Supplier.findOne({supplier_id: reqObj.supplier_id}).select('supplier_id supplier_name supplier_email supplier_mobile_no supplier_image tax_image license_image email mobile country_code supplier_address description license_no country_of_origin contact_person_name designation tags payment_terms estimated_delivery_time') 
        .then((data) => {
          callback({code: 200, message : 'Supplier details fetched successfully', result:data})
      }).catch((error) => {
          console.error('Error:', error);
          callback({code: 400, message : 'Error in fetching supplier details'})
      });
      }catch (error) {
        callback({code: 500, message : 'Internal server error'})
      }
    },

    changePassword : async(reqObj, callback) => {
      try {
        const { supplier_id, password } = reqObj
        const supplier = await Supplier.findOne({supplier_id : supplier_id})

        if(!supplier) {
          return callback({code: 404, message: "Supplier doesn't exists"});
        }
        let newPassword
        const saltRounds = 10
        bcrypt.genSalt(saltRounds).then((salt) => {
          return bcrypt.hash(password, salt)
        })
        .then((hashedPassword) => {
          newPassword = hashedPassword
          Supplier.findOneAndUpdate(
            { supplier_id: supplier_id },

            { $set: {password : newPassword} },
            { new: true }
          ).then(() => {
            callback({code: 200, message: "Password updated Successfully"})
          }) 
          .catch((err) => {
            callback({code: 400 , message: "Error while updating password "})
          })
        })
        .catch((err) => {
          callback({code: 401 , message: "Error while updating password "})
        })

        // Supplier.findOneAndUpdate({supplier_id : supplier_id},{$set: {password :}})
      } catch (error) {
        console.log('error',error);
            callback({code: 500 , message: "Internal Server Error", error: error})
      }
    },

    // buyerOrderRequests : async(reqObj, callback) => {
    //   try {
    //     const { buyer_id, supplier_id, limit, pageNo } = reqObj
    //     const page_no  = pageNo || 1
    //     const pageSize = limit || 2
    //     const offSet   = (page_no - 1) * pageSize
    //       Order.aggregate([
    //         {
    //           $match: { 
    //               buyer_id    : buyer_id,
    //               supplier_id : supplier_id
    //            }
    //         },
    //         {
    //           $lookup: {
    //             from         : 'suppliers',
    //             localField   : 'supplier_id',
    //             foreignField : 'supplier_id',
    //             as           : 'supplier'
    //           }
    //         },
    //         {
    //           $project: {
    //             order_id          : 1,
    //             buyer_id          : 1,
    //             buyer_company     : 1,
    //             supplier_id       : 1,
    //             items             : 1,
    //             payment_terms     : 1,
    //             est_delivery_time : 1,
    //             shipping_details  : 1,
    //             remarks           : 1,
    //             order_status      : 1,
    //             created_at        : 1,
    //             supplier          : { $arrayElemAt : ["$supplier", 0] }
    //           }
    //         }
    //       ])
    //       .then((data) => {
    //         console.log('dataa', data);
    //       })
    //       .catch((err) => {
    //         console.log('error',err);
    //       })
    //   } catch (error) {
        
    //   }
    // }

}