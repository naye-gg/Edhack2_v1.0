import { sql, relations } from "drizzle-orm";
import { sqliteTable, text, integer, real, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { nanoid } from "nanoid";

export const students = sqliteTable("students", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  grade: text("grade").notNull(),
  mainSubjects: text("main_subjects").notNull(),
  specialNeeds: text("special_needs"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
});

export const teacherPerspectives = sqliteTable("teacher_perspectives", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  studentId: text("student_id").references(() => students.id),
  attentionLevel: text("attention_level"), // Alta, Media, Baja, Variable
  verbalParticipation: text("verbal_participation"), // Activa, Moderada, Limitada, No verbal
  socialInteraction: text("social_interaction"), // Sociable, Selectivo, Reservado, Evita
  preferredModality: text("preferred_modality"), // Visual, Auditiva, Kinestésica, Lectora
  concentrationTime: integer("concentration_time"), // minutes
  instructionNeeds: text("instruction_needs"), // Una vez, Repetidas, Escritas, Visuales
  observedStrengths: text("observed_strengths"),
  successfulActivities: text("successful_activities"),
  effectiveStrategies: text("effective_strategies"),
  mainDifficulties: text("main_difficulties"),
  conflictiveSituations: text("conflictive_situations"),
  previousAdaptations: text("previous_adaptations"),
  preferredExpression: text("preferred_expression"),
  selfEsteemLevel: integer("self_esteem_level"), // 1-10
  mainMotivators: text("main_motivators"),
  additionalComments: text("additional_comments"),
  suspectedSpecialNeeds: text("suspected_special_needs"),
  currentSupports: text("current_supports"),
});

export const evidence = pgTable("evidence", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => students.id),
  taskTitle: text("task_title").notNull(),
  subject: text("subject").notNull(),
  completionDate: timestamp("completion_date").defaultNow(),
  evidenceType: text("evidence_type").notNull(), // texto, imagen, video, audio
  fileName: text("file_name"),
  filePath: text("file_path"),
  standardRubric: text("standard_rubric"),
  evaluatedCompetencies: text("evaluated_competencies"),
  originalInstructions: text("original_instructions"),
  timeSpent: integer("time_spent"), // minutes
  reportedDifficulties: text("reported_difficulties"),
  isAnalyzed: boolean("is_analyzed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const analysisResults = pgTable("analysis_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  evidenceId: varchar("evidence_id").references(() => evidence.id),
  adaptedScore: decimal("adapted_score", { precision: 4, scale: 2 }),
  competencyLevel: text("competency_level"),
  identifiedStrengths: text("identified_strengths"),
  improvementAreas: text("improvement_areas"),
  successfulModalities: text("successful_modalities"),
  pedagogicalRecommendations: text("pedagogical_recommendations"),
  suggestedAdaptations: text("suggested_adaptations"),
  evaluationJustification: text("evaluation_justification"),
  analysisDate: timestamp("analysis_date").defaultNow(),
});

export const learningProfiles = pgTable("learning_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => students.id),
  dominantLearningPattern: text("dominant_learning_pattern"),
  detectedSpecialAbilities: text("detected_special_abilities"),
  identifiedNeeds: text("identified_needs"),
  recommendedTeachingStrategies: text("recommended_teaching_strategies"),
  suggestedEvaluationInstruments: text("suggested_evaluation_instruments"),
  personalizedDidacticMaterials: text("personalized_didactic_materials"),
  curricularAdaptationPlan: text("curricular_adaptation_plan"),
  generatedAt: timestamp("generated_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const studentsRelations = relations(students, ({ one, many }) => ({
  teacherPerspective: one(teacherPerspectives),
  evidence: many(evidence),
  learningProfile: one(learningProfiles),
}));

export const teacherPerspectivesRelations = relations(teacherPerspectives, ({ one }) => ({
  student: one(students, {
    fields: [teacherPerspectives.studentId],
    references: [students.id],
  }),
}));

export const evidenceRelations = relations(evidence, ({ one }) => ({
  student: one(students, {
    fields: [evidence.studentId],
    references: [students.id],
  }),
  analysisResult: one(analysisResults),
}));

export const analysisResultsRelations = relations(analysisResults, ({ one }) => ({
  evidence: one(evidence, {
    fields: [analysisResults.evidenceId],
    references: [evidence.id],
  }),
}));

export const learningProfilesRelations = relations(learningProfiles, ({ one }) => ({
  student: one(students, {
    fields: [learningProfiles.studentId],
    references: [students.id],
  }),
}));

// Insert schemas
export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeacherPerspectiveSchema = createInsertSchema(teacherPerspectives).omit({
  id: true,
});

export const insertEvidenceSchema = createInsertSchema(evidence).omit({
  id: true,
  createdAt: true,
  isAnalyzed: true,
});

export const insertAnalysisResultSchema = createInsertSchema(analysisResults).omit({
  id: true,
  analysisDate: true,
});

export const insertLearningProfileSchema = createInsertSchema(learningProfiles).omit({
  id: true,
  generatedAt: true,
  updatedAt: true,
});

// Types
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;
export type InsertTeacherPerspective = z.infer<typeof insertTeacherPerspectiveSchema>;
export type TeacherPerspective = typeof teacherPerspectives.$inferSelect;
export type InsertEvidence = z.infer<typeof insertEvidenceSchema>;
export type Evidence = typeof evidence.$inferSelect;
export type InsertAnalysisResult = z.infer<typeof insertAnalysisResultSchema>;
export type AnalysisResult = typeof analysisResults.$inferSelect;
export type InsertLearningProfile = z.infer<typeof insertLearningProfileSchema>;
export type LearningProfile = typeof learningProfiles.$inferSelect;

// Extended types for relations
export type StudentWithRelations = Student & {
  teacherPerspective?: TeacherPerspective;
  evidence?: Evidence[];
  learningProfile?: LearningProfile;
};

export type EvidenceWithRelations = Evidence & {
  student?: Student;
  analysisResult?: AnalysisResult;
};
