const Url = require('../models/Url');
const { validateUrl, generateShortCode } = require('../utils/helpers');

const shortenUrl = async (req, res) => {
  try {
    const { url, customCode, expiresIn } = req.body;

    // Validate input
    if (!url) {
      return res.status(400).json({
        error: 'URL is required',
        message: 'Please provide a valid URL to shorten'
      });
    }

    // Validate URL format
    if (!validateUrl(url)) {
      return res.status(400).json({
        error: 'Invalid URL format',
        message: 'Please provide a valid HTTP or HTTPS URL'
      });
    }

    // Check if URL already exists
    const existingUrl = await Url.findOne({ originalUrl: url, isActive: true });
    if (existingUrl) {
      return res.json({
        shortUrl: existingUrl.shortUrl,
        shortCode: existingUrl.shortCode,
        originalUrl: existingUrl.originalUrl,
        createdAt: existingUrl.createdAt,
        expiresAt: existingUrl.expiresAt,
        clicks: existingUrl.clicks,
        message: 'URL already exists'
      });
    }

    // Generate short code
    let shortCode;
    if (customCode) {
      // Check if custom code is available
      const existing = await Url.findOne({ shortCode: customCode });
      if (existing) {
        return res.status(400).json({
          error: 'Custom code already exists',
          message: 'Please choose a different custom code'
        });
      }
      shortCode = customCode;
    } else {
      shortCode = await generateShortCode();
    }

    // Calculate expiration date
    let expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // Default 1 year
    if (expiresIn) {
      const days = parseInt(expiresIn);
      if (days > 0 && days <= 365) {
        expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      }
    }

    // Create short URL
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const shortUrl = `${baseUrl}/${shortCode}`;

    // Save to database
    const newUrl = new Url({
      originalUrl: url,
      shortCode,
      shortUrl,
      expiresAt,
      createdBy: req.ip || 'anonymous'
    });

    await newUrl.save();

    res.status(201).json({
      shortUrl: newUrl.shortUrl,
      shortCode: newUrl.shortCode,
      originalUrl: newUrl.originalUrl,
      createdAt: newUrl.createdAt,
      expiresAt: newUrl.expiresAt,
      clicks: newUrl.clicks
    });

  } catch (error) {
    console.error('Error in shortenUrl:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create short URL'
    });
  }
};

const redirectUrl = async (req, res) => {
  try {
    const { code } = req.params;

    if (!code) {
      return res.status(400).json({
        error: 'Short code is required'
      });
    }

    // Find URL by short code
    const url = await Url.findOne({ shortCode: code, isActive: true });

    if (!url) {
      return res.status(404).json({
        error: 'URL not found',
        message: 'The short URL you requested does not exist or has been deactivated'
      });
    }

    // Check if URL has expired
    if (url.expiresAt && new Date() > url.expiresAt) {
      return res.status(410).json({
        error: 'URL expired',
        message: 'This short URL has expired'
      });
    }

    // Increment click count
    await Url.findByIdAndUpdate(url._id, { $inc: { clicks: 1 } });

    // Redirect to original URL
    res.redirect(301, url.originalUrl);

  } catch (error) {
    console.error('Error in redirectUrl:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to redirect to original URL'
    });
  }
};

const getUrlStats = async (req, res) => {
  try {
    const { code } = req.params;

    const url = await Url.findOne({ shortCode: code, isActive: true });

    if (!url) {
      return res.status(404).json({
        error: 'URL not found',
        message: 'The short URL you requested does not exist'
      });
    }

    res.json({
      shortCode: url.shortCode,
      shortUrl: url.shortUrl,
      originalUrl: url.originalUrl,
      clicks: url.clicks,
      createdAt: url.createdAt,
      expiresAt: url.expiresAt,
      isActive: url.isActive,
      daysUntilExpiry: Math.ceil((url.expiresAt - new Date()) / (1000 * 60 * 60 * 24))
    });

  } catch (error) {
    console.error('Error in getUrlStats:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get URL statistics'
    });
  }
};

const getAllUrls = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const urls = await Url.find({ isActive: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Url.countDocuments({ isActive: true });

    res.json({
      urls,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error in getAllUrls:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve URLs'
    });
  }
};

module.exports = {
  shortenUrl,
  redirectUrl,
  getUrlStats,
  getAllUrls
};