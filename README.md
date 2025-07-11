# Mini URL Shortener API

A simple and efficient URL shortener API built with Node.js, Express.js, and MongoDB.

## 🚀 Features

- **URL Shortening**: Convert long URLs into short, manageable links
- **Redirect Service**: Automatically redirect short URLs to original destinations
- **Analytics**: Track click counts and view statistics
- **Expiration**: URLs automatically expire after a set time
- **Rate Limiting**: Prevent abuse with built-in rate limiting
- **Custom Codes**: Option to use custom short codes
- **Validation**: Robust URL validation and error handling
- **Security**: Helmet.js for security headers, CORS support

## 📋 Requirements

- Node.js (v14 or higher)
- MongoDB (v4.0 or higher)
- npm or yarn

## 🛠️ Installation

1. Clone the repository:
```bash
git clone [https://github.com/yourusername/mini-url-shortener.git](https://github.com/Akash6848/url-shortener.git)
cd url-shortener
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your MongoDB connection string
```

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Run the application:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 🧪 Testing

Run the included test suite:
```bash
npm test
```

## 📚 API Endpoints

### 1. Shorten URL
**POST** `/shorten`

Create a short URL from a long URL.

**Request Body:**
```json
{
  "url": "https://example.com/very/long/url",
  "customCode": "mycode", // Optional
  "expiresIn": 30 // Optional, days until expiration
}
```

**Response:**
```json
{
  "shortUrl": "http://localhost:3000/abc123",
  "shortCode": "abc123",
  "originalUrl": "https://example.com/very/long/url",
  "createdAt": "2023-12-01T10:00:00.000Z",
  "expiresAt": "2024-12-01T10:00:00.000Z",
  "clicks": 0
}
```

### 2. Redirect to Original URL
**GET** `/:code`

Redirect to the original URL using the short code.

**Response:** 301 redirect to original URL

### 3. Get URL Statistics
**GET** `/stats/:code`

Get statistics for a short URL.

**Response:**
```json
{
  "shortCode": "abc123",
  "shortUrl": "http://localhost:3000/abc123",
  "originalUrl": "https://example.com/very/long/url",
  "clicks": 42,
  "createdAt": "2023-12-01T10:00:00.000Z",
  "expiresAt": "2024-12-01T10:00:00.000Z",
  "isActive": true,
  "daysUntilExpiry": 365
}
```

### 4. Health Check
**GET** `/health`

Check if the API is running.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2023-12-01T10:00:00.000Z",
  "uptime": 3600
}
```

## 🏗️ Project Structure

```
mini-url-shortener/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   └── urlController.js     # Request handlers
├── middleware/
│   └── errorHandler.js      # Error handling
├── models/
│   └── Url.js              # MongoDB schema
├── routes/
│   └── urlRoutes.js        # API routes
├── utils/
│   └── helpers.js          # Utility functions
├── .env                    # Environment variables
├── .gitignore             # Git ignore file
├── package.json           # Dependencies
├── server.js              # Main server file
├── test.js                # Test suite
└── README.md             # This file
```

## 🔧 Configuration

Environment variables in `.env`:

```
NODE_ENV=development
PORT=3000
MONGODB_URI=your_mongodb_connection_string
BASE_URL=http://localhost:3000
```

## 🛡️ Security Features

- **Rate Limiting**: 100 requests per 15 minutes globally, 10 URL shortening requests per 15 minutes
- **URL Validation**: Prevents shortening of localhost and private IP addresses
- **Helmet.js**: Security headers for protection against common vulnerabilities
- **CORS**: Cross-origin resource sharing support
- **Input Validation**: Robust validation of all inputs

## 📊 Database Schema

```javascript
{
  originalUrl: String,        // The original long URL
  shortCode: String,          // The generated short code
  shortUrl: String,           // The complete short URL
  clicks: Number,             // Number of times accessed
  createdAt: Date,            // Creation timestamp
  expiresAt: Date,            // Expiration timestamp
  isActive: Boolean,          // Whether the URL is active
  createdBy: String           // IP address of creator
}
```
## 🧪 Testing with Postman

Import the included Postman collection to test all endpoints:

1. Open Postman
2. Import `poatman/url-shortener.postman_collection.json`
3. Set environment variables if needed
4. Run the collection
