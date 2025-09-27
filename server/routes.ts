import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import {
  insertStudentSchema,
  insertTeacherPerspectiveSchema,
  insertEvidenceSchema,
  insertAnalysisResultSchema,
  insertLearningProfileSchema,
} from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const studentId = req.params.studentId || 'general';
      const studentDir = path.join(uploadDir, studentId);
      if (!fs.existsSync(studentDir)) {
        fs.mkdirSync(studentDir, { recursive: true });
      }
      cb(null, studentDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|mp3|wav|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  }
});

// Simulated AI Analysis Service
class AIAnalysisService {
  async analyzeEvidence(evidenceData: any, teacherPerspective: any): Promise<any> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    const adaptedScore = this.calculateAdaptedScore(evidenceData, teacherPerspective);
    const competencyLevel = this.determineCompetencyLevel(adaptedScore);
    
    return {
      adaptedScore: adaptedScore.toFixed(2),
      competencyLevel,
      identifiedStrengths: this.generateStrengths(evidenceData, teacherPerspective),
      improvementAreas: this.generateImprovementAreas(evidenceData, teacherPerspective),
      successfulModalities: this.determineSuccessfulModalities(teacherPerspective),
      pedagogicalRecommendations: this.generatePedagogicalRecommendations(teacherPerspective),
      suggestedAdaptations: this.generateSuggestedAdaptations(evidenceData, teacherPerspective),
      evaluationJustification: this.generateJustification(evidenceData, teacherPerspective, adaptedScore),
    };
  }

  private calculateAdaptedScore(evidence: any, perspective: any): number {
    let baseScore = 70 + Math.random() * 30; // 70-100
    
    // Adjust based on attention level
    if (perspective?.attentionLevel === 'Alta') baseScore += 5;
    if (perspective?.attentionLevel === 'Baja') baseScore -= 3;
    
    // Adjust based on participation
    if (perspective?.verbalParticipation === 'Activa') baseScore += 3;
    if (perspective?.verbalParticipation === 'Limitada') baseScore -= 2;
    
    // Adjust based on evidence type matching preferred modality
    if (this.evidenceMatchesModality(evidence, perspective)) baseScore += 10;
    
    return Math.min(100, Math.max(60, baseScore));
  }

  private evidenceMatchesModality(evidence: any, perspective: any): boolean {
    const modality = perspective?.preferredModality?.toLowerCase();
    const type = evidence?.evidenceType?.toLowerCase();
    
    return (
      (modality?.includes('visual') && type === 'imagen') ||
      (modality?.includes('auditiva') && type === 'audio') ||
      (modality?.includes('kinestésica') && type === 'video')
    );
  }

  private determineCompetencyLevel(score: number): string {
    if (score >= 90) return 'Avanzado';
    if (score >= 80) return 'Competente';
    if (score >= 70) return 'En desarrollo';
    return 'Iniciando';
  }

  private generateStrengths(evidence: any, perspective: any): string {
    const strengths = [];
    
    if (perspective?.observedStrengths) {
      strengths.push(`Fortalezas observadas por el docente: ${perspective.observedStrengths}`);
    }
    
    if (evidence?.evidenceType === 'imagen') {
      strengths.push('Excelente representación visual de conceptos');
    } else if (evidence?.evidenceType === 'audio') {
      strengths.push('Comunicación oral clara y estructurada');
    } else if (evidence?.evidenceType === 'video') {
      strengths.push('Integración efectiva de múltiples modalidades');
    }
    
    return strengths.join('. ');
  }

  private generateImprovementAreas(evidence: any, perspective: any): string {
    const areas = [];
    
    if (perspective?.mainDifficulties) {
      areas.push(`Áreas identificadas: ${perspective.mainDifficulties}`);
    }
    
    if (evidence?.reportedDifficulties) {
      areas.push(`Dificultades reportadas: ${evidence.reportedDifficulties}`);
    }
    
    return areas.join('. ') || 'Continuar fortaleciendo habilidades desarrolladas';
  }

  private determineSuccessfulModalities(perspective: any): string {
    const modality = perspective?.preferredModality;
    if (modality) {
      return `Modalidad ${modality.toLowerCase()} muestra mayor efectividad`;
    }
    return 'Evaluar múltiples modalidades para identificar preferencias';
  }

  private generatePedagogicalRecommendations(perspective: any): string {
    const recommendations = [];
    
    if (perspective?.effectiveStrategies) {
      recommendations.push(`Continuar con estrategias efectivas: ${perspective.effectiveStrategies}`);
    }
    
    if (perspective?.preferredModality === 'Visual') {
      recommendations.push('Incrementar uso de mapas conceptuales y diagramas');
    } else if (perspective?.preferredModality === 'Auditiva') {
      recommendations.push('Incorporar más discusiones grupales y explicaciones orales');
    } else if (perspective?.preferredModality === 'Kinestésica') {
      recommendations.push('Incluir actividades manipulativas y experimentación');
    }
    
    return recommendations.join('. ') || 'Adaptar metodología según perfil de aprendizaje identificado';
  }

  private generateSuggestedAdaptations(evidence: any, perspective: any): string {
    const adaptations = [];
    
    if (perspective?.concentrationTime && perspective.concentrationTime < 20) {
      adaptations.push('Fragmentar tareas en segmentos de 15-20 minutos');
    }
    
    if (perspective?.instructionNeeds === 'Escritas') {
      adaptations.push('Proporcionar instrucciones escritas claras y secuenciales');
    } else if (perspective?.instructionNeeds === 'Visuales') {
      adaptations.push('Incluir apoyos visuales en todas las instrucciones');
    }
    
    return adaptations.join('. ') || 'Mantener adaptaciones actuales según necesidades específicas';
  }

  private generateJustification(evidence: any, perspective: any, score: number): string {
    return `La evaluación considera las características específicas del estudiante, incluyendo su modalidad de aprendizaje preferida (${perspective?.preferredModality || 'por determinar'}), nivel de atención (${perspective?.attentionLevel || 'variable'}) y las estrategias pedagógicas que han demostrado efectividad. La puntuación de ${score.toFixed(1)} refleja un ajuste adaptativo basado en las necesidades especiales identificadas.`;
  }

  async generateLearningProfile(studentId: string): Promise<any> {
    const student = await storage.getStudent(studentId);
    if (!student) throw new Error('Student not found');

    const analyzedEvidence = student.evidence?.filter(e => e.analysisResult) || [];
    
    return {
      studentId,
      dominantLearningPattern: this.identifyDominantPattern(student, analyzedEvidence),
      detectedSpecialAbilities: this.detectSpecialAbilities(student, analyzedEvidence),
      identifiedNeeds: this.identifyNeeds(student),
      recommendedTeachingStrategies: this.recommendTeachingStrategies(student),
      suggestedEvaluationInstruments: this.suggestEvaluationInstruments(student),
      personalizedDidacticMaterials: this.recommendDidacticMaterials(student),
      curricularAdaptationPlan: this.createAdaptationPlan(student),
    };
  }

  private identifyDominantPattern(student: any, evidence: any[]): string {
    const modality = student.teacherPerspective?.preferredModality;
    const evidenceTypes = evidence.map(e => e.evidenceType);
    
    if (modality) {
      return `Patrón ${modality.toLowerCase()} dominante con preferencia por ${this.getModalityDescription(modality)}`;
    }
    
    return 'Patrón multimodal - requiere evaluación adicional para identificar preferencias específicas';
  }

  private getModalityDescription(modality: string): string {
    const descriptions = {
      'Visual': 'representaciones gráficas, diagramas y materiales visuales',
      'Auditiva': 'explicaciones orales, discusiones y materiales auditivos', 
      'Kinestésica': 'actividades manipulativas, experimentación y movimiento',
      'Lectora': 'textos escritos, lectura y actividades de escritura'
    };
    return descriptions[modality as keyof typeof descriptions] || 'diversos tipos de estímulos';
  }

  private detectSpecialAbilities(student: any, evidence: any[]): string {
    const abilities = [];
    
    if (student.teacherPerspective?.observedStrengths) {
      abilities.push(student.teacherPerspective.observedStrengths);
    }
    
    const avgScore = evidence.reduce((sum, e) => sum + (parseFloat(e.analysisResult?.adaptedScore) || 0), 0) / evidence.length;
    if (avgScore > 85) {
      abilities.push('Capacidad de aprendizaje superior en áreas de fortaleza');
    }
    
    return abilities.join('. ') || 'Habilidades específicas por identificar mediante evaluación continua';
  }

  private identifyNeeds(student: any): string {
    const needs = [];
    
    if (student.specialNeeds) {
      needs.push(`Necesidades identificadas: ${student.specialNeeds}`);
    }
    
    if (student.teacherPerspective?.mainDifficulties) {
      needs.push(`Áreas de apoyo: ${student.teacherPerspective.mainDifficulties}`);
    }
    
    return needs.join('. ') || 'Evaluación integral para identificar necesidades específicas';
  }

  private recommendTeachingStrategies(student: any): string {
    const strategies = [];
    
    if (student.teacherPerspective?.effectiveStrategies) {
      strategies.push(`Continuar con: ${student.teacherPerspective.effectiveStrategies}`);
    }
    
    const modality = student.teacherPerspective?.preferredModality;
    if (modality === 'Visual') {
      strategies.push('Mapas conceptuales, organizadores gráficos, colores y símbolos');
    } else if (modality === 'Auditiva') {
      strategies.push('Explicaciones verbales, música, discusiones grupales, repetición oral');
    } else if (modality === 'Kinestésica') {
      strategies.push('Manipulativos, experimentos, movimiento, aprendizaje basado en proyectos');
    }
    
    return strategies.join('. ') || 'Estrategias multimodales adaptadas al perfil individual';
  }

  private suggestEvaluationInstruments(student: any): string {
    const instruments = [];
    
    const modality = student.teacherPerspective?.preferredModality;
    if (modality === 'Visual') {
      instruments.push('Portafolios visuales, mapas conceptuales, infografías, presentaciones');
    } else if (modality === 'Auditiva') {
      instruments.push('Presentaciones orales, grabaciones, discusiones, exámenes orales');
    } else if (modality === 'Kinestésica') {
      instruments.push('Proyectos prácticos, demostraciones, experimentos, construcción de modelos');
    }
    
    instruments.push('Rúbricas adaptativas, evaluación continua, autoevaluación');
    
    return instruments.join(', ') || 'Instrumentos diversificados según modalidades de aprendizaje';
  }

  private recommendDidacticMaterials(student: any): string {
    const materials = [];
    
    const modality = student.teacherPerspective?.preferredModality;
    if (modality === 'Visual') {
      materials.push('Materiales gráficos, videos educativos, software visual, pictogramas');
    } else if (modality === 'Auditiva') {
      materials.push('Audiolibros, grabaciones, música educativa, recursos sonoros');
    } else if (modality === 'Kinestésica') {
      materials.push('Manipulativos, kits de experimentos, juegos educativos, materiales táctiles');
    }
    
    return materials.join(', ') || 'Materiales adaptados a necesidades específicas identificadas';
  }

  private createAdaptationPlan(student: any): string {
    const adaptations = [];
    
    if (student.teacherPerspective?.previousAdaptations) {
      adaptations.push(`Mantener adaptaciones exitosas: ${student.teacherPerspective.previousAdaptations}`);
    }
    
    if (student.teacherPerspective?.concentrationTime && student.teacherPerspective.concentrationTime < 25) {
      adaptations.push('Sesiones cortas de 15-20 minutos con descansos activos');
    }
    
    adaptations.push('Evaluación flexible con múltiples oportunidades');
    adaptations.push('Retroalimentación inmediata y positiva');
    adaptations.push('Ambiente estructurado y predecible');
    
    return adaptations.join('. ');
  }
}

