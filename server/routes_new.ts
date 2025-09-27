import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import path from "path";
import { storage } from "./storage";
import { config } from "./config";
import { uploadConfig, FileService, ensureUploadDir } from "./fileService";
import {
  insertStudentSchema,
  insertTeacherPerspectiveSchema,
  insertEvidenceSchema,
  insertAnalysisResultSchema,
  insertLearningProfileSchema,
} from "@shared/schema";
import { z } from "zod";

// Analysis service for AI-powered evaluation
class AnalysisService {
  static async analyzeEvidence(evidenceId: string) {
    try {
      const evidence = await storage.getEvidence(evidenceId);
      if (!evidence || !evidence.studentId) {
        throw new Error('Evidence not found');
      }

      const student = await storage.getStudent(evidence.studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      const perspective = await storage.getTeacherPerspective(evidence.studentId);
      
      // Generate analysis based on evidence and teacher perspective
      const analysis = this.generateAnalysis(evidence, perspective);
      
      // Save analysis result
      const analysisResult = await storage.createAnalysisResult({
        evidenceId: evidence.id,
        adaptedScore: analysis.adaptedScore.toString(),
        competencyLevel: analysis.competencyLevel,
        identifiedStrengths: analysis.identifiedStrengths,
        improvementAreas: analysis.improvementAreas,
        successfulModalities: analysis.successfulModalities,
        pedagogicalRecommendations: analysis.pedagogicalRecommendations,
        suggestedAdaptations: analysis.suggestedAdaptations,
        evaluationJustification: analysis.evaluationJustification,
      });

      return analysisResult;
    } catch (error) {
      console.error('Error analyzing evidence:', error);
      throw error;
    }
  }

  private static generateAnalysis(evidence: any, perspective: any) {
    const baseScore = this.calculateAdaptedScore(evidence, perspective);
    const competencyLevel = this.determineCompetencyLevel(baseScore);
    
    return {
      adaptedScore: baseScore,
      competencyLevel,
      identifiedStrengths: this.generateStrengths(evidence, perspective),
      improvementAreas: this.generateImprovementAreas(evidence, perspective),
      successfulModalities: this.determineSuccessfulModalities(perspective),
      pedagogicalRecommendations: this.generatePedagogicalRecommendations(perspective),
      suggestedAdaptations: this.generateSuggestedAdaptations(evidence, perspective),
      evaluationJustification: this.generateEvaluationJustification(evidence, perspective, baseScore)
    };
  }

  private static calculateAdaptedScore(evidence: any, perspective: any): number {
    let baseScore = 75; // Starting score

    // Adjust based on completion time vs concentration time
    if (perspective?.concentrationTime && evidence?.timeSpent) {
      const timeRatio = evidence.timeSpent / perspective.concentrationTime;
      if (timeRatio <= 1) baseScore += 15;
      else if (timeRatio <= 1.5) baseScore += 10;
      else if (timeRatio > 2) baseScore -= 5;
    }

    // Adjust based on evidence type matching preferred modality  
    if (this.evidenceMatchesModality(evidence, perspective)) baseScore += 10;

    return Math.min(100, Math.max(60, baseScore));
  }

  private static evidenceMatchesModality(evidence: any, perspective: any): boolean {
    const modality = perspective?.preferredModality?.toLowerCase();
    const type = evidence?.evidenceType?.toLowerCase();

    return (
      (modality?.includes('visual') && type === 'imagen') ||
      (modality?.includes('auditiva') && type === 'audio') ||
      (modality?.includes('kinestésica') && type === 'video')
    );
  }

  private static determineCompetencyLevel(score: number): string {
    if (score >= 90) return 'Avanzado';
    if (score >= 80) return 'Competente';  
    if (score >= 70) return 'En desarrollo';
    return 'Iniciando';
  }

  private static generateStrengths(evidence: any, perspective: any): string {
    const strengths = [];

    if (perspective?.observedStrengths) {
      strengths.push(`Fortalezas observadas: ${perspective.observedStrengths}`);
    }

    if (evidence?.evidenceType === 'imagen') {
      strengths.push('Excelente representación visual de conceptos');
    } else if (evidence?.evidenceType === 'audio') {
      strengths.push('Comunicación oral clara y estructurada');
    } else if (evidence?.evidenceType === 'video') {
      strengths.push('Integración efectiva de múltiples modalidades');
    }

    return strengths.join('. ') || 'Demuestra comprensión de conceptos básicos';
  }

  private static generateImprovementAreas(evidence: any, perspective: any): string {
    const areas = [];

    if (perspective?.mainDifficulties) {
      areas.push(`Áreas identificadas: ${perspective.mainDifficulties}`);
    }

    if (evidence?.reportedDifficulties) {
      areas.push(`Dificultades reportadas: ${evidence.reportedDifficulties}`);
    }

    return areas.join('. ') || 'Continuar fortaleciendo habilidades desarrolladas';
  }

  private static determineSuccessfulModalities(perspective: any): string {
    const modality = perspective?.preferredModality;
    if (modality) {
      return `Modalidad ${modality.toLowerCase()} muestra mayor efectividad`;
    }
    return 'Evaluar múltiples modalidades para identificar preferencias';
  }

  private static generatePedagogicalRecommendations(perspective: any): string {
    const recommendations = [];

    if (perspective?.effectiveStrategies) {
      recommendations.push(`Continuar con: ${perspective.effectiveStrategies}`);
    }

    if (perspective?.preferredModality?.toLowerCase().includes('visual')) {
      recommendations.push('Incrementar uso de materiales visuales y diagramas');
    } else if (perspective?.preferredModality?.toLowerCase().includes('auditiva')) {
      recommendations.push('Fortalecer actividades de discusión y explicación oral');
    }

    return recommendations.join('. ') || 'Diversificar estrategias pedagógicas según perfil del estudiante';
  }

  private static generateSuggestedAdaptations(evidence: any, perspective: any): string {
    const adaptations = [];

    if (perspective?.instructionNeeds?.includes('Repetidas')) {
      adaptations.push('Proporcionar instrucciones repetidas y claras');
    }

    if (perspective?.instructionNeeds?.includes('Visuales')) {
      adaptations.push('Incluir apoyos visuales en las instrucciones');
    }

    if (perspective?.concentrationTime && perspective.concentrationTime < 20) {
      adaptations.push('Dividir tareas en segmentos cortos');
    }

    return adaptations.join('. ') || 'Mantener estrategias actuales con monitoreo constante';
  }

  private static generateEvaluationJustification(evidence: any, perspective: any, score: number): string {
    return `Evaluación basada en evidencia de tipo ${evidence?.evidenceType}, considerando tiempo invertido (${evidence?.timeSpent || 'N/A'} min), modalidad preferida (${perspective?.preferredModality || 'N/A'}) y perfil individual del estudiante. Puntaje adaptado: ${score}/100`;
  }
}

export function registerRoutes(app: Express): Server {
  const server = createServer(app);

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Students routes
  app.get("/api/students", async (_req, res) => {
    try {
      const students = await storage.getAllStudents();
      res.json(students);
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({ error: "Failed to fetch students" });
    }
  });

  app.get("/api/students/:id", async (req, res) => {
    try {
      const student = await storage.getStudent(req.params.id);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      console.error('Error fetching student:', error);
      res.status(500).json({ error: "Failed to fetch student" });
    }
  });

  app.post("/api/students", async (req, res) => {
    try {
      const validatedData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(validatedData);
      res.status(201).json(student);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error('Error creating student:', error);
      res.status(500).json({ error: "Failed to create student" });
    }
  });

  app.put("/api/students/:id", async (req, res) => {
    try {
      const validatedData = insertStudentSchema.partial().parse(req.body);
      const student = await storage.updateStudent(req.params.id, validatedData);
      res.json(student);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error('Error updating student:', error);
      res.status(500).json({ error: "Failed to update student" });
    }
  });

  app.delete("/api/students/:id", async (req, res) => {
    try {
      await storage.deleteStudent(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting student:', error);
      res.status(500).json({ error: "Failed to delete student" });
    }
  });

  // Teacher perspectives routes
  app.get("/api/students/:studentId/perspective", async (req, res) => {
    try {
      const perspective = await storage.getTeacherPerspective(req.params.studentId);
      if (!perspective) {
        return res.status(404).json({ error: "Teacher perspective not found" });
      }
      res.json(perspective);
    } catch (error) {
      console.error('Error fetching teacher perspective:', error);
      res.status(500).json({ error: "Failed to fetch teacher perspective" });
    }
  });

  app.post("/api/students/:studentId/perspective", async (req, res) => {
    try {
      const validatedData = insertTeacherPerspectiveSchema.parse({
        ...req.body,
        studentId: req.params.studentId
      });
      const perspective = await storage.createTeacherPerspective(validatedData);
      res.status(201).json(perspective);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error('Error creating teacher perspective:', error);
      res.status(500).json({ error: "Failed to create teacher perspective" });
    }
  });

  app.put("/api/students/:studentId/perspective", async (req, res) => {
    try {
      const validatedData = insertTeacherPerspectiveSchema.partial().parse(req.body);
      const perspective = await storage.updateTeacherPerspective(req.params.studentId, validatedData);
      res.json(perspective);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error('Error updating teacher perspective:', error);
      res.status(500).json({ error: "Failed to update teacher perspective" });
    }
  });

  // Evidence routes
  app.get("/api/evidence", async (_req, res) => {
    try {
      const evidence = await storage.getAllEvidence();
      res.json(evidence);
    } catch (error) {
      console.error('Error fetching evidence:', error);
      res.status(500).json({ error: "Failed to fetch evidence" });
    }
  });

  app.get("/api/students/:studentId/evidence", async (req, res) => {
    try {
      const evidence = await storage.getEvidenceByStudent(req.params.studentId);
      res.json(evidence);
    } catch (error) {
      console.error('Error fetching student evidence:', error);
      res.status(500).json({ error: "Failed to fetch student evidence" });
    }
  });

  app.post('/api/students/:studentId/evidence', uploadConfig.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const evidenceType = FileService.getFileType(req.file.filename);
      
      const validatedData = insertEvidenceSchema.parse({
        studentId: req.params.studentId,
        taskTitle: req.body.taskTitle,
        subject: req.body.subject,
        evidenceType,
        fileName: req.file.originalname,
        filePath: req.file.path,
        standardRubric: req.body.standardRubric,
        evaluatedCompetencies: req.body.evaluatedCompetencies,
        originalInstructions: req.body.originalInstructions,
        timeSpent: req.body.timeSpent ? parseInt(req.body.timeSpent) : null,
        reportedDifficulties: req.body.reportedDifficulties,
      });

      const evidence = await storage.createEvidence(validatedData);
      res.status(201).json(evidence);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error('Error creating evidence:', error);
      res.status(500).json({ error: "Failed to create evidence" });
    }
  });

