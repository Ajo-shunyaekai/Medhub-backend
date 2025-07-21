require("dotenv").config();
const logErrorToFile = require("../logs/errorLogs");
const {
  sendErrorResponse,
  sendSuccessResponse,
  handleCatchBlockError,
} = require("../utils/commonResonse");
const nodemailer = require("nodemailer");
const fs = require("fs");

const Buyer = require("../schema/buyerSchema");
const Supplier = require("../schema/supplierSchema");
const Subscription = require("../schema/subscriptionSchema");
const {
  sendEmailConfirmationContent,
  adminMailOptionsContent,
} = require("../utils/emailContents");
const { sendEmail } = require("../utils/emailService");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // Your secret key from Stripe

// Array of available subscription plans
const plans = [
  {
    // plan_id: "price_1Qs1YUG7JtuXMMbfa6sW0JO9", //live
    // plan_id: "price_1Qs1ShG7JtuXMMbfLKxV6J7B", //test
    plan_id: "price_1RmAOUG7JtuXMMbfSO5Zc7q7", //test
    plan_name: "Monthly Subscription",
    duration: "month",
  },
  {
    // plan_id: "price_1Qs1YQG7JtuXMMbfWUPZx4eu", //live
    // plan_id: "price_1Qs1UJG7JtuXMMbft0yInx6G", //test
    plan_id: "price_1RmAKgG7JtuXMMbfPiiCFCZN", //test
    plan_name: "Yearly Subscription",
    duration: "year",
  },
];

const createSubscription = async (req, res) => {
  try {
    const {
      plan_name,
      duration,
      email = "ajostripetest@yopmail.com",
      userType,
      userId,
    } = req?.body;

    const plan = plans?.find(
      (plan) => plan?.plan_name === plan_name && plan?.duration === duration
    );

    if (!plan) {
      return res?.status(400)?.json({ message: "Plan not found!!" });
    }
    console.log("\n\n\n\njjjjjjjj", req?.body);

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

    if (!session) {
      return res
        ?.status(400)
        ?.json({ message: "Error with payment integration!!" });
    }

    return sendSuccessResponse(
      res,
      200,
      `Your Subscription Plan updated`,
      session
    );
  } catch (error) {
    handleCatchBlockError(req, res, error);
  }
};
const savePayment = async (req, res) => {
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
          (Number.parseInt(subscription?.plan?.amount || 0) / 100).toFixed(2) ||
          0,
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
        userId: userId, // Get userId from req body
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
    handleCatchBlockError(req, res, error);
  }
};
const sendEmailConfirmation = async (req, res) => {
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
    const file = req.file || {};
    // Check if file is attached to the req
    if (!req.file) return sendErrorResponse(res, 500, "No file uploaded");

    // Assuming you're using Nodemailer to send the email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER_ID,
        pass: process.env.SMTP_USER_PASSWORD,
      },
    });

    const subject = "Subscription Confirmation";

    const emailContent = await sendEmailConfirmationContent(
      userFound,
      name,
      subscriptionStartDate,
      subscriptionEndDate,
      amount
    );
    await sendEmail(
      email || "user1.stripe@yopmail.com",
      subject,
      emailContent,
      [
        {
          filename: file.originalname,
          path: file.path,
        },
      ]
    );

    // Delete the file after sending the email
    fs.unlink(file.path, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
        logErrorToFile(err, req);
        return sendErrorResponse(res, 500, "Error deleting file:", err);
      }
    });

    const subject2 = "New Subscription and Payment Confirmation";
    const emailContent2 = await adminMailOptionsContent(
      userFound,
      name,
      subscriptionStartDate,
      subscriptionEndDate,
      usertype,
      amount
    );
    await sendEmail(process.env.ADMIN_EMAIL, subject2, emailContent2, [
      {
        filename: file.originalname,
        path: file.path,
      },
    ]);

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
    handleCatchBlockError(req, res, error);
  }
};
const getSubscriptionDetils = async (req, res) => {
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
    handleCatchBlockError(req, res, error);
  }
};
// const stripeWebhook = async (req, res) => {
//   try {
//     const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
//     const sig = req.headers["stripe-signature"];
//     let event;
//     // console.log('body :', req.body);
//     try {
//       event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//     } catch (err) {
//       console.log("errmsg:", err.message);
//       // res.status(400).send(`Webhook Error: ${err.message}`);
//       handleCatchBlockError(req, res, err);
//       return;
//     }
//     // Handle the event
//     const bookingType = event.data.object.metadata?.booking_type;
//     const bookingId = event.data.object.metadata?.booking_id;
//     const userId = event.data.object.metadata?.user_id;
//     const couponCode = event.data.object.metadata?.coupon_code;
//     const sessionId = event.data.object.id;
//     const paymentIntentId =
//       event.data.object.payment_intent || event.data.object.id;

//     switch (event.type) {
//       case "checkout.session.completed":
//         const userId = event.data.object.metadata?.user_id;
//         const userType = event.data.object.metadata?.user_type;
//         const planName = event.data.object.metadata?.plan_name;

//         // Optional: log or use metadata
//         console.log(`User ${userId} of type ${userType} purchased ${planName}`);

//         // Then call your logic
//         await BookingConfirm(
//           bookingType,
//           bookingId,
//           paymentIntentId,
//           couponCode
//         );
//         break;
//       default:
//         console.log(`Unhandled event type ${event.data.object}`);
//     }
//     // Return a 200 response to acknowledge receipt of the event
//     return sendSuccessResponse(res, 200, "Subscription success!");
//     return;
//   } catch (error) {
//     handleCatchBlockError(req, res, err);
//   }
// };
const stripeWebhook = async (req, res) => {
  try {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error("Webhook signature error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        try {
          const session = event.data.object;

          const session_id = session.id;
          const userId = session.metadata?.user_id;
          const userType = session.metadata?.user_type;
          const email =
            session.customer_details?.email || session.metadata?.email;
          const name = session.customer_details?.name || "User";

          // Call the savePayment function
          await savePayment(
            {
              body: {
                session_id,
                userType,
                userId,
                email,
              },
            },
            res
          ); // Call directly with req-like object

          // Call the sendEmailConfirmation function
          await sendEmailConfirmation(
            {
              headers: { usertype: userType },
              body: {
                session_id,
                userId,
                email,
                name,
                subscriptionStartDate: "", // You can retrieve actual dates inside savePayment and pass back
                subscriptionEndDate: "",
                amount: "",
              },
              file: null, // If you're attaching invoice PDF later, pass it here
            },
            res
          );

          return res.status(200).send("Webhook handled and actions completed.");
        } catch (err) {
          console.error("Webhook internal logic error:", err);
          return res
            .status(500)
            .send("Internal server error during webhook handling.");
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
        return res.status(200).send("Event ignored");
    }
  } catch (error) {
    handleCatchBlockError(req, res, error);
  }
};
module.exports = {
  createSubscription,
  savePayment,
  sendEmailConfirmation,
  getSubscriptionDetils,
  stripeWebhook,
};
