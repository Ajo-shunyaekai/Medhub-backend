const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderCancellation = new Schema({
  order_id: {
    type: String,
    ref: "Order",
    required: true,
  },
  item_id: {
    type: String,
    ref: "OrderItem",
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  cancelled_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("OrderCanellation", orderCancellation);
