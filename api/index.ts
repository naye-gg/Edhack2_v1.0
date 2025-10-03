import express from 'express';
import type { Request, Response } from 'express';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import { teachers } from '../shared/schema';
import { z } from 'zod';
import ws from "ws";

const app = express();

// Database setup
neonConfig.webSocketConstructor = ws;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  max: 1,
});
const db = drizzle(pool);

// Validation schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

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

app.post("/api/auth/login", async (req: Request, res: Response) => {
  try {
    console.log('🟢 Login attempt:', req.body);
    
    // Validate input
    const loginData = loginSchema.parse(req.body);
    
    // Find teacher by email
    const teacherResults = await db.select().from(teachers).where(eq(teachers.email, loginData.email));
    const [teacher] = teacherResults;
    
    if (!teacher) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Check password (plain text for now)
    if (teacher.password !== loginData.password) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Check if teacher is active
    if (!teacher.isActive) {
      return res.status(401).json({ error: "Cuenta desactivada" });
    }

    // Update last login
    await db.update(teachers)
      .set({ lastLogin: new Date() })
      .where(eq(teachers.id, teacher.id));

    // Generate session token
    const sessionToken = `teacher_${teacher.id}_${Date.now()}`;
    
    // Remove password from response
    const { password, ...teacherResponse } = teacher;
    
    res.json({ 
      teacher: teacherResponse, 
      token: sessionToken,
      message: "Inicio de sesión exitoso" 
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Datos inválidos", details: error.errors });
    }
    res.status(500).json({ error: "Error interno del servidor" });
  }
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
