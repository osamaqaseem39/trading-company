const express = require('express');
const router = express.Router();
const { createQuote, getQuotes, updateQuoteStatus } = require('../controllers/quoteController');

// POST /api/quotes - create a new quote
router.post('/', createQuote);

// GET /api/quotes - get all quotes
router.get('/', getQuotes);

// PATCH /api/quotes/:id - update quote status
router.patch('/:id', updateQuoteStatus);

module.exports = router; 