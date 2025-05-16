const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const packageInformationSchema = new Schema({
  total_no_of_packages: { type: Number, required: true },
  package_details: [
    {
      package_name: { type: String },
      dimensions: {
        length: { type: Number, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
        volume: { type: Number, required: true },
      },
      weight: { type: Number, required: true },
    },
  ],
});

const bomSchema = new Schema({
  products: [
    {
      product_id: { type: String, required: true },
      product_name: { type: String, required: true },
      quantity: { type: Number, required: true },
      no_of_packages: { type: Number, required: true },
    },
  ],
  package_information: packageInformationSchema,
});

module.exports = mongoose.model("Bom", bomSchema);
