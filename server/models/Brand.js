const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  image: { type: String }, // file path
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Brand', BrandSchema); 