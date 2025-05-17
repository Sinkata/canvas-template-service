// src/app.js
require('dotenv').config();
const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// Import routes and middleware
const templateRoutes = require('./routes/templates');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware setup
app.use(cors());                    // Enable CORS for all routes
app.use(morgan('dev'));             // HTTP request logging
app.use(express.json());            // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(fileUpload());              // Handle file uploads

// Serve all files in public/ at the web root
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api/templates', templateRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global error handler
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
