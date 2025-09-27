import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Edit, BrainCircuit, MessageCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import StudentChat from "./student-chat";
import { useState } from "react";

interface StudentCardProps {
  student: any;
  showActions?: boolean;
  className?: string;
}

export default function StudentCard({ student, showActions = false, className = "" }: StudentCardProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getAvatarColor = (id: string) => {
    const colors = [
      'bg-accent',
      'bg-chart-1', 
      'bg-chart-3',
      'bg-primary',
      'bg-chart-2'
    ];
    const index = id.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getSpecialNeedsBadgeColor = (need: string) => {
    const lowerNeed = need.toLowerCase();
    if (lowerNeed.includes('autismo') || lowerNeed.includes('tea')) {
      return 'bg-primary/10 text-primary';
    }
    if (lowerNeed.includes('tdah')) {
      return 'bg-chart-2/10 text-chart-2';
    }
    if (lowerNeed.includes('dislexia')) {
      return 'bg-chart-5/10 text-chart-5';
    }
    return 'bg-muted text-muted-foreground';
  };

  const getModalityColor = (modality: string) => {
    switch (modality?.toLowerCase()) {
      case 'visual':
        return 'bg-accent/10 text-accent';
      case 'auditiva':
      case 'auditivo':
        return 'bg-chart-4/10 text-chart-4';
      case 'kinestésica':
      case 'kinestésico':
        return 'bg-chart-1/10 text-chart-1';
      case 'lecto-escritura':
      case 'lectora':
        return 'bg-chart-3/10 text-chart-3';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const calculateAverageScore = () => {
    const analyzedEvidence = student.evidence?.filter((e: any) => e.analysisResult?.adaptedScore) || [];
    if (analyzedEvidence.length === 0) return null;
    
    const total = analyzedEvidence.reduce((sum: number, e: any) => 
      sum + parseFloat(e.analysisResult.adaptedScore), 0
    );
    return (total / analyzedEvidence.length).toFixed(1);
  };

  const averageScore = calculateAverageScore();
  const evidenceCount = student.evidence?.length || 0;

  return (
    <div className={`flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors ${className}`}>
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 ${getAvatarColor(student.id)} rounded-full flex items-center justify-center`}>
          <span className="text-white font-semibold text-sm">
            {getInitials(student.name)}
          </span>
        </div>
        
        <div>
          <h4 className="font-medium text-foreground" data-testid={`student-name-${student.id}`}>
            {student.name}
          </h4>
          <p className="text-sm text-muted-foreground">
            {student.grade} • {student.mainSubjects}
          </p>
          
          <div className="flex items-center space-x-2 mt-1">
            {student.specialNeeds && (
              <Badge 
                className={`text-xs ${getSpecialNeedsBadgeColor(student.specialNeeds)}`}
                data-testid={`special-needs-badge-${student.id}`}
              >
                {student.specialNeeds.split(' ')[0]}
              </Badge>
            )}
            
            {student.teacherPerspective?.preferredModality && (
              <Badge 
                className={`text-xs ${getModalityColor(student.teacherPerspective.preferredModality)}`}
                data-testid={`modality-badge-${student.id}`}
              >
                {student.teacherPerspective.preferredModality}
              </Badge>
            )}
            
            {student.learningProfile && (
              <Badge variant="secondary" className="text-xs" data-testid={`profile-badge-${student.id}`}>
                <BrainCircuit className="w-3 h-3 mr-1" />
                Perfil IA
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="text-center">
          {averageScore ? (
            <>
              <p className="text-sm font-medium text-foreground" data-testid={`average-score-${student.id}`}>
                {averageScore}
              </p>
              <p className="text-xs text-muted-foreground">Promedio</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-muted-foreground">-</p>
              <p className="text-xs text-muted-foreground">Sin datos</p>
            </>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {evidenceCount} evidencia{evidenceCount !== 1 ? 's' : ''}
          </p>
        </div>

        {showActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2"
                data-testid={`student-actions-${student.id}`}
              >
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => setIsChatOpen(true)}
                data-testid={`button-chat-student-${student.id}`}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat con IA
              </DropdownMenuItem>
              <DropdownMenuItem data-testid={`button-view-student-${student.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                Ver perfil completo
              </DropdownMenuItem>
              <DropdownMenuItem data-testid={`button-edit-student-${student.id}`}>
                <Edit className="w-4 h-4 mr-2" />
                Editar información
              </DropdownMenuItem>
              <DropdownMenuItem data-testid={`button-generate-profile-${student.id}`}>
                <BrainCircuit className="w-4 h-4 mr-2" />
                Generar perfil IA
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Chat Dialog */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="max-w-4xl w-full h-[80vh] max-h-[600px] p-0">
          <StudentChat 
            student={student} 
            onClose={() => setIsChatOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
