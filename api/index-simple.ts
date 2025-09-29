import express from "express";

const app = express();

// Body parsing middleware with limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Simple logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
  });
  next();
});

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "FlexIAdapt API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Auth endpoints - Simplificados para deployment
app.post("/auth/login", (req, res) => {
  res.status(500).json({ 
    error: "Database not configured",
    message: "Please configure DATABASE_URL environment variable in Vercel",
    details: "This API requires a database connection to work properly"
  });
});

app.post("/auth/logout", (req, res) => {
  res.json({ message: "Logout successful" });
});

// Students endpoints - Placeholder
app.get("/students", (req, res) => {
  res.status(500).json({ 
    error: "Database not configured",
    message: "Please configure DATABASE_URL environment variable" 
  });
});

app.post("/students", (req, res) => {
  res.status(500).json({ 
    error: "Database not configured",
    message: "Please configure DATABASE_URL environment variable" 
  });
});

// Evidence endpoints - Placeholder  
app.get("/evidence", (req, res) => {
  res.json([]);
});

app.post("/evidence", (req, res) => {
  res.status(500).json({ 
    error: "Database not configured",
    message: "Please configure DATABASE_URL environment variable" 
  });
});

// Stats endpoint - Placeholder
app.get("/stats", (req, res) => {
  res.json({
    totalStudents: 0,
    analyzedEvidence: 0,
    profilesGenerated: 0,
    avgAnalysisTime: 0
  });
});

// Catch all other routes
app.all("*", (req, res) => {
  res.status(404).json({ 
    error: "Endpoint not found",
    path: req.path,
    method: req.method
  });
});

// Export for Vercel serverless functions
export default app;
