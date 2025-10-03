export default async function handler(req: any, res: any) {
  try {
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    // Get student ID from query parameters
    const { studentId } = req.query;
    
    if (!studentId) {
      return res.status(400).json({ error: "Student ID is required" });
    }

    console.log(`👤 Student individual operations for ID: ${studentId}, method: ${req.method}`);

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

    // Define schema
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

    if (req.method === 'GET') {
      const student = await db.select()
        .from(students)
        .where(eq(students.id, studentId))
        .limit(1);

      if (student.length === 0) {
        return res.status(404).json({ error: "Student not found" });
      }

      return res.status(200).json(student[0]);

    } else if (req.method === 'PUT') {
      const updateResult = await db.update(students)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(students.id, studentId))
        .returning();

      if (updateResult.length === 0) {
        return res.status(404).json({ error: "Student not found" });
      }

      return res.status(200).json({
        message: "Student updated successfully",
        student: updateResult[0]
      });

    } else if (req.method === 'DELETE') {
      const deleteResult = await db.delete(students)
        .where(eq(students.id, studentId))
        .returning();

      if (deleteResult.length === 0) {
        return res.status(404).json({ error: "Student not found" });
      }

      return res.status(200).json({
        message: "Student deleted successfully",
        deletedStudent: deleteResult[0]
      });

    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }

  } catch (error) {
    console.error('❌ Student individual handler error:', error);
    
    return res.status(500).json({ 
      error: "Error processing student request",
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
