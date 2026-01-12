import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useStudents } from "@/hooks/useStudents";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Brain, AlertTriangle, TrendingUp, CheckCircle, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const predictionStyles = {
  excelling: "bg-success/10 text-success border-success/20",
  "on-track": "bg-accent/10 text-accent border-accent/20",
  "at-risk": "bg-danger/10 text-danger border-danger/20",
};

const predictionIcons = {
  excelling: CheckCircle,
  "on-track": TrendingUp,
  "at-risk": AlertTriangle,
};

export default function Predictions() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { students, isLoading } = useStudents();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const atRiskStudents = students.filter((s) => s.prediction === "at-risk");
  const excellingStudents = students.filter((s) => s.prediction === "excelling");
  const onTrackStudents = students.filter((s) => s.prediction === "on-track");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                <Brain className="h-8 w-8 text-primary" />
                AI Predictions
              </h1>
              <p className="text-muted-foreground">
                Machine learning-based performance predictions for all students
              </p>
            </div>

            {/* At-Risk Section */}
            <Card className="card-shadow border-danger/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-danger">
                  <AlertTriangle className="h-5 w-5" />
                  At-Risk Students ({atRiskStudents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {atRiskStudents.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {atRiskStudents.map((student) => {
                      const Icon = predictionIcons[student.prediction];
                      return (
                        <Card key={student.id} className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10 border-2 border-danger/20">
                              <AvatarFallback className="bg-danger/10 text-danger">
                                {getInitials(student.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{student.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Grade: {student.grade}% | Attendance: {student.attendance}%
                              </p>
                              <div className="mt-2 flex items-center gap-2">
                                <Progress value={student.confidence} className="h-2 flex-1" />
                                <span className="text-xs text-muted-foreground">
                                  {student.confidence}%
                                </span>
                              </div>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => navigate(`/student/${student.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No at-risk students. Great job!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Excelling Section */}
            <Card className="card-shadow border-success/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success">
                  <CheckCircle className="h-5 w-5" />
                  Excelling Students ({excellingStudents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {excellingStudents.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {excellingStudents.map((student) => (
                      <Card key={student.id} className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 border-2 border-success/20">
                            <AvatarFallback className="bg-success/10 text-success">
                              {getInitials(student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{student.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Grade: {student.grade}% | Attendance: {student.attendance}%
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              <Progress value={student.confidence} className="h-2 flex-1" />
                              <span className="text-xs text-muted-foreground">
                                {student.confidence}%
                              </span>
                            </div>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => navigate(`/student/${student.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No excelling students yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* On Track Section */}
            <Card className="card-shadow border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent">
                  <TrendingUp className="h-5 w-5" />
                  On Track Students ({onTrackStudents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {onTrackStudents.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {onTrackStudents.map((student) => (
                      <Card key={student.id} className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 border-2 border-accent/20">
                            <AvatarFallback className="bg-accent/10 text-accent">
                              {getInitials(student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{student.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Grade: {student.grade}% | Attendance: {student.attendance}%
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              <Progress value={student.confidence} className="h-2 flex-1" />
                              <span className="text-xs text-muted-foreground">
                                {student.confidence}%
                              </span>
                            </div>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => navigate(`/student/${student.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No on-track students
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
