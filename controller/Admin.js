const bcrypt             = require('bcrypt');
const jwt                = require('jsonwebtoken');
const nodemailer         = require('nodemailer');
const generator          = require('generate-password');
const Admin              = require('../schema/adminSchema')
const User               = require('../schema/userSchema')
const Order              = require('../schema/orderSchema')
const Supplier           = require('../schema/supplierSchema')
const Buyer              = require('../schema/buyerSchema')
const BuyerEdit          = require('../schema/buyerEditSchema')
const SupplierEdit       = require('../schema/supplierEditSchema')
const MedicineInventory  = require('../schema/medicineInventorySchema')
const Support            = require('../schema/supportSchema')
const Notification       = require('../schema/notificationSchema')
const {Medicine, SecondaryMarketMedicine, NewMedicine }            = require("../schema/medicineSchema");
const {EditMedicine, NewMedicineEdit, SecondaryMarketMedicineEdit} = require('../schema/medicineEditRequestSchema')


const generatePassword = () => {
  const password = generator.generate({
    length  : 12,
    numbers : true
  });
  return password
}


var transporter = nodemailer.createTransport({
    host   : "smtp.gmail.com",
    port   : 587,
    secure : false, // true for 465, false for other ports
    type   : "oauth2",
    // service : 'gmail',
    auth : {
        user : process.env.SMTP_USER_ID,
        pass : process.env.SMTP_USER_PASSWORD
    }
});
const sendMailFunc = (email, subject, body) =>{
    
    var mailOptions = {
        from    : process.env.SMTP_USER_ID,
        to      : email,
        subject : subject,
        // text    : 'This is text mail, and sending for testing purpose'
        html:body
        
    };
    transporter.sendMail(mailOptions);
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
              return callback({code: 404, message: 'Email not found', result: admin})
          }

          const isMatch = await bcrypt.compare(password, admin.password);

          const adminDetails = {
            admin_id  : admin.admin_id,
            user_name : admin.user_name,
            email     : admin.email,
            token     : admin.token
          }

          if (isMatch) {
              callback({code: 200, message: 'Admin Login Successfull', result: adminDetails})
          } else {
              callback({code: 401, message: 'Incorrect Password', })
          }
      } catch (error) {
        console.error('Internal Server Error:', error);
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

    //------------------------ supplier ------------------------//

    // getSupplierList: async(reqObj, callback) => {
    //   try {
    //     const { pageNo, limit, filterKey } = reqObj

    //     const page_no   = pageNo || 1
    //     const page_size = limit || 2
    //     const offSet    = (page_no -1) * page_size

    //     const fields = {
    //       token    : 0,
    //       password : 0
    //     };

    //     Supplier.find({}).select(fields).skip(offSet).limit(page_size).then((data) => {
    //       Supplier.countDocuments().then((totalItems) => {

    //         const totalPages = Math.ceil(totalItems / page_size)
    //         const returnObj = {
    //           data,
    //           totalPages
    //         }
    //         callback({code: 200, message : 'Supplier list fetched successfully', result: returnObj})
    //       })
    //       .catch((err) => {
    //         callback({code: 400, message : 'Error while  fetching suppliers list count', result: err})
    //       })
    //     }).catch((error) => {
    //       console.error('Error:', error);
    //       callback({code: 400, message : 'Error in fetching suppliers list', result: error})
    //     });
    //   }catch (err) {
    //     callback({code: 500, message : 'Internal server error', result: err})
    //   }
    // },

    getSupplierList: async (reqObj, callback) => {
      try {
        const { pageNo, pageSize, filterKey } = reqObj;
    
        const page_no   = pageNo || 1;
        const page_size = pageSize || 2;
        const offSet    = (page_no - 1) * page_size;
    
        const fields = {
          token    : 0,
          password : 0
        };

        let filterCondition = {};
        if (filterKey === 'pending') {
          filterCondition = { account_status: 0 };
        } else if (filterKey === 'accepted') {
          filterCondition = { account_status: 1 };
        } else if (filterKey === 'rejected') {
          filterCondition = { account_status: 2 };
        }
    
        const data       = await Supplier.find(filterCondition).select(fields).sort({createdAt: -1}).skip(offSet).limit(page_size);
        const totalItems = await Supplier.countDocuments(filterCondition);
    
        const totalPages = Math.ceil(totalItems / page_size);
        const returnObj = {
          data,
          totalPages,
          totalItems
        };
    
        callback({ code: 200, message: 'Supplier list fetched successfully', result: returnObj });
      } catch (error) {
        console.error('Error:', error);
        callback({ code: 500, message: 'Internal server error', result: error });
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
              totalPages,
              totalItems
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

    // acceptRejectSupplierRegReq : async(reqObj, callback) => {
    //   try {
    //     const { supplier_id, action } = reqObj

    //     const supplier = await Supplier.findOne({ supplier_id : supplier_id });
  
    //     if (!supplier) {
    //         return callback({code: 400, message: "supplier not found" });
    //     }

    //     const newAccountStatus = action === 'accept' ? 1 : action === 'reject' ? 2 : ''
    //     const newProfileStatus = 1

       
    //     const updateProfile = await Supplier.findOneAndUpdate(
    //         { supplier_id    : supplier_id },
    //         { account_status : newAccountStatus, profile_status : newProfileStatus },
    //         { new : true }
    //     );

    //     if (!updateProfile) {
    //       return callback({ code: 400, message: "Failed to update supplier status" });
    //   }

    //   let password
      
    //     if (updateProfile) {
    //        if(updateProfile.account_status === 1) {
    //           password = generatePassword()
            
    //         const saltRounds = 10
    //         const hashedPassword = await bcrypt.hash(password, saltRounds);
    //         updateProfile.password = hashedPassword;
    //         await updateProfile.save();
    //        }
          
    //       const returnObj = {
    //         supplier_id           : updateProfile.supplier_id,
    //         supplier_name         : updateProfile.supplier_name,
    //         supplier_email        : updateProfile.supplier_email,
    //         supplier_mobile_no    : updateProfile.supplier_mobile,
    //         supplier_country_code : updateProfile.supplier_country_code,
    //         account_status        : updateProfile.account_status,
    //         profile_status        : updateProfile.profile_status,
    //         password              : updateProfile.password,
    //         generatedPassword     : password
    //       }
    //       let body = "Hello "+updateProfile.supplier_name+", <br />" 
    //       +"Your Registration Request has been Approved  "
    //       +"Your Login Email is: "+updateProfile.supplier_email+"" 
    //       +"Your Login Password is : "+password +", <br />" 
    //       +"<br /><br />"
    //       +" Thanks & Regards"
    //       +" <br />"
    //       +" Team. Deliver";
    //   sendMailFunc('ajo@shunyaekai.tech', 'Login Credentials for Deliver', body)
    //       callback({ code: 200, message: `${updateProfile.status === 1 ? 'supplier registration accepted successfully': updateProfile.status === 2 ? ' supplier registration rejected' : ''}`,result: returnObj});
    //     } else {
    //         callback({code:400,  message: "Failed to update user status" });
    //     }

    //   } catch (error) {
    //     console.log('Internal Sever Error:',error)
    //     callback({code: 500, message: 'Internal Server Error', result: error})
    //   }
    // },


    acceptRejectSupplierRegReq: async (reqObj, callback) => {
      try {
        const { supplier_id, action } = reqObj;
    
        const supplier = await Supplier.findOne({ supplier_id: supplier_id });
    
        if (!supplier) {
          return callback({ code: 400, message: "Supplier not found" });
        }
    
        const newAccountStatus = action === 'accept' ? 1 : action === 'reject' ? 2 : '';
        const newProfileStatus = 1;
    
        const updateProfile = await Supplier.findOneAndUpdate(
          { supplier_id: supplier_id },
          { account_status: newAccountStatus, profile_status: newProfileStatus },
          { new: true }
        );
    
        if (!updateProfile) {
          return callback({ code: 400, message: "Failed to update supplier status" });
        }
    
        if (action === 'accept') {
          let password = generatePassword();
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(password, saltRounds);
          updateProfile.password = hashedPassword;
          await updateProfile.save();
    
          const returnObj = {
            supplier_id: updateProfile.supplier_id,
            supplier_name: updateProfile.supplier_name,
            supplier_email: updateProfile.supplier_email,
            supplier_mobile_no: updateProfile.supplier_mobile,
            supplier_country_code: updateProfile.supplier_country_code,
            account_status: updateProfile.account_status,
            profile_status: updateProfile.profile_status,
            password: updateProfile.password,
            generatedPassword: password
          };
    
          const body = `Hello ${updateProfile.supplier_name}, <br />
            Your Registration Request has been Approved. <br />
            Your Login Email is: ${updateProfile.supplier_email} <br />
            Your Login Password is: ${password} <br />
            <br /><br />
            Thanks & Regards <br />
            Team Deliver`;
    
          sendMailFunc(updateProfile.supplier_email, 'Login Credentials for Deliver', body);
    
          return callback({
            code: 200,
            message: 'Supplier registration accepted successfully',
            result: returnObj
          });
        } else if (action === 'reject') {
          const body = `Hello ${updateProfile.supplier_name}, <br />
            We regret to inform you that your registration request has been rejected. <br />
            If you believe this is an error, please contact our support team. <br />
            <br /><br />
            Thanks & Regards <br />
            Team Deliver`;
    
          sendMailFunc('ajo@shunyaekai.tech', 'Registration Request Rejected', body);
    
          return callback({
            code: 200,
            message: 'Supplier registration rejected',
            result: null
          });
        } else {
          return callback({ code: 400, message: "Invalid action" });
        }
      } catch (error) {
        console.log('Internal Server Error:', error);
        callback({ code: 500, message: 'Internal Server Error', result: error });
      }
    },
    

    supplierSupportList : async(reqObj, callback) => {
      try {
         const {pageNo, pageSize } = reqObj
 
         const page_no   = pageNo || 1
         const page_size = pageSize || 1
         const offset    = (page_no - 1) * page_size 
 
         Support.find({user_type : 'supplier'}).sort({createdAt: -1}).skip(offset).limit(page_size).then((data) => {
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
    //------------------------ supplier ------------------------//


    //------------------------ buyer ------------------------//
    // getBuyerList: async(reqObj, callback) => {
    //   try {
    //     const { pageNo, limit } = reqObj

    //     const page_no   = pageNo || 1
    //     const page_size = limit || 2
    //     const offSet    = (page_no - 1) * 10

    //     const fields = {
    //       token    : 0,
    //       password : 0
    //     };

    //     Buyer.find({}).select(fields).skip(offSet).limit(page_size).then((data) => {
    //       Buyer.countDocuments().then((totalItems) => {

    //         const totalPages = Math.ceil(totalItems / page_size);
    //         const resultObj = {
    //           data,
    //           totalPages 
    //         }

    //         callback({code: 200, message: 'Buyer list fetched successfully', result: resultObj})
    //       })
    //       .catch((err) => {
    //         callback({code: 400, message:'Error while fetching buyer list count', result: err })
    //       })
    //     })
    //     .catch((err) => {
    //       callback({code: 400, message:'Error while fetching buyer list', result: err })
    //     })

    //   } catch (error) {
    //     callback({code: 500, message:'Internal Server Error', result: error })
    //   }
    // },
    getBuyerList: async (reqObj, callback) => {
      try {
        const { pageNo, pageSize, filterKey } = reqObj;
    
        const page_no   = pageNo || 1;
        const page_size = pageSize || 2;
        const offSet    = (page_no - 1) * page_size;

        const fields = {
          token    : 0,
          password : 0
        };

        let filterCondition = {};
        if (filterKey === 'pending') {
          filterCondition = { account_status: 0 };
        } else if (filterKey === 'accepted') {
          filterCondition = { account_status: 1 };
        } else if (filterKey === 'rejected') {
          filterCondition = { account_status: 2 };
        }
    
        const data       = await Buyer.find(filterCondition).select(fields).sort({createdAt: -1}).skip(offSet).limit(page_size);
        const totalItems = await Buyer.countDocuments(filterCondition);
    
        const totalPages = Math.ceil(totalItems / page_size);
        const returnObj = {
          data,
          totalPages,
          totalItems
        };
    
        callback({ code: 200, message: 'Buyer list fetched successfully', result: returnObj });
      } catch (error) {
        console.error('Error:', error);
        callback({ code: 500, message: 'Internal server error', result: error });
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
        const {pageNo, pageSize} = reqObj

        const page_no   = pageNo || 1
        const page_size = pageSize || 2
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
              totalPages,
              totalItems
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

    // acceptRejectBuyerRegReq : async(reqObj, callback) => {
    //   try {
    //     const { buyer_id, action } = reqObj

    //     const buyer = await Buyer.findOne({ buyer_id : buyer_id });
  
    //     if (!buyer) {
    //         return callback({code: 400, message: "buyer not found" });
    //     }

    //     const newAccountStatus = action === 'accept' ? 1 : action === 'reject' ? 2 : ''
    //     const newProfileStatus = 1
       
    //     const updateStatus = await Buyer.findOneAndUpdate(
    //         { buyer_id    : buyer_id },
    //         { account_status : newAccountStatus, profile_status : newProfileStatus },
    //         { new         : true }
    //     );

    //     if (!updateStatus) {
    //       return callback({ code: 400, message: "Failed to update supplier status" });
    //     }

        
    //     let password
      
    //     if (updateStatus) {
    //        if(updateStatus.account_status === 1) {
    //           password = generatePassword()
            
    //         const saltRounds      = 10
    //         const hashedPassword  = await bcrypt.hash(password, saltRounds);
    //         updateStatus.password = hashedPassword;

    //         await updateStatus.save();
    //        }
          
    //       const returnObj = {
    //         buyer_id           : updateStatus.buyer_id,
    //         buyer_name         : updateStatus.buyer_name,
    //         buyer_email        : updateStatus.buyer_email,
    //         buyer_mobile       : updateStatus.buyer_mobile,
    //         buyer_country_code : updateStatus.buyer_country_code,
    //         status             : updateStatus.account_status,
    //         password           : updateStatus.password,
    //         generatedPassword  : password
    //       }

    //       callback({ code: 200, message: `${updateStatus.account_status === 1 ? 'Buyer Registration Accepted Successfully': updateStatus.account_status === 2 ? 'Buyer Registration Rejected' : ''}`,result: returnObj});
    //     } else {
    //         callback({code:400,  message: "Failed to update buyer status" });
    //     }

    //   } catch (error) {
    //     console.log('Internal Sever Error:',error)
    //     callback({code: 500, message: 'Internal Server Error', result: error})
    //   }
    // },


    acceptRejectBuyerRegReq: async (reqObj, callback) => {
      try {
        const { buyer_id, action } = reqObj;
    
        const buyer = await Buyer.findOne({ buyer_id: buyer_id });
    
        if (!buyer) {
          return callback({ code: 400, message: "Buyer not found" });
        }
    
        const newAccountStatus = action === 'accept' ? 1 : action === 'reject' ? 2 : '';
        const newProfileStatus = 1;
    
        const updateStatus = await Buyer.findOneAndUpdate(
          { buyer_id: buyer_id },
          { account_status: newAccountStatus, profile_status: newProfileStatus },
          { new: true }
        );
    
        if (!updateStatus) {
          return callback({ code: 400, message: "Failed to update buyer status" });
        }
    
        if (action === 'accept') {
          let password = generatePassword();
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(password, saltRounds);
          updateStatus.password = hashedPassword;
          await updateStatus.save();
    
          const returnObj = {
            buyer_id: updateStatus.buyer_id,
            buyer_name: updateStatus.buyer_name,
            buyer_email: updateStatus.buyer_email,
            buyer_mobile: updateStatus.buyer_mobile,
            buyer_country_code: updateStatus.buyer_country_code,
            status: updateStatus.account_status,
            password: updateStatus.password,
            generatedPassword: password
          };
    
          const body = `Hello ${updateStatus.buyer_name}, <br />
            Your Registration Request has been Approved. <br />
            Your Login Email is: ${updateStatus.buyer_email} <br />
            Your Login Password is: ${password} <br />
            <br /><br />
            Thanks & Regards <br />
            Team Deliver`;
    
          sendMailFunc(updateStatus.buyer_email, 'Login Credentials for Deliver', body);
    
          return callback({
            code: 200,
            message: 'Buyer Registration Accepted Successfully',
            result: returnObj
          });
        } else if (action === 'reject') {
          const body = `Hello ${updateStatus.buyer_name}, <br />
            We regret to inform you that your registration request has been rejected. <br />
            If you believe this is an error, please contact our support team. <br />
            <br /><br />
            Thanks & Regards <br />
            Team Deliver`;
    
          sendMailFunc(updateStatus.buyer_email, 'Registration Request Rejected', body);
    
          return callback({
            code: 200,
            message: 'Buyer Registration Rejected',
            result: null
          });
        } else {
          return callback({ code: 400, message: "Invalid action" });
        }
      } catch (error) {
        console.log('Internal Server Error:', error);
        callback({ code: 500, message: 'Internal Server Error', result: error });
      }
    },
    


    buyerOrdersList: async (reqObj, callback) => {
      try {
        const {page_no, limit, filterKey, buyer_id} = reqObj
  
        const pageNo   = page_no || 1
        const pageSize = limit || 2
        const offset   = (pageNo - 1) * pageSize     
        
      // Order.aggregate([
      //     {
      //         $match: { 
      //             // buyer_id     : reqObj.buyer_id,
      //             order_status : reqObj.filterKey
      //         }
      //     },
      //     {
      //       $lookup: {
      //         from         : "suppliers",
      //         localField   : "supplier_id",
      //         foreignField : "supplier_id",
      //         as           : "supplier"
      //       }
      //     },
      //     {
      //       $lookup: {
      //         from         : "buyers",
      //         localField   : "buyer_id",
      //         foreignField : "buyer_id",
      //         as           : "buyer"
      //       }
      //     },
      //     {
      //       $project: {
      //         order_id          : 1,
      //         buyer_id          : 1,
      //         buyer_name        : 1,
      //         buyer_company     : 1,
      //         supplier_id       : 1,
      //         items             : 1,
      //         payment_terms     : 1,
      //         est_delivery_time : 1,
      //         shipping_details  : 1,
      //         remarks           : 1,
      //         order_status      : 1,
      //         created_at        : 1,
      //         supplier          : { $arrayElemAt : ["$supplier", 0] },
      //         buyer             : { $arrayElemAt : ["$buyer", 0] }
      //       }
      //     },
      //     {
      //       $unwind : "$items" 
      //     },
      //     {
      //       $lookup: {
      //         from         : "medicines",
      //         localField   : "items.medicine_id",
      //         foreignField : "medicine_id",
      //         as           : "medicine"
      //       }
      //     },
      //     {
      //       $addFields: {
      //         "items.medicine_image" : { $arrayElemAt: ["$medicine.medicine_image", 0] },
      //         "items.item_price"     : { $toDouble: { $arrayElemAt: [{ $split: ["$items.price", " "] }, 0] } } 
      //       }
      //     },
      //     {
      //       $group: {
      //         _id               : "$_id",
      //         order_id          : { $first: "$order_id" },
      //         buyer_id          : { $first: "$buyer_id" },
      //         buyer_name        : { $first: "$buyer_name" },
      //         buyer_company     : { $first: "$buyer_company" },
      //         supplier_id       : { $first: "$supplier_id" },
      //         items             : { $push: "$items" },
      //         payment_terms     : { $first: "$payment_terms" },
      //         est_delivery_time : { $first: "$est_delivery_time" },
      //         shipping_details  : { $first: "$shipping_details" },
      //         remarks           : { $first: "$remarks" },
      //         order_status      : { $first: "$order_status" },
      //         created_at        : { $first: "$created_at" },
      //         supplier          : { $first: "$supplier" },
      //         buyer             : { $first: "$buyer" },
      //         totalPrice        : { $sum: "$items.item_price" }
      //       }
      //     },
      //     {
      //         $project: {
      //             order_id          : 1,
      //             buyer_id          : 1,
      //             buyer_name        : 1,
      //             buyer_company     : 1,
      //             supplier_id       : 1,
      //             items             : 1,
      //             payment_terms     : 1,
      //             est_delivery_time : 1,
      //             shipping_details  : 1,
      //             remarks           : 1,
      //             order_status      : 1,
      //             created_at        : 1,
      //             totalPrice        : 1,
      //             "buyer.buyer_image"       : 1,
      //             "buyer.buyer_name"        : 1,
      //             "supplier.supplier_image" : 1,
      //             "supplier.supplier_name"  : 1,
      //         }
      //     },
      //     { $sort : { created_at: -1 } },
      //     { $skip  : offset },
      //     { $limit : pageSize },
      // ])
      Order.aggregate([
        {
            $match: { 
                // buyer_id     : reqObj.buyer_id,
                order_status : reqObj.filterKey
            }
        },
        {
          $lookup: {
            from         : "suppliers",
            localField   : "supplier_id",
            foreignField : "supplier_id",
            as           : "supplier"
          }
        },
        {
          $lookup: {
            from         : "buyers",
            localField   : "buyer_id",
            foreignField : "buyer_id",
            as           : "buyer"
          }
        },
        {
          $project: {
            order_id          : 1,
            buyer_id          : 1,
            buyer_company     : 1,
            supplier_id       : 1,
            items             : 1,
            payment_terms     : 1,
            est_delivery_time : 1,
            shipping_details  : 1,
            remarks           : 1,
            order_status      : 1,
            status            : 1,
            created_at        : 1,
            supplier          : { $arrayElemAt : ["$supplier", 0] },
            buyer             : { $arrayElemAt : ["$buyer", 0] }
          }
        },
        {
          $unwind : "$items" 
        },
        {
          $lookup: {
            from         : "medicines",
            localField   : "items.product_id",
            foreignField : "medicine_id",
            as           : "medicine"
          }
        },
        {
          $addFields: {
            "items.medicine_image" : { $arrayElemAt: ["$medicine.medicine_image", 0] },
            "items.item_price"     : { $toDouble: { $arrayElemAt: [{ $split: ["$items.price", " "] }, 0] } } 
          }
        },
        {
          $group: {
            _id               : "$_id",
            order_id          : { $first: "$order_id" },
            buyer_id          : { $first: "$buyer_id" },
            buyer_company     : { $first: "$buyer_company" },
            supplier_id       : { $first: "$supplier_id" },
            items             : { $push: "$items" },
            payment_terms     : { $first: "$payment_terms" },
            est_delivery_time : { $first: "$est_delivery_time" },
            shipping_details  : { $first: "$shipping_details" },
            remarks           : { $first: "$remarks" },
            order_status      : { $first: "$order_status" },
            status            : { $first: "$status" },
            created_at        : { $first: "$created_at" },
            supplier          : { $first: "$supplier" },
            buyer             : { $first: "$buyer" },
            totalPrice        : { $sum: "$items.item_price" }
          }
        },
        {
            $project: {
                order_id          : 1,
                buyer_id          : 1,
                buyer_company     : 1,
                supplier_id       : 1,
                items             : 1,
                payment_terms     : 1,
                est_delivery_time : 1,
                shipping_details  : 1,
                remarks           : 1,
                order_status      : 1,
                status            : 1,
                created_at        : 1,
                totalPrice        : 1,
                "supplier.supplier_image" : 1,
                "supplier.supplier_name"  : 1,
                "supplier.supplier_type"  : 1,
                "buyer.buyer_image" : 1,
                "buyer.buyer_name"  : 1,
                "buyer.buyer_type"  : 1,
            }
        },
        { $sort : { created_at: -1 } },
        { $skip  : offset },
        { $limit : pageSize },
    ])
      .then((data) => {
          Order.countDocuments({order_status : filterKey})
          .then(totalItems => {
              const totalPages = Math.ceil(totalItems / pageSize);

              const responseData = {
                  data,
                  totalPages,
                  totalItems
              }
              callback({ code: 200, message: "Buyer Order List Fetched successfully", result: responseData });
          })
      })
      .catch((err) => {
          console.log('Error in fetching order list',err);
          callback({ code: 400, message: "Error in fetching order list", result: err });
      })
      } catch (error) {
        console.log('Intenal Server Error',error)
        callback({ code: 500, message: "Internal Server Error", result: error });
      }
    },

    buyerSupportList : async(reqObj, callback) => {
      try {
         const {pageNo, pageSize } = reqObj
 
         const page_no   = pageNo || 1
         const page_size = pageSize || 1
         const offset    = (page_no - 1) * page_size 
 
         Support.find({user_type : 'buyer'}).sort({createdAt: -1}).skip(offset).limit(page_size).then((data) => {
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

    buyerInvoicesList: async (reqObj, callback) => {
      try {
        const {page_no, limit, filterKey, buyer_id} = reqObj
  
        const pageNo   = page_no || 1
        const pageSize = limit || 1
        const offset   = (pageNo - 1) * pageSize     
        
        Order.aggregate([
            {
                $match: { 
                    // buyer_id     : reqObj.buyer_id,
                    order_status : reqObj.filterKey
                }
            },
            {
              $lookup: {
                from         : "suppliers",
                localField   : "supplier_id",
                foreignField : "supplier_id",
                as           : "supplier"
              }
            },
            {
              $project: {
                order_id          : 1,
                buyer_id          : 1,
                buyer_company     : 1,
                supplier_id       : 1,
                items             : 1,
                payment_terms     : 1,
                est_delivery_time : 1,
                shipping_details  : 1,
                remarks           : 1,
                order_status      : 1,
                invoice_number    : 1,
                created_at        : 1,
                supplier          : { $arrayElemAt : ["$supplier", 0] }
              }
            },
            {
              $unwind : "$items" 
            },
            {
              $lookup: {
                from         : "medicines",
                localField   : "items.medicine_id",
                foreignField : "medicine_id",
                as           : "medicine"
              }
            },
            {
              $addFields: {
                "items.medicine_image": { $arrayElemAt: ["$medicine.medicine_image", 0] },
                "items.item_price": { $toDouble: { $arrayElemAt: [{ $split: ["$items.price", " "] }, 0] } } 
              }
            },
            {
              $group: {
                _id               : "$_id",
                order_id          : { $first: "$order_id" },
                buyer_id          : { $first: "$buyer_id" },
                buyer_company     : { $first: "$buyer_company" },
                supplier_id       : { $first: "$supplier_id" },
                items             : { $push: "$items" },
                payment_terms     : { $first: "$payment_terms" },
                est_delivery_time : { $first: "$est_delivery_time" },
                shipping_details  : { $first: "$shipping_details" },
                remarks           : { $first: "$remarks" },
                order_status      : { $first: "$order_status" },
                invoice_number    : { $first: "$invoice_number" },
                created_at        : { $first: "$created_at" },
                supplier          : { $first: "$supplier" },
                totalPrice        : { $sum: "$items.item_price" }
              }
            },
            {
                $project: {
                    order_id          : 1,
                    buyer_id          : 1,
                    buyer_company     : 1,
                    supplier_id       : 1,
                    items             : 1,
                    payment_terms     : 1,
                    est_delivery_time : 1,
                    shipping_details  : 1,
                    remarks           : 1,
                    order_status      : 1,
                    invoice_number    : 1,
                    created_at        : 1,
                    totalPrice        : 1,
                    "supplier.supplier_image" : 1,
                    "supplier.supplier_name"     : 1,
                    "supplier.supplier_address"  : 1,
                }
            },
            { $sort : { created_at: -1 } },
            { $skip  : offset },
            { $limit : pageSize },
        ])
        .then((data) => {
            Order.countDocuments({order_status : filterKey})
            .then(totalItems => {
                const totalPages = Math.ceil(totalItems / pageSize);

                const responseData = {
                    data,
                    totalPages,
                    totalItems
                }
                callback({ code: 200, message: "List Fetched successfully", result: responseData });
            })
        })
        .catch((err) => {
            console.log(err);
            callback({ code: 400, message: "Error in fetching order list", result: err });
        })
      } catch (error) {
        callback({ code: 500, message: "Internal Server Error", result: error });
      }
    },
    //------------------------ buyer ------------------------//


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

    invoicesList: async (reqObj, callback) => {
      try {
        const {pageNo, pageSize, filterKey, buyer_id} = reqObj
  
        const page_no   = pageNo || 1
        const page_size = pageSize || 1
        const offset   = (page_no - 1) * page_size     
        
        Order.aggregate([
            {
                $match: { 
                    // buyer_id     : reqObj.buyer_id,
                    order_status : reqObj.filterKey
                }
            },
            {
              $lookup: {
                from         : "suppliers",
                localField   : "supplier_id",
                foreignField : "supplier_id",
                as           : "supplier"
              }
            },
            {
              $project: {
                order_id          : 1,
                buyer_id          : 1,
                buyer_company     : 1,
                supplier_id       : 1,
                items             : 1,
                payment_terms     : 1,
                est_delivery_time : 1,
                shipping_details  : 1,
                remarks           : 1,
                order_status      : 1,
                invoice_number    : 1,
                created_at        : 1,
                supplier          : { $arrayElemAt : ["$supplier", 0] }
              }
            },
            {
              $unwind : "$items" 
            },
            {
              $lookup: {
                from         : "medicines",
                localField   : "items.medicine_id",
                foreignField : "medicine_id",
                as           : "medicine"
              }
            },
            {
              $addFields: {
                "items.medicine_image": { $arrayElemAt: ["$medicine.medicine_image", 0] },
                "items.item_price": { $toDouble: { $arrayElemAt: [{ $split: ["$items.price", " "] }, 0] } } 
              }
            },
            {
              $group: {
                _id               : "$_id",
                order_id          : { $first: "$order_id" },
                buyer_id          : { $first: "$buyer_id" },
                buyer_company     : { $first: "$buyer_company" },
                supplier_id       : { $first: "$supplier_id" },
                items             : { $push: "$items" },
                payment_terms     : { $first: "$payment_terms" },
                est_delivery_time : { $first: "$est_delivery_time" },
                shipping_details  : { $first: "$shipping_details" },
                remarks           : { $first: "$remarks" },
                order_status      : { $first: "$order_status" },
                invoice_number    : { $first: "$invoice_number" },
                created_at        : { $first: "$created_at" },
                supplier          : { $first: "$supplier" },
                totalPrice        : { $sum: "$items.item_price" }
              }
            },
            {
                $project: {
                    order_id          : 1,
                    buyer_id          : 1,
                    buyer_company     : 1,
                    supplier_id       : 1,
                    items             : 1,
                    payment_terms     : 1,
                    est_delivery_time : 1,
                    shipping_details  : 1,
                    remarks           : 1,
                    order_status      : 1,
                    invoice_number    : 1,
                    created_at        : 1,
                    totalPrice        : 1,
                    "supplier.supplier_image" : 1,
                    "supplier.supplier_name"     : 1,
                    "supplier.supplier_address"  : 1,
                }
            },
            { $sort : { created_at: -1 } },
            { $skip  : offset },
            { $limit : page_size },
        ])
        .then((data) => {
            Order.countDocuments({order_status : filterKey})
            .then(totalItems => {
                const totalPages = Math.ceil(totalItems / page_size);

                const responseData = {
                    data,
                    totalPages,
                    totalItems
                }
                callback({ code: 200, message: "List Fetched successfully", result: responseData });
            })
        })
        .catch((err) => {
            console.log(err);
            callback({ code: 400, message: "Error in fetching order list", result: err });
        })
      } catch (error) {
        callback({ code: 500, message: "Internal Server Error", result: error });
      }
    },

    orderDetails : async (reqObj, callback) => {
      try {
          const {buyer_id, order_id, filterKey} = reqObj

          Order.aggregate([
              {
                  $match: { 
                      order_id     : order_id,
                      // buyer_id     : buyer_id,
                      // order_status : filterKey
                  }
              },
              {
                $lookup: {
                  from         : "suppliers",
                  localField   : "supplier_id",
                  foreignField : "supplier_id",
                  as           : "supplier"
                }
              },
              {
                $lookup: {
                  from         : "buyers",
                  localField   : "buyer_id",
                  foreignField : "buyer_id",
                  as           : "buyer"
                }
              },
              {
                $lookup: {
                  from         : "enquiries",
                  localField   : "enquiry_id",
                  foreignField : "enquiry_id",
                  as           : "enquiry"
                }
              },
              {
                $project: {
                  order_id          : 1,
                  enquiry_id :1,
                  purchaseOrder_id : 1,
                  buyer_id          : 1,
                  buyer_company     : 1,
                  supplier_id       : 1,
                  buyer_name : 1,
                  buyer_email : 1,
                  buyer_mobile:1,
                  buyer_address : 1,
                  supplier_name : 1,
                  supplier_email: 1,
                  supplier_address: 1,
                  supplier_mobile: 1,
                  items             : 1,
                  payment_terms     : 1,
                  deposit_requested: 1,
                  deposit_due : 1,
                  est_delivery_time : 1,
                  shipping_details  : 1,
                  remarks           : 1,
                  order_status      : 1,
                  status : 1,
                  invoice_number    : 1,
                  invoice_no        : 1,
                  invoice_date : 1,
                  payment_due_date: 1,
                  total_due_amount: 1,
                  logistics_details : 1,
                  coordinators : 1,
                  shipment_details : 1,
                  created_at        : 1,
                  supplier          : { $arrayElemAt: ["$supplier", 0] },
                  buyer          : { $arrayElemAt: ["$buyer", 0] },
                  enquiry          : { $arrayElemAt: ["$enquiry", 0] }
                }
              },
              {
                $unwind: "$items"
              },
              {
                $lookup: {
                  from         : "medicines",
                   localField   : "items.medicine_id",
                  foreignField : "medicine_id",
                  as           : "medicine"
                }
              },
              {
                $addFields: {
                  "items.medicine_image" : {$arrayElemAt : ["$medicine.medicine_image", 0] },
                  "items.drugs_name"     : {$arrayElemAt  : ["$medicine.drugs_name",0]},
                  "items.strength"     : {$arrayElemAt  : ["$medicine.strength",0]},
                  "items.item_price"     : { $toDouble: { $arrayElemAt: [{ $split: ["$items.price", " "] }, 0] } } 
                }
              },
              {
                $group: {
                  _id               : "$_id",
                  order_id          : { $first: "$order_id" },
                  buyer_id          : { $first: "$buyer_id" },
                  buyer_company     : { $first: "$buyer_company" },
                  buyer_name        : { $first: "$buyer_name" },
                  buyer_email        : { $first: "$buyer_email" },
                  buyer_address        : { $first: "$buyer_address" },
                  buyer_mobile        : { $first: "$buyer_mobile" },
                  supplier_name        : { $first: "$supplier_name" },
                  supplier_email        : { $first: "$supplier_email" },
                  supplier_mobile        : { $first: "$supplier_mobile" },
                  supplier_address  : { $first: "$supplier_address" },
                  supplier_type  : { $first: "$supplier_type" },
                  country_of_origin :  { $first: "$country_of_origin" },
                  supplier_id       : { $first: "$supplier_id" },
                  items             : { $push: "$items" },
                  payment_terms     : { $first: "$payment_terms" },

                  deposit_requested     : { $first: "$deposit_requested" },
                  deposit_due     : { $first: "$deposit_due" },
                  // payment_terms     : { $first: "$payment_terms" },

                  est_delivery_time : { $first: "$est_delivery_time" },
                  shipping_details  : { $first: "$shipping_details" },
                  remarks           : { $first: "$remarks" },
                  order_status      : { $first: "$order_status" },
                  status            : { $first: "$status" },
                  invoice_number    : { $first: "$invoice_number" },
                  invoice_no        : { $first: "$invoice_no" },
                  invoice_date : { $first: "$invoice_date" },
                  payment_due_date: { $first: "$payment_due_date" },
                  logistics_details : { $first: "$logistics_details" },
                  shipment_details : { $first: "$shipment_details" },
                  coordinators : { $first: "$coordinators" },
                  total_due_amount: { $first: "$total_due_amount" },
                  created_at        : {$first: "$created_at"},
                  supplier          : { $first: "$supplier" },
                  buyer         : { $first: "$buyer" },
                  enquiry         : { $first: "$enquiry" },
                  totalPrice        : { $sum: "$items.item_price" }
                }
              },
              {
                  $project: {
                    order_id          : 1,
                    enquiry_id :1,
                    purchaseOrder_id : 1,
                    buyer_id          : 1,
                    buyer_company     : 1,
                    supplier_id       : 1,
                    buyer_name : 1,
                    buyer_email : 1,
                    buyer_mobile:1,
                    buyer_address : 1,
                    supplier_name : 1,
                    supplier_email: 1,
                    supplier_address: 1,
                    supplier_mobile: 1,
                    supplier_type: 1,
                    items             : 1,
                    payment_terms     : 1,
                    deposit_requested: 1,
                    deposit_due : 1,
                    est_delivery_time : 1,
                    shipping_details  : 1,
                    remarks           : 1,
                    order_status      : 1,
                    status : 1,
                    invoice_number    : 1,
                    invoice_no        : 1,
                    invoice_date : 1,
                    payment_due_date: 1,
                    logistics_details: { $arrayElemAt: ["$logistics_details", 0] },
                    shipment_details : 1,
                    coordinators : 1,
                    total_due_amount : 1,
                    created_at        : 1,
                      totalPrice        : 1,
                      "supplier.supplier_image" : 1,
                      "supplier.supplier_name"  : 1,
                      "supplier.supplier_type"  : 1,
                      "supplier.estimated_delivery_time"  : 1,
                      "enquiry.enquiry_id"  : 1,
                      "enquiry.payment_terms"  : 1,
                      "buyer.buyer_image" : 1,
                      "buyer.buyer_name" : 1,
                      "buyer.buyer_email" : 1,
                      "buyer.buyer_mobile" : 1,
                      "buyer.buyer_type" : 1,
                  }
              }
          ])
          .then((data) => {
              callback({ code: 200, message: "Details Fetched successfully", result: data[0] });
          })
          .catch((err) => {
              console.log(err);
              callback({ code: 400, message: "Error in fetching order details", result: err });
          })
          
      } catch (error) {
          
      }
    },


  //   orderDetails: async (reqObj, callback) => {
  //     try {
  //         const { buyer_id, order_id, filterKey } = reqObj;
  
  //         Order.aggregate([
  //             {
  //                 $match: {
  //                     order_id: order_id,
  //                     // Uncomment if needed
  //                     // buyer_id: buyer_id,
  //                     // order_status: filterKey
  //                 }
  //             },
  //             {
  //                 $lookup: {
  //                     from: "suppliers",
  //                     localField: "supplier_id",
  //                     foreignField: "supplier_id",
  //                     as: "supplier"
  //                 }
  //             },
  //             {
  //                 $lookup: {
  //                     from: "buyers",
  //                     localField: "buyer_id",
  //                     foreignField: "buyer_id",
  //                     as: "buyer"
  //                 }
  //             },
  //             {
  //                 $lookup: {
  //                     from: "enquiries",
  //                     localField: "enquiry_id",
  //                     foreignField: "enquiry_id",
  //                     as: "enquiry"
  //                 }
  //             },
  //             {
  //                 $unwind: "$items"
  //             },
  //             {
  //                 $lookup: {
  //                     from: "medicines",
  //                     localField: "items.medicine_id",
  //                     foreignField: "medicine_id",
  //                     as: "medicine"
  //                 }
  //             },
  //             {
  //                 $addFields: {
  //                     "items.medicine_image": { $arrayElemAt: ["$medicine.medicine_image", 0] },
  //                     "items.drugs_name": { $arrayElemAt: ["$medicine.drugs_name", 0] },
  //                     "items.strength": { $arrayElemAt: ["$medicine.strength", 0] },
  //                     "items.item_price": { $toDouble: { $arrayElemAt: [{ $split: ["$items.price", " "] }, 0] } }
  //                 }
  //             },
  //             {
  //                 $addFields: {
  //                     "quantityRequiredInt": { $toInt: "$items.quantity_required" }
  //                 }
  //             },
  //             {
  //                 $addFields: {
  //                     "matchingInventory": {
  //                         $filter: {
  //                             input: "$medicine.inventory_info",
  //                             as: "info",
  //                             cond: {
  //                                 $and: [
  //                                     { $gte: ["$quantityRequiredInt", { $toInt: { $arrayElemAt: [{ $split: ["$$info.quantity", "-"] }, 0] } }] },
  //                                     { $lte: ["$quantityRequiredInt", { $toInt: { $arrayElemAt: [{ $split: ["$$info.quantity", "-"] }, 1] } }] }
  //                                 ]
  //                             }
  //                         }
  //                     }
  //                 }
  //             },
  //             {
  //                 $addFields: {
  //                     "items.est_delivery_days": {
  //                         $arrayElemAt: ["$matchingInventory.est_delivery_days", 0]
  //                     }
  //                 }
  //             },
  //             {
  //                 $group: {
  //                     _id: "$_id",
  //                     order_id: { $first: "$order_id" },
  //                     buyer_id: { $first: "$buyer_id" },
  //                     buyer_company: { $first: "$buyer_company" },
  //                     buyer_name: { $first: "$buyer_name" },
  //                     buyer_email: { $first: "$buyer_email" },
  //                     buyer_mobile: { $first: "$buyer_mobile" },
  //                     buyer_address: { $first: "$buyer_address" },
  //                     supplier_name: { $first: "$supplier_name" },
  //                     supplier_email: { $first: "$supplier_email" },
  //                     supplier_mobile: { $first: "$supplier_mobile" },
  //                     supplier_address: { $first: "$supplier_address" },
  //                     supplier_type: { $first: "$supplier_type" },
  //                     country_of_origin: { $first: "$country_of_origin" },
  //                     supplier_id: { $first: "$supplier_id" },
  //                     items: { $push: "$items" },
  //                     payment_terms: { $first: "$payment_terms" },
  //                     deposit_requested: { $first: "$deposit_requested" },
  //                     deposit_due: { $first: "$deposit_due" },
  //                     est_delivery_time: { $first: "$est_delivery_time" },
  //                     shipping_details: { $first: "$shipping_details" },
  //                     remarks: { $first: "$remarks" },
  //                     order_status: { $first: "$order_status" },
  //                     status: { $first: "$status" },
  //                     invoice_number: { $first: "$invoice_number" },
  //                     invoice_no: { $first: "$invoice_no" },
  //                     invoice_date: { $first: "$invoice_date" },
  //                     payment_due_date: { $first: "$payment_due_date" },
  //                     logistics_details: { $first: "$logistics_details" },
  //                     shipment_details: { $first: "$shipment_details" },
  //                     coordinators: { $first: "$coordinators" },
  //                     total_due_amount: { $first: "$total_due_amount" },
  //                     created_at: { $first: "$created_at" },
  //                     supplier: { $first: "$supplier" },
  //                     buyer: { $first: "$buyer" },
  //                     enquiry: { $first: "$enquiry" },
  //                     totalPrice: { $sum: "$items.item_price" }
  //                 }
  //             },
  //             {
  //                 $project: {
  //                     order_id: 1,
  //                     enquiry_id: 1,
  //                     purchaseOrder_id: 1,
  //                     buyer_id: 1,
  //                     buyer_company: 1,
  //                     supplier_id: 1,
  //                     buyer_name: 1,
  //                     buyer_email: 1,
  //                     buyer_mobile: 1,
  //                     buyer_address: 1,
  //                     supplier_name: 1,
  //                     supplier_email: 1,
  //                     supplier_mobile: 1,
  //                     supplier_address: 1,
  //                     supplier_type: 1,
  //                     items: 1,
  //                     payment_terms: 1,
  //                     deposit_requested: 1,
  //                     deposit_due: 1,
  //                     est_delivery_time: 1,
  //                     shipping_details: 1,
  //                     remarks: 1,
  //                     order_status: 1,
  //                     status: 1,
  //                     invoice_number: 1,
  //                     invoice_no: 1,
  //                     invoice_date: 1,
  //                     payment_due_date: 1,
  //                     logistics_details: { $arrayElemAt: ["$logistics_details", 0] },
  //                     shipment_details: 1,
  //                     coordinators: 1,
  //                     total_due_amount: 1,
  //                     created_at: 1,
  //                     totalPrice: 1,
  //                     "supplier.supplier_image": 1,
  //                     "supplier.supplier_name": 1,
  //                     "supplier.supplier_type": 1,
  //                     "enquiry.enquiry_id": 1,
  //                     "enquiry.payment_terms": 1,
  //                     "buyer.buyer_image": 1,
  //                     "buyer.buyer_name": 1,
  //                     "buyer.buyer_email": 1,
  //                     "buyer.buyer_mobile": 1,
  //                     "buyer.buyer_type": 1
  //                 }
  //             }
  //         ])
  //             .then((data) => {
  //                 callback({ code: 200, message: "Details Fetched successfully", result: data[0] });
  //             })
  //             .catch((err) => {
  //                 console.log(err);
  //                 callback({ code: 400, message: "Error in fetching order details", result: err });
  //             });
  //     } catch (error) {
  //         callback({ code: 500, message: "Server error", result: error });
  //     }
  // },
  
  
  
  


    //------------------------ supplier/buyer ------------------------//

   //------------------------ medicine ------------------------//

    acceptRejectAddMedicineReq : async(reqObj, callback) => {
      try {
        const { medicine_id, supplier_id, action } = reqObj

        const medicine = await Medicine.findOne({ medicine_id : medicine_id, supplier_id: supplier_id});
  
        if (!medicine) {
            return callback({code: 400, message: "medicine not found" });
        }

        const newMedicineStatus = action === 'accept' ? 1 : action === 'reject' ? 2 : ''
       
        const updateStatus = await Medicine.findOneAndUpdate(
            { medicine_id : medicine_id, supplier_id : supplier_id },
            { status      : newMedicineStatus },
            { new         : true }
        );

        if (!updateStatus) {
          return callback({ code: 400, message: "Failed to update medicine status" });
        } else {
          callback({ code: 200, message: `${updateStatus.status === 1 ? 'Medicine Added successfully': updateStatus.status === 2 ? 'Add medicine request rejected' : ''}`,result: updateStatus});
        }

      } catch (error) {
        console.log('Internal Sever Error:',error)
        callback({code: 500, message: 'Internal Server Error', result: error})
      }
    },
    
    allMedicineList: async (reqObj, callback) => {
      try {
        const {searchKey, pageNo, pageSize, medicine_type, status} = reqObj
  
        const page_no   = pageNo || 1
        const page_size = pageSize || 10
        const offset    = (page_no - 1) * page_size
  
        if(searchKey === '' || searchKey === undefined) {
          Medicine.aggregate([
            {
              $match: {
                // 'medicine_type': medicine_type,
                status       : status
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
                status            : 1,
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
                status            : 1,
                "inventory.delivery_info"  : 1,
                "inventory.price"          : 1,
              },
            },
            { $skip: offset },
            { $limit: page_size },
          ])
            .then((data) => {
              Medicine.countDocuments({status: status})
              .then(totalItems => {
                  const totalPages = Math.ceil(totalItems / page_size);
                  const returnObj = {
                    data,
                    totalPages,
                    totalItems
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

    acceptRejectEditMedicineReq : async(reqObj, callback) => {
      try {
            const { medicine_id, supplier_id, action } = reqObj;

            const medicine = await EditMedicine.findOne({ medicine_id: medicine_id, supplier_id: supplier_id });

            if (!medicine) {
              return callback({ code: 400, message: "Medicine edit request not found" });
            }

            const editMedicineStatus = action === 'accept' ? 1 : action === 'reject' ? 2 : '';

            if (editMedicineStatus === 1) {
              let updateObj = {
                medicine_id       : medicine.medicine_id,
                supplier_id       : medicine.supplier_id,
                medicine_name     : medicine.medicine_name,
                composition       : medicine.composition,
                strength          : medicine.strength,
                type_of_form      : medicine.type_of_form,
                shelf_life        : medicine.shelf_life,
                dossier_type      : medicine.dossier_type,
                dossier_status    : medicine.dossier_status,
                medicine_category : medicine.medicine_category,
                total_quantity    : medicine.total_quantity,
                gmp_approvals     : medicine.gmp_approvals,
                shipping_time     : medicine.shipping_time,
                tags              : medicine.tags,
                country_of_origin : medicine.country_of_origin,
                registered_in     : medicine.registered_in,
                stocked_in        : medicine.stocked_in,
                available_for     : medicine.available_for,
                description       : medicine.description,
                medicine_image    : medicine.medicine_image,
              };

              if (medicine.medicine_type === 'new_medicine') {
                updateObj.medicine_type  = 'new';
                updateObj.inventory_info = medicine.inventory_info ;
              } else if (medicine.medicine_type === 'secondary_medicine') {
                updateObj.medicine_type        = 'secondary market';
                updateObj.purchased_on         = medicine.purchased_on;
                updateObj.country_available_in = medicine.country_available_in;
                updateObj.min_purchase_unit    = medicine.min_purchase_unit;
                updateObj.unit_price           = medicine.unit_price;
                updateObj.invoice_image        = medicine.invoice_image;
              }

              try {
                await EditMedicine.findOneAndUpdate(
                  { supplier_id: supplier_id, medicine_id: medicine_id },
                  { $set: { edit_status: editMedicineStatus } }
                );

                let updatedMedicine

                if(medicine.medicine_type === 'new_medicine') {
                updatedMedicine = await NewMedicine.findOneAndUpdate(
                    { supplier_id: supplier_id, medicine_id: medicine_id },
                    { $set: updateObj },
                    { new: true }
                  );
                } else if(medicine.medicine_type === 'secondary_medicine') {
                  updatedMedicine = await SecondaryMarketMedicine.findOneAndUpdate(
                    { supplier_id: supplier_id, medicine_id: medicine_id },
                    { $set: updateObj },
                    { new: true }
                  );
                }

                if (!updatedMedicine) {
                  return callback({ code: 400, message: "Medicine not found for update" });
                }

                return callback({ code: 200, message: `${medicine.medicine_type === 'new_medicine' ? 'New' : 'Secondary'} medicine details updated successfully`, result: updatedMedicine });

              } catch (error) {
                console.error('Error updating medicine details:', error);
                return callback({ code: 400, message: 'Error while updating medicine details', result: error });
              }
            } else if (editMedicineStatus === 2) {
              try {
                const result = await EditMedicine.findOneAndUpdate(
                  { supplier_id: supplier_id, medicine_id: medicine_id },
                  { $set: { edit_status: editMedicineStatus } }
                );

                return callback({ code: 200, message: 'Edit medicine request rejected', result: result });

              } catch (error) {
                console.error('Error rejecting edit request:', error);
                return callback({ code: 400, message: 'Error while rejecting the edit request', result: error });
              }
            }
      } catch (error) {
        console.error('Unexpected error:', error);
        return callback({ code: 500, message: 'Unexpected error', result: error });
      }
    },

    medicineEditList : async (reqObj, callback) => {
      try {
        const { status, pageNo, pageSize, medicine_id, supplier_id } = reqObj

         const page_no   = pageNo || 1
         const page_size = pageSize || 10
         const offset    = (page_no - 1) * page_size

         EditMedicine.find({edit_status: status}).sort({createdAt: -1}).skip(offset).limit(page_size)
         .then((data) => {
            callback({code: 200, message: 'Medicine Edit List', result: data})
         })
         .catch((err) => {
          callback({code: 400, message: 'Error while fetching medicine edit list', result: err})
         })
      } catch (error) {
        callback({code: 500, message: 'Internal server error', result: error})
      }
    },

    deleteMedicine : async(reqObj, callback) => {
      try {
        const { medicine_id, supplier_id } = reqObj
          
        Medicine.findOneAndUpdate(
          { medicine_id: medicine_id, supplier_id: supplier_id },
          { $set: { status: 3 } },
          { new: true }
        )
        .then((result) => {
          callback({ code: 200, message: 'Updated successfully', result: result });
        })
        .catch((err) => {
          callback({ code: 400, message: 'Error while updating', result: err });
        });
      } catch (error) {
        console.log('Internal server error',err);
        callback({ code: 500, message: 'Internal server error', result: error });
      }
    },
    //------------------------------ medicine -------------------------------//


    //----------------------------- support -------------------------------------//
    
    // supportList : async(reqObj, callback) => {
    //   try {
    //      const {pageNo, pageSize } = reqObj
 
    //      const page_no   = pageNo || 1
    //      const page_size = pageSize || 1
    //      const offset    = (page_no - 1) * page_size 
 
    //      Support.find().skip(offset).limit(page_size).then((data) => {
    //        Support.countDocuments().then((totalItems) => {
    //          const totalPages = Math.ceil(totalItems / page_size)
    //          const returnObj =  {
    //            data,
    //            totalPages
    //          }
    //          callback({code: 200, message : 'support list fetched successfully', result: returnObj})
    //        })
    //        .catch((err) => {
    //          console.log(err);
    //          callback({code: 400, message : 'error while fetching support list count', result: err})
    //        })
    //      })
    //      .catch((err) => {
    //        console.log(err);
    //        callback({code: 400, message : 'error while fetching support list', result: err})
    //      })
 
    //   } catch (error) {
    //    callback({code: 500, message : 'Internal Server Error', result: error})
    //   }
    // },

    supportList: async (reqObj, callback) => {
      try {
        const { pageNo, pageSize, filterKey, supportType } = reqObj;
    
        const page_no   = pageNo || 1;
        const page_size = pageSize || 2;
        const offSet    = (page_no - 1) * page_size;

        let filterCondition = {};
       
        if (filterKey === 'buyer') {
          filterCondition = { user_type: 'buyer' };
        } else if (filterKey === 'supplier') {
          filterCondition = { user_type: 'supplier' };
        }

        if (supportType) {
          filterCondition.support_type = supportType;
        }
    
        const data       = await Support.find(filterCondition).select().sort({createdAt: -1}).skip(offSet).limit(page_size);
        const totalItems = await Support.countDocuments(filterCondition);
    
        const totalPages = Math.ceil(totalItems / page_size);
        const returnObj = {
          data,
          totalPages,
          totalItems
        };
    
        callback({ code: 200, message: 'Support list fetched successfully', result: returnObj });
      } catch (error) {
        console.error('Error:', error);
        callback({ code: 500, message: 'Internal server error', result: error });
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
    },

    //----------------------------- support -------------------------------------//



    //----------------------------- dashboard details -------------------------------------//
    adminDashboardDataList: async (reqObj, callback) => {
      try {
    
        const orderDataList = Order.aggregate([
          {
            $addFields: {
              numeric_total_price: {
                $toDouble: {
                  $arrayElemAt: [{ $split: ["$total_price", " "] }, 0]
                }
              }
            }
          },
          {
            $facet: {
              completedCount: [
                { $match: { order_status: 'completed' } },
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 },
                    total_purchase: { $sum: "$numeric_total_price" }
                  }
                },
                {
                  $project: {
                    _id: 0,
                    count: 1,
                    total_purchase: 1
                  }
                }
              ],
              activeCount: [
                { $match: { order_status: 'active' } },
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 },
                    total_purchase: { $sum: "$numeric_total_price" }
                  }
                },
                {
                  $project: {
                    _id: 0,
                    count: 1,
                    total_purchase: 1
                  }
                }
              ],
              pendingCount: [
                { $match: { order_status: 'pending' } },
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 },
                    total_purchase: { $sum: "$numeric_total_price" }
                  }
                },
                {
                  $project: {
                    _id: 0,
                    count: 1,
                    total_purchase: 1
                  }
                }
              ],
              totalPurchaseAmount: [
                {
                  $group: {
                    _id: null,
                    total_purchase: { $sum: "$numeric_total_price" }
                  }
                },
                {
                  $project: {
                    _id: 0,
                    total_purchase: 1
                  }
                }
              ]
            }
          }
        ]);
    
        const buyerRegReqList = Buyer.aggregate([
          {
            $facet: {
              regReqCount: [
                { $match: { account_status: 0 } },
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 }
                  }
                },
                {
                  $project: {
                    _id: 0,
                    count: 1
                  }
                }
              ],
              acceptedReqCount: [
                { $match: { account_status: 1 } },
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 }
                  }
                },
                {
                  $project: {
                    _id: 0,
                    count: 1
                  }
                }
              ]
            }
          }
        ]);

        const supplierrRegReqList = Supplier.aggregate([
          {
            $facet: {
              regReqCount: [
                { $match: { account_status: 0 } },
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 }
                  }
                },
                {
                  $project: {
                    _id: 0,
                    count: 1
                  }
                }
              ],
              acceptedReqCount: [
                { $match: { account_status: 1 } },
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 }
                  }
                },
                {
                  $project: {
                    _id: 0,
                    count: 1
                  }
                }
              ]
            }
          }
        ]);

        const supplierCountry = Supplier.aggregate([
          {
            $group: {
              _id: "$country_of_origin",
              count: { $sum: 1 }
            }
          },
          {
            $sort: { count: -1 }
          },
          {
            $limit: 3
          },
          {
            $project: {
              _id: 0,
              country: "$_id",
              count: 1
            }
          }
        ])

        const buyerCountry = Buyer.aggregate([
          {
            $group: {
              _id: "$country_of_origin",
              count: { $sum: 1 }
            }
          },
          {
            $sort: { count: -1 }
          },
          {
            $limit: 3
          },
          {
            $project: {
              _id: 0,
              country: "$_id",
              count: 1
            }
          }
        ])

        const [orderData, buyerData, supplierData, supplierCountryData, buyerCountryData ] = await Promise.all([orderDataList, buyerRegReqList, supplierrRegReqList, supplierCountry, buyerCountry]);

        const result = {
          ...orderData[0],
          supplierCountryData,
          buyerCountryData,
          buyerRegisReqCount       : (buyerData[0].regReqCount && buyerData[0].regReqCount[0]) ? buyerData[0].regReqCount[0] : { count: 0 },
          buyerAcceptedReqCount    : (buyerData[0].acceptedReqCount && buyerData[0].acceptedReqCount[0]) ? buyerData[0].acceptedReqCount[0] : { count: 0 },
          supplierRegisReqCount    : (supplierData[0].regReqCount && supplierData[0].regReqCount[0]) ? supplierData[0].regReqCount[0] : { count: 0 },
          supplierAcceptedReqCount : (supplierData[0].acceptedReqCount && supplierData[0].acceptedReqCount[0]) ? supplierData[0].acceptedReqCount[0] : { count: 0 },
        };
    
        callback({ code: 200, message: 'Dashboard data list fetched successfully', result });
      } catch (error) {
        console.log('Internal Server Error', error);
        callback({ code: 500, message: 'Internal server error', result: error });
      }
    },
    
    //----------------------------- dashboard details -------------------------------------//


    //----------------------------- order -------------------------------------//

    // buyerInvoicesList: async (reqObj, callback) => {
    //   try {
    //     const {page_no, limit, filterKey, buyer_id} = reqObj
  
    //     const pageNo   = page_no || 1
    //     const pageSize = limit || 1
    //     const offset   = (pageNo - 1) * pageSize     
        
    //     Order.aggregate([
    //         {
    //             $match: { 
    //                 // buyer_id     : reqObj.buyer_id,
    //                 // order_status : reqObj.filterKey
    //                 order_status : 'pending'
    //             }
    //         },
    //         {
    //           $lookup: {
    //             from         : "suppliers",
    //             localField   : "supplier_id",
    //             foreignField : "supplier_id",
    //             as           : "supplier"
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
    //             invoice_number    : 1,
    //             created_at        : 1,
    //             supplier          : { $arrayElemAt : ["$supplier", 0] }
    //           }
    //         },
    //         {
    //           $unwind : "$items" 
    //         },
    //         {
    //           $lookup: {
    //             from         : "medicines",
    //             localField   : "items.product_id",
    //             foreignField : "medicine_id",
    //             as           : "medicine"
    //           }
    //         },
    //         {
    //           $addFields: {
    //             "items.medicine_image": { $arrayElemAt: ["$medicine.medicine_image", 0] },
    //             "items.item_price": { $toDouble: { $arrayElemAt: [{ $split: ["$items.price", " "] }, 0] } } 
    //           }
    //         },
    //         {
    //           $group: {
    //             _id               : "$_id",
    //             order_id          : { $first: "$order_id" },
    //             buyer_id          : { $first: "$buyer_id" },
    //             buyer_company     : { $first: "$buyer_company" },
    //             supplier_id       : { $first: "$supplier_id" },
    //             items             : { $push: "$items" },
    //             payment_terms     : { $first: "$payment_terms" },
    //             est_delivery_time : { $first: "$est_delivery_time" },
    //             shipping_details  : { $first: "$shipping_details" },
    //             remarks           : { $first: "$remarks" },
    //             order_status      : { $first: "$order_status" },
    //             invoice_number    : { $first: "$invoice_number" },
    //             created_at        : { $first: "$created_at" },
    //             supplier          : { $first: "$supplier" },
    //             totalPrice        : { $sum: "$items.item_price" }
    //           }
    //         },
    //         {
    //             $project: {
    //                 order_id          : 1,
    //                 buyer_id          : 1,
    //                 buyer_company     : 1,
    //                 supplier_id       : 1,
    //                 items             : 1,
    //                 payment_terms     : 1,
    //                 est_delivery_time : 1,
    //                 shipping_details  : 1,
    //                 remarks           : 1,
    //                 order_status      : 1,
    //                 invoice_number    : 1,
    //                 created_at        : 1,
    //                 totalPrice        : 1,
    //                 "supplier.supplier_image" : 1,
    //                 "supplier.supplier_name"     : 1,
    //                 "supplier.supplier_address"  : 1,
    //             }
    //         },
    //         { $sort : { created_at: -1 } },
    //         // { $skip  : offset },
    //         // { $limit : pageSize },
    //     ])
    //     .then((data) => {
    //         Order.countDocuments({order_status : filterKey, buyer_id: buyer_id})
    //         .then(totalItems => {
    //             const totalPages = Math.ceil(totalItems / pageSize);

    //             const responseData = {
    //                 data,
    //                 totalPages,
    //                 totalItems
    //             }
    //             callback({ code: 200, message: "List Fetched successfully", result: responseData });
    //         })
    //     })
    //     .catch((err) => {
    //         console.log(err);
    //         callback({ code: 400, message: "Error in fetching order list", result: err });
    //     })
    //   } catch (error) {
    //     callback({ code: 500, message: "Internal Server Error", result: error });
    //   }
    // },

   
    

    //----------------------------- order -------------------------------------//


    getNotificationList : async(reqObj, callback) => {
      try {
        const { buyer_id, pageNo, pageSize } = reqObj;
    
        const page_no   = pageNo || 1;
        const page_size = pageSize || 100;
        const offset    = (page_no - 1) * page_size;
    
        Notification.aggregate([
          {
            $match: {
              // to_id: buyer_id,
              to : 'admin'
            }
          },
          {
            $lookup: {
              from         : "suppliers",
              localField   : "from_id",
              foreignField : "supplier_id",
              as           : "supplier"
            }
          },
          {
            $lookup: {
              from         : "buyers",
              localField   : "from_id",
              foreignField : "buyer_id",
              as           : "buyer"
            }
          },
          {
            $project: {
              notification_id: 1,
              event: 1,
              event_type: 1,
              from: 1,
              to: 1,
              from_id: 1,
              to_id: 1,
              event_id: 1,
              connected_id: 1,
              link_id : 1,
              message: 1,
              status : 1,
              createdAt: 1,
              updatedAt: 1,
              fromDetails: {
                $cond: {
                  if: { $gt: [{ $size: "$supplier" }, 0] },
                  then: { $arrayElemAt: ["$supplier", 0] },
                  else: { $arrayElemAt: ["$buyer", 0] }
                }
              }
            }
          },
          { $sort  : { createdAt: -1 } },
          { $skip  : offset },
          { $limit : page_size },
        ])
        .then(async (data) => {
          const totalItems = await Notification.countDocuments({ to: 'admin'});
          const totalPages = Math.ceil(totalItems / page_size);
    
          const returnObj = {
            data,
            totalPages,
            totalItems
          };
          callback({code: 200, message: "List fetched successfully", result: returnObj});
        })
        .catch((err) => {
          console.log(err);
          callback({code: 400, message: 'Error while fetching buyer list', result: err});
        });
      } catch (error) {
        console.error(error);
        callback({ code: 500, message: "Internal Server Error", result: error });
      }
    },
    

    getNotificationDetailsList : async(reqObj, callback) => {
      try {
        const { buyer_id, pageNo, pageSize } = reqObj
    
        const page_no   = pageNo || 1
        const page_size = pageSize || 5
        const offset    = (page_no - 1) * page_size 
    
        Notification.aggregate([
          {
            $match: {
              to : 'admin'
            }
          },
          {
            $lookup: {
              from         : "suppliers",
              localField   : "from_id",
              foreignField : "supplier_id",
              as           : "supplier"
            }
          },
          {
            $lookup: {
              from         : "buyers",
              localField   : "from_id",
              foreignField : "buyer_id",
              as           : "buyer"
            }
          },
          {
            $project: {
              notification_id: 1,
              event: 1,
              event_type: 1,
              from: 1,
              to: 1,
              from_id: 1,
              to_id: 1,
              event_id: 1,
              connected_id: 1,
              link_id : 1,
              message: 1,
              status : 1,
              createdAt: 1,
              updatedAt: 1,
              fromDetails: {
                $cond: {
                  if: { $gt: [{ $size: "$supplier" }, 0] },
                  then: { $arrayElemAt: ["$supplier", 0] },
                  else: { $arrayElemAt: ["$buyer", 0] }
                }
              }
            }
          },
          { $sort  : {createdAt: -1} },
          { $skip  : offset },
          { $limit : page_size },
          
        ])
        .then( async(data) => {
          const totalItems = await Notification.countDocuments({ to: 'admin'});
          const totalPages = Math.ceil(totalItems / page_size);
    
          const returnObj = {
              data,
              totalPages,
              totalItems
          };
          callback({code: 200, message: "List fetched successfully", result: returnObj})
        })
        .catch((err) => {
          console.log(err);
          callback({code: 400, message : 'error while fetching buyer list', result: err})
        })
      } catch (error) {
        console.error(error);
        callback({ code: 500, message: "Internal Server Error", result: error });
      }
    },
    

    updateStatus : async(reqObj, callback) => {
      console.log(reqObj);
      try {
        const { notification_id, status } = reqObj

        const updateNotification = await Notification.findOneAndUpdate(
          { notification_id : notification_id },
          {
              $set: {
                status: status,
                // status            : 'Awaiting Details from Seller'
              }
          },
          { new: true } 
      );
      if (!updateNotification) {
          return callback({ code: 404, message: 'Notification not found', result: null });
      }
      callback({ code: 200, message: "Status Updated", result: updateNotification });

      } catch (error) {
        console.log(error);
        callback({ code: 500, message: "Internal Server Error", result: error });
      }
    },
}