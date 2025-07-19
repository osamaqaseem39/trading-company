const SubCategory = require('../models/SubCategory');
const Category = require('../models/Category');

// Create a subcategory (must have a parent)
exports.createSubcategory = async (req, res) => {
  try {
    const data = req.body;
    if (!data.parent) {
      return res.status(400).json({ error: 'Parent category is required for subcategory.' });
    }
    if (req.file) {
      data.image = req.file.path;
    }
    const subcategory = new SubCategory(data);
    await subcategory.save();
    res.status(201).json(subcategory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all subcategories
exports.getSubcategories = async (req, res) => {
  try {
    const subcategories = await SubCategory.find().populate('parent').sort({ createdAt: -1 });
    res.json(subcategories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single subcategory by ID
exports.getSubcategory = async (req, res) => {
  try {
    const subcategory = await SubCategory.findById(req.params.id).populate('parent');
    if (!subcategory) return res.status(404).json({ error: 'Not found' });
    res.json(subcategory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a subcategory (must have a parent)
exports.updateSubcategory = async (req, res) => {
  try {
    const data = req.body;
    if (!data.parent) {
      return res.status(400).json({ error: 'Parent category is required for subcategory.' });
    }
    if (req.file) {
      data.image = req.file.path;
    }
    const subcategory = await SubCategory.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!subcategory) return res.status(404).json({ error: 'Not found' });
    res.json(subcategory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a subcategory
exports.deleteSubcategory = async (req, res) => {
  try {
    const subcategory = await SubCategory.findByIdAndDelete(req.params.id);
    if (!subcategory) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Subcategory deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get nested subcategories (children of a given parent)
exports.getNestedSubcategories = async (req, res) => {
  try {
    const parentId = req.query.parentId;
    if (!parentId) {
      return res.status(400).json({ error: 'parentId query param is required.' });
    }
    const subcategories = await SubCategory.find({ parent: parentId }).lean();
    // Build a map for quick lookup
    const subcategoryMap = {};
    subcategories.forEach(cat => {
      subcategoryMap[cat._id] = { ...cat, children: [] };
    });
    // Assign children to their parent
    subcategories.forEach(cat => {
      if (cat.parent && subcategoryMap[cat.parent]) {
        subcategoryMap[cat.parent].children.push(subcategoryMap[cat._id]);
      }
    });
    // Only direct children of the given parent
    const nested = Object.values(subcategoryMap).filter(cat => cat.parent == parentId);
    res.json(nested);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 