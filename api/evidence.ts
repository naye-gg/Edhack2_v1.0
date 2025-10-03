export default async function handler(req: any, res: any) {
  try {
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    console.log('📁 Evidence endpoint called');

    // Initialize database services
    const { drizzle } = await import('drizzle-orm/neon-serverless');
    const { Pool, neonConfig } = await import('@neondatabase/serverless');
    const ws = await import('ws');

    // Set up database connection
    neonConfig.webSocketConstructor = ws.default || ws;
    
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: "Database URL not configured" });
    }

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
    });
    const db = drizzle(pool);

    // Define schema inline
    const { pgTable, text, timestamp, boolean, serial, jsonb } = await import('drizzle-orm/pg-core');
    
    const evidence = pgTable('evidence', {
      id: serial('id').primaryKey(),
      taskTitle: text('task_title').notNull(),
      studentId: text('student_id').notNull(),
      isAnalyzed: boolean('is_analyzed').default(false),
      createdAt: timestamp('created_at').defaultNow(),
      analysisResult: jsonb('analysis_result')
    });

    const evidenceResult = await db.select().from(evidence);
    
    console.log('📁 Evidence found:', evidenceResult.length);
    return res.status(200).json(evidenceResult);

  } catch (error) {
    console.error('❌ Evidence handler error:', error);
    
    return res.status(500).json({ 
      error: "Error fetching evidence",
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
