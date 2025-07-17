const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadBrandCategoryImage');
const categoryController = require('../controllers/categoryController');

// POST /api/categories
router.post('/', upload.single('image'), categoryController.createCategory);
// GET /api/categories
router.get('/', categoryController.getCategories);

// GET /api/categories/nested
router.get('/nested', categoryController.getNestedCategories);
// GET /api/categories/:id
router.get('/:id', categoryController.getCategory);
// PUT /api/categories/:id
router.put('/:id', upload.single('image'), categoryController.updateCategory);
// DELETE /api/categories/:id
router.delete('/:id', categoryController.deleteCategory);

module.exports = router; 