  // Analysis routes
  app.post('/api/evidence/:id/analyze', async (req, res) => {
    try {
      const analysisResult = await AnalysisService.analyzeEvidence(req.params.id);
      res.status(201).json(analysisResult);
    } catch (error) {
      console.error('Error analyzing evidence:', error);
      res.status(500).json({ error: "Failed to analyze evidence" });
    }
  });

  app.get('/api/analysis-results/:evidenceId', async (req, res) => {
    try {
      const result = await storage.getAnalysisResult(req.params.evidenceId);
      if (!result) {
        return res.status(404).json({ error: "Analysis result not found" });
      }
      res.json(result);
    } catch (error) {
      console.error('Error fetching analysis result:', error);
      res.status(500).json({ error: "Failed to fetch analysis result" });
    }
  });

  // Learning profiles routes
  app.get("/api/students/:studentId/learning-profile", async (req, res) => {
    try {
      const profile = await storage.getLearningProfile(req.params.studentId);
      if (!profile) {
        return res.status(404).json({ error: "Learning profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error('Error fetching learning profile:', error);
      res.status(500).json({ error: "Failed to fetch learning profile" });
    }
  });

  app.post("/api/students/:studentId/learning-profile", async (req, res) => {
    try {
      const validatedData = insertLearningProfileSchema.parse({
        ...req.body,
        studentId: req.params.studentId
      });
      const profile = await storage.createLearningProfile(validatedData);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error('Error creating learning profile:', error);
      res.status(500).json({ error: "Failed to create learning profile" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (_req, res) => {
    try {
      const students = await storage.getAllStudents();
      const evidence = await storage.getAllEvidence();
      
      const totalStudents = students.length;
      const totalEvidence = evidence.length;
      const analyzedEvidence = evidence.filter(e => e.isAnalyzed).length;
      const studentsWithProfiles = students.filter(s => 'learningProfile' in s && s.learningProfile).length;

      res.json({
        totalStudents,
        totalEvidence,
        analyzedEvidence,
        studentsWithProfiles,
        analysisProgress: totalEvidence > 0 ? (analyzedEvidence / totalEvidence) * 100 : 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // File serving
  app.get('/api/files/:studentId/:filename', async (req, res) => {
    try {
      const { studentId, filename } = req.params;
      const filePath = path.join(process.cwd(), 'uploads', studentId, filename);
      
      const fileInfo = await FileService.getFileInfo(filePath);
      if (!fileInfo.exists) {
        return res.status(404).json({ error: 'File not found' });
      }

      res.sendFile(filePath);
    } catch (error) {
      console.error('Error serving file:', error);
      res.status(500).json({ error: "Failed to serve file" });
    }
  });

  return server;
}
