const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  details: { type: String, required: true },
  image: { type: String },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const Quote = mongoose.model('Quote', quoteSchema);
module.exports = Quote; 