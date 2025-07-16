const SupplierRequest = require('../models/SupplierRequest');

exports.createSupplier = async (req, res) => {
  try {
    const data = req.body;
    if (req.file) {
      data.brochure = req.file.path;
    }
    const supplier = new SupplierRequest(data);
    await supplier.save();
    res.status(201).json(supplier);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await SupplierRequest.find().sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSupplier = async (req, res) => {
  try {
    const supplier = await SupplierRequest.findById(req.params.id);
    if (!supplier) return res.status(404).json({ error: 'Not found' });
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 