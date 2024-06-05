const bcrypt             = require('bcrypt');
const jwt                = require('jsonwebtoken');
const generator          = require('generate-password');
const Admin              = require('../schema/adminSchema')
const User               = require('../schema/userSchema')
const Supplier           = require('../schema/supplierSchema')
const Buyer              = require('../schema/supplierSchema')
const BuyerEdit          = require('../schema/buyerEditSchema')
const SupplierEdit       = require('../schema/supplierEditSchema')
const Medicine           = require('../schema/medicineSchema')
const MedicineInventory  = require('../schema/medicineInventorySchema')

const generatePassword = () => {
  const password = generator.generate({
    length: 12,
    numbers: true
  });
  return password
}


module.exports = {

    register : async(reqObj, callback) => {
        try {
          const adminId    = 'ADM-' + Math.random().toString(16).slice(2);
        let jwtSecretKey = process.env.APP_SECRET; 
        let data         = {  time : Date(),  email:reqObj.email } 
        const token      = jwt.sign(data, jwtSecretKey); 
        const saltRounds = 10

        const newAdmin = new Admin({
            admin_id   : adminId,
            user_name  : reqObj.name,
            email      : reqObj.email,
            password   : reqObj.password,
            token      : token
          });

          bcrypt.genSalt(saltRounds).then((salt) => {
            return bcrypt.hash(newAdmin.password, salt)
          })
          .then((hashedPassword) => {
            newAdmin.password = hashedPassword

            newAdmin.save()
            .then((response) => {
              callback({code: 200, message : 'Admin regisrtation successfull', result:response})
            }) .catch((err) => {
              console.error('Error', err);
              callback({code: 200, message : 'Admin registration failed', result: err})
            })
          })
          .catch((error) => {
            console.error('Error generating salt or hashing password:', error);
            callback({code: 400, message: 'Error in generating salt or hashing password', result: error});
          }) 
        } catch (error) {
          console.log('Internal Server Error');
          callback({code: 500, message: 'Internal server error', result: error})
        }
        
    },

    login : async(reqObj, callback) => {
      try {
        const password = reqObj.password
         const email   = reqObj.email

        const admin = await Admin.findOne({ email: email });

        if (!admin) {
            console.log('Not found');
            callback({code: 404, message: 'Email not found'})
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if (isMatch) {
            console.log('Validation successful');
            callback({code: 200, message: 'Admin Login Successfull'})
        } else {
            console.log('Validation not successful');
            callback({code: 401, message: 'Incorrect Password'})
        }
      }catch (error) {
        console.error('Error validating user:', error);
        callback({code: 500, message: 'Internal Server Error', result: error})
    }
    },

    getUserList : async(reqObj, callback) => {
      try {
        User.find({}).select('user_id first_name last_name email status').limit(5).then((data) => {
          callback({code: 200, message : 'User list fetched successfully', result:data})
      }).catch((error) => {
          console.error('Error:', error);
          callback({code: 400, message : 'Error in fetching users list'})
      });
      }catch (error) {
        console.error('Internal Server Error', error);
        callback({code: 500, message : 'Internal server error'})
        // callback(500);
      }
    },

    blockUnblockUser: async (reqObj, callback) => {
      try {
          const { user_id } = reqObj;
          const user = await User.findOne({ user_id: user_id });
  
          if (!user) {
              return callback({code: 400, message: "User not found" });
          }
  
          const newStatus = user.status === 1 ? 0 : 1;
  
          const updateProfile = await User.findOneAndUpdate(
              { user_id: user_id },
              { status: newStatus },
              { new: true }
          );
  
          if (updateProfile) {
            
            const returnObj = {
              user_id    : updateProfile.user_id,
              first_name : updateProfile.first_name,
              last_name  : updateProfile.last_name,
              email      : updateProfile.email,
              status     : updateProfile.status
            }

            callback({ code: 200, message: `${updateProfile.status === 0 ? 'User blocked successfully': 'User unblocked successfully'}`,result: returnObj});
          } else {
              callback({code:400,  message: "Failed to update user status" });
          }
      } catch (error) {
          console.error('Error', error);
          callback(500, { message: "Internal server error" });
      }
    },

    getsupplierList: async(reqObj, callback) => {
      try {
        const fields = {
          supplier_id                 : 1,
          supplier_name               : 1,
          supplier_image              : 1,
          supplier_address            : 1,
          description                 : 1,
          supplier_email              : 1,
          supplier_mobile_no          : 1,
          supplier_country_code       : 1,
          license_no                  : 1,
          tax_no                      : 1,
          country_of_origin           : 1,
          country_of_operation        : 1,
          contact_person_name         : 1,
          designation                 : 1,
          contact_person_mobile_no    : 1,
          contact_person_country_code : 1,
          license_image               : 1,
          tax_image                   : 1,
          payment_terms               : 1,
          tags                        : 1,
          estimated_delivery_time     : 1,
          status                      : 1
        };

        Supplier.find({}).select(fields).then((data) => {
          callback({code: 200, message : 'supplier list fetched successfully', result: data})
        }).catch((error) => {
          console.error('Error:', error);
          callback({code: 400, message : 'Error in fetching suppliers list', result: error})
        });
      }catch (err) {
        callback({code: 500, message : 'Internal server error', result: err})
      }
    },

    getRegReqList: async(reqObj, callback) => {
      try {
        const { pageNo, limit } = reqObj

        const page_no   = pageNo || 1
        const page_size = limit || 2
        const offset    = (page_no -1) * page_size

        const fields = {
          supplier_id                : 1,
          supplier_name               : 1,
          supplier_image              : 1,
          supplier_address            : 1,
          description                 : 1,
          supplier_email              : 1,
          supplier_mobile_no          : 1,
          supplier_country_code       : 1,
          license_no                  : 1,
          tax_no                      : 1,
          country_of_origin           : 1,
          country_of_operation        : 1,
          contact_person_name         : 1,
          designation                 : 1,
          contact_person_mobile_no    : 1,
          contact_person_country_code : 1,
          license_image               : 1,
          tax_image                   : 1,
          payment_terms               : 1,
          tags                        : 1,
          estimated_delivery_time     : 1,
          status                      : 1
        };

        Supplier.find({status : 0}).select(fields).then((data) => {
          callback({code: 200, message : 'supplier registration request list fetched successfully', result:data})
      }).catch((error) => {
          console.error('Error:', error);
          callback({code: 400, message : 'Error in fetching suppliers registration request list', result: error})
      });
      }catch (err) {
        callback({code: 500, message : 'Internal server error'})
      }
    },

    acceptRejectsupplierRegReq : async(reqObj, callback) => {
      try {
        const { supplier_id, action } = reqObj

        const supplier = await Supplier.findOne({ supplier_id : supplier_id });
  
        if (!supplier) {
            return callback({code: 400, message: "supplier not found" });
        }

        const newAccountStatus = action === 'accept' ? 1 : action === 'reject' ? 2 : ''
        const newProfileStatus = 1

       
        const updateProfile = await Supplier.findOneAndUpdate(
            { supplier_id    : supplier_id },
            { account_status : newAccountStatus, profile_status : newProfileStatus },
            { new : true }
        );

        if (!updateProfile) {
          return callback({ code: 400, message: "Failed to update supplier status" });
      }

      let password
      
        if (updateProfile) {
           if(updateProfile.account_status === 1) {
              password = generatePassword()
            
            const saltRounds = 10
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            updateProfile.password = hashedPassword;
            await updateProfile.save();
           }
          
          const returnObj = {
            supplier_id           : updateProfile.supplier_id,
            supplier_name         : updateProfile.supplier_name,
            supplier_email        : updateProfile.supplier_email,
            supplier_mobile_no    : updateProfile.supplier_mobile,
            supplier_country_code : updateProfile.supplier_country_code,
            account_status        : updateProfile.account_status,
            profile_status        : updateProfile.profile_status,
            password              : updateProfile.password,
            generatedPassword     : password
          }

          callback({ code: 200, message: `${updateProfile.status === 1 ? 'supplier registration accepted successfully': updateProfile.status === 2 ? ' supplier registration rejected' : ''}`,result: returnObj});
        } else {
            callback({code:400,  message: "Failed to update user status" });
        }

      } catch (error) {
        console.log('Internal Sever Error:',error)
        callback({code: 500, message: 'Internal Server Error', result: error})
      }
    },

    getsupplierList: async(reqObj, callback) => {
      try {
        const { pageNo, limit } = reqObj

        const fields = {
          supplier_id                 : 1,
          company_name             : 1,
          supplier_name               : 1,
          supplier_email              : 1,
          supplier_mobile_no          : 1,
          supplier_country_code       : 1,
          status                   : 1
          
          // supplier_image           : 1,
          // supplier_address         : 1,
          // description              : 1,
          // license_no                  : 1,
          // tax_no                      : 1,
          // country_of_origin           : 1,
          // country_of_operation        : 1,
          // contact_person_name         : 1,
          // designation                 : 1,
          // contact_person_mobile_no    : 1,
          // contact_person_country_code : 1,
          // license_image               : 1,
          // tax_image                   : 1,
          // payment_terms               : 1,
          // tags                        : 1,
          // estimated_delivery_time     : 1,
         
        };

        Supplier.find({}).select(fields).limit(1).then((data) => {
          callback({code: 200, message: 'supplier list fetched successfully', result: data})
        })
        .catch((err) => {
          callback({code: 400, message:'Error while fetching supplier list', result: err })
        })

      } catch (error) {
        
      }
    },

    getBuyerRegReqList: async(reqObj, callback) => {
      try {
        const {pageNo, limit} = reqObj

        const page_no   = pageNo || 1
        const page_size = limit | 2
        const offSet    = (page_no - 1) * page_size

        const fields = {
          buyer_id             : 1,
          // company_name             : 1,
          supplier_name        : 1,
          buyer_email          : 1,
          buyer_mobile         : 1,
          buyer_country_code   : 1,
          account_status       : 1
        };

        Buyer.find({account_status : 0}).select(fields).limit(2).then((data) => {
          callback({code: 200, message: 'Buyer Registration Request List fetched Successfully', result: data})
        })
        .catch((err) => {
          callback({code: 400, message: 'Error while fetching supplier registration requests list', result: err})
        })

      } catch (error) {
        console.log('INternal server error')
        callback({code: 500, message: 'Internal server error', result: error})
      }
    },

    acceptRejectBuyerRegReq : async(reqObj, callback) => {
      try {
        const { buyer_id, action } = reqObj

        const buyer = await Buyer.findOne({ buyer_id : buyer_id });
  
        if (!buyer) {
            return callback({code: 400, message: "supplier not found" });
        }

        const newAccountStatus = action === 'accept' ? 1 : action === 'reject' ? 2 : ''
        const newProfileStatus = 1
       
        const updateStatus = await supplier.findOneAndUpdate(
            { buyer_id    : buyer_id },
            { account_status : newAccountStatus, profile_status : newProfileStatus },
            { new         : true }
        );

        if (!updateStatus) {
          return callback({ code: 400, message: "Failed to update supplier status" });
        }

        let password
      
        if (updateStatus) {
           if(updateStatus.account_status === 1) {
              password = generatePassword()
            
            const saltRounds      = 10
            const hashedPassword  = await bcrypt.hash(password, saltRounds);
            updateStatus.password = hashedPassword;

            await updateStatus.save();
           }
          
          const returnObj = {
            buyer_id           : updateStatus.buyer_id,
            buyer_name         : updateStatus.buyer_name,
            buyer_email        : updateStatus.buyer_email,
            buyer_mobile       : updateStatus.buyer_mobile,
            buyer_country_code : updateStatus.buyer_country_code,
            status             : updateStatus.status,
            password           : updateStatus.password,
            generatedPassword  : password
          }

          callback({ code: 200, message: `${updateStatus.status === 1 ? 'buyer registration accepted successfully': updateStatus.status === 2 ? 'buyer registration rejected' : ''}`,result: returnObj});
        } else {
            callback({code:400,  message: "Failed to update buyer status" });
        }

      } catch (error) {
        console.log('Internal Sever Error:',error)
        callback({code: 500, message: 'Internal Server Error', result: error})
      }
    },

    getProfileUpdateReqList: async(reqObj, callback) => {
      try {
        const { pageNo, limit, user_type  } = reqObj

        const fieldsToExclude = {
          token     : 0,
          createdAt : 0,
          updatedAt : 0,
          password  : 0,
        };

        const fetchUpdateProfileRequests = (Model, callback) => {
          Model.find({}).select(fieldsToExclude).limit()
            .then((data) => {
              callback({ code: 200, message: 'Update Profile Req list fetched successfully', result: data });
            })
            .catch((err) => {
              callback({ code: 400, message: 'Error while fetching update profile req list', result: err });
            });
        };
        
        if (user_type === 'supplier') {
          fetchUpdateProfileRequests(supplierEdit, callback);
        } else if (user_type === 'supplier') {
          fetchUpdateProfileRequests(supplierEdit, callback);
        }

      } catch (error) {
        callback({code: 500, message:'Internal Server Error', result: error })
      }
    },

    acceptRejectProfileEditRequest : async(reqObj, callback) => {
      
      try {
        const { user_id, user_type, action } = reqObj
        
        const status = action == 'accept' ? 1 : 'reject' ? 2 : ''

        if(status === 1) {
          if(user_type === 'supplier') {
            const isSupplier = await SupplierEdit.findOne({supplier_id : user_id, edit_status: 0})
  
              if(!isSupplier) {
                return callback({code: 402, message: 'supplier edit request not found'})
              }
            
              await SupplierEdit.findOneAndUpdate({supplier_id: user_id}, {$set: {edit_status: status}})
  
                 const updateObj = {
                  supplier_name               : isSupplier.supplier_name, 
                  description                 : isSupplier.description, 
                  supplier_address            : isSupplier.supplier_address, 
                  supplier_email              : isSupplier.supplier_email, 
                  supplier_mobile             : isSupplier.supplier_mobile, 
                  supplier_country_code       : isSupplier.supplier_country_code, 
                  contact_person_name         : isSupplier.contact_person_name,
                  contact_person_mobile_no    : isSupplier.contact_person_mobile_no, 
                  contact_person_country_code : isSupplier.contact_person_country_code, 
                  contact_person_email        : isSupplier.contact_person_email, 
                  designation                 : isSupplier.designation,
                  country_of_origin           : isSupplier.country_of_origin, 
                  country_of_operation        : isSupplier.country_of_operation, 
                  license_no                  : isSupplier.license_no, 
                  tax_no                      : isSupplier.tax_no, 
                  payment_terms               : isSupplier.payment_terms, 
                  tags                        : isSupplier.tags, 
                  estimated_delivery_time     : isSupplier.estimated_delivery_time, 
                  supplier_image              : isSupplier.supplier_image, 
                  tax_image                   : isSupplier.tax_image, 
                  license_image               : isSupplier.license_image,
                  profile_status              : 1    
                };

                  Supplier.findOneAndUpdate({supplier_id: isSupplier.supplier_id}, {$set: updateObj}, {new: true})
                  .then((result) => {
                    callback({code: 200, message : 'Profile details updated successfully', result: result})
                  })
                  .catch((err) => {
                          callback({code: 400, message : 'Error while updating profile details ', result: err})
                  })
  
          } else if(user_type === 'buyer') {
            const isBuyer = await BuyerEdit.findOne({buyer_id : user_id, edit_status : 0})
            console.log(isBuyer);
            if(!isBuyer) {
              callback({code: 402, message: 'Buyer edit request not found'})
            }
              const countryOfOperationString = isBuyer.country_of_operation.join(', '); 

            BuyerEdit.findOneAndUpdate({buyer_id: user_id},
              {
                $set: {
                edit_status : status}
              }).then(async() => {
  
                const updateObj = {
                  // buyer_id                 : isbuyer.buyer_id, 
                  buyer_name                  : isBuyer.buyer_name, 
                  description                 : isBuyer.description, 
                  buyer_address               : isBuyer.buyer_address, 
                  buyer_email                 : isBuyer.buyer_email, 
                  buyer_mobile                : isBuyer.buyer_mobile, 
                  buyer_country_code          : isBuyer.buyer_country_code, 
                  contact_person_name         : isBuyer.contact_person_name,
                  contact_person_mobile_no    : isBuyer.contact_person_mobile, 
                  contact_person_country_code : isBuyer.contact_person_country_code, 
                  contact_person_email        : isBuyer.contact_person_email, 
                  designation                 : isBuyer.designation,
                  country_of_origin           : isBuyer.country_of_origin, 
                  country_of_operation        : countryOfOperationString,
                  license_no                  : isBuyer.license_no, 
                  tax_no                      : isBuyer.tax_no, 
                  payment_terms               : isBuyer.payment_terms, 
                  tags                        : isBuyer.tags, 
                  estimated_delivery_time     : isBuyer.estimated_delivery_time, 
                  buyer_image                 : isBuyer.buyer_image, 
                  tax_image                   : isBuyer.tax_image, 
                  license_image               : isBuyer.license_image,
                  profile_status              : 1    
                };
                
  
                Buyer.findOneAndUpdate({buyer_id : isBuyer.buyer_id}, { $set: updateObj}, {new: true})
                .then((result) => {
                  callback({code: 200, message : 'Profile details updated successfully', result: result})
                })
                .catch((err) => {
                  callback({code: 400, message : 'Error while updating profile details ', result: err})
                })
              })
          }
        } else if(status === 2) {
          callback({code: 403, message : 'Request for edit profile details rejected'})
        }
        

      } catch (error) {
        callback({code: 500, message : 'Internal Server Error', result: error})
      }
    }
}