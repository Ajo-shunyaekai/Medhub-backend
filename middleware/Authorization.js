require("dotenv").config();
const jwt = require("jsonwebtoken");
const Buyer = require("../schema/buyerSchema");
const Supplier = require("../schema/supplierSchema");
const Admin = require("../schema/adminSchema");
const LogisticsPartner = require("../schema/logisticsCompanySchema");
const logErrorToFile = require("../logs/errorLogs");
const {
  sendErrorResponse,
  handleCatchBlockError,
  cookiesOptions,
} = require("../utils/commonResonse");
const {
  generateAccessAndRefeshToken,
} = require("../controller/authController");
 
const checkAuthorization = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
 
    if (!token) {
      res.status(401).send({ message: "Auth Token is Missing" });
    } else {
      if (token != process.env.Authorization) {
        res.status(400).send({ message: "Invalid Auth Token" });
      } else {
        next();
      }
    }
  } catch (error) {
    handleCatchBlockError(req, res, error);
  }
};
 
const authenticationNAuthorization = async (req, res, next) => {
  try {
    console.log("req.headers", req?.headers);
    const { usertype, token1, token2 } = req.headers;
    // const { accessToken, refreshToken } = req.cookies;
 
    if (!usertype) {
      return sendErrorResponse(res, 401, "User type missing.");
    }
    const accessToken = token1;
    const refreshToken = token2;
 
    if (!accessToken) {
      return sendErrorResponse(res, 401, "Access token missing.");
    }
 
    let decodedToken;
 
    const Model =
      usertype === "Buyer"
        ? Buyer
        : usertype === "Admin"
        ? Admin
        : usertype === "Supplier"
        ? Supplier
        : usertype === "Logistics"
        ? LogisticsPartner
        : null;
 
    try {
      decodedToken = jwt.verify(
        accessToken,
        process.env.JWT_ACCESS_TOKEN_SECRET
      );
 
      const user = await Model?.findById(decodedToken?._id)?.select(
        "-password -refreshToken"
      );
 
      if (!user) {
        return sendErrorResponse(res, 401, "Invalid token.");
      }
 
      req.userFromMiddleware = user;
      next();
    } catch (err) {
      // Access token might be expired
      if (err.name === "TokenExpiredError") {
        // Try refresh token logic
        if (!refreshToken) {
          return sendErrorResponse(
            res,
            401,
            "Session expired. Please login again."
          );
        }
 
        try {
          const decodedRefresh = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_TOKEN_SECRET
          );
 
          const user = await Model?.findById(decodedRefresh?._id);
          if (!user) {
            return sendErrorResponse(res, 401, "Invalid refresh token.");
          }
 
          // Refresh token valid → issue new access token
          const newAccessToken = await user.generateAccessToken();
 
          // Set new access token in cookies
          res.cookie("accessToken", newAccessToken, cookiesOptions);
 
          decodedToken = jwt.decode(newAccessToken); // Use new token
 
          req.userFromMiddleware = user;
          next();
        } catch (refreshError) {
          return sendErrorResponse(
            res,
            401,
            "Session expired. Please login again."
          );
        }
      } else {
        return sendErrorResponse(res, 401, "Invalid access token.");
      }
    }
  } catch (error) {
    return handleCatchBlockError(req, res, error, {
      fromMiddleware: true,
      status: 401,
      message: "Authentication failed.",
    });
  }
};
 
module.exports = {
  checkAuthorization,
  authenticationNAuthorization,
};