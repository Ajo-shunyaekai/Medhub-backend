const express = require("express");
const {
  checkAuthorization,
  authenticationNAuthorization,
} = require("../middleware/Authorization");
const router = express.Router();
const {
  getAllBids,
  getAllBids1,
  getBidDetails,
  addBid,
  editBid,
  updateBidParticipant,
  getBidProductDetails,
  getCurrentBidDetails
} = require("../controller/bids");
const { addBidUpload } = require("../middleware/multer/bidMulter");

router.post("/", checkAuthorization, authenticationNAuthorization, getAllBids1);
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

router.post(
  "/add-participant/:bidId/:itemId",
  checkAuthorization,
  authenticationNAuthorization,
  updateBidParticipant
);

router.post(
  "/get-bid-product/:bidId/:itemId",
  checkAuthorization,
  authenticationNAuthorization,
  getBidProductDetails
);

router.post(
  "/get-current-bid-details/:buyerId/:supplierId",
  checkAuthorization,
  authenticationNAuthorization,
  getCurrentBidDetails
);

module.exports = router;
