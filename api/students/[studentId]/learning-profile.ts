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

    console.log(`🧠 Learning profile for student ${studentId}:`, req.method);

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
    const { pgTable, text, timestamp, real } = await import('drizzle-orm/pg-core');
    
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

    // ==================== GET LEARNING PROFILE ====================
    if (req.method === "GET") {
      const profileResult = await db.select()
        .from(learningProfiles)
        .where(eq(learningProfiles.studentId, studentId))
        .limit(1);
      
      if (profileResult.length === 0) {
        return res.status(404).json({ error: "Learning profile not found" });
      }

      console.log('🧠 Learning profile found for student:', studentId);
      return res.status(200).json(profileResult[0]);
    }

    // ==================== CREATE LEARNING PROFILE ====================
    if (req.method === "POST") {
      const { z } = await import('zod');
      const { nanoid } = await import('nanoid');
      
      const createSchema = z.object({
        dominantLearningPattern: z.string().min(1),
        cognitiveStrengths: z.string().min(1),
        learningChallenges: z.string().min(1),
        motivationalFactors: z.string().min(1),
        recommendedTeachingApproaches: z.string().min(1),
        assessmentRecommendations: z.string().min(1),
        resourcesAndTools: z.string().min(1),
        confidenceLevel: z.number().min(0).max(1),
      });

      try {
        const validatedData = createSchema.parse(req.body);
        
        // Check if profile already exists
        const existingProfile = await db.select()
          .from(learningProfiles)
          .where(eq(learningProfiles.studentId, studentId))
          .limit(1);

        if (existingProfile.length > 0) {
          return res.status(409).json({ error: "Learning profile already exists for this student" });
        }

        const newProfile = {
          id: nanoid(),
          studentId: studentId,
          ...validatedData,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const insertResult = await db.insert(learningProfiles)
          .values(newProfile)
          .returning();

        console.log('🧠 Learning profile created for student:', studentId);
        return res.status(201).json(insertResult[0]);
      } catch (validationError) {
        return res.status(400).json({ 
          error: "Invalid data", 
          details: validationError.errors || validationError.message
        });
      }
    }

    // ==================== UPDATE LEARNING PROFILE ====================
    if (req.method === "PUT") {
      const { z } = await import('zod');
      
      const updateSchema = z.object({
        dominantLearningPattern: z.string().optional(),
        cognitiveStrengths: z.string().optional(),
        learningChallenges: z.string().optional(),
        motivationalFactors: z.string().optional(),
        recommendedTeachingApproaches: z.string().optional(),
        assessmentRecommendations: z.string().optional(),
        resourcesAndTools: z.string().optional(),
        confidenceLevel: z.number().min(0).max(1).optional(),
      });

      try {
        const validatedData = updateSchema.parse(req.body);
        
        const updateResult = await db.update(learningProfiles)
          .set({
            ...validatedData,
            updatedAt: new Date()
          })
          .where(eq(learningProfiles.studentId, studentId))
          .returning();

        if (updateResult.length === 0) {
          return res.status(404).json({ error: "Learning profile not found" });
        }

        console.log('🧠 Learning profile updated for student:', studentId);
        return res.status(200).json(updateResult[0]);
      } catch (validationError) {
        return res.status(400).json({ 
          error: "Invalid data", 
          details: validationError.errors || validationError.message
        });
      }
    }

    return res.status(405).json({ error: "Method not allowed" });

  } catch (error) {
    console.error('❌ Learning profile handler error:', error);
    
    return res.status(500).json({ 
      error: "Error processing learning profile request",
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
