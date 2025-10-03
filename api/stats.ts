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

    // Define schema inline matching the real database structure
    const { pgTable, text, timestamp, boolean, integer, real } = await import('drizzle-orm/pg-core');
    
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

    const evidence = pgTable('evidence', {
      id: text('id').primaryKey(),
      studentId: text('student_id').notNull(),
      taskTitle: text('task_title').notNull(),
      subject: text('subject').notNull(),
      completionDate: timestamp('completion_date').defaultNow(),
      evidenceType: text('evidence_type').notNull(),
      fileName: text('file_name'),
      filePath: text('file_path'),
      fileSize: integer('file_size'),
      standardRubric: text('standard_rubric').notNull(),
      evaluatedCompetencies: text('evaluated_competencies').notNull(),
      originalInstructions: text('original_instructions').notNull(),
      timeSpent: integer('time_spent'),
      reportedDifficulties: text('reported_difficulties'),
      isAnalyzed: boolean('is_analyzed').default(false),
      createdAt: timestamp('created_at').defaultNow(),
    });

    const learningProfiles = pgTable('learning_profiles', {
      id: text('id').primaryKey(),
      studentId: text('student_id').notNull(),
      dominantLearningPattern: text('dominant_learning_pattern').notNull(),
      cognitiveStrengths: text('cognitive_strengths').notNull(),
      learningChallenges: text('learning_challenges').notNull(),
      motivationalFactors: text('motivational_factors').notNull(),
      recommendedTeachingApproaches: text('recommended_teaching_approaches').notNull(),
      assessmentRecommendations: text('assessment_recommendations').notNull(),
      resourcesAndTools: text('resources_and_tools').notNull(),
      confidenceLevel: real('confidence_level').notNull(),
      createdAt: timestamp('created_at').defaultNow(),
      updatedAt: timestamp('updated_at').defaultNow(),
    });

    // Get all data for stats
    const studentsResult = await db.select().from(students);
    const evidenceResult = await db.select().from(evidence);
    const profilesResult = await db.select().from(learningProfiles);
    
    console.log('📊 Raw stats data:', { 
      students: studentsResult.length, 
      evidence: evidenceResult.length,
      profiles: profilesResult.length
    });

    const totalStudents = studentsResult.length;
    const totalEvidence = evidenceResult.length;
    const analyzedEvidence = evidenceResult.filter((e: any) => e.isAnalyzed).length;
    const profilesGenerated = profilesResult.length; // Usar la tabla separada
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
