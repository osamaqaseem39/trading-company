const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
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
  },
  gallery: [{
    type: String
  }]
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product; 