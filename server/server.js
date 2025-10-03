const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['https://flexiadapt.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// Simple health check
app.get("/", (req, res) => {
  res.json({ 
    message: "FlexiAdapt Backend API", 
    status: "running",
    version: "1.0.0",
    endpoints: {
      students: "/api/students",
      auth: "/api/auth/login",
      stats: "/api/stats",
      evidence: "/api/evidence"
    },
    database: {
      connected: !!process.env.DATABASE_URL,
      url: process.env.DATABASE_URL ? "configured" : "missing"
    }
  });
});

// Simple API endpoints for testing
app.get("/api/students", async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: "Database not configured" });
    }

    // Simple response for now
    res.json({
      students: [
        {
          id: "test-1",
          name: "Test Student",
          grade: "4to Primaria",
          status: "Railway Backend Working!"
        }
      ],
      totalStudents: 1,
      source: "Railway Backend"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/stats", (req, res) => {
  res.json({
    totalStudents: 1,
    analyzedEvidence: 0,
    profilesGenerated: 0,
    pendingReview: 0,
    modalityBreakdown: [
      { name: 'Visual', percentage: 35 },
      { name: 'Auditiva', percentage: 25 },
      { name: 'Kinestésica', percentage: 40 }
    ],
    analysisProgress: 0,
    source: "Railway Backend"
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  
  // Simple test login
  if (email && password) {
    res.json({
      success: true,
      token: "railway-test-token",
      teacher: {
        id: "test-teacher",
        name: "Test Teacher",
        email: email
      }
    });
  } else {
    res.status(400).json({ error: "Email and password required" });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: "Endpoint not found", 
    path: req.originalUrl,
    availableEndpoints: ["/", "/api/students", "/api/stats", "/api/auth/login"]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FlexiAdapt Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/`);
  console.log(`🔗 Frontend should use: https://your-railway-app.railway.app as API_BASE_URL`);
});

module.exports = app;
