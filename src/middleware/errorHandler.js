// src/middleware/errorHandler.js

/**
 * Global error handling middleware for Express
 * Captures errors from route handlers and sends standardized JSON responses
 */
module.exports = function errorHandler(err, req, res, next) {
    console.error(err.stack || err);
  
    const statusCode = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
  
    res.status(statusCode).json({
      error: message
    });
  };
  