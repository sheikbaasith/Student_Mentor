import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
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
  Download,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Course } from "@/hooks/useCourses";
import { Student } from "@/hooks/useStudents";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
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
  upcoming: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-muted text-muted-foreground",
  archived: "bg-muted/50 text-muted-foreground",
};

const predictionStyles = {
  excelling: "bg-success/10 text-success border-success/20",
  "on-track": "bg-primary/10 text-primary border-primary/20",
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
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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

  // Export students to CSV
  const handleExportCSV = () => {
    if (students.length === 0) {
      toast({
        title: "No Data",
        description: "No students enrolled in this course to export.",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      "Name",
      "Email",
      "Roll No",
      "Grade",
      "Attendance",
      "Internal Marks",
      "External Marks",
      "Total Marks",
      "Prediction",
      "Confidence",
    ];
    const csvContent = [
      headers.join(","),
      ...students.map((s) =>
        [
          `"${s.name}"`,
          s.email,
          s.roll_no || "",
          s.grade,
          s.attendance,
          s.internal_marks,
          s.external_marks,
          (s.internal_marks || 0) + (s.external_marks || 0),
          s.prediction,
          s.confidence,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${course?.code || "course"}_students_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "CSV Exported",
      description: `Exported ${students.length} student records.`,
    });
  };

  // Generate PDF report
  const handleExportPDF = async () => {
    if (!reportRef.current) return;

    setIsGeneratingPDF(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${course?.code || "course"}_report_${new Date().toISOString().split("T")[0]}.pdf`);

      toast({
        title: "Report Generated",
        description: "Course report has been downloaded as PDF.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF report.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
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
                <div className="flex flex-col gap-6">
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
                  {/* Export Buttons */}
                  <div className="flex flex-wrap gap-3 pt-2 border-t">
                    <Button
                      variant="outline"
                      onClick={handleExportCSV}
                      disabled={students.length === 0}
                    >
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleExportPDF}
                      disabled={isGeneratingPDF || students.length === 0}
                    >
                      {isGeneratingPDF ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <FileText className="mr-2 h-4 w-4" />
                      )}
                      Export PDF Report
                    </Button>
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

            {/* Hidden Printable Report Section */}
            <div
              ref={reportRef}
              className="absolute -left-[9999px] bg-white p-8 w-[210mm] space-y-6"
              aria-hidden="true"
            >
              {/* Report Header */}
              <div className="text-center border-b pb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {course.name} - Course Report
                </h2>
                <p className="text-gray-600 mt-1">{course.code}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Generated on{" "}
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* Course Summary */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-100">
                  <Users className="h-6 w-6 mx-auto text-blue-600 mb-2" />
                  <p className="text-2xl font-bold text-blue-700">{students.length}</p>
                  <p className="text-sm text-blue-600">Enrolled</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-purple-50 border border-purple-100">
                  <GraduationCap className="h-6 w-6 mx-auto text-purple-600 mb-2" />
                  <p className="text-2xl font-bold text-purple-700">{avgGrade}%</p>
                  <p className="text-sm text-purple-600">Avg Grade</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-50 border border-green-100">
                  <Target className="h-6 w-6 mx-auto text-green-600 mb-2" />
                  <p className="text-2xl font-bold text-green-700">{avgAttendance}%</p>
                  <p className="text-sm text-green-600">Attendance</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-red-50 border border-red-100">
                  <AlertTriangle className="h-6 w-6 mx-auto text-red-600 mb-2" />
                  <p className="text-2xl font-bold text-red-700">{predictionCounts["at-risk"]}</p>
                  <p className="text-sm text-red-600">At Risk</p>
                </div>
              </div>

              {/* Student Status Distribution */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Status Distribution</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-green-50 border border-green-100">
                    <CheckCircle className="h-5 w-5 mx-auto text-green-600 mb-2" />
                    <p className="text-xl font-bold text-green-700">{predictionCounts.excelling}</p>
                    <p className="text-sm text-green-600">Excelling</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-yellow-50 border border-yellow-100">
                    <TrendingUp className="h-5 w-5 mx-auto text-yellow-600 mb-2" />
                    <p className="text-xl font-bold text-yellow-700">{predictionCounts["on-track"]}</p>
                    <p className="text-sm text-yellow-600">On Track</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-red-50 border border-red-100">
                    <AlertTriangle className="h-5 w-5 mx-auto text-red-600 mb-2" />
                    <p className="text-xl font-bold text-red-700">{predictionCounts["at-risk"]}</p>
                    <p className="text-sm text-red-600">At Risk</p>
                  </div>
                </div>
              </div>

              {/* Grade Distribution */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Distribution</h3>
                <div className="grid grid-cols-5 gap-3">
                  {gradeDistribution.map((item, index) => {
                    const colors = [
                      "bg-green-100 text-green-700",
                      "bg-blue-100 text-blue-700",
                      "bg-yellow-100 text-yellow-700",
                      "bg-orange-100 text-orange-700",
                      "bg-red-100 text-red-700",
                    ];
                    return (
                      <div key={item.range} className={`text-center p-3 rounded-lg ${colors[index]}`}>
                        <p className="text-2xl font-bold">{item.count}</p>
                        <p className="text-xs">{item.range}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Students List */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Enrolled Students ({students.length})
                </h3>
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Name</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Roll No</th>
                      <th className="px-3 py-2 text-center font-medium text-gray-700">Grade</th>
                      <th className="px-3 py-2 text-center font-medium text-gray-700">Attendance</th>
                      <th className="px-3 py-2 text-center font-medium text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {students.slice(0, 20).map((student) => (
                      <tr key={student.id}>
                        <td className="px-3 py-2 text-gray-900">{student.name}</td>
                        <td className="px-3 py-2 text-gray-600">{student.roll_no || "N/A"}</td>
                        <td className="px-3 py-2 text-center font-medium">{student.grade}%</td>
                        <td className="px-3 py-2 text-center">{student.attendance}%</td>
                        <td className="px-3 py-2 text-center capitalize">{student.prediction}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {students.length > 20 && (
                  <p className="px-3 py-2 text-sm text-gray-500 bg-gray-50">
                    ...and {students.length - 20} more students
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="mt-8 pt-4 border-t text-center text-xs text-gray-500">
                <p>This report was generated by the Student Performance Prediction System</p>
                <p className="mt-1">© {new Date().getFullYear()} EduPredict - AI-Powered Student Analytics</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
