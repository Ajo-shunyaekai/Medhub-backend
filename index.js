const express = require("express");
const path = require("path");
const { websiteEnquiryEmail } = require("./controller/website");

// Route Definitions
module.exports = function (app) {
  // Serve HTML files for the website
  const routes = [
    { paths: ["/", "/index.html", "/index"], file: "index.html" },
    { paths: ["/about.html", "/about"], file: "about.html" },
    { paths: ["/buyer.html"], file: "buyer.html" },
    { paths: ["/supplier.html"], file: "supplier.html" },
    { paths: ["/pricing.html", "/pricing"], file: "pricing.html" },
    { paths: ["/contact-us.html", "/contact-us"], file: "contact-us.html" },
    { paths: ["/privacy-policy.html", "/privacy-policy"], file: "privacy-policy.html" },
    { paths: ["/terms-and-conditions.html", "/terms-and-conditions"], file: "terms-and-conditions.html" },
    { paths: ["/request-a-demo.html", "/request-a-demo"], file: "request-a-demo.html" },
  ];

  routes.forEach((route) => {
    app.get(route.paths, (req, res) => {
      res.sendFile(path.join(__dirname, "public", route.file));
    });
  });

  // Serve video files from the uploads folder
  app.use("/videos", express.static(path.join(__dirname, "uploads/hls")));

  // Website enquiry email
  app.post("/send-email", websiteEnquiryEmail);

  // API Routes
  app.use(`/api/auth`, require(`./routes/authRoutes`));
  app.use(`/api/product`, require(`./routes/productRoutes`));
  app.use("/api/address", require(`./routes/addressRoutes`));
  app.use("/api/subscription", require("./routes/subscriptionRoutes"));
  app.use("/api/logistics", require(`./routes/logisticsPartnerRoutes`));
  app.use("/api/admin", require("./routes/adminRoutes")());
  app.use("/api/medicine", require("./routes/medicineRoute")());
  app.use("/api/buyer/medicine", require("./routes/medicineRoute")());
  app.use("/api/supplier/medicine", require("./routes/medicineRoute")());
  app.use("/api/admin/medicine", require("./routes/medicineRoute")());
  app.use("/api/buyer", require("./routes/buyerRoutes")());
  app.use("/api/supplier", require("./routes/supplierRoutes")());
  app.use("/api/order", require("./routes/orderRoutes")());
  app.use("/api/enquiry", require("./routes/enquiryRoutes")());
  app.use("/api/purchaseorder", require("./routes/purchaseOrderRoutes")());
  app.use("/api/invoice", require("./routes/invoiceRoutes")());
  app.use("/api/support", require("./routes/supportRoutes")());

  // Catch-all for other routes
  app.get(["/*"], (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });
};
