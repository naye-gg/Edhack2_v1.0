import { drizzle } from 'drizzle-orm/libsql';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { createClient } from '@libsql/client';
import ws from "ws";
import * as schema from "@shared/schema";
import { config } from "./config";

// Initialize database based on DATABASE_URL
let db: any;
let pool: Pool | undefined;

if (config.DATABASE_URL.startsWith('file:') || config.DATABASE_URL.includes('.sqlite')) {
  // SQLite database for development using libsql
  const client = createClient({
    url: config.DATABASE_URL,
  });
  db = drizzle(client, { schema });
  
  console.log('🗄️  Using SQLite database for development');
} else {
  // PostgreSQL/Neon database for production
  neonConfig.webSocketConstructor = ws;
  
  pool = new Pool({ 
    connectionString: config.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  
  db = drizzleNeon({ client: pool, schema });
  
  console.log('🗄️  Using PostgreSQL/Neon database');
}

export { db };

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing database connection...');
  if (pool) {
    await pool.end();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Closing database connection...');
  if (pool) {
    await pool.end();
  }
  process.exit(0);
});