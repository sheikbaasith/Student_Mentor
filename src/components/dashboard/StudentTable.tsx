import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface Student {
  id: string;
  name: string;
  email: string;
  grade: number;
  attendance: number;
  prediction: "excelling" | "on-track" | "at-risk";
  confidence: number;
  subjects: {
    name: string;
    score: number;
  }[];
}

interface StudentTableProps {
  students: Student[];
}

const predictionStyles = {
  "excelling": "bg-success/10 text-success border-success/20 hover:bg-success/20",
  "on-track": "bg-accent/10 text-accent border-accent/20 hover:bg-accent/20",
  "at-risk": "bg-danger/10 text-danger border-danger/20 hover:bg-danger/20",
};

const predictionLabels = {
  "excelling": "Excelling",
  "on-track": "On Track",
  "at-risk": "At Risk",
};

export function StudentTable({ students }: StudentTableProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 85) return "text-success font-semibold";
    if (grade >= 70) return "text-accent font-semibold";
    if (grade >= 60) return "text-warning font-semibold";
    return "text-danger font-semibold";
  };

  return (
    <div className="rounded-xl border bg-card card-shadow overflow-hidden animate-slide-up">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">Student Performance Overview</h3>
        <p className="text-sm text-muted-foreground mt-1">
          AI-powered predictions for student outcomes
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Student</TableHead>
            <TableHead className="font-semibold">Current Grade</TableHead>
            <TableHead className="font-semibold">Attendance</TableHead>
            <TableHead className="font-semibold">AI Prediction</TableHead>
            <TableHead className="font-semibold">Confidence</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student, index) => (
            <TableRow
              key={student.id}
              className="hover:bg-muted/30 transition-colors cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-primary/10">
                    <AvatarFallback className="bg-primary/5 text-primary font-medium">
                      {getInitials(student.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className={getGradeColor(student.grade)}>{student.grade}%</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        student.attendance >= 90
                          ? "bg-success"
                          : student.attendance >= 75
                          ? "bg-accent"
                          : "bg-warning"
                      )}
                      style={{ width: `${student.attendance}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {student.attendance}%
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(
                    "font-medium transition-colors",
                    predictionStyles[student.prediction]
                  )}
                >
                  {predictionLabels[student.prediction]}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${student.confidence}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {student.confidence}%
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