const aiService = new AIAnalysisService();

export async function registerRoutes(app: Express): Promise<Server> {
  // Students routes
  app.get('/api/students', async (req, res) => {
    try {
      const students = await storage.getAllStudents();
      res.json(students);
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({ error: 'Failed to fetch students' });
    }
  });

  app.get('/api/students/:id', async (req, res) => {
    try {
      const student = await storage.getStudent(req.params.id);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      res.json(student);
    } catch (error) {
      console.error('Error fetching student:', error);
      res.status(500).json({ error: 'Failed to fetch student' });
    }
  });

  app.post('/api/students', async (req, res) => {
    try {
      const validatedData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(validatedData);
      
      // If teacher perspective is provided, create it
      if (req.body.teacherPerspective) {
        const perspectiveData = insertTeacherPerspectiveSchema.parse({
          ...req.body.teacherPerspective,
          studentId: student.id
        });
        await storage.createTeacherPerspective(perspectiveData);
      }
      
      res.status(201).json(student);
    } catch (error) {
      console.error('Error creating student:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to create student' });
      }
    }
  });

  app.put('/api/students/:id', async (req, res) => {
    try {
      const validatedData = insertStudentSchema.partial().parse(req.body);
      const student = await storage.updateStudent(req.params.id, validatedData);
      res.json(student);
    } catch (error) {
      console.error('Error updating student:', error);
      res.status(500).json({ error: 'Failed to update student' });
    }
  });

  app.delete('/api/students/:id', async (req, res) => {
    try {
      await storage.deleteStudent(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting student:', error);
      res.status(500).json({ error: 'Failed to delete student' });
    }
  });

  // Teacher perspectives routes
  app.get('/api/students/:studentId/perspective', async (req, res) => {
    try {
      const perspective = await storage.getTeacherPerspective(req.params.studentId);
      if (!perspective) {
        return res.status(404).json({ error: 'Teacher perspective not found' });
      }
      res.json(perspective);
    } catch (error) {
      console.error('Error fetching teacher perspective:', error);
      res.status(500).json({ error: 'Failed to fetch teacher perspective' });
    }
  });

  app.post('/api/students/:studentId/perspective', async (req, res) => {
    try {
      const validatedData = insertTeacherPerspectiveSchema.parse({
        ...req.body,
        studentId: req.params.studentId
      });
      const perspective = await storage.createTeacherPerspective(validatedData);
      res.status(201).json(perspective);
    } catch (error) {
      console.error('Error creating teacher perspective:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to create teacher perspective' });
      }
    }
  });

  // Evidence routes
  app.get('/api/evidence', async (req, res) => {
    try {
      const evidence = await storage.getAllEvidence();
      res.json(evidence);
    } catch (error) {
      console.error('Error fetching evidence:', error);
      res.status(500).json({ error: 'Failed to fetch evidence' });
    }
  });

  app.get('/api/students/:studentId/evidence', async (req, res) => {
    try {
      const evidence = await storage.getEvidenceByStudent(req.params.studentId);
      res.json(evidence);
    } catch (error) {
      console.error('Error fetching student evidence:', error);
      res.status(500).json({ error: 'Failed to fetch student evidence' });
    }
  });

  app.post('/api/students/:studentId/evidence', upload.single('file'), async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Determine evidence type based on file mimetype
      let evidenceType = 'texto';
      if (file.mimetype.startsWith('image/')) evidenceType = 'imagen';
      else if (file.mimetype.startsWith('video/')) evidenceType = 'video';
      else if (file.mimetype.startsWith('audio/')) evidenceType = 'audio';

      const evidenceData = insertEvidenceSchema.parse({
        ...req.body,
        studentId: req.params.studentId,
        fileName: file.originalname,
        filePath: file.path,
        evidenceType,
        completionDate: new Date(),
      });

      const evidence = await storage.createEvidence(evidenceData);
      res.status(201).json(evidence);
    } catch (error) {
      console.error('Error uploading evidence:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to upload evidence' });
      }
    }
  });

  // Analysis routes
  app.post('/api/evidence/:evidenceId/analyze', async (req, res) => {
    try {
      const evidence = await storage.getEvidence(req.params.evidenceId);
      if (!evidence) {
        return res.status(404).json({ error: 'Evidence not found' });
      }

      const student = await storage.getStudent(evidence.studentId);
      const teacherPerspective = student?.teacherPerspective;

      // Perform AI analysis
      const analysisData = await aiService.analyzeEvidence(evidence, teacherPerspective);
      
      const analysisResult = await storage.createAnalysisResult({
        evidenceId: evidence.id,
        ...analysisData
      });

      // Mark evidence as analyzed
      await storage.updateEvidence(evidence.id, { isAnalyzed: true });

      res.json(analysisResult);
    } catch (error) {
      console.error('Error analyzing evidence:', error);
      res.status(500).json({ error: 'Failed to analyze evidence' });
    }
  });

  // Learning profile routes
  app.get('/api/students/:studentId/profile', async (req, res) => {
    try {
      const profile = await storage.getLearningProfile(req.params.studentId);
      if (!profile) {
        return res.status(404).json({ error: 'Learning profile not found' });
      }
      res.json(profile);
    } catch (error) {
      console.error('Error fetching learning profile:', error);
      res.status(500).json({ error: 'Failed to fetch learning profile' });
    }
  });

  app.post('/api/students/:studentId/profile/generate', async (req, res) => {
    try {
      const profileData = await aiService.generateLearningProfile(req.params.studentId);
      const profile = await storage.createLearningProfile(profileData);
      res.json(profile);
    } catch (error) {
      console.error('Error generating learning profile:', error);
      res.status(500).json({ error: 'Failed to generate learning profile' });
    }
  });

  // Statistics route
  app.get('/api/stats', async (req, res) => {
    try {
      const students = await storage.getAllStudents();
      const allEvidence = await storage.getAllEvidence();
      
      const stats = {
        totalStudents: students.length,
        totalEvidence: allEvidence.length,
        analyzedEvidence: allEvidence.filter(e => e.isAnalyzed).length,
        profilesGenerated: students.filter(s => s.learningProfile).length,
        pendingReview: allEvidence.filter(e => !e.isAnalyzed).length,
        modalityBreakdown: calculateModalityBreakdown(students),
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  const httpServer = createServer(app);
  return httpServer;
}

function calculateModalityBreakdown(students: any[]) {
  const modalities = { Visual: 0, Auditiva: 0, Kinestésica: 0, 'Lecto-escritura': 0 };
  
  students.forEach(student => {
    const modality = student.teacherPerspective?.preferredModality;
    if (modality && modalities.hasOwnProperty(modality)) {
      modalities[modality as keyof typeof modalities]++;
    }
  });
  
  const total = Object.values(modalities).reduce((a, b) => a + b, 0);
  
  return Object.entries(modalities).map(([name, count]) => ({
    name,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0
  }));
}
