const express = require('express');
const router = express.Router();
const {
  shortenUrl,
  redirectUrl,
  getUrlStats,
  getAllUrls
} = require('../controllers/urlController');

// POST /shorten - Create short URL
router.post('/shorten', shortenUrl);

// GET /health - Server running properly
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// GET /stats/:code - Get URL statistics
router.get('/stats/:code', getUrlStats);

// GET /api/urls - Get all URLs (admin endpoint)
router.get('/api/urls', getAllUrls);

// GET /:code - Redirect to original URL
router.get('/:code', redirectUrl);

module.exports = router;