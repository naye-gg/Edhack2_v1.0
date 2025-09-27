import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Play, Eye, BrainCircuit, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EvidenceUpload from "@/components/evidence-upload";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Evidence() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const { toast } = useToast();

  const { data: evidence = [] as any[], isLoading } = useQuery({
    queryKey: ["/api/evidence"],
  });

  const analyzeEvidenceMutation = useMutation({
    mutationFn: async (evidenceId: string) => {
      const response = await apiRequest("POST", `/api/evidence/${evidenceId}/analyze`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evidence"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Análisis completado",
        description: "La evidencia ha sido analizada exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error en análisis",
        description: "No se pudo analizar la evidencia. Intenta de nuevo.",
        variant: "destructive",
      });
    },
  });

  const filteredEvidence = evidence.filter((item: any) => {
    if (filterType !== "all" && item.evidenceType !== filterType) return false;
    if (filterStatus !== "all") {
      if (filterStatus === "analyzed" && !item.isAnalyzed) return false;
      if (filterStatus === "pending" && item.isAnalyzed) return false;
    }
    return true;
  });

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'imagen': return '🖼️';
      case 'video': return '🎥';
      case 'audio': return '🎵';
      default: return '📄';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'imagen': return 'bg-blue-100 text-blue-800';
      case 'video': return 'bg-green-100 text-green-800';
      case 'audio': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestión de Evidencias</h2>
          <p className="text-muted-foreground">
            Administra y analiza las evidencias de aprendizaje de tus estudiantes
          </p>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-upload-evidence">
              <Upload className="w-4 h-4 mr-2" />
              Subir Evidencia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" data-testid="dialog-upload-evidence">
            <DialogHeader>
              <DialogTitle>Subir Nueva Evidencia</DialogTitle>
            </DialogHeader>
            <EvidenceUpload
              onSuccess={() => setIsUploadOpen(false)}
              onCancel={() => setIsUploadOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="mb-6" data-testid="card-evidence-filters">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-foreground mb-2">Tipo de Evidencia</label>
              <Select value={filterType} onValueChange={setFilterType} data-testid="select-filter-type">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="imagen">Imagen</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="texto">Texto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-foreground mb-2">Estado de Análisis</label>
              <Select value={filterStatus} onValueChange={setFilterStatus} data-testid="select-filter-status">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="analyzed">Analizados</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evidence List */}
      <Card data-testid="card-evidence-list">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Evidencias ({filteredEvidence.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border border-border rounded-lg">
                  <div className="w-12 h-12 bg-muted rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
                    <div className="flex space-x-2">
                      <div className="h-5 bg-muted rounded w-16 animate-pulse" />
                      <div className="h-5 bg-muted rounded w-20 animate-pulse" />
                    </div>
                  </div>
                  <div className="h-8 bg-muted rounded w-24 animate-pulse" />
                </div>
              ))}
            </div>
          ) : filteredEvidence.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {evidence.length === 0 ? "No hay evidencias registradas" : "No se encontraron evidencias"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {evidence.length === 0 
                  ? "Comienza subiendo la primera evidencia de aprendizaje"
                  : "No hay evidencias que coincidan con los filtros seleccionados"
                }
              </p>
              {evidence.length === 0 && (
                <Button onClick={() => setIsUploadOpen(true)} data-testid="button-upload-first-evidence">
                  <Upload className="w-4 h-4 mr-2" />
                  Subir primera evidencia
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvidence.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  data-testid={`evidence-item-${item.id}`}
                >
                  <div className="w-12 h-12 bg-muted/50 rounded-lg flex items-center justify-center text-2xl">
                    {getEvidenceIcon(item.evidenceType)}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground" data-testid={`evidence-title-${item.id}`}>
                      {item.taskTitle}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {item.student?.name} • {item.subject}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={getTypeColor(item.evidenceType)} data-testid={`evidence-type-${item.id}`}>
                        {item.evidenceType}
                      </Badge>
                      <Badge variant={item.isAnalyzed ? "default" : "secondary"} data-testid={`evidence-status-${item.id}`}>
                        {item.isAnalyzed ? "Analizado" : "Pendiente"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    {item.analysisResult?.adaptedScore && (
                      <div className="mb-2">
                        <p className="text-lg font-bold text-accent" data-testid={`evidence-score-${item.id}`}>
                          {parseFloat(item.analysisResult.adaptedScore).toFixed(1)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.analysisResult.competencyLevel}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      {!item.isAnalyzed ? (
                        <Button
                          size="sm"
                          onClick={() => analyzeEvidenceMutation.mutate(item.id)}
                          disabled={analyzeEvidenceMutation.isPending}
                          data-testid={`button-analyze-${item.id}`}
                        >
                          <BrainCircuit className="w-4 h-4 mr-1" />
                          {analyzeEvidenceMutation.isPending ? "Analizando..." : "Analizar"}
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" data-testid={`button-view-analysis-${item.id}`}>
                          <Eye className="w-4 h-4 mr-1" />
                          Ver Análisis
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
