const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const Controller = require("../controller/Buyer");
const { handleResponse } = require("../utils/utilities");
const { validation } = require("../utils/utilities");
const { imageUpload } = require("../utils/imageUpload");
const mime = require("mime-types");
const {
  checkAuthorization,
  authenticationNAuthorization,
} = require("../middleware/Authorization");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getLoggedinUserProfileDetails,
  verifyEmail,
  verifyOTP,
  resetPassword,
  updatePassword,
  // addProfileEditRequest,
  verifyEmailAndResendOTP,
  updateProfileAndSendEditRequest,
  logoutUser,
  getOtherinUserDetails,
} = require(`../controller/authController`);
const { validateUserInput } = require("../middleware/validations/editProfile");
const {
  handleValidationErrors,
} = require("../middleware/validations/validationErrorHandler");
const { authUpload } = require("../middleware/multer/authMulter");
const { authValidationRules } = require("../middleware/validations/auth/auth");
const {
  addUserFileMiddleware,
} = require("../middleware/validations/auth/fileUploads");

// router.post(`/register`, checkAuthorization, authUpload, registerUser);
// router.post(
//   `/register`,
//   checkAuthorization,
//   authValidationRules,
//   handleValidationErrors,
//   addUserFileMiddleware,
//   authUpload,
//   registerUser
// );
router.post(
  `/register`,
  checkAuthorization,
  authValidationRules,
  handleValidationErrors,
  addUserFileMiddleware,
  // authUpload,
  registerUser
);

router.post(`/login`, loginUser);
router.post(`/logout`, authenticationNAuthorization, logoutUser);

router.post(`/verify-email`, verifyEmailAndResendOTP);
router.post(`/resend-otp`, verifyEmailAndResendOTP);

router.post(`/verify-otp`, verifyOTP);

router.post(`/reset-password`, resetPassword);

router.post(`/update-password/:id`, updatePassword);

router.post(
  `/edit-profile/:id`,
  checkAuthorization,
  validateUserInput,
  handleValidationErrors,
  updateProfileAndSendEditRequest
);

router.post(`/:id`, getLoggedinUserProfileDetails);
router.post(`/other-user/:userType/:id`, getOtherinUserDetails);

module.exports = router;
