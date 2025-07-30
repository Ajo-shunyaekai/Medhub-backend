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
  sendSubscriptionPaymentEmailContent,
} = require("../utils/emailContents");
const { sendEmail } = require("../utils/emailService");
const { getFilePathsAdd } = require("../helper");
const { default: mongoose } = require("mongoose");

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

// Array of available subscription coupons
const discounts = [
  {
    name: "SAVET1-99",
    id: "i7QVnDDB",
  },
  {
    name: "SAVET2-198",
    id: "tKcpuARp",
  },
  {
    name: "SAVET3-297",
    id: "RjZT9s9M",
  },
  {
    name: "SAVET4-396",
    id: "BLHeHGTq",
  },
  {
    name: "SAVET6-594",
    id: "xn2mnvi1",
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
      discount,
    } = req?.body;

    const foundDiscount = discounts?.find(
      (ele) => ele?.name?.toLowerCase() == discount?.toLowerCase()
    );

    if (!foundDiscount) {
      return res?.status(400)?.json({ message: "Coupon Code not found!!" });
    }

    const plan = plans?.find(
      (plan) => plan?.plan_name === plan_name && plan?.duration === duration
    );

    if (!plan) {
      return res?.status(400)?.json({ message: "Plan not found!!" });
    }

    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    let customer;
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({ email: email });
    }

    const invoiceFile = await getFilePathsAdd(req, res, ["invoice_pdf"]);

    const user = await (userType?.trim()?.toLowerCase() === "supplier"
      ? Supplier
      : Buyer
    )?.findOne({
      contact_person_email: email,
    });

    if (!user) {
      return sendErrorResponse(res, 500, "Failed Finding user");
    }

    const subscription = await Subscription.create({
      userId: user?._id,
      email: user?.contact_person_email,
      userType:
        userType?.trim()?.toLowerCase() === "buyer" ? "Buyer" : "Supplier",
      custom_invoice_pdf: invoiceFile?.["invoice_pdf"]?.[0] || "",
      custom_subscription_id: "SBSC-" + Math.random().toString(16).slice(2, 10),
    });

    if (!subscription) {
      return sendErrorResponse(res, 500, "Failed Creating Subscription");
    }

    // Step 1: Create session
    const sessionData = {
      mode: "subscription",
      // discounts: [{ coupon: "bcmkVBK9" }],
      payment_method_types: ["card"],
      line_items: [{ price: plan?.plan_id, quantity: 1 }],
      payment_method_options: {
        card: { request_three_d_secure: "any" },
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      success_url: `${process.env.CLIENT_URL}/subscription/${userType}/${userId}/successful`,
      cancel_url: `${process.env.CLIENT_URL}/subscription/${userType}/${userId}/failure`,
      customer: customer.id,
      metadata: {
        subscriptionId: String(subscription?._id),
        userId: String(userId),
        email: String(email),
        userType: String(userType),
      },
    };

    // ✅ If discount is found, include it
    if (foundDiscount?.id) {
      sessionData.discounts = [{ coupon: foundDiscount.id }];
    }

    // Step 1: Create session
    const session = await stripe.checkout.sessions.create(sessionData);

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

const savePaymentAndSendEmail = async (req, res, detailObj) => {
  try {
    const { session_id, userType, userId, email, subscriptionId } = detailObj;

    if (!mongoose.Types.ObjectId.isValid(subscriptionId)) {
      console.error("Invalid subscription ID");
      return sendErrorResponse(res, 500, "Invalid subscription ID");
    }

    const subscriptionExists = await Subscription.findOne({
      _id: new mongoose.Types.ObjectId(subscriptionId),
    });

    if (!subscriptionExists) {
      console.error("No Subscription details found");
      return sendErrorResponse(res, 500, "No Subscription details found");
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    const subscription = await stripe.subscriptions.retrieve(
      session?.subscription
    );

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
      console.error({ message: "Plan not found!!" });
      return sendErrorResponse(res, 500, "Plan not found!!");
    }

    // Retrieve the associated product details using the product ID from the plan
    const product = await stripe.products.retrieve(plan.product);

    if (!product) {
      console.error("Product not found");
    }

    // Retrieve the associated product details using the invoice ID from the plan
    const invoice = await stripe.invoices.retrieve(
      subscription?.latest_invoice
    );

    if (!invoice) {
      console.error("Invoice not found");
      return sendErrorResponse(res, 500, "Invoice not found");
    }

    const updatedSubscription = await Subscription.findByIdAndUpdate(
      subscriptionExists,
      {
        $set: {
          sessionId: session?.id,
          subtotalAmount:
            (Number.parseInt(session?.amount_subtotal || 0) / 100).toFixed(2) ||
            0,
          totalAmount:
            (Number.parseInt(session?.amount_total || 0) / 100).toFixed(2) || 0,
          currency: session?.currency,
          customer: session?.customer,
          subscriptionId: subscription?.id,
          paymentMethodId: subscription?.default_payment_method,
          subscriptionStartDate,
          subscriptionEndDate,
          planId: plan?.id,
          productId: product?.id,
          productName: product?.name,
          invoiceNumber: invoice?.number,
          invoiceId: invoice?.id,
          invoicePdf: invoice?.invoice_pdf,
          paymentIntentId: invoice?.payment_intent,
          invoiceStatus: invoice?.status,
        },
      },
      { new: true }
    );

    if (!updatedSubscription) {
      console.error("Failed updating subscription details");
      return sendErrorResponse(
        res,
        500,
        "Failed updating subscription details"
      );
    }

    // Check if user exists before updating
    const updatedUser = await (userType?.toLowerCase() === "buyer"
      ? Buyer
      : Supplier
    )?.findOneAndUpdate(
      { _id: updatedSubscription?.userId },
      {
        $set: {
          currentSubscription: updatedSubscription?._id,
        },
        // Push the new subscription ID to the subscriptionsHistory array
        $push: {
          subscriptionsHistory: updatedSubscription?._id,
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

    const attachments = [
      {
        filename: `Custom_Invoice_${updatedSubscription?.invoiceNumber}.pdf`,
        path: updatedSubscription?.custom_invoice_pdf,
      },
      {
        filename: `Stripe_Invoice_${updatedSubscription?.invoiceNumber}.pdf`,
        path: updatedSubscription?.invoicePdf,
      },
    ];

    const subject = "Subscription Confirmation";
    const emailContent = await sendEmailConfirmationContent(
      updatedUser,
      updatedSubscription?.productName,
      subscriptionStartDate,
      subscriptionEndDate,
      updatedSubscription?.totalAmount
    );
    await sendEmail(
      email ||
        updatedUser?.contact_person_email || [
          "ajo@shunyaekai.tech",
          "Shivani@shunyaekai.tech",
        ],
      subject,
      emailContent,
      attachments
    );

    const subject2 = "New Subscription and Payment Confirmation";
    const emailContent2 = await adminMailOptionsContent(
      updatedUser,
      updatedSubscription?.productName,
      subscriptionStartDate,
      subscriptionEndDate,
      userType,
      updatedSubscription?.totalAmount
    );
    await sendEmail(
      process.env.ADMIN_EMAIL,
      subject2,
      emailContent2,
      attachments
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

const stripeWebhook = async (req, res) => {
  try {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const sig = req?.headers["stripe-signature"];
    let event = req?.body;
    if (endpointSecret) {
      // Get the signature sent by Stripe
      const signature = sig;
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          endpointSecret
        );
      } catch (err) {
        console.error(
          `⚠️  Webhook signature verification failed.`,
          err.message
        );
        // return res.sendStatus(400);
        return sendErrorResponse(
          res,
          400,
          "Webhook signature verification failed"
        );
      }
    }
    const session = event?.data?.object;

    // Handle the event
    switch (event?.type) {
      case "invoice.updated":
        break;
      case "invoice.finalized":
        break;
      case "invoice.payment_action_required":
        break;
      case "customer.created":
        break;
      case "customer.updated":
        break;
      case "checkout.session.async_payment_failed":
        break;
      case "checkout.session.async_payment_succeeded":
        break;
      case "checkout.session.completed":
        savePaymentAndSendEmail(req, res, {
          ...session?.metadata,
          session_id: session?.id,
        });
        break;
      case "checkout.session.expired":
        break;
      case "payment_intent.succeeded":
        break;
      case "charge.succeeded":
        break;
      case "payment_method.attached":
        break;
      case "customer.subscription.created":
        break;
      case "customer.subscription.updated":
        break;
      case "invoice.paid":
        break;
      case "invoice.payment_succeeded":
        break;

      default:
        console.error(`\n Unhandled event type \n${event.type}`);
        return res.status(200).send("Event ignored");
    }
  } catch (error) {
    handleCatchBlockError(req, res, error);
  }
};

const sendSubscriptionPaymentReqUrl = async (req, res) => {
  try {
    const { userType, userId } = req?.params;
    const user = await (userType?.toLowerCase() === "buyer"
      ? Buyer
      : Supplier
    )?.findOne({
      [userType?.toLowerCase() === "buyer" ? "buyer_id" : "supplier_id"]:
        userId,
    });

    if (!user) {
      return sendErrorResponse(res, 500, "USer Not Found!!");
    }
    const subject = "Subscription Payment Link";
    const emailContent = await sendSubscriptionPaymentEmailContent(
      user,
      user?._id,
      userType
    );
    await sendEmail(
      user?.contact_person_email || [
        "ajo@shunyaekai.tech",
        "Shivani@shunyaekai.tech",
      ],
      subject,
      emailContent
    );
    // Return the subscription details
    return sendSuccessResponse(res, 200, "Mail sent!");
  } catch (error) {
    handleCatchBlockError(req, res, error);
  }
};

const addubscriptionPaymentReqUrl = async (req, res) => {
  try {
    const { userType, userId } = req?.params();
    const user = await (userType?.toLowerCase() === "buyer"
      ? Buyer
      : Supplier
    )?.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          showSubscriptionUrl: true,
        },
      },
      { new: true }
    );

    if (!user) {
      return sendErrorResponse(
        res,
        500,
        "Failed Saving Subscription Payment url of the user"
      );
    }
    // Return the subscription details
    return sendSuccessResponse(
      res,
      200,
      "Subscription ubscription Payment url of the user Saved!"
    );
  } catch (error) {
    handleCatchBlockError(req, res, error);
  }
};

module.exports = {
  createSubscription,
  savePaymentAndSendEmail,
  getSubscriptionDetils,
  stripeWebhook,
  sendSubscriptionPaymentReqUrl,
  addubscriptionPaymentReqUrl,
};
