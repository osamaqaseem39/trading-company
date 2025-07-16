const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const { addProduct, editProduct, getAllProducts, getProduct, deleteProduct } = require('../controllers/productController');

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

// Get single product
router.get('/:id', getProduct);

// Update product
router.put('/:id', upload.fields([
  { name: 'featuredImage', maxCount: 1 },
  { name: 'gallery', maxCount: 10 }
]), editProduct);

// Delete product
router.delete('/:id', deleteProduct);

module.exports = router; 