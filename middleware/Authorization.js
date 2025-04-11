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

const checkCommonUserAuthentication = async (req, res, next) => {
  const { accesstoken, usertype, supplier_id, seller_id, buyer_id, client_id } =
    req.headers;
  const admin_id = req.headers?.admin_id || req?.body?.admin_id;
  try {
    let user = null;

    if (usertype === "Buyer") {
      user = await Buyer.findOne({ token: accesstoken });
    } else if (usertype === "Admin") {
      user = await Admin.findOne({ token: accesstoken });
    } else if (usertype === "Supplier") {
      user = await Supplier.findOne({ token: accesstoken });
    } else if (usertype === "Logistics") {
      user = await LogisticsPartner.findOne({ token: accesstoken });
    }

    if (!user) {
      return res.status(400).send({ message: "Invalid Access Token" });
    }

    if (user.status === 0) {
      return res.status(400).send({ message: "Access Denied" });
    }
    next();
  } catch (error) {
    handleCatchBlockError(req, res, error);
  }
};

const authenticationNAuthorization = async (req, res, next) => {
  try {
    const { usertype } = req.headers;
    const { accessToken, refreshToken } = req.cookies;

    if (!usertype) {
      return sendErrorResponse(res, 401, "User type missing.");
    }

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
  checkCommonUserAuthentication,
  authenticationNAuthorization,
};
