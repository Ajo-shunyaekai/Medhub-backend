require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const User   = require('../schema/userSchema');
const logErrorToFile = require('../logs/errorLogs');
const { sendErrorResponse } = require('../utils/commonResonse');

module.exports = {

    register : async (req, res, reqObj, callback) => {
        try {
          const emailExists = await User.findOne({email : reqObj.email})
          if(emailExists) {
            return callback({code : 409, message: "Email already exists"})
          }
          const userId     = 'USR-' + Math.random().toString(16).slice(2);
          let jwtSecretKey =  process.env.APP_SECRET; 
          let data         =  {time : Date(), userId : userId } 
          const token      =  jwt.sign(data, jwtSecretKey); 

          const newUser = new User({
              user_id        : userId,
              first_name     : reqObj.first_name,
              last_name      : reqObj.last_name,
              mobile         : reqObj.mobile,
              country_code   : reqObj.countryCode,
              email          : reqObj.email,
              password       : reqObj.password,
              token          : token,
              status         : 1
            });
            
            const saltRounds = 10
            bcrypt.genSalt(saltRounds).then((salt) => {
              return bcrypt.hash(newUser.password, salt)
            })
            .then((hashedPassword) => {
              newUser.password = hashedPassword
              newUser.save() .then(() => {
                callback({code: 200, message: "Registration Successfull"})
              }).catch((err) => {
                callback({code: 400 , message: "Registration Failed"})
              })
            })
            .catch((error) => {
              callback({code: 401});
            }) 
        } catch (error) {
          console.error("Internal Server Error:", error);
          logErrorToFile(error, req);
          return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
        }
    },
    
    login : async (req, res, reqObj, callback) => {
      const password = reqObj.password
      const email    = reqObj.email

      try {
        const user = await User.findOne({ email: email });

        if (!user) {
            return callback({code: 404, message: 'Invalid Email'});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            callback({code : 200, message: 'Login successfull'});
        } else {
            callback({code: 401, message: 'Invalid Password'});
        }
      }catch (error) {
        console.error("Internal Server Error:", error);
        logErrorToFile(error, req);
        return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
     }
    },

    //save the generated opt in user collection
    saveOtp : async (req, res, reqObj, callback) => {
      const otp   = reqObj.otp
      const email = reqObj.email

      try {
        User.findOneAndUpdate({ email: email },{ otp: otp }).then((data) => {
          callback({code: 200, message: 'OTP Send successfully' });
        })
        .catch((err) => {
          callback({code: 400, message: 'Error in saving OTP' });
        })
      }catch (error) {
        console.error("Internal Server Error:", error);
        logErrorToFile(error, req);
        return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
     }
    },

    //verify the otp for the user
    verifyOtp : async (req, res, reqObj, callback) => {
      try {
        const otp   = reqObj.otp
        const email = reqObj.email

        const user = await User.findOne({ email: email });

        if (!user) {
          return callback({code: 404, message: 'Invalid Email'});
        }

        if(user.otp === otp){
          callback({code: 200, message: 'Login Successfull' });
        } else {
          callback({code: 400, message: 'Invalid OTP' });
        }

      }catch (error) {
        console.error("Internal Server Error:", error);
        logErrorToFile(error, req);
        return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
     }
    },

    updatePassword : async (req, res, reqObj, callback) => {
      const current_password = reqObj.current_password
      const new_password     = reqObj.new_password
      const user_id          = reqObj.user_id

    try {
      const user = await User.findOne({ user_id: user_id });

      if (!user) {
          return callback({ code: 404, message: 'User Not Found' });
      }
      const isMatch = await bcrypt.compare(current_password, user.password);

      if (!isMatch) {
          return callback({ code: 401, message: 'Password Validation Failed' });
      }
      const hashedPassword = await bcrypt.hash(new_password, 10);

      const updatedUser = await User.findOneAndUpdate({ user_id: user_id },{ password: hashedPassword }, { new: true });

      if (updatedUser) {
          callback({ code: 200, message: 'Password updated successfully'});
      } else {
          callback({ code: 500, message: 'Error in updating the password'});
      }
    } catch (error) {
      console.error("Internal Server Error:", error);
      logErrorToFile(error, req);
      return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
    }
    },

    editProfile : async (req, res, reqObj, callback) => {
      try {
        const user_id = reqObj.user_id

        const user = await User.findOne({ user_id: user_id });

        if (!user) {
            return callback({ code: 404, message: 'User Not Found' });
        }
        const updateProfile = await User.findOneAndUpdate({user_id: user_id}, {first_name: reqObj.first_name}, {last_name: reqObj.last_name},
                              {mobile_no: reqObj.mobile_no},{new: true})

          if(updateProfile){
            callback({ code: 200, message: 'Profile updated successfully'});
          } else {
            callback({ code: 400, message: 'Error in updating the profile'});
          }
      } catch (error) {
        console.error("Internal Server Error:", error);
        logErrorToFile(error, req);
        return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
      }
    },

    getUserList : async (req, res, reqObj, callback) => {
      try {
        User.find({}).select('user_id first_name last_name mobile email').then((data) => {
          callback(data)
      }).catch((error) => {
          console.error('Error:', error);
      });
      }catch (error) {
        console.error("Internal Server Error:", error);
        logErrorToFile(error, req);
        return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
    }
    },

    getProfile : async (req, res, reqObj, callback) => {
      try {
        User.find({user_id : reqObj.user_id}).select('user_id first_name last_name mobile email').then((data) => {
          callback(data)
      }).catch((error) => {
          console.error('Error:', error);
      });
      }catch (error) {
        console.error("Internal Server Error:", error);
        logErrorToFile(error, req);
        return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
    }
    },

 }

   





      

     
  




  