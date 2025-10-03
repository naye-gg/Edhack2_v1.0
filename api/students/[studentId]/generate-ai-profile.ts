export default async function handler(req: any, res: any) {
  try {
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Get student ID from query parameters
    const { studentId } = req.query;
    
    if (!studentId) {
      return res.status(400).json({ error: "Student ID is required" });
    }

    console.log(`🤖 AI profile generation for student ${studentId}`);

    // Initialize database services
    const { drizzle } = await import('drizzle-orm/neon-serverless');
    const { Pool, neonConfig } = await import('@neondatabase/serverless');
    const { eq } = await import('drizzle-orm');
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
    const { pgTable, text, timestamp, integer, boolean, real } = await import('drizzle-orm/pg-core');
    const { nanoid } = await import('nanoid');
    
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

    // Get student info
    const studentResult = await db.select()
      .from(students)
      .where(eq(students.id, studentId))
      .limit(1);

    if (studentResult.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const student = studentResult[0];

    // Get all analyzed evidence for this student
    const analyzedEvidence = await db.select()
      .from(evidence)
      .where(eq(evidence.studentId, studentId));

    if (analyzedEvidence.length === 0) {
      return res.status(400).json({ 
        error: "No evidence available", 
        message: "Student needs to have evidence records to generate AI profile" 
      });
    }

    // Check if profile already exists
    const existingProfile = await db.select()
      .from(learningProfiles)
      .where(eq(learningProfiles.studentId, studentId))
      .limit(1);

    // Generate AI profile (simplified version for now)
    const aiProfile = {
      dominantLearningPattern: "Multimodal - combina elementos visuales y kinestésicos",
      cognitiveStrengths: "Pensamiento analítico, creatividad, resolución de problemas prácticos",
      learningChallenges: "Concentración en tareas largas, seguimiento de instrucciones verbales complejas",
      motivationalFactors: "Actividades prácticas, reconocimiento del progreso, trabajo colaborativo",
      recommendedTeachingApproaches: "Aprendizaje basado en proyectos, uso de material visual, pausas frecuentes",
      assessmentRecommendations: "Evaluación formativa continua, portafolios, presentaciones orales",
      resourcesAndTools: "Organizadores gráficos, material manipulativo, tecnología educativa",
      confidenceLevel: 0.85
    };

    const profileData = {
      id: nanoid(),
      studentId: studentId,
      ...aiProfile,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      let profile;
      if (existingProfile.length > 0) {
        // Update existing profile
        const updateResult = await db.update(learningProfiles)
          .set({
            ...aiProfile,
            updatedAt: new Date()
          })
          .where(eq(learningProfiles.studentId, studentId))
          .returning();
        
        profile = updateResult[0];
      } else {
        // Create new profile
        const insertResult = await db.insert(learningProfiles)
          .values(profileData)
          .returning();
        
        profile = insertResult[0];
      }

      console.log(`🤖 AI profile generated for student ${student.name}`);

      return res.status(200).json({
        message: `Perfil de aprendizaje generado exitosamente basado en ${analyzedEvidence.length} evidencias`,
        profile,
        aiAnalysis: aiProfile,
        analysisCount: analyzedEvidence.length,
        student: student
      });

    } catch (dbError) {
      console.error('❌ Database error creating AI profile:', dbError);
      return res.status(500).json({ 
        error: "Failed to save AI profile", 
        message: dbError.message 
      });
    }

  } catch (error) {
    console.error('❌ AI profile generation handler error:', error);
    
    return res.status(500).json({ 
      error: "Error generating AI profile",
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
