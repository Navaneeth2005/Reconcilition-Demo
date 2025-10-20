const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const reconcileRouter = require('./routes/reconcile'); // adjust path if needed

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false
}));

// Middleware
app.use(morgan('dev'));
app.use(express.json());

// Serve frontend from public folder
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api', reconcileRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Tabulera Reconciliation Demo'
  });
});

// Optional API root endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Tabulera Benefits Reconciliation API',
    endpoints: {
      health: 'GET /health',
      reconcile: 'POST /api/reconcile (multipart/form-data with enrollment & invoice CSVs)'
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message 
  });
});

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔄 Reconcile endpoint: POST http://localhost:${PORT}/api/reconcile`);
});

module.exports = app;
