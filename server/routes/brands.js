const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadBrandCategoryImage');
const brandController = require('../controllers/brandController');

// POST /api/brands
router.post('/', upload.single('image'), brandController.createBrand);
// GET /api/brands
router.get('/', brandController.getBrands);
// GET /api/brands/:id
router.get('/:id', brandController.getBrand);
// PUT /api/brands/:id
router.put('/:id', upload.single('image'), brandController.updateBrand);
// DELETE /api/brands/:id
router.delete('/:id', brandController.deleteBrand);

module.exports = router; 