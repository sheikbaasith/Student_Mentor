import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Brain,
  Settings,
  FileText,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  className?: string;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Users, label: "Students", active: false },
  { icon: BarChart3, label: "Analytics", active: false },
  { icon: Brain, label: "AI Predictions", active: false },
  { icon: GraduationCap, label: "Courses", active: false },
  { icon: FileText, label: "Reports", active: false },
];

export function Sidebar({ className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col w-64 border-r bg-card h-[calc(100vh-4rem)] sticky top-16",
        className
      )}
    >
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Button
            key={item.label}
            variant={item.active ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-3 h-11",
              item.active && "bg-primary/10 text-primary hover:bg-primary/15"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Button>
        ))}
      </nav>

      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start gap-3 h-11">
          <Settings className="h-5 w-5" />
          Settings
        </Button>
      </div>
    </aside>
  );
}
