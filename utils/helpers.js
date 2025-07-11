const Url = require('../models/Url');
const validator = require('validator');

const validateUrl = (url) => {
  try {
    // Check if it's a valid URL format
    if (!validator.isURL(url, {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_valid_protocol: true
    })) {
      return false;
    }

    // Additional checks
    const urlObj = new URL(url);
    
    // Block localhost and private IPs for security
    if (urlObj.hostname === 'localhost' || 
        urlObj.hostname === '127.0.0.1' || 
        urlObj.hostname.startsWith('192.168.') ||
        urlObj.hostname.startsWith('10.') ||
        urlObj.hostname.startsWith('172.')) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};

const generateShortCode = async (length = 6) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  // Check if code already exists
  const existingUrl = await Url.findOne({ shortCode: result });
  if (existingUrl) {
    // If code exists, generate a new one recursively
    return generateShortCode(length);
  }
  
  return result;
};

module.exports = {
  validateUrl,
  generateShortCode
};