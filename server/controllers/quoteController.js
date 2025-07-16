const Quote = require('../models/Quote');

// Create a new quote
exports.createQuote = async (req, res) => {
  try {
    const { name, email, phone, details, image } = req.body;
    if (!name || !email || !phone || !details) {
      return res.status(400).json({ error: 'All fields except image are required.' });
    }
    const quote = new Quote({ name, email, phone, details, image });
    await quote.save();
    res.status(201).json({ success: true, quote });
  } catch (err) {
    console.error('Create quote error:', err);
    res.status(500).json({ error: 'Failed to create quote.' });
  }
};

// Get all quotes
exports.getQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });
    res.json(quotes);
  } catch (err) {
    console.error('Get quotes error:', err);
    res.status(500).json({ error: 'Failed to fetch quotes.' });
  }
};

// Update quote status
exports.updateQuoteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'in_progress', 'completed', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }
    const quote = await Quote.findByIdAndUpdate(id, { status }, { new: true });
    if (!quote) return res.status(404).json({ error: 'Quote not found.' });
    res.json({ success: true, quote });
  } catch (err) {
    console.error('Update quote status error:', err);
    res.status(500).json({ error: 'Failed to update quote status.' });
  }
}; 