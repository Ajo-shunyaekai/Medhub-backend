const bcrypt         = require('bcrypt');
const jwt            = require('jsonwebtoken');
const Guest          = require('../schema/guestSchema')
const {generateOtp}  = require('../utils/utilities');

module.exports = {

    guestLogin : async(reqObj, callback) => {
      try {
        const mobile = reqObj.mobile
        const newOtp = generateOtp()

        const guestUser = await Guest.findOne({mobile: mobile})

        if(guestUser) {
            Guest.findOneAndUpdate({ mobile: mobile },{ otp: newOtp }).then((data) => {
                callback({code: 200, message: "OTP send successfully", result: newOtp })
              })
              .catch((err) => {
                console.log(err);
                callback({code: 400, message: "Error in Sending OTP"})
              })
        } else {
             const newGuest = new Guest({
                mobile  : mobile,
                otp     : newOtp
          });
        
        newGuest.save().then(() => {
            callback({code: 200, message: "OTP send successfully", result: newOtp })
        })
        }
      }catch (error) {
        console.error('Internal Server Error:', error);
        callback({code: 500, message: "Internal Server Error", result: error })
    }
    },

    verifyOtp : async(reqObj, callback) => {
        try {
          const otp    = reqObj.otp
          const mobile = reqObj.mobile

          const guest = await Guest.findOne({ mobile: mobile }).sort({ createdAt: -1 });
  
          if (!guest) {
            return callback({code: 404, message: 'OTP not found or expired'});
          }
        
          const otpIsValid = guest.otp === otp && Date.now() - guest.createdAt.getTime() <= 2 * 60 * 1000;
          
          if(otpIsValid){
            callback({code: 200, message: 'Login Successfull' });
          } else {
            callback({code: 400, message: 'Invalid OTP' });
          }
  
        }catch (error) {
          console.log('Internal Server Error', error)
          callback({code: 500, message: "Internal Server Error", result: error })
       }
    },

}