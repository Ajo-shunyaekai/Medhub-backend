const bcrypt             = require('bcrypt');
const jwt                = require('jsonwebtoken');
const generator          = require('generate-password');
const Admin              = require('../schema/adminSchema')
const User               = require('../schema/userSchema')
const Supplier           = require('../schema/supplierSchema')
const Buyer              = require('../schema/buyerSchema')
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

    getSupplierList: async(reqObj, callback) => {
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
          callback({code: 200, message : 'Supplier list fetched successfully', result: data})
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
          callback({code: 200, message : 'Supplier registration request list fetched successfully', result:data})
      }).catch((error) => {
          console.error('Error:', error);
          callback({code: 400, message : 'Error in fetching suppliers registration request list', result: error})
      });
      }catch (err) {
        callback({code: 500, message : 'Internal server error'})
      }
    },

    acceptRejectSupplierRegReq : async(reqObj, callback) => {
      try {
        const { supplier_id, action } = reqObj

        const supplier = await Supplier.findOne({ supplier_id : supplier_id });
  
        if (!supplier) {
            return callback({code: 400, message: "Supplier not found" });
        }

        const newStatus = action === 'accept' ? 1 : action === 'reject' ? 2 : ''

       
        const updateProfile = await Supplier.findOneAndUpdate(
            { supplier_id : supplier_id },
            { status      : newStatus },
            { new         : true }
        );

        if (!updateProfile) {
          return callback({ code: 400, message: "Failed to update supplier status" });
      }

      let password
      
        if (updateProfile) {
           if(updateProfile.status === 1) {
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
            supplier_mobile_no    : updateProfile.supplier_mobile_no,
            supplier_country_code : updateProfile.supplier_country_code,
            status                : updateProfile.status,
            password              : updateProfile.password,
            generatedPassword     : password
          }

          callback({ code: 200, message: `${updateProfile.status === 1 ? 'Supplier registration accepted successfully': updateProfile.status === 2 ? ' Supplier registration rejected' : ''}`,result: returnObj});
        } else {
            callback({code:400,  message: "Failed to update user status" });
        }

      } catch (error) {
        console.log('Internal Sever Error:',error)
        callback({code: 500, message: 'Internal Server Error', result: error})
      }
    },

    getBuyerList: async(reqObj, callback) => {
      try {
        const { pageNo, limit } = reqObj

        const fields = {
          buyer_id                 : 1,
          company_name             : 1,
          buyer_name               : 1,
          buyer_email              : 1,
          buyer_mobile_no          : 1,
          buyer_country_code       : 1,
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

        Buyer.find({}).select(fields).limit(1).then((data) => {
          callback({code: 200, message: 'Buyer list fetched successfully', result: data})
        })
        .catch((err) => {
          callback({code: 400, message:'Error while fetching buyer list', result: err })
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
          buyer_id                 : 1,
          company_name             : 1,
          buyer_name               : 1,
          buyer_email              : 1,
          buyer_mobile_no          : 1,
          buyer_country_code       : 1,
          status                   : 1
        };

        Buyer.find({status : 0}).select(fields).limit(2).then((data) => {
          callback({code: 200, message: 'Buyer Registration Request List fetched Successfully', result: data})
        })
        .catch((err) => {
          callback({code: 400, message: 'Error while fetching buyer registration requests list', result: err})
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
            return callback({code: 400, message: "Buyer not found" });
        }

        const newStatus = action === 'accept' ? 1 : action === 'reject' ? 2 : ''
       
        const updateStatus = await Buyer.findOneAndUpdate(
            { buyer_id    : buyer_id },
            { status      : newStatus },
            { new         : true }
        );

        if (!updateStatus) {
          return callback({ code: 400, message: "Failed to update buyer status" });
      }

      let password
      
        if (updateStatus) {
           if(updateStatus.status === 1) {
              password = generatePassword()
            
            const saltRounds      = 10
            const hashedPassword  = await bcrypt.hash(password, saltRounds);
            updateStatus.password = hashedPassword;
            
            await updateStatus.save();
           }
          
          const returnObj = {
            supplier_id           : updateStatus.supplier_id,
            supplier_name         : updateStatus.supplier_name,
            supplier_email        : updateStatus.supplier_email,
            supplier_mobile_no    : updateStatus.supplier_mobile_no,
            supplier_country_code : updateStatus.supplier_country_code,
            status                : updateStatus.status,
            password              : updateStatus.password,
            generatedPassword     : password
          }

          callback({ code: 200, message: `${updateProfile.status === 1 ? 'Buyer registration accepted successfully': updateProfile.status === 2 ? 'Buyer registration rejected' : ''}`,result: returnObj});
        } else {
            callback({code:400,  message: "Failed to update buyer status" });
        }

      } catch (error) {
        console.log('Internal Sever Error:',error)
        callback({code: 500, message: 'Internal Server Error', result: error})
      }
    },


}