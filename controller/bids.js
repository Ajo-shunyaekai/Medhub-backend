require("dotenv").config();
const path = require("path");
const moment = require("moment");
const { DateTime } = require("luxon");
const { default: mongoose } = require("mongoose");
const Admin = require("../schema/adminSchema");
const Supplier = require("../schema/supplierSchema");
const Buyer = require("../schema/buyerSchema");
const LogisticsPartner = require("../schema/logisticsCompanySchema");
const Bid = require("../schema/bidSchema");
const Notification = require("../schema/notificationSchema");
const {
  sendErrorResponse,
  sendSuccessResponse,
  handleCatchBlockError,
} = require("../utils/commonResonse");
const { getFilePathsAdd } = require("../helper");
const { bidCreatedContent } = require("../utils/emailContents");
const { sendEmail } = require("../utils/emailService");

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
      // {
      //   $lookup: {
      //     from: "buyers",
      //     let: { userIdStr: "$userId" },
      //     pipeline: [
      //       {
      //         $match: {
      //           $expr: {
      //             $eq: [{ $toString: "$_id" }, "$$userIdStr"],
      //           },
      //         },
      //       },
      //       {
      //         $project: {
      //           token: 0,
      //           password: 0,
      //         },
      //       },
      //     ],
      //     as: "buyerDetails",
      //   },
      // },
      // {
      //   $unwind: {
      //     path: "$buyerDetails",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },
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

    return sendSuccessResponse(res, 200, "Bids Fetched Successfully", {
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

const getAllBids1 = async (req, res) => {
  try {
    const {
      userId,
      country,
      type,
      status,
      page_no = 1,
      page_size = 10,
      userType,
      participant,
      category
    } = req.query;

    const pageNo = parseInt(page_no);
    const pageSize = parseInt(page_size);
    const offset = (pageNo - 1) * pageSize;

    if (userId && !mongoose.isValidObjectId(userId)) {
      return sendErrorResponse(res, 400, "Invalid User ID format.", null);
    }

    let categoryArray = [];
    if (category) {
      categoryArray = category.split(",").map((c) => c.trim());
    }

    const matchStage = {
      ...(userId && { userId }),
      ...(status && { status }),
      ...(userType === "Supplier" &&
        country && { "general.fromCountries": country }), //filter only when userType = Supplier
      ...(categoryArray.length > 0 && { 
      additionalDetails: { 
        $elemMatch: { category: { $in: categoryArray } }  //trading categories filter
      } 
     })
    };

  if (userType === "Supplier") {
      const now = new Date();

      const allBids = await Bid.find(matchStage);

      // Filter in JS instead of doing broken date parsing in Mongo
      const filteredIds = allBids
        .filter(bid => {
          if (!bid.general?.startDate || !bid.general?.startTime) return false;
          const startDate = new Date(bid.general.startDate);
          const startDateTime = new Date(
            `${startDate.toISOString().split('T')[0]}T${bid.general.startTime}:00+05:30`
          );
          return startDateTime <= now;
        })
        .map(bid => bid._id);

      matchStage._id = { $in: filteredIds };
    }
  
    const pipeline = [{ $match: matchStage }, { $sort: { createdAt: -1 } }];

    const bids = await Bid.aggregate(pipeline);

    let finalBids = bids;

    if (userType === "Supplier") {
      const filteredBids = await Promise.all(
        bids.map(async (bid) => {
          const products = bid?.additionalDetails || [];

          const matchedProducts = products.filter((ele) => {
            const openForValue = (ele?.openFor || "")?.toString().toLowerCase();
            const typeValue = type?.toString().toLowerCase();
            return openForValue === typeValue;
          });

          if (matchedProducts.length > 0) {
            bid.additionalDetails = matchedProducts;
            return bid;
          }
          return null;
        })
      );

      finalBids = filteredBids.filter((bid) => bid !== null);
    }

    if (participant) {
      const filteredBids = await Promise.all(
        finalBids?.map(async (bid) => {
          const products = bid?.additionalDetails || [];

          // If participant exists and isn't "not", filter bids with the participant
          if (participant !== "not") {
            // Check if participant is found in any product's participants
            const isParticipatedMatch = products?.some((product) => {
              const participants = product?.participants || [];

              return participants.some(
                (ele) => ele?.id?.toString() === participant?.toString()
              );
            });

            // If participant is matched, include the bid
            if (isParticipatedMatch) {
              return bid;
            }
          } else {
            // // In cases where there are no participants or no matching participant, include the bid
            // if (!products?.participant || products?.participants?.length == 0) {
            //   return bid;
            // } else {
            // Check if participant is found in any product's participants
            const isParticipatedMatch = products?.every((product) => {
              const participants = product?.participants || [];

              return participants.every(
                (ele) => ele?.id?.toString() == participant?.toString()
              );
            });

            // If the participant is matched, exclude the bid
            if (isParticipatedMatch) {
              return bid; // Exclude the bid
            }
            // }
          }

          return null;
        })
      );

      // Filter out any null values to get the final bids
      finalBids = filteredBids.filter((bid) => bid !== null);
    }

    const totalBids = finalBids.length;
    const paginatedBids = finalBids.slice(offset, offset + pageSize);
    const totalPages = Math.ceil(totalBids / pageSize);
    const bidWithTotalCout = paginatedBids?.map((bid) => {
      let biddersArr = [];
      bid?.additionalDetails?.forEach((item) => {
        item?.participants?.forEach((bidder) =>
          biddersArr?.includes(bidder?.id?.toString())
            ? null
            : biddersArr?.push(bidder?.id?.toString())
        );
      });
      return {
        ...bid,
        totalBidsCount: biddersArr?.length || 0,
      };
    });

    return sendSuccessResponse(res, 200, "Bids Fetched Successfully", {
      bids: bidWithTotalCout,
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
    const { id } = req?.params;
    const { type, openFor } = req?.query;

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
                loginHistory: 0,
                login_history: 0,
                lastLogin: 0,
                last_login: 0,
                certificateFileNDate: 0,
                interested_in: 0,
                certificate_image: 0
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

    const filteredAdditionalDetails = type
      ? bidDetails[0]?.additionalDetails?.filter(
          (item) =>
            item?.openFor?.toLowerCase()?.replace(/\s+/g, "") ===
            type?.toLowerCase()?.replace(/\s+/g, "")
        )
      : bidDetails[0]?.additionalDetails;

    const updatedAdditionalDetails = await Promise.all(
      (filteredAdditionalDetails || []).map(async (item) => {
        const biddersArr = [];

        const updatedParticipants = await Promise.all(
          (item?.participants || []).map(async (bidder) => {
            const participantDetails = await Supplier?.findById(bidder?.id);
            if (!participantDetails) return null;

            const alreadyAdded = biddersArr.find((b) => b?.id === bidder?.id);

            if (!alreadyAdded) {
              biddersArr.push({
                ...bidder,
                participantId: participantDetails.supplier_id,
                participantName: participantDetails.supplier_name,
                participantType: participantDetails.supplier_type,
                participantCountry:
                  participantDetails?.registeredAddress?.country,
                productBidded: item?.itemId,
              });
            }

            return {
              ...bidder,
              totalBidsPCount: item?.participants?.length,
              participantId: participantDetails.supplier_id,
              participantName: participantDetails.supplier_name,
              participantType: participantDetails.supplier_type,
              participantCountry:
                participantDetails?.registeredAddress?.country,
              productBidded: item?.itemId,
            };
          })
        );

        const validParticipants = updatedParticipants.filter(Boolean);

        return {
          ...item,
          totalBidsCount: biddersArr.length,
          participants: validParticipants,
        };
      })
    );

    let updatedBidDetails = {
      ...bidDetails[0],
      additionalDetails: openFor
        ? updatedAdditionalDetails?.filter(
            (item) =>
              item?.openFor
                ?.toString()
                ?.toLowerCase()
                ?.replaceAll(/\s+/g, "") == openFor
          )
        : updatedAdditionalDetails,
    };

    return sendSuccessResponse(
      res,
      200,
      "Bid details fetched successfully.",
      updatedBidDetails
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
    const user = await Buyer?.findById(req?.body?.userId);

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
        console.warn(
          "Unsupported format for additionalDetails:",
          additionalDetails
        );
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
      const openFor = additionalDetailsArray?.map((section) => section?.openFor).filter(Boolean) || [];
      const matchingSuppliers = await Supplier.find({
        supplier_type: { $in: openFor },
        "registeredAddress.country": { $in: req.body.fromCountries },
      });
     
      const notificationMessage = `Bid Created! A new bid has been created by ${user?.buyer_name}`;
       matchingSuppliers.forEach(async (supplier) => {
      const notificationId = "NOT-" + Math.random().toString(16).slice(2, 10);
      const newNotification = new Notification({
        notification_id: notificationId,
        event_type: "Bid created",
        event: "bid",
        from: "buyer",
        to: "supplier",
        from_id: user.buyer_id,
        to_id: supplier.supplier_id,
        event_id: newBid._id,
        message: notificationMessage,
        status: 0,
      });
      await newNotification.save();

      //Send email
      const subject = "Invitation to Participate in Medhub Global Bid  ";
      const recipientEmails = [supplier.contact_person_email, 'ajo@shunyaekai.tech'];
      const emailContent = bidCreatedContent(user, supplier, newBid.bid_id); 

      try {
        await sendEmail(recipientEmails, subject, emailContent);
      } catch (error) {
        console.error(`Error sending email to ${supplier.supplier_email}:`, error);
      }
    });
    
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

const getBidProductDetails = async (req, res) => {
  try {
    const { bidId, itemId } = req?.params;
    // Step 1: Find the bid
    const bidDetails = await Bid.findOne({ _id: bidId });
    if (!bidDetails) {
      return sendErrorResponse(res, 400, "No Bid Found.");
    }

    // Step 2: Find the item to update within additionalDetails
    const itemDetails = bidDetails.additionalDetails.find(
      (item) => item.itemId === itemId
    );

    if (!itemDetails) {
      return sendErrorResponse(res, 400, "No Item Found in Bid.");
    }
    const biddersArr = [];

    const itemWithParticipantsDetails =
      (await Promise.all(
        itemDetails?.participants?.map(async (item) => {
          // Step 3: Check if participant exists
          const participantDetails = await Supplier?.findById(item?.id);
          if (!participantDetails) {
            return null;
          }
          // Check if bidder is already in biddersArr by bidder ID
          const existingBidder = biddersArr.find((b) => b?.id === bidder?.id);
          if (!existingBidder) {
            // If bidder is not in biddersArr, push the new bidder
            biddersArr.push({
              ...bidder,
              participantId : participantDetails?.supplier_id,
              participantName: participantDetails?.supplier_name,
              participantType: participantDetails?.supplier_type,
              participantCountry:
                participantDetails?.registeredAddress?.country,
              productBidded: itemDetails?.itemId,
            });
          }
          return {
            ...item,
            participantId : participantDetails?.supplier_id,
            participantName: participantDetails?.supplier_name,
            participantType: participantDetails?.supplier_type,
            participantCountry: participantDetails?.registeredAddress?.country,
            productBidded: itemDetails?.itemId,
          };
        })
      )) || [];

    return sendSuccessResponse(
      res,
      200,
      "Bid Item Details Fetched",
      itemWithParticipantsDetails
    );
  } catch (error) {
    handleCatchBlockError(req, res, error);
  }
};

const updateBidParticipant = async (req, res) => {
  try {
    const { bidId, itemId } = req?.params;
    const { participantId, productName, productId, amount, timeLine, tnc } = req?.body;

    // Step 1: Find the bid
    const bidDetails = await Bid.findById(bidId);
    if (!bidDetails) {
      return sendErrorResponse(res, 400, "No Bid Found.");
    }

    // Step 2: Find the item to update within additionalDetails
    const itemToUpdate = bidDetails.additionalDetails.find(
      (item) => item.itemId === itemId
    );

    if (!itemToUpdate) {
      return sendErrorResponse(res, 400, "No Item Found in Bid.");
    }

    // Step 3: Check if participant already exists
    const participantIndex = itemToUpdate.participants.findIndex(
      (p) => String(p.id) === String(participantId)
    );

    if (participantIndex !== -1) {
      // Step 4a: Participant exists, update and add history
      const participant = itemToUpdate.participants[participantIndex];
      const lastHistory =
        participant?.history?.[participant.history.length - 1] || {};

      const historyEntry = {
        // productId: {
        //   value: productId,
        //   edited: lastHistory?.productId?.value !== productId,
        // },
        // productName: {
        //   value: productName,
        //   edited: lastHistory?.productName?.value !== productName,
        // },
        amount: {
          value: amount,
          edited: lastHistory?.amount?.value !== amount,
        },
        timeLine: {
          value: timeLine,
          edited: lastHistory?.timeLine?.value !== timeLine,
        },
        tnc: {
          value: tnc,
          edited: lastHistory?.tnc?.value !== tnc,
        },
        type: "Bid Updated",
        date: new Date(),
      };

      // Ensure history array exists
      participant.history = participant.history || [];

      // participant.productId = productId;  
      // participant.productName = productName;
      participant.amount = amount;
      participant.timeLine = timeLine;
      participant.tnc = tnc;
      (lastHistory?.amount?.value !== amount ||
        lastHistory?.timeLine?.value !== timeLine ||
        // lastHistory?.productId?.value !== productId ||
        // lastHistory?.productName?.value !== productName ||
        lastHistory?.tnc?.value !== tnc) &&
        participant.history.push(historyEntry);
    } else {
      // Step 4b: Participant not found, add new with history
      const historyEntry = {
        // productId: {
        //   value: productId,
        //   edited: false,
        // },
        // productName: {
        //   value: productName,
        //   edited: false,
        // },
        amount: {
          value: amount,
          edited: false,
        },
        timeLine: {
          value: timeLine,
          edited: false,
        },
        tnc: {
          value: tnc,
          edited: false,
        },
        type: "Bid Created",
        date: new Date(),
      };

      itemToUpdate.participants.push({
        id: participantId,
        // productId,    
        // productName,
        amount,
        timeLine,
        tnc,
        history: [historyEntry],
      });
    }

    // Step 5: Save updated bid document
    await bidDetails.save();

    return sendSuccessResponse(
      res,
      200,
      participantIndex !== -1 ? "Participant updated." : "Participant added.",
      bidDetails
    );
  } catch (error) {
    handleCatchBlockError(req, res, error);
  }
};

const getCurrentBidDetails = async (req, res) => {
  try {
    const { buyerId, supplierId } = req.params;
    let { pageNo = 1, pageSize = 10 } = req.query;
    const page_no = pageNo || 1; 
    const page_size = pageSize || 5; 
    const offSet = (page_no - 1) * page_size;

    // Step 1: Find Buyer
    const buyerDoc = await Buyer.findOne({ buyer_id: buyerId });
    if (!buyerDoc) {
      return sendErrorResponse(res, 400, "Buyer Not Found.");
    }

    // Step 2: Find Supplier
    const supplierDoc = await Supplier.findOne({ supplier_id: supplierId });
    if (!supplierDoc) {
      return sendErrorResponse(res, 400, "Supplier Not Found.");
    }

    // Step 3: Get ALL bids where buyerId matches and supplier is in participants
    const bidDocs = await Bid.find({
      userId: buyerDoc._id,
      status: 'active',
      "additionalDetails.participants.id": supplierDoc._id
    })
    .sort({ createdAt: -1 })
      .skip(offSet)
      .limit(page_size);

     const totalBids = await Bid.countDocuments({ 
      userId: buyerDoc._id,
      status: 'active',
      "additionalDetails.participants.id": supplierDoc._id
    });
     const totalPages = Math.ceil(totalBids / page_size);

    if (!bidDocs.length) {
      return sendErrorResponse(res, 400, "No Bids Found for this Buyer & Supplier.");
    }

    // Step 4: Return as-is
    return sendSuccessResponse(res, 200, "Matching Bids Fetched", {
      bidDocs,
      totalItems: totalBids,
      currentPage: page_no,
      itemsPerPage: page_size,
      totalPages,
    });
  } catch (error) {
    console.error("error", error);
    handleCatchBlockError(req, res, error);
  }
};








module.exports = {
  getAllBids,
  getAllBids1,
  getBidDetails,
  addBid,
  editBid,
  getBidProductDetails,
  updateBidParticipant,
  getCurrentBidDetails
};
