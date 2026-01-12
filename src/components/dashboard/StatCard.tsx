import { ReactNode, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  variant?: "default" | "primary" | "accent" | "success" | "warning" | "danger";
  className?: string;
}

const variantStyles = {
  default: "bg-card",
  primary: "gradient-primary text-primary-foreground",
  accent: "gradient-accent text-accent-foreground",
  success: "gradient-success text-success-foreground",
  warning: "gradient-warning text-warning-foreground",
  danger: "gradient-danger text-danger-foreground",
};

const iconContainerStyles = {
  default: "bg-primary/10 text-primary",
  primary: "bg-white/20 text-white",
  accent: "bg-white/20 text-white",
  success: "bg-white/20 text-white",
  warning: "bg-white/20 text-white",
  danger: "bg-white/20 text-white",
};

export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ title, value, subtitle, icon, trend, variant = "default", className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl p-6 card-shadow card-hover animate-fade-in",
          variantStyles[variant],
          className
        )}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p
              className={cn(
                "text-sm font-medium",
                variant === "default" ? "text-muted-foreground" : "text-white/80"
              )}
            >
              {title}
            </p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p
                className={cn(
                  "text-sm",
                  variant === "default" ? "text-muted-foreground" : "text-white/70"
                )}
              >
                {subtitle}
              </p>
            )}
            {trend && (
              <div className="flex items-center gap-1 text-sm">
                <span
                  className={cn(
                    "font-medium",
                    trend.positive
                      ? variant === "default"
                        ? "text-success"
                        : "text-white"
                      : variant === "default"
                      ? "text-danger"
                      : "text-white"
                  )}
                >
                  {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%
                </span>
                <span
                  className={cn(
                    variant === "default" ? "text-muted-foreground" : "text-white/70"
                  )}
                >
                  vs last month
                </span>
              </div>
            )}
          </div>
          <div
            className={cn(
              "p-3 rounded-lg",
              iconContainerStyles[variant]
            )}
          >
            {icon}
          </div>
        </div>
      </div>
    );
  }
);

StatCard.displayName = "StatCard";
