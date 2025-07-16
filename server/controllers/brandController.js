const Brand = require('../models/Brand');

exports.createBrand = async (req, res) => {
  try {
    const data = req.body;
    if (req.file) {
      data.image = req.file.path;
    }
    const brand = new Brand(data);
    await brand.save();
    res.status(201).json(brand);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getBrands = async (req, res) => {
  try {
    const brands = await Brand.find().sort({ createdAt: -1 });
    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ error: 'Not found' });
    res.json(brand);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const data = req.body;
    if (req.file) {
      data.image = req.file.path;
    }
    const brand = await Brand.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!brand) return res.status(404).json({ error: 'Not found' });
    res.json(brand);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Brand deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 