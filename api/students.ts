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

    console.log('👥 Students endpoint called');

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

    // Define schema inline matching the real database structure
    const { pgTable, text, timestamp, integer } = await import('drizzle-orm/pg-core');
    
    const students = pgTable('students', {
      id: text('id').primaryKey(),
      teacherId: text('teacher_id').notNull(),
      name: text('name').notNull(),
      age: integer('age').notNull(),
      grade: text('grade').notNull(),
      mainSubjects: text('main_subjects').notNull(),
      specialNeeds: text('special_needs'),
      createdAt: timestamp('created_at').defaultNow(),
      updatedAt: timestamp('updated_at').defaultNow(),
    });

    const studentsResult = await db.select().from(students);
    
    console.log('👥 Students found:', studentsResult.length);
    return res.status(200).json(studentsResult);

  } catch (error) {
    console.error('❌ Students handler error:', error);
    
    return res.status(500).json({ 
      error: "Error fetching students",
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
