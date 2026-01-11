import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb,
  Target,
  BookOpen,
  Clock,
  Users,
  Award,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Student } from "@/hooks/useStudents";

interface StudentRecommendationsProps {
  student: Student;
}

interface Recommendation {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  icon: typeof Lightbulb;
  category: string;
}

function generateRecommendations(student: Student): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Attendance-based recommendations
  if (student.attendance < 75) {
    recommendations.push({
      title: "Improve Attendance",
      description:
        "Current attendance is below 75%. Regular attendance is strongly correlated with academic success. Consider setting up attendance reminders or discussing any barriers.",
      priority: "high",
      icon: Clock,
      category: "Attendance",
    });
  } else if (student.attendance < 85) {
    recommendations.push({
      title: "Maintain Consistent Attendance",
      description:
        "Attendance is good but has room for improvement. Aim for 90%+ attendance to maximize learning opportunities.",
      priority: "medium",
      icon: Clock,
      category: "Attendance",
    });
  }

  // Grade-based recommendations
  if (student.grade < 60) {
    recommendations.push({
      title: "Academic Support Needed",
      description:
        "Consider one-on-one tutoring or study groups. Focus on foundational concepts and schedule regular check-ins to track progress.",
      priority: "high",
      icon: BookOpen,
      category: "Academics",
    });
    recommendations.push({
      title: "Set Incremental Goals",
      description:
        "Break down improvement into smaller, achievable targets. Aim to improve by 5-10% each month with focused practice.",
      priority: "high",
      icon: Target,
      category: "Strategy",
    });
  } else if (student.grade < 75) {
    recommendations.push({
      title: "Strengthen Core Concepts",
      description:
        "Review fundamentals in challenging subjects. Practice problems and seek clarification on topics with lower scores.",
      priority: "medium",
      icon: BookOpen,
      category: "Academics",
    });
  } else if (student.grade >= 85) {
    recommendations.push({
      title: "Challenge with Advanced Work",
      description:
        "Consider advanced coursework or enrichment activities. Encourage participation in academic competitions or projects.",
      priority: "low",
      icon: Award,
      category: "Growth",
    });
  }

  // Internal vs External marks balance
  const totalMarks = student.internal_marks + student.external_marks;
  if (totalMarks > 0) {
    const internalRatio = student.internal_marks / totalMarks;
    if (internalRatio < 0.3 && student.external_marks > 0) {
      recommendations.push({
        title: "Improve Internal Assessment",
        description:
          "Internal marks are lower compared to external exams. Focus on class participation, assignments, and projects.",
        priority: "medium",
        icon: Users,
        category: "Assessment",
      });
    } else if (internalRatio > 0.7 && student.internal_marks > 0) {
      recommendations.push({
        title: "Prepare for External Exams",
        description:
          "Strong in internal assessments but needs exam preparation. Practice timed tests and past papers.",
        priority: "medium",
        icon: Target,
        category: "Assessment",
      });
    }
  }

  // Prediction-based recommendations
  if (student.prediction === "at-risk") {
    recommendations.push({
      title: "Early Intervention Required",
      description:
        "AI prediction indicates risk factors. Schedule a parent-teacher meeting to discuss support strategies and create an action plan.",
      priority: "high",
      icon: AlertCircle,
      category: "Intervention",
    });
  } else if (student.prediction === "excelling") {
    recommendations.push({
      title: "Maintain Excellence",
      description:
        "Continue current strategies. Consider leadership roles or peer tutoring opportunities to reinforce learning.",
      priority: "low",
      icon: Award,
      category: "Development",
    });
  }

  // General recommendation
  recommendations.push({
    title: "Regular Progress Reviews",
    description:
      "Schedule bi-weekly check-ins to monitor progress and adjust strategies as needed. Celebrate improvements to maintain motivation.",
    priority: "low",
    icon: Lightbulb,
    category: "General",
  });

  return recommendations.slice(0, 5); // Return max 5 recommendations
}

const priorityStyles = {
  high: "bg-danger/10 text-danger border-danger/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-success/10 text-success border-success/20",
};

export function StudentRecommendations({ student }: StudentRecommendationsProps) {
  const recommendations = generateRecommendations(student);

  return (
    <Card className="card-shadow animate-slide-up" style={{ animationDelay: "250ms" }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          AI-Powered Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec, index) => {
            const Icon = rec.icon;
            return (
              <div
                key={index}
                className="flex gap-4 p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div
                  className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                    rec.priority === "high"
                      ? "bg-danger/10"
                      : rec.priority === "medium"
                      ? "bg-warning/10"
                      : "bg-success/10"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      rec.priority === "high"
                        ? "text-danger"
                        : rec.priority === "medium"
                        ? "text-warning"
                        : "text-success"
                    )}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold">{rec.title}</h4>
                    <Badge variant="outline" className={cn("text-xs", priorityStyles[rec.priority])}>
                      {rec.priority} priority
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {rec.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
