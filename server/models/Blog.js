const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  featuredImage: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  
  slug: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

// Create URL-friendly slug from title
blogSchema.pre('save', function(next) {
  if (!this.slug || this.isModified('title')) {
    let slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')  // Replace any non-alphanumeric chars with hyphen
      .replace(/^-+|-+$/g, '')      // Remove leading/trailing hyphens
      .replace(/-{2,}/g, '-');      // Replace multiple consecutive hyphens with single hyphen
    
    // If slug is empty after cleaning (e.g., title was all special characters)
    if (!slug) {
      slug = 'untitled-' + Date.now();
    }
    
    // Add timestamp to ensure uniqueness
    this.slug = `${slug}-${Date.now()}`;
  }
  next();
});

const Blog = mongoose.model('Blog', blogSchema);
module.exports = Blog; 