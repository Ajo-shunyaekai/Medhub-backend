const { Server } = require('socket.io');

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: [
        'http://192.168.1.31:2221',
        'http://192.168.1.82:3000',
        'http://192.168.1.42:3000',
        'http://192.168.1.14:3000',
        'http://localhost:2221',
        'http://localhost:3030',
        'http://localhost:8000',
        'http://192.168.1.34:3333',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3333',
        'http://192.168.1.2:8000',
        'https://supplierdeliver.shunyaekai.com',
        'https://buyerdeliver.shunyaekai.com',
        'https://deliver.shunyaekai.com',
        'https://medhub.shunyaekai.com'
      ],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    // console.log('User connected:', socket.id);

    // Registration handlers
    ['register', 'registerBuyer', 'registerAdmin'].forEach(event => {
      socket.on(event, (userId) => {
        // console.log(`${event.replace('register', '')} registered: ${userId}`);
        socket.join(userId);
      });
    });

    // Notification handlers
    const notificationEvents = [
      { event: 'sendNotification',          emit: 'notification' },
      { event: 'sendInquiry',               emit: 'newEnquiry' },
      { event: 'submitQuotation',           emit: 'enquiryQuotation' },
      { event: 'createPO',                  emit: 'POCreated' },
      { event: 'editPO',                    emit: 'POEdited' },
      { event: 'createOrder',               emit: 'orderCreated' },
      { event: 'bookLogistics',             emit: 'logisticsRequest' },
      { event: 'shipmentDetailsSubmitted',  emit: 'shipmentDetailsSubmission' },
      { event: 'createInvoice',             emit: 'invoiceCreated' },
      { event: 'invoicePaymentDone',        emit: 'invoicePaymentStatusUpdated' },
      { event: 'buyerRegistration',         emit: 'buyerRegistered' },
      { event: 'supplierRegistration',      emit: 'supplierRegistered' },
      { event: 'addMedicine',               emit: 'medicineRequest' },
      { event: 'editNewMedicine',           emit: 'newMedicineEditRequest' },
      { event: 'editSecondaryMedicine',     emit: 'secondaryMedicineEditRequest' },
      { event: 'updateMedicineAddRequest',  emit: 'addMedicineRequestUpdated' },
      { event: 'updateMedicineEditRequest', emit: 'editMedicineRequestUpdated' },
      { event: 'updateProfileEditRequest',  emit: 'editProfileRequestUpdated' },
    ];

    notificationEvents.forEach(({ event, emit }) => {
      socket.on(event, (data) => {
        const { userId, supplierId, buyerId, adminId, message } = data;
        const targetId = userId || supplierId || buyerId || adminId;

        if (targetId) {
          io.to(targetId).emit(emit, message);
          // console.log(`${event} notification sent to ${targetId}`);
        }
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      // console.log('User disconnected: ', socket.id);
    });
  });

  return io;
}

module.exports = initializeSocket;
