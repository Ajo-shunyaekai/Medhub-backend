const express = require("express");
const {
  checkAuthorization,
  authenticationNAuthorization,
} = require("../middleware/Authorization");
const router = express.Router();
const {
  getAllBids,
  getBidDetails,
  addBid,
  editBid,
} = require("../controller/bids");
const { addBidUpload } = require("../middleware/multer/bidMulter");

router.post("/", checkAuthorization, authenticationNAuthorization, getAllBids);
router.post(
  "/add",
  checkAuthorization,
  authenticationNAuthorization,
  addBidUpload,
  addBid
);
router.post(
  "/edit/:id",
  checkAuthorization,
  authenticationNAuthorization,
  editBid
);
router.post(
  "/:id",
  checkAuthorization,
  authenticationNAuthorization,
  getBidDetails
);

module.exports = router;
