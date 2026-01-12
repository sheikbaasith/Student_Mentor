import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useStudents } from "@/hooks/useStudents";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { GradeDistribution } from "@/components/dashboard/GradeDistribution";
import { RiskBreakdown } from "@/components/dashboard/RiskBreakdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function Analytics() {
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

  const averageGrade = students.length > 0
    ? (students.reduce((sum, s) => sum + s.grade, 0) / students.length).toFixed(1)
    : 0;
  const averageAttendance = students.length > 0
    ? (students.reduce((sum, s) => sum + s.attendance, 0) / students.length).toFixed(1)
    : 0;
  const atRiskCount = students.filter((s) => s.prediction === "at-risk").length;
  const excellingCount = students.filter((s) => s.prediction === "excelling").length;
  const onTrackCount = students.filter((s) => s.prediction === "on-track").length;

  const performanceData = [
    { month: "Jan", average: 72, predicted: 73 },
    { month: "Feb", average: 74, predicted: 75 },
    { month: "Mar", average: 71, predicted: 74 },
    { month: "Apr", average: 76, predicted: 77 },
    { month: "May", average: 78, predicted: 79 },
    { month: "Jun", average: Number(averageGrade) || 75, predicted: (Number(averageGrade) || 75) + 2 },
  ];

  const gradeDistribution = [
    { grade: "A", count: students.filter((s) => s.grade >= 90).length },
    { grade: "B", count: students.filter((s) => s.grade >= 80 && s.grade < 90).length },
    { grade: "C", count: students.filter((s) => s.grade >= 70 && s.grade < 80).length },
    { grade: "D", count: students.filter((s) => s.grade >= 60 && s.grade < 70).length },
    { grade: "F", count: students.filter((s) => s.grade < 60).length },
  ];

  const riskData = [
    { name: "Excelling", value: excellingCount, color: "hsl(160, 84%, 39%)" },
    { name: "On Track", value: onTrackCount, color: "hsl(174, 72%, 40%)" },
    { name: "At Risk", value: atRiskCount, color: "hsl(0, 84%, 60%)" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Analytics
              </h1>
              <p className="text-muted-foreground">
                Detailed performance analytics and trends
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="card-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Average Grade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold">{averageGrade}%</span>
                    <TrendingUp className="h-5 w-5 text-success" />
                  </div>
                </CardContent>
              </Card>
              <Card className="card-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Average Attendance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold">{averageAttendance}%</span>
                    <Minus className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card className="card-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    At-Risk Ratio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold">
                      {students.length > 0 ? ((atRiskCount / students.length) * 100).toFixed(0) : 0}%
                    </span>
                    {atRiskCount > 0 ? (
                      <TrendingDown className="h-5 w-5 text-danger" />
                    ) : (
                      <TrendingUp className="h-5 w-5 text-success" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {students.length > 0 ? (
              <>
                <div className="grid gap-6 lg:grid-cols-2">
                  <PerformanceChart data={performanceData} />
                  <GradeDistribution data={gradeDistribution} />
                </div>
                <RiskBreakdown data={riskData} />
              </>
            ) : (
              <Card className="card-shadow p-12 text-center">
                <p className="text-lg font-medium">No data available</p>
                <p className="text-muted-foreground mt-1">
                  Add students to see analytics
                </p>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
