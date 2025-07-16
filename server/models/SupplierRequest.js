const mongoose = require('mongoose');

const SupplierRequestSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  companyName: { type: String, required: true },
  jobTitle: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true },
  },
  ingredientsSupplied: { type: String, required: true },
  foodSafetyAccreditations: { type: String, required: true },
  brochure: { type: String }, // file path
  website: { type: String },
  message: { type: String },
  newsletterSubscribed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SupplierRequest', SupplierRequestSchema); 