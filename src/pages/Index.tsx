import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useStudents } from "@/hooks/useStudents";
import { Users, AlertTriangle, TrendingUp, Award, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatCard } from "@/components/dashboard/StatCard";
import { StudentTable } from "@/components/dashboard/StudentTable";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { GradeDistribution } from "@/components/dashboard/GradeDistribution";
import { RiskBreakdown } from "@/components/dashboard/RiskBreakdown";
import { AddStudentDialog } from "@/components/dashboard/AddStudentDialog";
import { ImportStudentsDialog } from "@/components/dashboard/ImportStudentsDialog";

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { students, isLoading: studentsLoading } = useStudents();

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

  if (!user) {
    return null;
  }

  // Calculate stats from real student data
  const totalStudents = students.length;
  const atRiskStudents = students.filter((s) => s.prediction === "at-risk").length;
  const excellingStudents = students.filter((s) => s.prediction === "excelling").length;
  const onTrackStudents = students.filter((s) => s.prediction === "on-track").length;
  const averagePerformance = students.length > 0
    ? Number((students.reduce((sum, s) => sum + s.grade, 0) / students.length).toFixed(1))
    : 0;
  const passRate = students.length > 0
    ? Number((students.filter((s) => s.grade >= 60).length / students.length * 100).toFixed(1))
    : 0;

  // Generate performance data for chart
  const performanceData = [
    { month: "Jan", average: 72, predicted: 73 },
    { month: "Feb", average: 74, predicted: 75 },
    { month: "Mar", average: 71, predicted: 74 },
    { month: "Apr", average: 76, predicted: 77 },
    { month: "May", average: 78, predicted: 79 },
    { month: "Jun", average: averagePerformance || 75, predicted: (averagePerformance || 75) + 2 },
  ];

  // Generate grade distribution from real data
  const gradeDistribution = [
    { grade: "A", count: students.filter((s) => s.grade >= 90).length },
    { grade: "B", count: students.filter((s) => s.grade >= 80 && s.grade < 90).length },
    { grade: "C", count: students.filter((s) => s.grade >= 70 && s.grade < 80).length },
    { grade: "D", count: students.filter((s) => s.grade >= 60 && s.grade < 70).length },
    { grade: "F", count: students.filter((s) => s.grade < 60).length },
  ];

  const riskData = [
    { name: "Excelling", value: excellingStudents, color: "hsl(160, 84%, 39%)" },
    { name: "On Track", value: onTrackStudents, color: "hsl(174, 72%, 40%)" },
    { name: "At Risk", value: atRiskStudents, color: "hsl(0, 84%, 60%)" },
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
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Dashboard
                </h1>
                <p className="text-muted-foreground">
                  AI-powered insights into student performance and predictions
                </p>
              </div>
              <div className="flex gap-2">
                <ImportStudentsDialog />
                <AddStudentDialog />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Students"
                value={totalStudents}
                subtitle="Active enrollment"
                icon={<Users className="h-5 w-5" />}
                variant="primary"
              />
              <StatCard
                title="At-Risk Students"
                value={atRiskStudents}
                subtitle="Needs attention"
                icon={<AlertTriangle className="h-5 w-5" />}
                variant="danger"
              />
              <StatCard
                title="Average Performance"
                value={`${averagePerformance}%`}
                subtitle="Class average"
                icon={<TrendingUp className="h-5 w-5" />}
                variant="accent"
              />
              <StatCard
                title="Pass Rate"
                value={`${passRate}%`}
                subtitle="Students passing"
                icon={<Award className="h-5 w-5" />}
                variant="success"
              />
            </div>

            {/* Charts Row */}
            {students.length > 0 && (
              <div className="grid gap-6 lg:grid-cols-2">
                <PerformanceChart data={performanceData} />
                <GradeDistribution data={gradeDistribution} />
              </div>
            )}

            {/* Risk Breakdown */}
            {students.length > 0 && <RiskBreakdown data={riskData} />}

            {/* Student Table */}
            <StudentTable students={students} isLoading={studentsLoading} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
