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

    console.log('📊 Stats endpoint called');

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

    // Define schema inline for reliability
    const { pgTable, text, timestamp, boolean, serial, jsonb } = await import('drizzle-orm/pg-core');
    
    const students = pgTable('students', {
      id: serial('id').primaryKey(),
      name: text('name').notNull(),
      age: text('age'),
      grade: text('grade'),
      teacherId: text('teacher_id'),
      createdAt: timestamp('created_at').defaultNow(),
      learningProfile: jsonb('learning_profile')
    });

    const evidence = pgTable('evidence', {
      id: serial('id').primaryKey(),
      taskTitle: text('task_title').notNull(),
      studentId: text('student_id').notNull(),
      isAnalyzed: boolean('is_analyzed').default(false),
      createdAt: timestamp('created_at').defaultNow(),
      analysisResult: jsonb('analysis_result')
    });

    // Get all data for stats
    const studentsResult = await db.select().from(students);
    const evidenceResult = await db.select().from(evidence);
    
    console.log('📊 Raw stats data:', { 
      students: studentsResult.length, 
      evidence: evidenceResult.length 
    });

    const totalStudents = studentsResult.length;
    const totalEvidence = evidenceResult.length;
    const analyzedEvidence = evidenceResult.filter((e: any) => e.isAnalyzed).length;
    const profilesGenerated = studentsResult.filter((s: any) => s.learningProfile).length;
    const pendingEvidence = evidenceResult.filter((e: any) => !e.isAnalyzed).length;

    // Simple modalityBreakdown for now
    const modalityBreakdown = [
      { name: 'Visual', percentage: 35 },
      { name: 'Auditiva', percentage: 25 },
      { name: 'Kinestésica', percentage: 40 }
    ];

    const stats = {
      totalStudents,
      analyzedEvidence,
      profilesGenerated,
      pendingReview: pendingEvidence,
      modalityBreakdown,
      analysisProgress: totalEvidence > 0 ? Math.round((analyzedEvidence / totalEvidence) * 100) : 0
    };

    console.log('✅ Stats response:', stats);
    return res.status(200).json(stats);

  } catch (error) {
    console.error('❌ Stats handler error:', error);
    
    return res.status(500).json({ 
      error: "Error fetching stats",
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
