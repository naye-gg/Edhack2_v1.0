export default async function handler(req: any, res: any) {
  try {
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    // Get student ID from query parameters
    const { studentId } = req.query;
    
    if (!studentId) {
      return res.status(400).json({ error: "Student ID is required" });
    }

    console.log(`👨‍🏫 Teacher perspectives for student ${studentId}, method: ${req.method}`);

    // Initialize database services
    const { drizzle } = await import('drizzle-orm/neon-serverless');
    const { Pool, neonConfig } = await import('@neondatabase/serverless');
    const { eq, desc } = await import('drizzle-orm');
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
    const { pgTable, text, timestamp, integer } = await import('drizzle-orm/pg-core');
    const { nanoid } = await import('nanoid');
    
    const teacherPerspectives = pgTable('teacher_perspectives', {
      id: text('id').primaryKey(),
      studentId: text('student_id').notNull(),
      teacherId: text('teacher_id').notNull(),
      observationDate: timestamp('observation_date').defaultNow(),
      behavioralObservations: text('behavioral_observations').notNull(),
      academicProgress: text('academic_progress').notNull(),
      participationLevel: text('participation_level').notNull(),
      socialInteraction: text('social_interaction').notNull(),
      motivationFactors: text('motivation_factors').notNull(),
      challengesObserved: text('challenges_observed').notNull(),
      recommendedInterventions: text('recommended_interventions').notNull(),
      followUpActions: text('follow_up_actions'),
      priorityLevel: integer('priority_level').notNull(), // 1-5 scale
      createdAt: timestamp('created_at').defaultNow(),
      updatedAt: timestamp('updated_at').defaultNow(),
    });

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
      // Get all teacher perspectives for this student
      const perspectives = await db.select()
        .from(teacherPerspectives)
        .where(eq(teacherPerspectives.studentId, studentId))
        .orderBy(desc(teacherPerspectives.createdAt));

      // Get student info
      const studentResult = await db.select()
        .from(students)
        .where(eq(students.id, studentId))
        .limit(1);

      return res.status(200).json({
        studentId,
        student: studentResult[0] || null,
        perspectives,
        totalPerspectives: perspectives.length,
        latestObservation: perspectives[0] || null
      });

    } else if (req.method === 'POST') {
      // Create new teacher perspective
      const {
        teacherId,
        behavioralObservations,
        academicProgress,
        participationLevel,
        socialInteraction,
        motivationFactors,
        challengesObserved,
        recommendedInterventions,
        followUpActions,
        priorityLevel
      } = req.body;

      if (!teacherId || !behavioralObservations || !academicProgress || !participationLevel) {
        return res.status(400).json({ 
          error: "Missing required fields",
          required: ["teacherId", "behavioralObservations", "academicProgress", "participationLevel"]
        });
      }

      const perspectiveData = {
        id: nanoid(),
        studentId: studentId,
        teacherId,
        behavioralObservations,
        academicProgress,
        participationLevel,
        socialInteraction: socialInteraction || "No observado",
        motivationFactors: motivationFactors || "Pendiente de evaluar",
        challengesObserved: challengesObserved || "Ninguno identificado",
        recommendedInterventions: recommendedInterventions || "Continuar con estrategias actuales",
        followUpActions: followUpActions || null,
        priorityLevel: priorityLevel || 3,
        observationDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      try {
        const insertResult = await db.insert(teacherPerspectives)
          .values(perspectiveData)
          .returning();

        const perspective = insertResult[0];

        console.log(`👨‍🏫 Teacher perspective created for student ${studentId}`);

        return res.status(201).json({
          message: "Perspectiva del docente registrada exitosamente",
          perspective,
          studentId
        });

      } catch (dbError) {
        console.error('❌ Database error creating teacher perspective:', dbError);
        return res.status(500).json({ 
          error: "Failed to save teacher perspective", 
          message: dbError.message 
        });
      }

    } else if (req.method === 'PUT') {
      // Update existing teacher perspective
      const { perspectiveId } = req.query;
      
      if (!perspectiveId) {
        return res.status(400).json({ error: "Perspective ID is required for updates" });
      }

      const updateData = req.body;
      updateData.updatedAt = new Date();

      try {
        const updateResult = await db.update(teacherPerspectives)
          .set(updateData)
          .where(eq(teacherPerspectives.id, perspectiveId))
          .returning();

        if (updateResult.length === 0) {
          return res.status(404).json({ error: "Teacher perspective not found" });
        }

        const perspective = updateResult[0];

        console.log(`👨‍🏫 Teacher perspective ${perspectiveId} updated`);

        return res.status(200).json({
          message: "Perspectiva del docente actualizada",
          perspective,
          studentId
        });

      } catch (dbError) {
        console.error('❌ Database error updating teacher perspective:', dbError);
        return res.status(500).json({ 
          error: "Failed to update teacher perspective", 
          message: dbError.message 
        });
      }

    } else if (req.method === 'DELETE') {
      // Delete teacher perspective
      const { perspectiveId } = req.query;
      
      if (!perspectiveId) {
        return res.status(400).json({ error: "Perspective ID is required for deletion" });
      }

      try {
        const deleteResult = await db.delete(teacherPerspectives)
          .where(eq(teacherPerspectives.id, perspectiveId))
          .returning();

        if (deleteResult.length === 0) {
          return res.status(404).json({ error: "Teacher perspective not found" });
        }

        console.log(`👨‍🏫 Teacher perspective ${perspectiveId} deleted`);

        return res.status(200).json({
          message: "Perspectiva del docente eliminada",
          deletedPerspective: deleteResult[0]
        });

      } catch (dbError) {
        console.error('❌ Database error deleting teacher perspective:', dbError);
        return res.status(500).json({ 
          error: "Failed to delete teacher perspective", 
          message: dbError.message 
        });
      }

    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }

  } catch (error) {
    console.error('❌ Teacher perspectives handler error:', error);
    
    return res.status(500).json({ 
      error: "Error processing teacher perspective request",
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
