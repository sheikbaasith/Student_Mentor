import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useStudents } from "@/hooks/useStudents";
import { useCourses } from "@/hooks/useCourses";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  FileText,
  Download,
  FileSpreadsheet,
  FilePieChart,
  FileBarChart,
  CheckCircle,
  Users,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function Reports() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { students } = useStudents();
  const { courses } = useCourses();
  const { toast } = useToast();
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  // Stats calculations
  const totalStudents = students.length;
  const atRiskStudents = students.filter((s) => s.prediction === "at-risk");
  const excellingStudents = students.filter((s) => s.prediction === "excelling");
  const onTrackStudents = students.filter((s) => s.prediction === "on-track");
  const avgGrade = students.length > 0
    ? (students.reduce((sum, s) => sum + s.grade, 0) / students.length).toFixed(1)
    : 0;
  const avgAttendance = students.length > 0
    ? (students.reduce((sum, s) => sum + s.attendance, 0) / students.length).toFixed(1)
    : 0;

  const handleExportCSV = () => {
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
      "Date of Birth",
      "Blood Group",
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
          s.internal_marks + s.external_marks,
          s.prediction,
          s.confidence,
          s.date_of_birth || "",
          s.blood_group || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students_report_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "CSV Exported",
      description: `Exported ${students.length} student records.`,
    });
  };

  const generatePDFReport = async (reportType: string) => {
    if (!reportRef.current) return;

    setGeneratingReport(reportType);
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
      pdf.save(`${reportType.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);

      toast({
        title: "Report Generated",
        description: `${reportType} has been downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report.",
        variant: "destructive",
      });
    } finally {
      setGeneratingReport(null);
    }
  };

  const reports = [
    {
      title: "Performance Summary",
      description: "Overview of all student performance metrics",
      icon: FilePieChart,
      color: "text-primary",
    },
    {
      title: "At-Risk Analysis",
      description: "Detailed report on at-risk students and recommendations",
      icon: FileBarChart,
      color: "text-danger",
    },
    {
      title: "Attendance Report",
      description: "Student attendance patterns and trends",
      icon: FileSpreadsheet,
      color: "text-accent",
    },
    {
      title: "Grade Distribution",
      description: "Analysis of grade distribution across all students",
      icon: FileText,
      color: "text-success",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                  <FileText className="h-8 w-8 text-primary" />
                  Reports
                </h1>
                <p className="text-muted-foreground">
                  Generate and export student performance reports
                </p>
              </div>
              <Button onClick={handleExportCSV} className="gradient-primary text-primary-foreground">
                <Download className="mr-2 h-4 w-4" />
                Export All Data (CSV)
              </Button>
            </div>

            {/* Report Types Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {reports.map((report) => (
                <Card
                  key={report.title}
                  className="card-shadow hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg bg-muted ${report.color}`}>
                        <report.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {report.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => generatePDFReport(report.title)}
                      disabled={generatingReport === report.title}
                    >
                      {generatingReport === report.title ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Printable Report Content */}
            <div
              ref={reportRef}
              className="bg-white p-8 rounded-lg border space-y-6"
            >
              {/* Report Header */}
              <div className="text-center border-b pb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Student Performance Report
                </h2>
                <p className="text-gray-600 mt-1">Comprehensive Analytics Summary</p>
                <p className="text-sm text-gray-500 mt-2">
                  Generated on{" "}
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-100">
                  <Users className="h-6 w-6 mx-auto text-blue-600 mb-2" />
                  <p className="text-2xl font-bold text-blue-700">{totalStudents}</p>
                  <p className="text-sm text-blue-600">Total Students</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-50 border border-green-100">
                  <CheckCircle className="h-6 w-6 mx-auto text-green-600 mb-2" />
                  <p className="text-2xl font-bold text-green-700">{excellingStudents.length}</p>
                  <p className="text-sm text-green-600">Excelling</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-yellow-50 border border-yellow-100">
                  <TrendingUp className="h-6 w-6 mx-auto text-yellow-600 mb-2" />
                  <p className="text-2xl font-bold text-yellow-700">{onTrackStudents.length}</p>
                  <p className="text-sm text-yellow-600">On Track</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-red-50 border border-red-100">
                  <AlertTriangle className="h-6 w-6 mx-auto text-red-600 mb-2" />
                  <p className="text-2xl font-bold text-red-700">{atRiskStudents.length}</p>
                  <p className="text-sm text-red-600">At Risk</p>
                </div>
              </div>

              <Separator />

              {/* Performance Overview */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Performance Overview
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Average Grade</span>
                      <Badge variant="outline" className="bg-primary/10 text-primary">
                        {avgGrade}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Average Attendance</span>
                      <Badge variant="outline" className="bg-accent/10 text-accent">
                        {avgAttendance}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Courses</span>
                      <Badge variant="outline">{courses.length}</Badge>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Pass Rate (≥60%)</span>
                      <Badge variant="outline" className="bg-success/10 text-success">
                        {students.length > 0
                          ? ((students.filter((s) => s.grade >= 60).length / students.length) * 100).toFixed(1)
                          : 0}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Excellence Rate (≥85%)</span>
                      <Badge variant="outline" className="bg-primary/10 text-primary">
                        {students.length > 0
                          ? ((students.filter((s) => s.grade >= 85).length / students.length) * 100).toFixed(1)
                          : 0}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">At-Risk Rate</span>
                      <Badge variant="outline" className="bg-danger/10 text-danger">
                        {students.length > 0
                          ? ((atRiskStudents.length / students.length) * 100).toFixed(1)
                          : 0}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* At-Risk Students List */}
              {atRiskStudents.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    At-Risk Students ({atRiskStudents.length})
                  </h3>
                  <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                      <thead className="bg-red-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-red-700">Name</th>
                          <th className="px-4 py-2 text-center font-medium text-red-700">Grade</th>
                          <th className="px-4 py-2 text-center font-medium text-red-700">Attendance</th>
                          <th className="px-4 py-2 text-center font-medium text-red-700">Confidence</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {atRiskStudents.slice(0, 10).map((student) => (
                          <tr key={student.id}>
                            <td className="px-4 py-2 text-gray-900">{student.name}</td>
                            <td className="px-4 py-2 text-center font-medium text-red-600">
                              {student.grade}%
                            </td>
                            <td className="px-4 py-2 text-center">{student.attendance}%</td>
                            <td className="px-4 py-2 text-center">{student.confidence}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {atRiskStudents.length > 10 && (
                      <p className="px-4 py-2 text-sm text-gray-500 bg-gray-50">
                        ...and {atRiskStudents.length - 10} more students
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Grade Distribution */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Grade Distribution
                </h3>
                <div className="grid grid-cols-5 gap-3">
                  {[
                    { grade: "A (90+)", count: students.filter((s) => s.grade >= 90).length, color: "bg-green-100 text-green-700" },
                    { grade: "B (80-89)", count: students.filter((s) => s.grade >= 80 && s.grade < 90).length, color: "bg-blue-100 text-blue-700" },
                    { grade: "C (70-79)", count: students.filter((s) => s.grade >= 70 && s.grade < 80).length, color: "bg-yellow-100 text-yellow-700" },
                    { grade: "D (60-69)", count: students.filter((s) => s.grade >= 60 && s.grade < 70).length, color: "bg-orange-100 text-orange-700" },
                    { grade: "F (<60)", count: students.filter((s) => s.grade < 60).length, color: "bg-red-100 text-red-700" },
                  ].map((item) => (
                    <div key={item.grade} className={`text-center p-3 rounded-lg ${item.color}`}>
                      <p className="text-2xl font-bold">{item.count}</p>
                      <p className="text-xs">{item.grade}</p>
                    </div>
                  ))}
                </div>
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
