const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const { addProduct, editProduct, getAllProducts, getProduct, deleteProduct, getProductsByCategory, getProductsBySubcategory, queryProducts } = require('../controllers/productController');

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/products/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Create product
router.post('/', upload.fields([
  { name: 'featuredImage', maxCount: 1 },
  { name: 'gallery', maxCount: 10 }
]), addProduct);

// Get all products
router.get('/', getAllProducts);

// Get products by category
router.get('/category/:categoryId', getProductsByCategory);
// Get products by subcategory
router.get('/subcategory/:subcategoryId', getProductsBySubcategory);
// Flexible query endpoint
router.get('/query', queryProducts);

// Get single product (must be after the above)
router.get('/:id', getProduct);

// Update product
router.put('/:id', upload.fields([
  { name: 'featuredImage', maxCount: 1 },
  { name: 'gallery', maxCount: 10 }
]), editProduct);

// Delete product
router.delete('/:id', deleteProduct);

module.exports = router; 