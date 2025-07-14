require("dotenv").config();
const path = require("path");
const moment = require("moment");
const { default: mongoose } = require("mongoose");
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
    const {
      userId, 
      status,
      page_no = 1,
      page_size = 5,
    } = req.query;

    const pageNo = parseInt(page_no);
    const pageSize = parseInt(page_size);
    const offset = (pageNo - 1) * pageSize;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return sendErrorResponse(res, 400, "Invalid User ID format.", null);
    }

    const matchStage = {
      userId: userId,
    };

    if (status) {
      matchStage.status = status;
    }

    const pipeline = [
      {
        $match: matchStage,
      },
      {
        $lookup: {
          from: "buyers",
          let: { userIdStr: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toString: "$_id" }, "$$userIdStr"],
                },
              },
            },
            {
              $project: {
                token: 0,
                password: 0,
              },
            },
          ],
          as: "buyerDetails",
        },
      },
      {
        $unwind: {
          path: "$buyerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      { $skip: offset },
      { $limit: pageSize },
    ];

    const countPipeline = [
      { $match: matchStage },
      { $count: "total" },
    ];

    const countResult = await Bid.aggregate(countPipeline);
    const totalBids = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalBids / pageSize);

    const bids = await Bid.aggregate(pipeline);   
  
    return sendSuccessResponse(res, 200, "Success Fetching Bids", {
      bids: bids,
      totalItems: totalBids,
      currentPage: pageNo,
      itemsPerPage: pageSize,
      totalPages,
    });
  } catch (error) {
    handleCatchBlockError(req, res, error);
  }
};


const getBidDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.isValidObjectId(id)) {
      return sendErrorResponse(res, 400, "Invalid Bid ID format.", null);
    }

    const bidDetails = await Bid.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) },
      },
      {
        $lookup: {
          from: "buyers",
          let: { userIdStr: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toString: "$_id" }, "$$userIdStr"],
                },
              },
            },
            {
              $project: {
                token: 0,
                password: 0,
              },
            },
          ],
          as: "buyerDetails",
        },
      },
      {
        $unwind: {
          path: "$buyerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    if (!bidDetails?.length) {
      return sendErrorResponse(res, 404, "Bid not found.");
    }

    return sendSuccessResponse(res, 200, "Bid details fetched successfully.", bidDetails[0]);

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

    const bid_id = "BID-" + Math.random().toString(16).slice(2, 10);

    const documents = await getFilePathsAdd(req, res, ["documents"]);
    const newBidDetails = {
      ...req?.body,
      bid_id,
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
