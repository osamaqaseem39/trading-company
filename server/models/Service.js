const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  featuredImage: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service; 