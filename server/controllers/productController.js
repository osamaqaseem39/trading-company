const Product = require('../models/Product');

// Add a new product
exports.addProduct = async (req, res) => {
  try {
    const { title, description, featuredImage, gallery, brand, category } = req.body;
    const product = new Product({ title, description, featuredImage: featuredImage || '', gallery: gallery || [], brand: brand || '', category: category || '' });
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
    const updateData = { title, description, featuredImage: featuredImage || '', gallery: gallery || [], brand: brand || '', category: category || '' };
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