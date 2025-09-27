import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
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

export const evidence = sqliteTable("evidence", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  studentId: text("student_id").references(() => students.id),
  taskTitle: text("task_title").notNull(),
  subject: text("subject").notNull(),
  completionDate: text("completion_date").$defaultFn(() => new Date().toISOString()),
  evidenceType: text("evidence_type").notNull(), // texto, imagen, video, audio
  fileName: text("file_name"),
  filePath: text("file_path"),
  standardRubric: text("standard_rubric"),
  evaluatedCompetencies: text("evaluated_competencies"),
  originalInstructions: text("original_instructions"),
  timeSpent: integer("time_spent"), // minutes
  reportedDifficulties: text("reported_difficulties"),
  isAnalyzed: integer("is_analyzed", { mode: 'boolean' }).default(false),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const analysisResults = sqliteTable("analysis_results", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  evidenceId: text("evidence_id").references(() => evidence.id),
  adaptedScore: real("adapted_score"),
  competencyLevel: text("competency_level"),
  identifiedStrengths: text("identified_strengths"),
  improvementAreas: text("improvement_areas"),
  successfulModalities: text("successful_modalities"),
  pedagogicalRecommendations: text("pedagogical_recommendations"),
  suggestedAdaptations: text("suggested_adaptations"),
  evaluationJustification: text("evaluation_justification"),
  analysisDate: text("analysis_date").$defaultFn(() => new Date().toISOString()),
});

export const learningProfiles = sqliteTable("learning_profiles", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  studentId: text("student_id").references(() => students.id),
  dominantLearningPattern: text("dominant_learning_pattern"),
  detectedSpecialAbilities: text("detected_special_abilities"),
  identifiedNeeds: text("identified_needs"),
  recommendedTeachingStrategies: text("recommended_teaching_strategies"),
  suggestedEvaluationInstruments: text("suggested_evaluation_instruments"),
  personalizedDidacticMaterials: text("personalized_didactic_materials"),
  curricularAdaptationPlan: text("curricular_adaptation_plan"),
  generatedAt: text("generated_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
});

// Insert schemas using Zod directly
export const insertStudentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.number().min(1, "Age must be positive").max(120, "Age must be realistic"),
  grade: z.string().min(1, "Grade is required"),
  mainSubjects: z.string().min(1, "Main subjects are required"),
  specialNeeds: z.string().optional(),
});

export const insertTeacherPerspectiveSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  attentionLevel: z.string().optional(),
  verbalParticipation: z.string().optional(),
  socialInteraction: z.string().optional(),
  preferredModality: z.string().optional(),
  concentrationTime: z.number().min(0).optional(),
  instructionNeeds: z.string().optional(),
  observedStrengths: z.string().optional(),
  successfulActivities: z.string().optional(),
  effectiveStrategies: z.string().optional(),
  mainDifficulties: z.string().optional(),
  conflictiveSituations: z.string().optional(),
  previousAdaptations: z.string().optional(),
  preferredExpression: z.string().optional(),
  selfEsteemLevel: z.number().min(1).max(10).optional(),
  mainMotivators: z.string().optional(),
  additionalComments: z.string().optional(),
  suspectedSpecialNeeds: z.string().optional(),
  currentSupports: z.string().optional(),
});

export const insertEvidenceSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  taskTitle: z.string().min(1, "Task title is required"),
  subject: z.string().min(1, "Subject is required"),
  evidenceType: z.string().min(1, "Evidence type is required"),
  fileName: z.string().optional(),
  filePath: z.string().optional(),
  standardRubric: z.string().optional(),
  evaluatedCompetencies: z.string().optional(),
  originalInstructions: z.string().optional(),
  timeSpent: z.number().min(0).optional(),
  reportedDifficulties: z.string().optional(),
});

export const insertAnalysisResultSchema = z.object({
  evidenceId: z.string().min(1, "Evidence ID is required"),
  adaptedScore: z.string(),
  competencyLevel: z.string().optional(),
  identifiedStrengths: z.string().optional(),
  improvementAreas: z.string().optional(),
  successfulModalities: z.string().optional(),
  pedagogicalRecommendations: z.string().optional(),
  suggestedAdaptations: z.string().optional(),
  evaluationJustification: z.string().optional(),
});

export const insertLearningProfileSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  dominantLearningPattern: z.string().optional(),
  detectedSpecialAbilities: z.string().optional(),
  identifiedNeeds: z.string().optional(),
  recommendedTeachingStrategies: z.string().optional(),
  suggestedEvaluationInstruments: z.string().optional(),
  personalizedDidacticMaterials: z.string().optional(),
  curricularAdaptationPlan: z.string().optional(),
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

export type EvidenceWithAnalysis = Evidence & {
  analysisResult?: AnalysisResult;
};

export type EvidenceWithRelations = Evidence & {
  student?: Student;
  analysisResult?: AnalysisResult;
};
