import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, FileBarChart, Users, BrainCircuit, Download } from "lucide-react";

export default function Analysis() {
  const { data: students = [] as any[], isLoading: studentsLoading } = useQuery({
    queryKey: ["/api/students"],
  });

  const { data: evidence = [] as any[], isLoading: evidenceLoading } = useQuery({
    queryKey: ["/api/evidence"],
  });

  const { data: stats = {} as any, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  const analyzedEvidence = evidence.filter((item: any) => item.isAnalyzed);
  const studentsWithProfiles = students.filter((student: any) => student.learningProfile);

  const getAverageScore = (studentEvidence: any[]) => {
    const scores = studentEvidence
      .filter(e => e.analysisResult?.adaptedScore)
      .map(e => parseFloat(e.analysisResult.adaptedScore));
    return scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 'N/A';
  };

  const getCompetencyDistribution = () => {
    const distribution = { 'Avanzado': 0, 'Competente': 0, 'En desarrollo': 0, 'Iniciando': 0 };
    analyzedEvidence.forEach((item: any) => {
      const level = item.analysisResult?.competencyLevel;
      if (level && distribution.hasOwnProperty(level)) {
        distribution[level as keyof typeof distribution]++;
      }
    });
    return distribution;
  };

  const competencyDist = getCompetencyDistribution();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Análisis y Reportes</h2>
          <p className="text-muted-foreground">
            Visualiza el progreso y rendimiento de tus estudiantes
          </p>
        </div>
        <Button variant="outline" data-testid="button-export-report">
          <Download className="w-4 h-4 mr-2" />
          Exportar Reporte
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card data-testid="card-total-analysis">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Análisis Totales</p>
                <p className="text-2xl font-bold text-foreground">
                  {statsLoading ? '...' : analyzedEvidence.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-avg-performance">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Promedio General</p>
                <p className="text-2xl font-bold text-foreground">
                  {analyzedEvidence.length > 0 ? (
                    (analyzedEvidence.reduce((sum: number, item: any) => 
                      sum + parseFloat(item.analysisResult?.adaptedScore || 0), 0
                    ) / analyzedEvidence.length).toFixed(1)
                  ) : 'N/A'}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-profiles-generated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Perfiles Generados</p>
                <p className="text-2xl font-bold text-foreground">
                  {studentsLoading ? '...' : studentsWithProfiles.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-chart-1/10 rounded-lg flex items-center justify-center">
                <BrainCircuit className="w-6 h-6 text-chart-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-completion-rate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasa de Completitud</p>
                <p className="text-2xl font-bold text-foreground">
                  {students.length > 0 ? 
                    Math.round((studentsWithProfiles.length / students.length) * 100) : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center">
                <FileBarChart className="w-6 h-6 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Performance Overview */}
        <Card data-testid="card-student-performance">
          <CardHeader>
            <CardTitle>Rendimiento por Estudiante</CardTitle>
          </CardHeader>
          <CardContent>
            {studentsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4 p-3 border border-border rounded">
                    <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                    </div>
                    <div className="h-6 bg-muted rounded w-12 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay datos de estudiantes disponibles</p>
              </div>
            ) : (
              <div className="space-y-3">
                {students.map((student: any) => {
                  const studentEvidence = evidence.filter((e: any) => e.studentId === student.id && e.isAnalyzed);
                  const avgScore = getAverageScore(studentEvidence);
                  
                  return (
                    <div key={student.id} className="flex items-center justify-between p-3 border border-border rounded hover:bg-muted/50 transition-colors" data-testid={`student-performance-${student.id}`}>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground font-semibold text-sm">
                            {student.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{student.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {student.grade} • {studentEvidence.length} evidencias
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground" data-testid={`avg-score-${student.id}`}>
                          {avgScore}
                        </p>
                        {student.learningProfile && (
                          <Badge variant="secondary" className="text-xs">
                            Perfil generado
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Competency Level Distribution */}
        <Card data-testid="card-competency-distribution">
          <CardHeader>
            <CardTitle>Distribución de Niveles de Competencia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(competencyDist).map(([level, count], index) => {
                const percentage = analyzedEvidence.length > 0 ? (count / analyzedEvidence.length) * 100 : 0;
                const colors = ['bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-red-500'];
                
                return (
                  <div key={level} data-testid={`competency-level-${index}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{level}</span>
                      <span className="text-sm text-muted-foreground">
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${colors[index]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Learning Modalities Analysis */}
        <Card data-testid="card-modality-analysis">
          <CardHeader>
            <CardTitle>Análisis por Modalidades de Aprendizaje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.modalityBreakdown?.map((modality: any, index: number) => (
                <div key={modality.name} data-testid={`modality-analysis-${index}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-primary' :
                        index === 1 ? 'bg-accent' :
                        index === 2 ? 'bg-chart-1' : 'bg-chart-3'
                      }`} />
                      <span className="text-sm font-medium text-foreground">{modality.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {modality.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        index === 0 ? 'bg-primary' :
                        index === 1 ? 'bg-accent' :
                        index === 2 ? 'bg-chart-1' : 'bg-chart-3'
                      }`}
                      style={{ width: `${modality.percentage}%` }}
                    />
                  </div>
                </div>
              )) || (
                <p className="text-muted-foreground text-center py-4">
                  No hay datos suficientes para el análisis de modalidades
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Analysis Results */}
        <Card data-testid="card-recent-analysis-results">
          <CardHeader>
            <CardTitle>Resultados de Análisis Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {evidenceLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 border border-border rounded">
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : analyzedEvidence.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay análisis completados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {analyzedEvidence.slice(0, 5).map((item: any) => (
                  <div key={item.id} className="p-3 border border-border rounded hover:bg-muted/50 transition-colors" data-testid={`recent-analysis-${item.id}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {item.taskTitle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.student?.name} • {item.subject}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-accent">
                          {parseFloat(item.analysisResult?.adaptedScore || 0).toFixed(1)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.analysisResult?.competencyLevel}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
