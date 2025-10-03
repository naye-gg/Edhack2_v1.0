import express from 'express';
import type { Request, Response } from 'express';

const app = express();

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// CORS middleware
app.use((req: Request, res: Response, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Simple test routes
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

app.get("/api/test", (_req: Request, res: Response) => {
  res.json({ 
    message: "API is working", 
    environment: process.env.NODE_ENV,
    hasDB: !!process.env.DATABASE_URL,
    timestamp: new Date().toISOString() 
  });
});

app.post("/api/auth/login", (req: Request, res: Response) => {
  console.log('Login attempt:', req.body);
  res.json({ 
    error: "Database connection in progress",
    message: "This is a minimal handler for testing. Full functionality coming soon.",
    receivedData: req.body
  });
});

// Catch all
app.all("*", (req: Request, res: Response) => {
  res.status(404).json({ 
    error: "Endpoint not found",
    path: req.path,
    method: req.method,
    message: "Minimal handler active - full API coming soon"
  });
});

export default app;
