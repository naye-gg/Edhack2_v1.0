import express from "express";

const app = express();

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'API is working' 
  });
});

// Login endpoint básico para probar
app.post('/api/auth/login', (req, res) => {
  res.json({ 
    error: 'Database not configured for production',
    message: 'Please configure DATABASE_URL environment variable'
  });
});

export default app;
