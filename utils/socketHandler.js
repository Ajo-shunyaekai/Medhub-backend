const { Server } = require("socket.io");
const { corsOptions } = require("../config/corsOptions");

function initializeSocket(server) {
  const io = new Server(server, {
    cors: corsOptions,
  });

  io.on("connection", (socket) => {
    // Registration handlers
    ["register", "registerBuyer", "registerAdmin", "registerPartner"].forEach((event) => {
      socket.on(event, (userId) => {
        socket.join(userId);
      });
    });

    // Notification handlers
    const notificationEvents = [
      { event: "sendNotification", emit: "notification" },
      { event: "sendInquiry", emit: "newEnquiry" },
      { event: "submitQuotation", emit: "enquiryQuotation" },
      { event: "createPO", emit: "POCreated" },
      { event: "editPO", emit: "POEdited" },
      { event: "createOrder", emit: "orderCreated" },
      { event: "bookLogistics", emit: "logisticsRequest" },
      { event: "shipmentDetailsSubmitted", emit: "shipmentDetailsSubmission" },
      { event: "createInvoice", emit: "invoiceCreated" },
      { event: "invoicePaymentDone", emit: "invoicePaymentStatusUpdated" },
      { event: "buyerRegistration", emit: "buyerRegistered" },
      { event: "supplierRegistration", emit: "supplierRegistered" },
      { event: "addMedicine", emit: "medicineRequest" },
      { event: "editNewMedicine", emit: "newMedicineEditRequest" },
      { event: "editSecondaryMedicine", emit: "secondaryMedicineEditRequest" },
      { event: "updateMedicineAddRequest", emit: "addMedicineRequestUpdated" },
      {
        event: "updateMedicineEditRequest",
        emit: "editMedicineRequestUpdated",
      },
      { event: "updateProfileEditRequest", emit: "editProfileRequestUpdated" },
    ];

    notificationEvents.forEach(({ event, emit }) => {
      socket.on(event, (data) => {
        const { userId, supplierId, buyerId, adminId, message } = data;
        const targetId = userId || supplierId || buyerId || adminId;

        if (targetId) {
          io.to(targetId).emit(emit, message);
        }
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {});
  });

  return io;
}

module.exports = initializeSocket;
