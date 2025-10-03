export default async function handler(req: any, res: any) {
  try {
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    // Get student ID from query parameters
    const { studentId } = req.query;
    
    if (!studentId) {
      return res.status(400).json({ error: "Student ID is required" });
    }

    console.log(`📁 Student ${studentId} evidence endpoint:`, req.method);

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
    const { pgTable, text, timestamp, integer, boolean } = await import('drizzle-orm/pg-core');
    
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

    // Verify authentication
    const authHeader = req.headers.authorization || req.headers.Authorization || '';
    if (!authHeader.startsWith('teacher_')) {
      return res.status(401).json({ error: "Autorización requerida" });
    }

    // Extract teacher ID from token
    const parts = authHeader.split('_');
    const teacherId = parts.slice(1, -1).join('_');

    // Verify student belongs to teacher
    const studentResult = await db.select()
      .from(students)
      .where(eq(students.id, studentId))
      .limit(1);

    if (studentResult.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    if (studentResult[0].teacherId !== teacherId) {
      return res.status(403).json({ error: "Access denied" });
    }

    // ==================== GET STUDENT EVIDENCE ====================
    if (req.method === "GET") {
      const evidenceResult = await db.select()
        .from(evidence)
        .where(eq(evidence.studentId, studentId));
      
      console.log(`📁 Found ${evidenceResult.length} evidence items for student ${studentId}`);
      return res.status(200).json(evidenceResult);
    }

    // ==================== CREATE EVIDENCE ====================
    if (req.method === "POST") {
      const { z } = await import('zod');
      const { nanoid } = await import('nanoid');
      
      const createSchema = z.object({
        taskTitle: z.string().min(1),
        subject: z.string().min(1),
        evidenceType: z.string().min(1),
        fileName: z.string().optional(),
        filePath: z.string().optional(),
        fileSize: z.number().int().optional(),
        standardRubric: z.string().min(1),
        evaluatedCompetencies: z.string().min(1),
        originalInstructions: z.string().min(1),
        timeSpent: z.number().int().optional(),
        reportedDifficulties: z.string().optional(),
      });

      try {
        const validatedData = createSchema.parse(req.body);
        
        const newEvidence = {
          id: nanoid(),
          studentId: studentId,
          ...validatedData,
          isAnalyzed: false,
          createdAt: new Date()
        };

        const insertResult = await db.insert(evidence)
          .values(newEvidence)
          .returning();

        console.log('📁 Evidence created:', insertResult[0].taskTitle);
        return res.status(201).json(insertResult[0]);
      } catch (validationError) {
        return res.status(400).json({ 
          error: "Invalid data", 
          details: validationError.errors || validationError.message
        });
      }
    }

    return res.status(405).json({ error: "Method not allowed" });

  } catch (error) {
    console.error('❌ Student evidence handler error:', error);
    
    return res.status(500).json({ 
      error: "Error processing evidence request",
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
