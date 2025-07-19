const Category = require('../models/Category');

exports.createCategory = async (req, res) => {
  try {
    console.log('Uploaded file:', req.file); // Debug log
    console.log('Request body:', req.body); // Debug log
    const data = req.body;
    if (req.file) {
      data.image = req.file.path;
    }
    const category = new Category(data);
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const data = req.body;
    if (req.file) {
      data.image = req.file.path;
    }
    const category = await Category.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!category) return res.status(404).json({ error: 'Not found' });
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get categories as nested (parent/children) structure
exports.getNestedCategories = async (req, res) => {
  try {
    const categories = await Category.find().lean();
    // Build a map for quick lookup
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat._id] = { ...cat, children: [] };
    });
    // Assign children to their parent
    categories.forEach(cat => {
      if (cat.parent && categoryMap[cat.parent]) {
        categoryMap[cat.parent].children.push(categoryMap[cat._id]);
      }
    });
    // Only top-level categories (no parent)
    const nested = Object.values(categoryMap).filter(cat => !cat.parent);
    res.json(nested);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 