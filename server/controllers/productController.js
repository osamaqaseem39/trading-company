const Product = require('../models/Product');
const Category = require('../models/Category');

// Add a new product
exports.addProduct = async (req, res) => {
  try {
    const { title, description, featuredImage, gallery, brand, category } = req.body;
    let mainCategory = category;
    let subCategory = '';
    // Check if the selected category has a parent
    const catDoc = await Category.findById(category);
    if (catDoc && catDoc.parent) {
      mainCategory = catDoc.parent.toString();
      subCategory = category;
    }
    const product = new Product({ title, description, featuredImage: featuredImage || '', gallery: gallery || [], brand: brand || '', category: mainCategory || '', subCategory });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('Product creation error:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};

// Edit an existing product
exports.editProduct = async (req, res) => {
  try {
    const { title, description, featuredImage, gallery, brand, category } = req.body;
    let mainCategory = category;
    let subCategory = '';
    const catDoc = await Category.findById(category);
    if (catDoc && catDoc.parent) {
      mainCategory = catDoc.parent.toString();
      subCategory = category;
    }
    const updateData = { title, description, featuredImage: featuredImage || '', gallery: gallery || [], brand: brand || '', category: mainCategory || '', subCategory };
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await Product.find({ category: categoryId }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get products by subcategory
exports.getProductsBySubcategory = async (req, res) => {
  try {
    const { subcategoryId } = req.params;
    const products = await Product.find({ subCategory: subcategoryId }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Flexible query: /products/query?category=...&subCategory=...
exports.queryProducts = async (req, res) => {
  try {
    const { category, subCategory } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 