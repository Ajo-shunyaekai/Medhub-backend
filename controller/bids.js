require("dotenv").config();
const path = require("path");
const moment = require("moment");
const Admin = require("../schema/adminSchema");
const Supplier = require("../schema/supplierSchema");
const Buyer = require("../schema/buyerSchema");
const LogisticsPartner = require("../schema/logisticsCompanySchema");
const Bid = require("../schema/bidSchema");
const {
  sendErrorResponse,
  sendSuccessResponse,
  handleCatchBlockError,
} = require("../utils/commonResonse");

const getAllBids = async (req, res) => {
  try {
  } catch (error) {
    handleCatchBlockError(req, res, error);
  }
};

const getBidDetails = async (req, res) => {
  try {
  } catch (error) {
    handleCatchBlockError(req, res, error);
  }
};

const addBid = async (req, res) => {
  try {
    const schemaNameRef =
      usertype === "Buyer"
        ? Buyer
        : usertype === "Admin"
        ? Admin
        : usertype === "Supplier"
        ? Supplier
        : usertype === "Logistics"
        ? LogisticsPartner
        : null;
    const user = await schemaNameRef?.findById(userId);

    const documents = await getFilePathsAdd(req, res, ["documents"]);
    const newBidDetails = {
      ...req?.body,
      general: {
        ...req.body,

        documents: documents.documents || [],
      },
      other: {
        ...req?.body,
      },
    };

    const newBid = await Bid.create(newBidDetails);

    if (!newBid) {
      return sendErrorResponse(res, 400, "Failed to create new Bid.");
    }

    return sendSuccessResponse(res, 200, "Bid Created Successfully", newBid);
  } catch (error) {
    handleCatchBlockError(req, res, error);
  }
};

const editBid = async (req, res) => {
  try {
  } catch (error) {
    handleCatchBlockError(req, res, error);
  }
};

module.exports = {
  getAllBids,
  getBidDetails,
  addBid,
  editBid,
};
