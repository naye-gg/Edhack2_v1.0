import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import { teachers } from '../shared/schema';
import { z } from 'zod';
import ws from "ws";

// Database setup
neonConfig.webSocketConstructor = ws;

// Handler function for Vercel
export default async function handler(req: any, res: any) {
  try {
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    // Create database connection
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL!,
      max: 1,
    });
    const db = drizzle(pool);

    const { pathname } = new URL(req.url, `http://${req.headers.host}`);
    
    console.log('🚀 Request:', { method: req.method, pathname, body: req.body });

    // Health endpoint
    if (req.method === "GET" && pathname === "/api/health") {
      return res.status(200).json({ 
        status: "ok", 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production'
      });
    }

    // Test endpoint
    if (req.method === "GET" && pathname === "/api/test") {
      return res.status(200).json({ 
        message: "API is working", 
        environment: process.env.NODE_ENV,
        hasDB: !!process.env.DATABASE_URL,
        timestamp: new Date().toISOString() 
      });
    }

    // Login endpoint
    if (req.method === "POST" && pathname === "/login") {
      console.log('🔐 Login attempt:', req.body);
      
      // Parse body if needed
      let body = req.body;
      if (typeof body === 'string') {
        body = JSON.parse(body);
      }
      
      // Validate input
      const loginData = z.object({
        email: z.string().email("Email inválido"),
        password: z.string().min(1, "Password requerido")
      }).parse(body);

      console.log('✅ Login data validated:', { email: loginData.email });

      // Find teacher in database  
      const teacherResults = await db
        .select()
        .from(teachers)
        .where(eq(teachers.email, loginData.email))
        .limit(1);

      console.log('📊 Teacher query result:', teacherResults);
      
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
      
      return res.status(200).json({ 
        teacher: teacherResponse, 
        token: sessionToken,
        message: "Inicio de sesión exitoso" 
      });
    }

    // Catch all - endpoint not found
    return res.status(404).json({ 
      error: "Endpoint not found",
      path: pathname,
      method: req.method,
      message: "Vercel handler active" 
    });

  } catch (error) {
    console.error('❌ Handler error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Datos inválidos", details: error.errors });
    }
    
    return res.status(500).json({ 
      error: "Error interno del servidor",
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
