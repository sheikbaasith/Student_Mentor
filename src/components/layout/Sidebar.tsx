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
import { NavLink } from "react-router-dom";

interface SidebarProps {
  className?: string;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Students", path: "/students" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: Brain, label: "AI Predictions", path: "/predictions" },
  { icon: GraduationCap, label: "Courses", path: "/courses" },
  { icon: FileText, label: "Reports", path: "/reports" },
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
          <NavLink
            key={item.label}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 h-11 px-3 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 h-11 px-3 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )
          }
        >
          <Settings className="h-5 w-5" />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}
