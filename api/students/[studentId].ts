export default async function handler(req: any, res: any) {
  try {
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    // Get student ID from query parameters (Vercel dynamic routes)
    const { studentId } = req.query;
    
    if (!studentId) {
      return res.status(400).json({ error: "Student ID is required" });
    }

    console.log(`👤 Student ${studentId} endpoint called:`, req.method);

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

    // ==================== GET SINGLE STUDENT ====================
    if (req.method === "GET") {
      const studentResult = await db.select()
        .from(students)
        .where(eq(students.id, studentId))
        .limit(1);
      
      if (studentResult.length === 0) {
        return res.status(404).json({ error: "Student not found" });
      }

      console.log('👤 Student found:', studentResult[0].name);
      return res.status(200).json(studentResult[0]);
    }

    // ==================== UPDATE STUDENT ====================
    if (req.method === "PUT") {
      const { z } = await import('zod');
      
      const updateSchema = z.object({
        name: z.string().optional(),
        age: z.number().int().min(3).max(20).optional(),
        grade: z.string().optional(),
        mainSubjects: z.string().optional(),
        specialNeeds: z.string().optional(),
      });

      try {
        const validatedData = updateSchema.parse(req.body);
        
        const updateResult = await db.update(students)
          .set({
            ...validatedData,
            updatedAt: new Date()
          })
          .where(eq(students.id, studentId))
          .returning();

        if (updateResult.length === 0) {
          return res.status(404).json({ error: "Student not found" });
        }

        console.log('👤 Student updated:', updateResult[0].name);
        return res.status(200).json(updateResult[0]);
      } catch (validationError) {
        return res.status(400).json({ 
          error: "Invalid data", 
          details: validationError.errors || validationError.message
        });
      }
    }

    // ==================== DELETE STUDENT ====================
    if (req.method === "DELETE") {
      const deleteResult = await db.delete(students)
        .where(eq(students.id, studentId))
        .returning();

      if (deleteResult.length === 0) {
        return res.status(404).json({ error: "Student not found" });
      }

      console.log('👤 Student deleted:', deleteResult[0].name);
      return res.status(204).send();
    }

    return res.status(405).json({ error: "Method not allowed" });

  } catch (error) {
    console.error('❌ Student handler error:', error);
    
    return res.status(500).json({ 
      error: "Error processing student request",
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
