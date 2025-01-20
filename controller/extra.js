const updateProfileAndSendEditRequest = async (req, res) => {
    try {
      const { id } = req?.params;
      const { user_type } = req?.headers;
      const { newPassword, oldPassword, name, email, phone, address } = req?.body;
      let changePersonalDetails = false;
      let sendRequestToAdmin = false;
      let user;
      // Find the user based on their type and email
      if (user_type === "Buyer") {
        user = await Buyer?.findById(id);
      } else if (user_type === "Supplier") {
        user = await Supplier?.findById(id);
      } else if (user_type === "Admin") {
        user = await Admin?.findById(id);
      }
      // If the user is not found, return an error response
      if (!user) {
        return sendErrorResponse(
          res,
          400,
          "Profile not found."
        );
      }
      // Hash the new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword?.trim(), saltRounds);
      // save country code and phone number in different variables
      const userCountryCode = phone.split(" ")[0];
      const user_mobile_number = phone.split(" ").slice(1).join(" ");
      // check what to update (personal details only or the request to update the address or both )
      changePersonalDetails = user_type =='Buyer' ? (user?.buyer_name !== name || user?.buyer_email !== email || !isNewPwdSameAsOld || user?.buyer_country_code !== userCountryCode || user?.buyer_mobile!== user_mobile_number ) : (user?.supplier_name !== name || user?.supplier_email !== email || !isNewPwdSameAsOld || user?.supplier_country_code !== userCountryCode || user?.supplier_mobile!== user_mobile_number )
      sendRequestToAdmin = user_type =='Buyer' ? (user?.buyer_address !== address) : (user?.supplier_address !== address)
      let updateProfile;
      let newProfileEditReq;
      // sending response according to the condition checked above
      if(changePersonalDetails && sendRequestToAdmin) {
        if(newPassword?.trim()){
          if (!oldPassword?.trim()) {
            return sendErrorResponse(res, 400, "Old Password is required.");
          }
          // Check if the provided old password matches the current password
          const isOldPwdMatch = await bcrypt.compare(oldPassword?.trim(), user?.password);
          if (!isOldPwdMatch) {
            return sendErrorResponse(res, 400, "Old password is not correct.");
          }
          // Check if the new password matches the old password (to prevent reuse)
          const isNewPwdSameAsOld = await bcrypt.compare(
            newPassword?.trim(),
            user?.password
          );
          if (isNewPwdSameAsOld) {
            return sendErrorResponse(
              res,
              400,
              "New password cannot be the same as old password."
            );
          }
          // Update the profile details based on the user type
          if (user_type === "Buyer") {
            updateProfile = await Buyer?.findByIdAndUpdate(
              user?._id,
              { $set: 
                { 
                buyer_name: name,
                buyer_email: email,
                buyer_mobile: user_mobile_number,
                buyer_country_code: userCountryCode,
                password: hashedPassword,
                }
              },
              { new: true }
            );
            if(!updateProfile) {
              return sendErrorResponse(res, 400, "Failed to update profile details.");
            }
            // send update address to admin
            const ProfileReq = new BuyerProfileEdit({
              buyer_id: user?.buyer_id,
              userId: user?._id,
              buyer_address: address,
            });
            newProfileEditReq = await ProfileReq?.save()
            if(!newProfileEditReq) {
              return sendSuccessResponse(res, 206, 'Profile details updated, but failed to send address update request to Admin')
            }
            return sendSuccessResponse(res, 200, 'Profile details updated, also send address update request to Admin')          
          } else if (user_type === "Supplier") {
            updateProfile = await Supplier?.findByIdAndUpdate(
              user?._id,
              { $set: 
                { 
                supplier_name: name,
                supplier_email: email,
                supplier_mobile: user_mobile_number,
                supplier_country_code: userCountryCode,
                password: hashedPassword,
                }
              },
              { new: true }
            );
            if(!updateProfile) {
              return sendErrorResponse(res, 400, "Failed to update profile details.");
            }
            // send update address to admin
            const ProfileReq = new SupplierProfileEdit({
              supplier_id: user?.supplier_id,
              userId: user?._id,
              supplier_address: address,
            });
            newProfileEditReq = await ProfileReq?.save()
            if(!newProfileEditReq) {
              return sendSuccessResponse(res, 206, 'Profile details updated, but failed to send address update request to Admin')
            }
            return sendSuccessResponse(res, 200, 'Profile details updated, also send address update request to Admin')          
          }
        } else {
          // Update the profile details based on the user type
          if (user_type === "Buyer") {
            updateProfile = await Buyer?.findByIdAndUpdate(
              user?._id,
              { $set: 
                { 
                buyer_name: name,
                buyer_email: email,
                buyer_mobile: user_mobile_number,
                buyer_country_code: userCountryCode,
                }
              },
              { new: true }
            );
            if(!updateProfile) {
              return sendErrorResponse(res, 400, "Failed to update profile details.");
            }
            // send update address to admin
            const ProfileReq = new BuyerProfileEdit({
              buyer_id: user?.buyer_id,
              userId: user?._id,
              buyer_address: address,
            });
            newProfileEditReq = await ProfileReq?.save()
            if(!newProfileEditReq) {
              return sendSuccessResponse(res, 206, 'Profile details updated, but failed to send address update request to Admin')
            }
            return sendSuccessResponse(res, 200, 'Profile details updated, also send address update request to Admin')          
          } else if (user_type === "Supplier") {
            updateProfile = await Supplier?.findByIdAndUpdate(
              user?._id,
              { $set: 
                { 
                supplier_name: name,
                supplier_email: email,
                supplier_mobile: user_mobile_number,
                supplier_country_code: userCountryCode,
                }
              },
              { new: true }
            );
            if(!updateProfile) {
              return sendErrorResponse(res, 400, "Failed to update profile details.");
            }
            // send update address to admin
            const ProfileReq = new SupplierProfileEdit({
              supplier_id: user?.supplier_id,
              userId: user?._id,
              supplier_address: address,
            });
            newProfileEditReq = await ProfileReq?.save()
            if(!newProfileEditReq) {
              return sendSuccessResponse(res, 206, 'Profile details updated, but failed to send address update request to Admin')
            }
            return sendSuccessResponse(res, 200, 'Profile details updated, also send address update request to Admin')          
          }
        }
      } else if(changePersonalDetails && !sendRequestToAdmin){
        // Check if the provided old password matches the current password
        const isOldPwdMatch = await bcrypt.compare(oldPassword?.trim(), user?.password);
        if (!isOldPwdMatch) {
          return sendErrorResponse(res, 400, "Old password is not correct.");
        }
        // Check if the new password matches the old password (to prevent reuse)
        const isNewPwdSameAsOld = await bcrypt.compare(
          newPassword?.trim(),
          user?.password
        );
        if (isNewPwdSameAsOld) {
          return sendErrorResponse(
            res,
            400,
            "New password cannot be the same as old password."
          );
        }
        // Update the profile details based on the user type
        if (user_type === "Buyer") {
          updateProfile = await Buyer?.findByIdAndUpdate(
            user?._id,
            { $set: 
              { 
              buyer_name: name,
              buyer_email: email,
              buyer_mobile: user_mobile_number,
              buyer_country_code: userCountryCode,
              password: hashedPassword,
              }
            },
            { new: true }
          );
          if(!updateProfile) {
            return sendErrorResponse(res, 400, "Failed to update profile details.");
          }
          return sendSuccessResponse(res, 200, 'Profile details updated.')  
        } else if (user_type === "Supplier") {
          updateProfile = await Supplier?.findByIdAndUpdate(
            user?._id,
            { $set: 
              { 
              supplier_name: name,
              supplier_email: email,
              supplier_mobile: user_mobile_number,
              supplier_country_code: userCountryCode,
              password: hashedPassword,
              }
            },
            { new: true }
          );
          if(!updateProfile) {
            return sendErrorResponse(res, 400, "Failed to update profile details.");
          }
          return sendSuccessResponse(res, 200, 'Profile details updated.')
        }
      } else if(!changePersonalDetails && sendRequestToAdmin){
        if(user_type === 'Buyer'){
            const ProfileReq = new BuyerProfileEdit({
              buyer_id: user?.buyer_id,
              userId: user?._id,
              buyer_address: address,
            });
            newProfileEditReq = await ProfileReq?.save()
          return sendSuccessResponse(res, 200, 'Sent address update request to Admin')            
        } else if(user_type === 'Supplier'){
            const ProfileReq = new SupplierProfileEdit({
              supplier_id: user?.supplier_id,
              userId: user?._id,
              supplier_address: address,
            });
            newProfileEditReq = await ProfileReq?.save()
          return sendSuccessResponse(res, 200, 'Sent address update request to Admin')            
        }
      }
    } catch (error) {
      console.log("Internal Server Error:", error);
      logErrorToFile(error, req);
      return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
    }
  }