import { Link, useLocation } from "wouter";
import { BrainCircuit, LayoutDashboard, Users, FileText, BarChart3, FileBarChart, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const [location] = useLocation();

  const navigation = [
    { name: "Panel Principal", href: "/", icon: LayoutDashboard, current: location === "/" || location === "/dashboard" },
    { name: "Estudiantes", href: "/students", icon: Users, current: location === "/students" },
    { name: "Evidencias", href: "/evidence", icon: FileText, current: location === "/evidence" },
    { name: "Análisis", href: "/analysis", icon: BarChart3, current: location === "/analysis" },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col shadow-sm" data-testid="sidebar">
      {/* Logo Section */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <BrainCircuit className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">FlexiEval</h1>
            <p className="text-sm text-muted-foreground">Evaluación Adaptativa</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                item.current
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent/10 hover:text-accent"
              }`}
              data-testid={`nav-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Icon className="w-5 h-5" />
              <span className={item.current ? "font-medium" : ""}>{item.name}</span>
            </Link>
          );
        })}
        
        <div className="pt-4 border-t border-border mt-4">
          <Link
            href="/settings"
            className="flex items-center space-x-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-accent/10 hover:text-accent transition-colors"
            data-testid="nav-link-settings"
          >
            <Settings className="w-5 h-5" />
            <span>Configuración</span>
          </Link>
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
            <span className="text-accent-foreground font-semibold">MG</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">María González</p>
            <p className="text-xs text-muted-foreground">Docente Primaria</p>
          </div>
          <Button variant="ghost" size="sm" className="p-1 hover:bg-muted" data-testid="button-logout">
            <LogOut className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
