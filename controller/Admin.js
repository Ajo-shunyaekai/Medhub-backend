const bcrypt             = require('bcrypt');
const jwt                = require('jsonwebtoken');
const Admin              = require('../schema/adminSchema')
const User               = require('../schema/userSchema')
const Medicine           = require('../schema/medicineSchema')
const MedicineInventory  = require('../schema/medicineInventorySchema')

module.exports = {

    register : async(reqObj, callback) => {

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
              callback(200)
            }) .catch((err) => {
              console.error('Error', err);
              callback(400)
            })
          })
          .catch((error) => {
            console.error('Error generating salt or hashing password:', error);
            callback(500);
          }) 
    },

    login : async(reqObj, callback) => {
      const password = reqObj.password
      const email    = reqObj.email

      try {
        const admin = await Admin.findOne({ email: email });

        if (!admin) {
            console.log('Not found');
            return callback(404);
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if (isMatch) {
            console.log('Validation successful');
            callback(200);
        } else {
            console.log('Validation not successful');
            callback(401);
        }
      }catch (error) {
        console.error('Error validating user:', error);
        callback(500);
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

}