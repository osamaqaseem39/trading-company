const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadBrochure');
const supplierController = require('../controllers/supplierController');

// POST /api/suppliers
router.post('/', upload.single('brochure'), supplierController.createSupplier);

// GET /api/suppliers
router.get('/', supplierController.getSuppliers);

// GET /api/suppliers/:id
router.get('/:id', supplierController.getSupplier);

module.exports = router; 