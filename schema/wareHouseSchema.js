const mongoose = require("mongoose");

const wareHouseSchema = new mongoose.Schema(
  {
    pending: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bom", // Replace with the name of the related model
      },
    ],
    inTransit: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bom", // Replace with the name of the related model
      },
    ],
    completed: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bom", // Replace with the name of the related model
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Warehouse", wareHouseSchema);
