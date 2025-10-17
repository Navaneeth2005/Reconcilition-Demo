const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const reconcileRouter = require('./routes/reconcile');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration - CRITICAL FIX
app.use(cors({
  origin: '*', // Allow all origins (or specify: 'null' for file:// protocol)
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false
}));

// Middleware
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api', reconcileRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Tabulera Reconciliation Demo'
  });
});

// Root endpoint
app.get('/', (req, res) => {
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔄 Reconcile endpoint: POST http://localhost:${PORT}/api/reconcile`);
});

module.exports = app;
