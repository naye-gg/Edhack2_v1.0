import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, BrainCircuit, Clock, Upload, UserPlus, TrendingUp, AlertCircle } from "lucide-react";
import StatsCard from "@/components/stats-card";
import StudentCard from "@/components/student-card";
import EvidenceUpload from "@/components/evidence-upload";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";

export default function Dashboard() {
  const [showUploadForm, setShowUploadForm] = useState(false);

  const { data: stats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["/api/students"],
  });

  const { data: recentEvidence = [], isLoading: evidenceLoading } = useQuery({
    queryKey: ["/api/evidence"],
  });

  const recentStudents = students?.slice(0, 3) || [];
  const recentAnalysis = recentEvidence?.slice(0, 3) || [];

  return (
    <div className="p-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Estudiantes"
          value={stats?.totalStudents || 0}
          icon={Users}
          trend={`+${Math.floor(Math.random() * 5) + 1} este mes`}
          isLoading={statsLoading}
          data-testid="stats-total-students"
        />
        <StatsCard
          title="Evidencias Analizadas"
          value={stats?.analyzedEvidence || 0}
          icon={FileText}
          trend={`+${Math.floor(Math.random() * 10) + 5} esta semana`}
          isLoading={statsLoading}
          data-testid="stats-analyzed-evidence"
        />
        <StatsCard
          title="Perfiles Generados"
          value={stats?.profilesGenerated || 0}
          icon={BrainCircuit}
          trend={`${Math.floor((stats?.profilesGenerated / Math.max(stats?.totalStudents, 1)) * 100) || 0}% completado`}
          isLoading={statsLoading}
          data-testid="stats-profiles-generated"
        />
        <StatsCard
          title="Pendientes Revisión"
          value={stats?.pendingReview || 0}
          icon={Clock}
          trend="Requiere atención"
          isLoading={statsLoading}
          variant="warning"
          data-testid="stats-pending-review"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Students and Evidence Upload */}
        <div className="lg:col-span-2 space-y-6">
          {/* Students List */}
          <Card data-testid="card-recent-students">
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle>Estudiantes Recientes</CardTitle>
                <Button variant="ghost" size="sm" asChild data-testid="button-view-all-students">
                  <a href="/students">Ver todos</a>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {studentsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 border border-border rounded-lg">
                      <div className="w-12 h-12 bg-muted rounded-full animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                        <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentStudents.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay estudiantes registrados</p>
                  <Button variant="outline" className="mt-4" asChild data-testid="button-create-first-student">
                    <a href="/students">Crear primer estudiante</a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentStudents.map((student: any) => (
                    <StudentCard key={student.id} student={student} data-testid={`student-card-${student.id}`} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Evidence Upload Section */}
          {!showUploadForm ? (
            <Card data-testid="card-upload-prompt">
              <CardContent className="p-6 text-center">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Subir Nueva Evidencia</h3>
                <p className="text-muted-foreground mb-4">
                  Adjunta archivos de texto, imagen, video o audio para análisis
                </p>
                <Button onClick={() => setShowUploadForm(true)} data-testid="button-show-upload-form">
                  <Upload className="w-4 h-4 mr-2" />
                  Comenzar
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card data-testid="card-evidence-upload">
              <CardHeader>
                <CardTitle>Subir Nueva Evidencia</CardTitle>
              </CardHeader>
              <CardContent>
                <EvidenceUpload
                  onSuccess={() => setShowUploadForm(false)}
                  onCancel={() => setShowUploadForm(false)}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card data-testid="card-quick-actions">
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                asChild
                data-testid="button-new-student"
              >
                <a href="/students">
                  <UserPlus className="w-5 h-5 mr-3 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">Nuevo Estudiante</p>
                    <p className="text-xs text-muted-foreground">Crear perfil completo</p>
                  </div>
                </a>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                data-testid="button-generate-profile"
              >
                <BrainCircuit className="w-5 h-5 mr-3 text-accent" />
                <div className="text-left">
                  <p className="font-medium">Generar Perfil</p>
                  <p className="text-xs text-muted-foreground">Análisis completo IA</p>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                asChild
                data-testid="button-group-report"
              >
                <a href="/analysis">
                  <FileText className="w-5 h-5 mr-3 text-chart-1" />
                  <div className="text-left">
                    <p className="font-medium">Reporte Grupal</p>
                    <p className="text-xs text-muted-foreground">Comparativa de clase</p>
                  </div>
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Analysis */}
          <Card data-testid="card-recent-analysis">
            <CardHeader>
              <CardTitle>Análisis Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {evidenceLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-muted rounded-full mt-2 animate-pulse" />
                      <div className="flex-1 space-y-1">
                        <div className="h-3 bg-muted rounded animate-pulse" />
                        <div className="h-2 bg-muted rounded w-3/4 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentAnalysis.length === 0 ? (
                <div className="text-center py-4">
                  <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No hay análisis recientes</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentAnalysis.map((evidence: any, index: number) => (
                    <div key={evidence.id} className="flex items-start space-x-3" data-testid={`analysis-item-${index}`}>
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        evidence.isAnalyzed ? 'bg-accent' : 'bg-chart-4'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {evidence.student?.name || 'Estudiante'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {evidence.taskTitle} - {evidence.isAnalyzed ? 'Completado' : 'En proceso'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(evidence.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {evidence.analysisResult?.adaptedScore ? (
                          <p className="text-sm font-bold text-accent" data-testid={`score-${index}`}>
                            {parseFloat(evidence.analysisResult.adaptedScore).toFixed(1)}
                          </p>
                        ) : (
                          <p className="text-xs text-chart-4">Procesando...</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Overview */}
          <Card data-testid="card-performance-overview">
            <CardHeader>
              <CardTitle>Rendimiento por Modalidad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.modalityBreakdown?.map((modality: any, index: number) => (
                  <div key={modality.name} data-testid={`modality-${index}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-primary' :
                          index === 1 ? 'bg-accent' :
                          index === 2 ? 'bg-chart-1' : 'bg-chart-3'
                        }`} />
                        <span className="text-sm text-foreground">{modality.name}</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {modality.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mt-1">
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
                )) || [
                  { name: 'Visual', percentage: 35 },
                  { name: 'Auditivo', percentage: 28 },
                  { name: 'Kinestésico', percentage: 22 },
                  { name: 'Lecto-escritura', percentage: 15 }
                ].map((modality, index) => (
                  <div key={modality.name} data-testid={`modality-default-${index}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-primary' :
                          index === 1 ? 'bg-accent' :
                          index === 2 ? 'bg-chart-1' : 'bg-chart-3'
                        }`} />
                        <span className="text-sm text-foreground">{modality.name}</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {modality.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mt-1">
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
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
