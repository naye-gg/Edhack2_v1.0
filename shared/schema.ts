import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { z } from "zod";
import { nanoid } from "nanoid";

// Tabla de profesores
export const teachers = sqliteTable("teachers", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // Se almacenará hasheada
  name: text("name").notNull(),
  lastName: text("last_name").notNull(),
  school: text("school"),
  grade: text("grade"), // Grado que enseña
  subject: text("subject"), // Materia principal
  phoneNumber: text("phone_number"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
  lastLogin: text("last_login"),
});

export const students = sqliteTable("students", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  teacherId: text("teacher_id").references(() => teachers.id).notNull(), // Relación con profesor
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

export const teacherDocuments = sqliteTable("teacher_documents", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  studentId: text("student_id").references(() => students.id),
  documentType: text("document_type").notNull(), // 'rubric', 'diagnosis', 'report', 'other'
  title: text("title").notNull(),
  fileName: text("file_name"),
  filePath: text("file_path"),
  extractedContent: text("extracted_content"),
  uploadedAt: text("uploaded_at").$defaultFn(() => new Date().toISOString()),
  uploadedBy: text("uploaded_by"),
});

export const aiGeneratedResources = sqliteTable("ai_generated_resources", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  studentId: text("student_id").references(() => students.id),
  resourceType: text("resource_type").notNull(), // 'task', 'exercise', 'material', 'strategy'
  title: text("title").notNull(),
  content: text("content").notNull(),
  difficulty: text("difficulty"),
  subject: text("subject"),
  tags: text("tags"),
  basedOnEvidenceId: text("based_on_evidence_id").references(() => evidence.id),
  basedOnAnalysisId: text("based_on_analysis_id").references(() => analysisResults.id),
  aiPrompt: text("ai_prompt"),
  aiModel: text("ai_model"),
  generatedAt: text("generated_at").$defaultFn(() => new Date().toISOString()),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
});

export const aiAnalysisHistory = sqliteTable("ai_analysis_history", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  evidenceId: text("evidence_id").references(() => evidence.id),
  analysisType: text("analysis_type").notNull(), // 'content', 'competency', 'adaptation', 'resource_generation'
  aiModel: text("ai_model").notNull(),
  prompt: text("prompt").notNull(),
  response: text("response").notNull(),
  tokensUsed: integer("tokens_used"),
  processingTime: integer("processing_time"), // milliseconds
  confidence: real("confidence"), // 0-1 score
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

// Nuevas tablas para chat por estudiante
export const studentChats = sqliteTable("student_chats", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  studentId: text("student_id").references(() => students.id),
  title: text("title").notNull(),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
});

export const chatMessages = sqliteTable("chat_messages", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  chatId: text("chat_id").references(() => studentChats.id),
  role: text("role").notNull(), // user, assistant
  content: text("content").notNull(),
  studentContext: text("student_context"), // JSON con contexto del estudiante usado
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

// Insert schemas using Zod
export const insertStudentSchema = z.object({
  teacherId: z.string().min(1, "Teacher ID is required"),
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

export const insertTeacherDocumentSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  documentType: z.enum(['rubric', 'diagnosis', 'report', 'other']),
  title: z.string().min(1, "Title is required"),
  fileName: z.string().optional(),
  filePath: z.string().optional(),
  extractedContent: z.string().optional(),
  uploadedBy: z.string().optional(),
});

export const insertAiGeneratedResourceSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  resourceType: z.enum(['task', 'exercise', 'material', 'strategy']),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  subject: z.string().optional(),
  tags: z.string().optional(),
  basedOnEvidenceId: z.string().optional(),
  basedOnAnalysisId: z.string().optional(),
  aiPrompt: z.string().optional(),
  aiModel: z.string().optional(),
});

export const insertAiAnalysisHistorySchema = z.object({
  evidenceId: z.string().min(1, "Evidence ID is required"),
  analysisType: z.enum(['content', 'competency', 'adaptation', 'resource_generation']),
  aiModel: z.string().min(1, "AI Model is required"),
  prompt: z.string().min(1, "Prompt is required"),
  response: z.string().min(1, "Response is required"),
  tokensUsed: z.number().min(0).optional(),
  processingTime: z.number().min(0).optional(),
  confidence: z.number().min(0).max(1).optional(),
});

// Chat schemas
export const insertStudentChatSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  title: z.string().min(1, "Title is required"),
});

export const insertChatMessageSchema = z.object({
  chatId: z.string().min(1, "Chat ID is required"),
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1, "Content is required"),
  studentContext: z.string().optional(),
});

// Schemas de validación para profesores
export const insertTeacherSchema = z.object({
  email: z.string().email("Email debe ser válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  school: z.string().optional(),
  grade: z.string().optional(),
  subject: z.string().optional(),
  phoneNumber: z.string().optional(),
});

export const loginTeacherSchema = z.object({
  email: z.string().email("Email debe ser válido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

// Types
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;
export type LoginTeacher = z.infer<typeof loginTeacherSchema>;
export type Teacher = typeof teachers.$inferSelect;
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
export type InsertTeacherDocument = z.infer<typeof insertTeacherDocumentSchema>;
export type TeacherDocument = typeof teacherDocuments.$inferSelect;
export type InsertAiGeneratedResource = z.infer<typeof insertAiGeneratedResourceSchema>;
export type AiGeneratedResource = typeof aiGeneratedResources.$inferSelect;
export type InsertAiAnalysisHistory = z.infer<typeof insertAiAnalysisHistorySchema>;
export type AiAnalysisHistory = typeof aiAnalysisHistory.$inferSelect;
export type InsertStudentChat = z.infer<typeof insertStudentChatSchema>;
export type StudentChat = typeof studentChats.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

// Extended types for relations
export type TeacherWithStudents = Teacher & {
  students?: Student[];
};

export type StudentWithRelations = Student & {
  teacher?: Teacher;
  teacherPerspective?: TeacherPerspective;
  evidence?: Evidence[];
  learningProfile?: LearningProfile;
  teacherDocuments?: TeacherDocument[];
  aiGeneratedResources?: AiGeneratedResource[];
  chats?: StudentChat[];
};

export type EvidenceWithAnalysis = Evidence & {
  analysisResult?: AnalysisResult;
  aiAnalysisHistory?: AiAnalysisHistory[];
};

export type EvidenceWithRelations = Evidence & {
  student?: Student;
  analysisResult?: AnalysisResult;
  aiAnalysisHistory?: AiAnalysisHistory[];
};

export type ChatWithMessages = StudentChat & {
  messages?: ChatMessage[];
};

export type AnalysisResultWithResources = AnalysisResult & {
  generatedResources?: AiGeneratedResource[];
};
