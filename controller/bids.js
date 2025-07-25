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
const { getFilePathsAdd } = require("../helper");

const getAllBids = async (req, res) => {
  try {
    const { userId, status, page_no = 1, page_size = 10 } = req.query;

    const pageNo = parseInt(page_no);
    const pageSize = parseInt(page_size);
    const offset = (pageNo - 1) * pageSize;

    if (userId && !mongoose.isValidObjectId(userId)) {
      return sendErrorResponse(res, 400, "Invalid User ID format.", null);
    }

    const matchStage = {};

    if (userId) {
      matchStage.userId = userId;
    }

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

    const countPipeline = [{ $match: matchStage }, { $count: "total" }];

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

    return sendSuccessResponse(
      res,
      200,
      "Bid details fetched successfully.",
      bidDetails[0]
    );
  } catch (error) {
    handleCatchBlockError(req, res, error);
  }
};

const addBid = async (req, res) => {
  try {
    let usertype;
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
    const user = await schemaNameRef?.findById(req?.body?.userId);

    const bid_id = "BID-" + Math.random().toString(16).slice(2, 10);

    // const documents = await getFilePathsAdd(req, res, ["documents"]);
    const bidDocs = await getFilePathsAdd(req, res, ["bidDocs"]);

    let documentsParsed = [];

    if (typeof req?.body?.documents == "string") {
      try {
        // documentsParsed = JSON.parse(req.body.documents)?.filter(
        //   (value) => value != "[object Object]"
        // );
        if (Array.isArray(req?.body?.documents)) {
          documentsParsed = req.body.documents.filter(
            (value) => value !== "[object Object]"
          );
        } else if (typeof req?.body?.documents === "string") {
          // If it's a string, try to parse it as JSON and filter
          documentsParsed = JSON.parse(req.body?.documents)?.filter(
            (value) => value !== "[object Object]"
          );
        } else {
          // Handle case where documents is neither an array nor a string
          throw new Error("Invalid documents format.");
        }
      } catch (error) {
        handleCatchBlockError(req, res, error);
      }
    } else {
      documentsParsed = JSON.parse(
        req.body?.documents?.filter((value) => value != "[object Object]")
      );
    }

    let additionalDetailsArray = [];

    try {
      const { additionalDetails } = req.body;

      // Case 1: If already an array of objects (not strings)
      if (
        Array.isArray(additionalDetails) &&
        additionalDetails.every((item) => typeof item === "object")
      ) {
        additionalDetailsArray = additionalDetails.map((item) => ({
          ...item,
          itemId: Math.random().toString(16).slice(2, 10),
        }));
      }

      // Case 2: If array of strings
      else if (Array.isArray(additionalDetails)) {
        const validJsonString = additionalDetails.find((entry) => {
          try {
            const parsed = JSON.parse(entry);
            return Array.isArray(parsed);
          } catch {
            return false;
          }
        });

        if (validJsonString) {
          const parsed = JSON.parse(validJsonString);
          additionalDetailsArray = parsed.map((item) => ({
            ...item,
            itemId: Math.random().toString(16).slice(2, 10),
          }));
        }
      }

      // Case 3: If it is a single valid JSON string
      else if (typeof additionalDetails === "string") {
        const parsed = JSON.parse(additionalDetails);
        if (Array.isArray(parsed)) {
          additionalDetailsArray = parsed.map((item) => ({
            ...item,
            itemId: Math.random().toString(16).slice(2, 10),
          }));
        }
      }

      // Case 4: Unexpected format
      else {
        console.warn("Unsupported format for additionalDetails:", additionalDetails);
      }
    } catch (err) {
      return handleCatchBlockError(req, res, err);
    }

    const newBidDetails = {
      ...req?.body,
      bid_id,
      general: {
        ...req.body,

        // documents: documents.documents || [],
        bidDocs: bidDocs.bidDocs || [],
        documents: documentsParsed
          ?.map((ele, index) => {
            return {
              document:
                typeof ele?.document !== "string"
                  ? bidDocs?.bidDocs?.find((filename) => {
                      const path = ele?.document?.path;

                      // Ensure path is defined and log the file path
                      if (!path) {
                        return false; // If there's no path, skip this entry
                      }

                      const ext = path.split(".").pop(); // Get the file extension

                      const sanitizedPath = path
                        .replaceAll("./", "")
                        .replaceAll(" ", "")
                        .replaceAll(`.${ext}`, "");

                      // Match file by sanitized name
                      return filename?.includes(sanitizedPath);
                    })
                  : ele?.document || bidDocs?.bidDocs?.[index] || "",

              name: ele?.name || "", // Log the name being used (if any)
            };
          })
          ?.filter((ele) => ele?.document || ele?.name),
      },
      // additionalDetails: JSON.parse(
      //   req?.body?.additionalDetails
      //     ?.filter((value) => value != "[object Object]")
      //     ?.map((ele) => ({
      //       ...ele,
      //       itemId: Math.random().toString(16).slice(2, 10),
      //     }))
      // ),
      additionalDetails: additionalDetailsArray,
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
