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
  updateBidParticipant2,
  getBidProductDetails,
  getCurrentBidDetails,
  addToFavourite,
  sendEnquiry
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
  // updateBidParticipant
  updateBidParticipant2
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

router.post(
  "/add-to-favourite/:bidId/:itemId/:participantId",
  checkAuthorization,
  authenticationNAuthorization,
  addToFavourite
);

router.post(
  "/send-enquiry/:bidId/:itemId/:participantId",
  checkAuthorization,
  authenticationNAuthorization,
  sendEnquiry
);

module.exports = router;
