const express = require('express');
const router = express.Router();
const subcategoryController = require('../controllers/subcategoryController');

// Get all subcategories
router.get('/', subcategoryController.getSubcategories);

// Get nested subcategories
router.get('/nested', subcategoryController.getNestedSubcategories);

// Get a single subcategory
router.get('/:id', subcategoryController.getSubcategory);

// Create a subcategory
router.post('/', subcategoryController.createSubcategory);

// Update a subcategory
router.put('/:id', subcategoryController.updateSubcategory);

// Delete a subcategory
router.delete('/:id', subcategoryController.deleteSubcategory);

module.exports = router; 