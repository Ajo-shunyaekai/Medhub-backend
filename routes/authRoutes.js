const express = require(`express`);
const router = express.Router();
const { loginUser, getLoggedinUserProfileDetails, } = require(`../controller/authController`);

// router.post(`/register`, registerUser)
router.post(`/login`, loginUser);
router.post(`/:id`, getLoggedinUserProfileDetails);

module.exports = router;
