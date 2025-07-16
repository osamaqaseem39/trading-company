const Service = require('../models/Service');

// Add a new service
exports.addService = async (req, res) => {
  try {
    const { title, description, featuredImage } = req.body;
    const service = new Service({ title, description, featuredImage });
    await service.save();
    res.status(201).json(service);
  } catch (err) {
    console.error('Service creation error:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};

// Edit an existing service
exports.editService = async (req, res) => {
  try {
    const { title, description, featuredImage } = req.body;
    const updateData = { title, description, featuredImage };
    const service = await Service.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!service) return res.status(404).json({ error: 'Service not found' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all services
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single service
exports.getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a service
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found' });
    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 