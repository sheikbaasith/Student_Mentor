import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Eye,
  Loader2,
  GraduationCap,
  BarChart3,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Course } from "@/hooks/useCourses";
import { Student } from "@/hooks/useStudents";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  upcoming: "bg-accent/10 text-accent border-accent/20",
  completed: "bg-muted text-muted-foreground",
  archived: "bg-muted/50 text-muted-foreground",
};

const predictionStyles = {
  excelling: "bg-success/10 text-success border-success/20",
  "on-track": "bg-accent/10 text-accent border-accent/20",
  "at-risk": "bg-danger/10 text-danger border-danger/20",
};

const predictionLabels = {
  excelling: "Excelling",
  "on-track": "On Track",
  "at-risk": "At Risk",
};

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course", id],
    queryFn: async () => {
      if (!user || !id) return null;
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .eq("teacher_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Course | null;
    },
    enabled: !!user && !!id,
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["course-students", id],
    queryFn: async () => {
      if (!user || !id) return [];
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("course_id", id)
        .eq("teacher_id", user.id)
        .order("name");

      if (error) throw error;
      return data as Student[];
    },
    enabled: !!user && !!id,
  });

  const isLoading = authLoading || courseLoading || studentsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-8 flex items-center justify-center">
            <Card className="max-w-md w-full text-center p-8">
              <CardContent>
                <p className="text-lg font-medium">Course not found</p>
                <p className="text-muted-foreground mt-2">
                  The course you're looking for doesn't exist or you don't have access.
                </p>
                <Button onClick={() => navigate("/courses")} className="mt-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Courses
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  // Calculate analytics
  const avgGrade = students.length > 0
    ? Math.round(students.reduce((acc, s) => acc + s.grade, 0) / students.length)
    : 0;

  const avgAttendance = students.length > 0
    ? Math.round(students.reduce((acc, s) => acc + s.attendance, 0) / students.length)
    : 0;

  const predictionCounts = {
    excelling: students.filter((s) => s.prediction === "excelling").length,
    "on-track": students.filter((s) => s.prediction === "on-track").length,
    "at-risk": students.filter((s) => s.prediction === "at-risk").length,
  };

  const pieData = [
    { name: "Excelling", value: predictionCounts.excelling, color: "hsl(var(--success))" },
    { name: "On Track", value: predictionCounts["on-track"], color: "hsl(var(--accent))" },
    { name: "At Risk", value: predictionCounts["at-risk"], color: "hsl(var(--danger))" },
  ].filter((d) => d.value > 0);

  const gradeDistribution = [
    { range: "90-100", count: students.filter((s) => s.grade >= 90).length },
    { range: "80-89", count: students.filter((s) => s.grade >= 80 && s.grade < 90).length },
    { range: "70-79", count: students.filter((s) => s.grade >= 70 && s.grade < 80).length },
    { range: "60-69", count: students.filter((s) => s.grade >= 60 && s.grade < 70).length },
    { range: "Below 60", count: students.filter((s) => s.grade < 60).length },
  ];

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const getGradeColor = (grade: number) => {
    if (grade >= 85) return "text-success font-semibold";
    if (grade >= 70) return "text-accent font-semibold";
    if (grade >= 60) return "text-warning font-semibold";
    return "text-danger font-semibold";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => navigate("/courses")}
              className="mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>

            {/* Course Header */}
            <Card className="card-shadow animate-slide-up">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-bold">{course.name}</h1>
                      <Badge
                        variant="outline"
                        className={cn("capitalize", statusStyles[course.status])}
                      >
                        {course.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{course.code}</p>
                    {course.description && (
                      <p className="text-sm text-muted-foreground max-w-2xl">
                        {course.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-5 w-5" />
                      <span className="font-medium text-foreground">
                        {students.length}/{course.max_students}
                      </span>
                      <span>Students</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-5 w-5" />
                      <span>{course.duration}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="card-shadow animate-slide-up" style={{ animationDelay: "50ms" }}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Enrolled</p>
                      <p className="text-2xl font-bold">{students.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-shadow animate-slide-up" style={{ animationDelay: "100ms" }}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-accent/10">
                      <GraduationCap className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Grade</p>
                      <p className="text-2xl font-bold">{avgGrade}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-shadow animate-slide-up" style={{ animationDelay: "150ms" }}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-success/10">
                      <Target className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Attendance</p>
                      <p className="text-2xl font-bold">{avgAttendance}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-shadow animate-slide-up" style={{ animationDelay: "200ms" }}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-danger/10">
                      <AlertTriangle className="h-6 w-6 text-danger" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">At Risk</p>
                      <p className="text-2xl font-bold">{predictionCounts["at-risk"]}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Prediction Distribution */}
              <Card className="card-shadow animate-slide-up" style={{ animationDelay: "250ms" }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Student Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {students.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      No students enrolled yet
                    </div>
                  )}
                  <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Excelling ({predictionCounts.excelling})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-accent" />
                      <span className="text-sm">On Track ({predictionCounts["on-track"]})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-danger" />
                      <span className="text-sm">At Risk ({predictionCounts["at-risk"]})</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Grade Distribution */}
              <Card className="card-shadow animate-slide-up" style={{ animationDelay: "300ms" }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    Grade Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {students.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={gradeDistribution}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="range" className="text-xs" />
                          <YAxis allowDecimals={false} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar
                            dataKey="count"
                            fill="hsl(var(--primary))"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      No students enrolled yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Students Table */}
            <Card className="card-shadow animate-slide-up" style={{ animationDelay: "350ms" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Enrolled Students ({students.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {students.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Student</TableHead>
                        <TableHead className="font-semibold">Roll No</TableHead>
                        <TableHead className="font-semibold">Grade</TableHead>
                        <TableHead className="font-semibold">Attendance</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id} className="hover:bg-muted/30">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border-2 border-primary/10">
                                <AvatarFallback className="bg-primary/5 text-primary font-medium">
                                  {getInitials(student.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{student.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {student.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium">
                              {student.roll_no || "N/A"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <span className={getGradeColor(student.grade)}>
                                {student.grade}%
                              </span>
                              <Progress value={student.grade} className="h-1.5 w-20" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <span className="text-sm font-medium">
                                {student.attendance}%
                              </span>
                              <Progress value={student.attendance} className="h-1.5 w-20" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "font-medium",
                                predictionStyles[student.prediction as keyof typeof predictionStyles]
                              )}
                            >
                              {predictionLabels[student.prediction as keyof typeof predictionLabels]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/student/${student.id}`)}
                              className="text-muted-foreground hover:text-primary"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium">No students enrolled</p>
                    <p className="text-muted-foreground mt-1">
                      Assign students to this course from the Students page
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
