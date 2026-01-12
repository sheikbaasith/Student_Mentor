import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useStudents } from "@/hooks/useStudents";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Download, FileSpreadsheet, FilePieChart, FileBarChart } from "lucide-react";

export default function Reports() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { students } = useStudents();

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

  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Roll No", "Grade", "Attendance", "Prediction", "Confidence"];
    const csvContent = [
      headers.join(","),
      ...students.map((s) =>
        [
          `"${s.name}"`,
          s.email,
          s.roll_no || "",
          s.grade,
          s.attendance,
          s.prediction,
          s.confidence,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students_report.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
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
                Export CSV
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {reports.map((report) => (
                <Card
                  key={report.title}
                  className="card-shadow hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg bg-muted ${report.color}`}>
                        <report.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {report.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Stats */}
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle>Quick Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-primary">{students.length}</p>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-success">
                      {students.filter((s) => s.prediction === "excelling").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Excelling</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-accent">
                      {students.filter((s) => s.prediction === "on-track").length}
                    </p>
                    <p className="text-sm text-muted-foreground">On Track</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-danger">
                      {students.filter((s) => s.prediction === "at-risk").length}
                    </p>
                    <p className="text-sm text-muted-foreground">At Risk</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
