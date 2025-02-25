require("dotenv").config();
const logErrorToFile = require("../logs/errorLogs");
const {
  sendErrorResponse,
  sendSuccessResponse,
} = require("../utils/commonResonse");
const nodemailer = require("nodemailer");
const fs = require("fs");

const Buyer = require("../schema/buyerSchema");
const Supplier = require("../schema/supplierSchema");
const Subscription = require("../schema/subscriptionSchema");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // Your secret key from Stripe

// Array of available subscription plans
const plans = [
  {
    // plan_id: "price_1Qs1YUG7JtuXMMbfa6sW0JO9", //live  
    plan_id: "price_1Qs1ShG7JtuXMMbfLKxV6J7B", //test 
    plan_name: "Monthly Subscription",
    duration: "month",
  },
  {
    // plan_id: "price_1Qs1YQG7JtuXMMbfWUPZx4eu", //live 
    plan_id: "price_1Qs1UJG7JtuXMMbft0yInx6G", //test 
    plan_name: "Yearly Subscription",
    duration: "year",
  },
];

module.exports = {
  createSubscription: async (req, res) => {
    try {
      console.log('REQBODY', req.body)
      const { plan_name, duration, email, userType, userId } = req?.body;
      const plan = plans?.find(
        (plan) => plan?.plan_name === plan_name && plan?.duration === duration
      );

      if (!plan) {
        return res?.status(400)?.json({ message: "Plan not found!!" });
      }
      console.log('plan', plan)

      // Check if customer exists by email
      const customers = await stripe.customers.list({
        email: email,
        limit: 1, // We only need to check for one customer
      });

      let customer;
      if (customers.data.length > 0) {
        // Customer exists, use the existing customer details
        customer = customers.data[0];
      } else {
        // Customer does not exist, create a new customer
        customer = await stripe.customers.create({
          email: email,
        });
      }

      // Create the subscription session
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: plan?.plan_id,
            quantity: 1,
          },
        ],
        success_url: `${process.env.CLIENT_URL}/subscription/${userType}/${userId}/successful?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/subscription/${userType}/${userId}/failure`,
        customer: customer.id, // Use the existing or new customer
      });
      console.log('session', session)
      return sendSuccessResponse(
        res,
        200,
        `Your Subscription Plan updated`,
        session
      );
    } catch (error) {
      console.log("Internal Server Error:", error);
      logErrorToFile(error, req);
      return sendErrorResponse(
        res,
        500,
        "An unexpected error occurred. Please try again later.",
        error
      );
    }
  },

  savePayment: async (req, res) => {
    try {
      const { session_id, userType, userId, email } = req?.body;
      const session = await stripe.checkout.sessions.retrieve(session_id);
      const subscription = await stripe.subscriptions.retrieve(
        session?.subscription
      );

      if (session.status == "complete") {
        // Convert timestamp to Date
        const startDate = new Date(subscription.current_period_start * 1000); // Multiply by 1000 to convert from seconds to milliseconds
        const endDate = new Date(subscription.current_period_end * 1000); // Multiply by 1000 to convert from seconds to milliseconds

        // Format the date in the desired format
        const formatDate = (date) => {
          return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        };

        // Display the formatted dates
        const subscriptionStartDate = formatDate(startDate);
        const subscriptionEndDate = formatDate(endDate);

        // Retrieve the plan details directly from Stripe
        const plan = await stripe.prices.retrieve(subscription?.plan?.id);

        if (!plan) {
          return res?.status(400)?.json({ message: "Plan not found!!" });
        }

        // Retrieve the associated product details using the product ID from the plan
        const product = await stripe.products.retrieve(plan.product);

        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }

        // Retrieve the associated product details using the invoice ID from the plan
        const invoice = await stripe.invoices.retrieve(
          subscription?.latest_invoice
        );

        if (!invoice) {
          return res.status(404).json({ message: "Invoice not found" });
        }

        const subscriptionDetails = {
          sessionId: session?.id,
          customerId: subscription?.customer,
          subscriptionId: subscription?.id,
          productId: subscription?.plan?.product,
          planId: subscription?.plan?.id,
          paymentIntentId: invoice?.payment_intent,
          paymentMethodId: subscription?.default_payment_method,
          invoiceId: subscription?.latest_invoice,
          invoiceNumber: invoice?.number,
          subscriptionStartDate,
          subscriptionEndDate,
          currency: subscription?.currency,
          amount:
            (Number.parseInt(subscription?.plan?.amount || 0) / 100).toFixed(
              2
            ) || 0,
          name: product?.name,
          months: subscription?.plan?.interval_count,
        };

        // Check if the subscription already exists based on the sessionId
        const SubscriptionExists = await Subscription.findOne({
          "subscriptionDetails.sessionId": session?.id,
        });

        if (SubscriptionExists) {
          // If subscription exists, return response with the existing subscription details
          return sendSuccessResponse(
            res,
            200,
            "Payment and invoice already saved!",
            SubscriptionExists
          );
        }

        // Create new subscription document
        const newSubscription = new Subscription({
          userId: userId, // Get userId from request body
          userSchemaReference: userType === "buyer" ? "Buyer" : "Supplier", // UserType determines schema reference
          subscriptionDetails: subscriptionDetails,
        });

        // Save the new subscription
        const newSubscriptionSaved = await newSubscription.save();

        if (!newSubscriptionSaved) {
          return sendErrorResponse(
            res,
            500,
            "Failed Saving Subscription Details"
          );
        }

        // Check if user exists before updating
        const updatedUser = await (userType === "buyer"
          ? Buyer
          : Supplier
        )?.findByIdAndUpdate(
          userId,
          {
            $set: {
              currentSubscription: newSubscriptionSaved?._id,
            },
            // Push the new subscription ID to the subscriptionsHistory array
            $push: {
              subscriptionsHistory: {
                subscriptionId: newSubscriptionSaved?._id,
              },
            },
          },
          { new: true }
        );

        if (!updatedUser) {
          return sendErrorResponse(
            res,
            500,
            "Failed Saving Subscription Details of the user"
          );
        }

        // Return the subscription details
        return sendSuccessResponse(
          res,
          200,
          "Payment and invoice saved successfully!",
          newSubscriptionSaved
        );
      } else {
        return sendErrorResponse(res, 400, "Payment session not complete");
      }
    } catch (error) {
      console.log("Internal Server Error:", error);
      logErrorToFile(error, req);
      return sendErrorResponse(
        res,
        500,
        "An unexpected error occurred. Please try again later.",
        error
      );
    }
  },

  sendEmailConfirmation: async (req, res) => {
    try {
      const { usertype } = req?.headers;
      const {
        session_id,
        userId,
        email,
        name,
        subscriptionStartDate,
        subscriptionEndDate,
        amount,
      } = req?.body;

      const userFound = await (usertype?.toLowerCase() == "buyer"
        ? Buyer
        : Supplier
      ).findByIdAndUpdate(userId, {
        $set: {
          subscriptionEmail: session_id,
        },
      });
      if (userFound?.subscriptionEmail?.trim() == session_id?.trim()) {
        return sendSuccessResponse(
          res,
          200,
          "Invoice have already been sent to the email!"
        );
      }
      console.log("req?.body?.user", usertype);
      const file = req.file || {};
      // Check if file is attached to the request
      if (!req.file) return sendErrorResponse(res, 500, "No file uploaded");

      // Assuming you're using Nodemailer to send the email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_USER_ID,
          pass: process.env.SMTP_USER_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.SMTP_USER_ID,
        to: email || "user1.stripe@yopmail.com", // Replace with the actual recipient's email
        subject: "Subscription Confirmation",
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
              <table style="width: 100%; background-color: #ffffff; border-radius: 8px; padding: 20px;">
                <tr>
                  <td>
                    <h2 style="text-align: center; color: #333;">Thank You for Subscribing!</h2>
                    <p style="color: #555; font-size: 16px;">Dear <strong>${userFound?.contact_person_name}</strong>,</p>
                    <p style="color: #555; font-size: 16px;">Thank you for subscribing to our service! We are excited to have you onboard.</p>
      
                    <h3 style="color: #333;">Subscription Details:</h3>
                    <ul style="color: #555; font-size: 16px;">
                      <li><strong>Subscription Plan:</strong> ${name}</li>
                      <li><strong>Start Date:</strong> ${subscriptionStartDate}</li>
                      <li><strong>End Date:</strong> ${subscriptionEndDate}</li>
                    </ul>
      
                    <h3 style="color: #333;">Payment Details:</h3>
                    <ul style="color: #555; font-size: 16px;">
                      <li><strong>Amount Paid:</strong> $ ${amount}</li>
                      <li><strong>Payment Date:</strong> ${subscriptionStartDate}</li>
                    </ul>
      
                    <p style="color: #555; font-size: 16px;">If you have any questions, feel free to contact our support team at <a href="mailto:connect@medhub.global">connect@medhub.global</a>.</p>
      
                    <p style="color: #555; font-size: 16px;">Best regards,<br>Medhub Global Team</p>
                  </td>
                </tr>
              </table>
      
              <footer style="text-align: center; color: #888; font-size: 12px; margin-top: 20px;">
                <p>&copy; 2025 Medhub Global. All rights reserved.</p>
                <p>If you did not subscribe to this service, please ignore this email.</p>
              </footer>
            </body>
          </html>
        `,
        attachments: [
          {
            filename: file.originalname,
            path: file.path,
          },
        ],
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          logErrorToFile(error, req);
          return sendErrorResponse(res, 500, "Failed to send email", error);
        }

        // Delete the file after sending the email
        fs.unlink(file.path, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
            logErrorToFile(err, req);
            return sendErrorResponse(res, 500, "Error deleting file:", err);
          }
        });
      });

      // Send another email to the admin
      const adminMailOptions = {
        from: process.env.SMTP_USER_ID,
        to: process.env.ADMIN_EMAIL, // Replace with admin email
        subject: "New Subscription and Payment Confirmation",
        html: `
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
            <table style="width: 100%; background-color: #ffffff; border-radius: 8px; padding: 20px;">
              <tr>
                <td>
                  <h2 style="text-align: center; color: #333;">New Subscription and Payment Confirmation</h2>
                  <p style="color: #555; font-size: 16px;">Dear Admin,</p>
                  <p style="color: #555; font-size: 16px;">A new subscription has been successfully created for the user <strong>${
                    userFound?.contact_person_name
                  }</strong>.</p>
      
                  <h3 style="color: #333;">Subscription Details:</h3>
                  <ul style="color: #555; font-size: 16px;">
                    <li><strong>Subscription Plan:</strong> ${name}</li>
                    <li><strong>Start Date:</strong> ${subscriptionStartDate}</li>
                    <li><strong>End Date:</strong> ${subscriptionEndDate}</li>
                    <li><strong>User Type:</strong> ${
                      usertype?.toLowerCase() == "buyer" ? "Buyer" : "Supplier"
                    }</li>
                  </ul>
      
                  <h3 style="color: #333;">Payment Details:</h3>
                  <ul style="color: #555; font-size: 16px;">
                    <li><strong>Amount Paid:</strong> $ ${amount}</li>
                    <li><strong>Payment Date:</strong> ${subscriptionStartDate}</li>
                  </ul>
      
                  <p style="color: #555; font-size: 16px;">If you need more details, please check the subscription records in the system.</p>
                  <p style="color: #555; font-size: 16px;">Best regards,<br>Medhub Global Team</p>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
      };

      transporter.sendMail(adminMailOptions, (error, info) => {
        if (error) {
          console.error("Error sending admin email:", error);
          logErrorToFile(error, req);
        } else {
          console.log("Admin email sent successfully");
        }
      });

      const updaedUserForEmail = await (usertype?.toLowerCase() == "buyer"
        ? Buyer
        : Supplier
      ).findByIdAndUpdate(
        userId,
        {
          $set: {
            subscriptionEmail: session_id,
          },
        },
        { new: true }
      );
      if (!updaedUserForEmail)
        return sendErrorResponse(res, 500, "No user found");

      // Return the subscription details
      return sendSuccessResponse(
        res,
        200,
        "Invoice have been sent to the email!"
      );
    } catch (error) {
      console.log("Internal Server Error:", error);
      logErrorToFile(error, req);
      return sendErrorResponse(
        res,
        500,
        "An unexpected error occurred. Please try again later.",
        error
      );
    }
  },

  getSubscriptionDetils: async (req, res) => {
    try {
      const { id } = req?.params;
      const subscriptionDetails = await Subscription.findById(id);
      if (!subscriptionDetails)
        return sendErrorResponse(res, 500, "No Subscription found");

      // Return the subscription details
      return sendSuccessResponse(
        res,
        200,
        "Subscription Found!",
        subscriptionDetails
      );
    } catch (error) {
      console.log("Internal Server Error:", error);
      logErrorToFile(error, req);
      return sendErrorResponse(
        res,
        500,
        "An unexpected error occurred. Please try again later.",
        error
      );
    }
  },
};
