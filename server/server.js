const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// Simple health check
app.get("/", (req, res) => {
  res.json({ 
    message: "FlexiAdapt Backend API", 
    status: "running",
    endpoints: {
      students: "/api/students",
      auth: "/api/auth/login",
      stats: "/api/stats"
    }
  });
});

// Import and setup routes
const { registerRoutes } = require("./routes");
registerRoutes(app);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FlexiAdapt Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/`);
});

module.exports = app;
