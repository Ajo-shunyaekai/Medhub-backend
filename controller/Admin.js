const bcrypt             = require('bcrypt');
const jwt                = require('jsonwebtoken');
const generator          = require('generate-password');
const Admin              = require('../schema/adminSchema')
const User               = require('../schema/userSchema')
const Supplier           = require('../schema/supplierSchema')
const Buyer              = require('../schema/buyerSchema')
const BuyerEdit          = require('../schema/buyerEditSchema')
const SupplierEdit       = require('../schema/supplierEditSchema')
const Medicine           = require('../schema/medicineSchema')
const MedicineInventory  = require('../schema/medicineInventorySchema')

const generatePassword = () => {
  const password = generator.generate({
    length  : 12,
    numbers : true
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
                callback({code: 400, message : 'Admin registration failed', result: err})
              })
            })
            .catch((error) => {
              callback({code: 400, message: 'Error in generating salt or hashing password', result: error});
            }) 
        } catch (error) {
          callback({code: 500, message: 'Internal server error', result: error})
        } 
    },

    login : async(reqObj, callback) => {
      try {
         const password = reqObj.password
         const email    = reqObj.email

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
      } catch (error) {
        console.error('Error validating user:', error);
        callback({code: 500, message: 'Internal Server Error', result: error})
      }
    },

    editAdminProfile : async (reqObj, callback) => {
      try {
        const { admin_id, user_name, email } = reqObj

        const admin = await Admin.findOne({admin_id : admin_id})

        if(!admin) {
          callback({code: 404, message : 'User not found'})
        }

        const updateProfile = await Admin.findOneAndUpdate({admin_id : admin_id},  { user_name: user_name, email: email }, {new: true})

        if(updateProfile) {
          callback({code: 200, message: 'Profile Updated Successfully', result: updateProfile})
        } else {
          callback({code: 400, message: 'Error while updating profile details', result: updateProfile})
        }
      } catch (error) {
        console.log("error", error)
        callback({code: 500, message: 'Internal Server Error', result: error})
      }
    },

    adminProfileDetails : async (reqObj, callback) => {
      try {
        const fields = {
          password  : 0,
          token     : 0,
          createdAt : 0,
          updatedAt : 0
        }
        Admin.find({admin_id : reqObj.admin_id}).select(fields).then((data) => {
          callback({code: 200, message: 'Admin Profile Details', result: data})
      }).catch((error) => {
          console.error('Error:', error);
          callback({code: 400, message: 'Error in fetching admin profile details', result: error})
      });
      }catch (error) {
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
        callback({code: 500, message : 'Internal server error', result: error})
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

    //------------------------ buyer ------------------------//
    getSupplierList: async(reqObj, callback) => {
      try {
        const { pageNo, limit } = reqObj

        const page_no   = pageNo || 1
        const page_size = limit || 2
        const offSet    = (page_no -1) * page_size

        const fields = {
          token    : 0,
          password : 0
        };

        Supplier.find({}).select(fields).skip(offSet).limit(page_size).then((data) => {
          Supplier.countDocuments().then((totalItems) => {

            const totalPages = Math.ceil(totalItems / page_size)
            const returnObj = {
              data,
              totalPages
            }
            callback({code: 200, message : 'Supplier list fetched successfully', result: returnObj})
          })
          .catch((err) => {
            callback({code: 400, message : 'Error while  fetching suppliers list count', result: err})
          })
        }).catch((error) => {
          console.error('Error:', error);
          callback({code: 400, message : 'Error in fetching suppliers list', result: error})
        });
      }catch (err) {
        callback({code: 500, message : 'Internal server error', result: err})
      }
    },

    supplierDetails : async(reqObj, callback) => {
      try {
        const fields = {
          token    : 0,
          password : 0
        }
        Supplier.findOne({supplier_id: reqObj.supplier_id}).select(fields) 
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

    getRegReqList: async(reqObj, callback) => {
      try {
        const { pageNo, limit } = reqObj

        const page_no   = pageNo || 1
        const page_size = limit || 2
        const offSet    = (page_no -1) * page_size

        const fields = {
          token    : 0,
          password : 0
        };

        Supplier.find({account_status : 0}).select(fields).skip(offSet).limit(page_size).then((data) => {
          Supplier.countDocuments({account_status : 0}).then((totalItems) => {

            const totalPages = Math.ceil( totalItems / page_size )
            const returnObj = {
              data,
              totalPages
            }
            callback({code: 200, message : 'supplier registration request list fetched successfully', result: returnObj})
          })
          .catch((err) => {
            callback({code: 400, message : 'Error while fetching supplier registration request list count', result: err})
          }) 
      }).catch((error) => {
          console.error('Error:', error);
          callback({code: 400, message : 'Error in fetching suppliers registration request list', result: error})
      });
      }catch (err) {
        console.error('Er:', err);
        callback({code: 500, message : 'Internal server error'})
      }
    },

    acceptRejectSupplierRegReq : async(reqObj, callback) => {
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
    //------------------------ buyer ------------------------//


    //------------------------ supplier ------------------------//
    getBuyerList: async(reqObj, callback) => {
      try {
        const { pageNo, limit } = reqObj

        const page_no   = pageNo || 1
        const page_size = limit || 2
        const offSet    = (page_no - 1) * 10

        const fields = {
          token    : 0,
          password : 0
        };

        Buyer.find({}).select(fields).skip(offSet).limit(page_size).then((data) => {
          Buyer.countDocuments().then((totalItems) => {

            const totalPages = Math.ceil(totalItems / page_size);
            const resultObj = {
              data,
              totalPages 
            }

            callback({code: 200, message: 'Buyer list fetched successfully', result: resultObj})
          })
          .catch((err) => {
            callback({code: 400, message:'Error while fetching buyer list count', result: err })
          })
        })
        .catch((err) => {
          callback({code: 400, message:'Error while fetching buyer list', result: err })
        })

      } catch (error) {
        callback({code: 500, message:'Internal Server Error', result: error })
      }
    },

    buyerDetails : async(reqObj, callback) => {
      try {
        const fields = {
          token    : 0,
          password : 0
        }
        Buyer.findOne({buyer_id: reqObj.buyer_id}).select(fields) 
        .then((data) => {
          callback({code: 200, message : 'Buyer details fetched successfully', result:data})
      }).catch((error) => {
          console.error('Error:', error);
          callback({code: 400, message : 'Error in fetching buyer details'})
      });
      }catch (error) {
        callback({code: 500, message : 'Internal server error'})
      }
    },

    getBuyerRegReqList: async(reqObj, callback) => {
      try {
        const {pageNo, limit} = reqObj

        const page_no   = pageNo || 1
        const page_size = limit || 2
        const offSet    = (page_no - 1) * page_size

        const fields = {
          token    : 0,
          password : 0
        };

        Buyer.find({account_status : 0}).select(fields).skip(offSet).limit(page_size).then((data) => {
          Buyer.countDocuments({account_status : 0}).then((totalItems) => {
            
            const totalPages = Math.ceil(totalItems / page_size);
            const resultObj = {
              data,
              totalPages
            }
            callback({code: 200, message: 'Buyer Registration Request List fetched Successfully', result: resultObj})
          })
          .catch((err) => {
            callback({code: 400, message: 'Error in counting buyer registratiion requests count', result: err})
          }) 
        })
        .catch((err) => {
          callback({code: 400, message: 'Error while fetching supplier registration requests list', result: err})
        })

      } catch (error) {
        console.log('Internal server error')
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
    //------------------------ supplier ------------------------//



    //------------------------ supplier/buyer ------------------------//
    getProfileUpdateReqList: async(reqObj, callback) => {
      try {
        const { pageNo, limit, user_type  } = reqObj

        const page_no   = pageNo || 1
        const page_size = limit || 2
        const offSet    = (page_no -1) * page_size

        const fieldsToExclude = {
          token     : 0,
          createdAt : 0,
          updatedAt : 0,
          password  : 0,
        };

        const fetchUpdateProfileRequests = (Model, callback) => {

          Model.find({}).select(fieldsToExclude).skip(offSet).limit(page_size)
            .then((data) => {
              Model.countDocuments().then((totalItems) => {

                const totalPages = Math.ceil(totalItems / page_size)
                const returnObj = {
                  data,
                  totalPages
                }
                callback({ code: 200, message: 'Update Profile Req list fetched successfully', result: returnObj });
              })
              .catch((err) => {
                callback({ code: 400, message: 'Error while fetching update profile req list count', result: err });
              })
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
    },
    //------------------------ supplier/buyer ------------------------//



    //------------------------ medicine ------------------------//
    allMedicineList: async (reqObj, callback) => {
      try {
        const {searchKey, pageNo, pageSize, medicine_type} = reqObj
  
        const page_no   = pageNo || 1
        const page_size = pageSize || 10
        const offset    = (page_no - 1) * page_size
  
        if(searchKey === '' || searchKey === undefined) {
          Medicine.aggregate([
            {
              $match: {
                'medicine_type': medicine_type
              }
            },
            {
              $lookup: {
                from         : "medicineinventories",
                localField   : "medicine_id",
                foreignField : "medicine_id",
                as           : "inventory",
              },
            },
            {
              $project: {
                medicine_id       : 1,
                supplier_id       : 1,
                medicine_name     : 1,
                medicine_image    : 1,
                drugs_name        : 1,
                country_of_origin : 1,
                dossier_type      : 1,
                dossier_status    : 1,
                gmp_approvals     : 1,
                registered_in     : 1,
                comments          : 1,
                dosage_form       : 1,
                category_name     : 1,
                strength          : 1,
                quantity          : 1,
                medicine_type     : 1,
                inventory : {
                  $arrayElemAt: ["$inventory", 0],
                },
              },
            },
            {
              $project: {
                medicine_id       : 1,
                supplier_id       : 1,
                medicine_name     : 1,
                medicine_image    : 1,
                drugs_name        : 1,
                country_of_origin : 1,
                dossier_type      : 1,
                dossier_status    : 1,
                gmp_approvals     : 1,
                registered_in     : 1,
                comments          : 1,
                dosage_form       : 1,
                category_name     : 1,
                strength          : 1,
                quantity          : 1,
                medicine_type     : 1,
                "inventory.delivery_info"  : 1,
                "inventory.price"          : 1,
              },
            },
            { $skip: offset },
            { $limit: page_size },
          ])
            .then((data) => {
              Medicine.countDocuments({medicine_type : medicine_type})
              .then(totalItems => {
                  const totalPages = Math.ceil(totalItems / page_size);
                  const returnObj = {
                    data,
                    totalPages
                  }
                  callback({ code: 200, message: "Medicine list fetched successfully", result: returnObj });
              })
              .catch((err) => {
                callback({ code: 400, message: "Error while fetching medicine count", result: err});
              })
            })
            .catch((err) => {
              console.log(err);
              callback({ code: 400, message: "Error fetching medicine list", result: err});
            });
        } else {
          Medicine.aggregate([
            {
              $match: {
                'medicine_name': { $regex: searchKey, $options: 'i' },
                'medicine_type': medicine_type
              }
            },
            {
              $project: {
                medicine_id       : 1,
                supplier_id       : 1,
                medicine_name     : 1,
                medicine_image    : 1,
                drugs_name        : 1,
                country_of_origin : 1,
                dossier_type      : 1,
                dossier_status    : 1,
                gmp_approvals     : 1,
                registered_in     : 1,
                comments          : 1,
                dosage_form       : 1,
                category_name     : 1,
                strength          : 1,
                quantity          : 1,
                medicine_type     : 1,
                inventory : {
                  $arrayElemAt: ["$inventory", 0],
                },
              }
            },
            {
              $project: {
                medicine_id       : 1,
                supplier_id       : 1,
                medicine_name     : 1,
                medicine_image    : 1,
                drugs_name        : 1,
                country_of_origin : 1,
                dossier_type      : 1,
                dossier_status    : 1,
                gmp_approvals     : 1,
                registered_in     : 1,
                comments          : 1,
                dosage_form       : 1,
                category_name     : 1,
                strength          : 1,
                quantity          : 1,
                medicine_type     : 1,
                "inventory.delivery_info"  : 1,
                "inventory.price"          : 1,
              },
            },
            { $skip: offset },
            { $limit: page_size }
          ])
          .then((data) => {
            Medicine.countDocuments({ 
              medicine_name: { $regex: searchKey, $options: 'i' },
              medicine_type: medicine_type 
            })
              .then(totalItems => {
                  const totalPages = Math.ceil(totalItems / page_size);
                  const returnObj = {
                    data,
                    totalPages
                  }
                  callback({ code: 200, message: "Medicine list fetched successfully", result: returnObj });
              })
              .catch((err) => {
                callback({ code: 400, message: "Error while fetching medicine count", result: err});
              })
            })
          .catch((err) => {
            callback({ code: 400, message: "Error fetching medicine list", result: err});
          });
  
        }
       
      } catch (error) {
        callback({ code: 500, message: "Internal Server Error", result: error });
      }
    },

    getMedicineDetails: async (reqObj, callback) => {
      try {
        Medicine.aggregate([
          {
            $match: { medicine_id: reqObj.medicine_id },
          },
          {
            $lookup: {
              from         : "medicineinventories",
              localField   : "medicine_id",
              foreignField : "medicine_id",
              as           : "inventory",
            },
          },
          {
            $project: {
              medicine_id    : 1,
              supplier_id    : 1,
              medicine_name  : 1,
              composition    : 1,
              dossier_type   : 1,
              dossier_status : 1,
              gmp_approvals  : 1,
              shipping_time  : 1,
              tags           : 1,
              available_for  : 1,
              description    : 1,
              registered_in  : 1,
              inventory_info : 1,
              medicine_image : 1,
              medicine_type  : 1,
              // medicine_image    : 1,
              // drugs_name        : 1,
              // country_of_origin : 1,
              // dosage_form       : 1,
              // category_name     : 1,
              // strength          : 1,
              inventory : {
                $arrayElemAt: ["$inventory", 0],
              },
            },
          },
          {
            $project: {
              medicine_id    : 1,
              supplier_id    : 1,
              medicine_name  : 1,
              composition    : 1,
              dossier_type   : 1,
              dossier_status : 1,
              gmp_approvals  : 1,
              shipping_time  : 1,
              tags           : 1,
              available_for  : 1,
              description    : 1,
              registered_in  : 1,
              inventory_info : 1,
              medicine_image : 1,
              medicine_type  : 1,
              "inventory.inventory_info" : 1,
              "inventory.strength"       : 1,
            },
          },
          {
            $lookup: {
              from         : "suppliers",
              localField   : "supplier_id",
              foreignField : "supplier_id",
              as           : "supplier",
            },
          },
          {
            $project: {
              medicine_id    : 1,
              supplier_id    : 1,
              medicine_name  : 1,
              composition    : 1,
              dossier_type   : 1,
              dossier_status : 1,
              gmp_approvals  : 1,
              shipping_time  : 1,
              tags           : 1,
              available_for  : 1,
              description    : 1,
              registered_in  : 1,
              inventory_info : 1,
              medicine_image : 1,
              medicine_type  : 1,
              "inventory.inventory_info" : 1,
              "inventory.strength"       : 1,
              supplier : {
                $arrayElemAt: ["$supplier", 0],
              },
            },
          },
          {
            $project: {
              medicine_id    : 1,
              supplier_id    : 1,
              medicine_name  : 1,
              composition    : 1,
              dossier_type   : 1,
              dossier_status : 1,
              gmp_approvals  : 1,
              shipping_time  : 1,
              tags           : 1,
              available_for  : 1,
              description    : 1,
              registered_in  : 1,
              inventory_info : 1,
              medicine_image : 1,
              medicine_type  : 1,
              "inventory.inventory_info" : 1,
              "inventory.strength"       : 1,
              "supplier.supplier_id"             : 1, 
              "supplier.supplier_name"           : 1,
              "supplier.description"             : 1,
              "supplier.estimated_delivery_time" : 1,
              "supplier.tags"                    : 1,
              "supplier.license_no"              : 1,
              "supplier.supplier_address"        : 1,
              "supplier.payment_terms"           : 1,
              "supplier.country_of_origin"       : 1,
            },
          },
        ])
          .then((data) => {
            if (data.length) {
              callback({ code: 200, message: "Medicine details fetched successfully", result: data });
            } else {
              callback({code: 400, message: "Medicine with requested id not found", result: data });
            }
          })
          .catch((err) => {
            callback({code: 400, message: "Error fetching medicine details", result: err });
          });
      } catch (error) {
        callback({ code: 500, message: "Internal server error", result: error });
      }
    },
    //-------------------------- medicine ----------------------------//



    //----------------------------- support -------------------------------------//
    supportList : async(reqObj, callback) => {
      try {
         const {pageNo, pageSize } = reqObj
 
         const page_no   = pageNo || 1
         const page_size = pageSize || 1
         const offset    = (page_no - 1) * page_size 
 
         Support.find().skip(offset).limit(page_size).then((data) => {
           Support.countDocuments().then((totalItems) => {
             const totalPages = Math.ceil(totalItems / page_size)
             const returnObj =  {
               data,
               totalPages
             }
             callback({code: 200, message : 'support list fetched successfully', result: returnObj})
           })
           .catch((err) => {
             console.log(err);
             callback({code: 400, message : 'error while fetching support list count', result: err})
           })
         })
         .catch((err) => {
           console.log(err);
           callback({code: 400, message : 'error while fetching support list', result: err})
         })
 
      } catch (error) {
       callback({code: 500, message : 'Internal Server Error', result: error})
      }
     },
 
    supportDetails : async (reqObj, callback) => {
      try {
          const { supplier_id , support_id } = reqObj

          Support.find({support_id : support_id}).select().then((data) => {
          callback({code: 200, message : 'support details fetched successfully', result: data})
          })
      } catch (error) {
        
      }
    }
    //----------------------------- support -------------------------------------//

}