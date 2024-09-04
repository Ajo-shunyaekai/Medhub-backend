const mongoose = require('mongoose');

const baseOptions = {
  discriminatorKey : 'medicine_type', 
  collection       : 'medicineeditrequest',          
};

const medicineEditRequest = new mongoose.Schema({
  medicine_id: {
    type: String,
    required: true,
    // unique: true
  },
  supplier_id: {
    type: String,
    required: true,
  },
  medicine_name: {
    type: String,
    required: true
  },
  
  composition: {
    type: String,
    required: true
  },
  strength: {
    type: String,
    required: true
  },
  type_of_form: {
    type: String,
    required: true
  },
  shelf_life: {
    type: String,
    required: true
  },
  dossier_type: {
    type: String,
    required: true
  },
  dossier_status: {
    type: String,
    required: true
  },
  medicine_category: {
    type: String,
    required: true
  },
  total_quantity: {
    type: String,
    required: true
  },
  gmp_approvals: {
    type: String,
    required: true
  },
  shipping_time: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    required: true
  }],
  unit_tax : {
    type: String,
    required: true
  },
  country_of_origin: {
    type: String,
    required: true
  },
  registered_in: [{
    type: String,
    required: true
  }],
  stocked_in: [{
    type: String,
    required: true
  }],
  available_for: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  medicine_image: [{
    type: String,
    trim: true,
    required: true
  }],
  manufacturer_name: {
    type: String,
    required: true
  },
  manufacturer_country_of_origin: {
    type: String,
    required: true
  },
  manufacturer_description: {
    type: String,
    required: true
  },
  stockedIn_details: [{
    stocked_in_country : String,
    stocked_quantity   : String,
    stocked_in_type    : String,
  }],
  inventory_info: [{
    quantity          : String,
    unit_price        : String,
    total_price       : String,
    est_delivery_days : String,
  }],
  status: {  // 0 - pending, 1 - accepted  ,  2 - rejected, 
    type: Number,
    
  },
  edit_status: {  // 0 - pending, 1 - accepted  ,  2 - rejected, 
    type: Number,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, baseOptions);

const EditMedicine = mongoose.model('MedicineEditRequest', medicineEditRequest);

const newMedicineEditRequestSchema = new mongoose.Schema({
  inventory_info: [{
    quantity          : String,
    unit_price        : String,
    total_price       : String,
    est_delivery_days : String,
  }],
});

const NewMedicineEdit = EditMedicine.discriminator('new_medicine', newMedicineEditRequestSchema);

const secondaryMarketMedicineEditRequestSchema = new mongoose.Schema({
  purchased_on: {
    type: String,
  },
  country_available_in: [{
    type: String,
  }],
  min_purchase_unit: {
    type: String,
  },
  unit_price: {
    type: String,
  },
  condition: {
    type: String,
  },
  invoice_image: [{
    type: String,
    trim: true
  }]
});

const SecondaryMarketMedicineEdit = EditMedicine.discriminator('secondary_medicine', secondaryMarketMedicineEditRequestSchema);

module.exports = {
  EditMedicine,
  NewMedicineEdit,
  SecondaryMarketMedicineEdit
};