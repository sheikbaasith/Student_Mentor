import { Users, AlertTriangle, TrendingUp, Award } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatCard } from "@/components/dashboard/StatCard";
import { StudentTable } from "@/components/dashboard/StudentTable";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { GradeDistribution } from "@/components/dashboard/GradeDistribution";
import { RiskBreakdown } from "@/components/dashboard/RiskBreakdown";
import {
  students,
  performanceData,
  gradeDistribution,
  riskData,
  dashboardStats,
} from "@/data/mockData";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Dashboard
              </h1>
              <p className="text-muted-foreground">
                AI-powered insights into student performance and predictions
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Students"
                value={dashboardStats.totalStudents}
                subtitle="Active enrollment"
                icon={<Users className="h-5 w-5" />}
                trend={{ value: 5.2, positive: true }}
                variant="primary"
              />
              <StatCard
                title="At-Risk Students"
                value={dashboardStats.atRiskStudents}
                subtitle="Needs attention"
                icon={<AlertTriangle className="h-5 w-5" />}
                trend={{ value: 2.1, positive: false }}
                variant="danger"
              />
              <StatCard
                title="Average Performance"
                value={`${dashboardStats.averagePerformance}%`}
                subtitle="Class average"
                icon={<TrendingUp className="h-5 w-5" />}
                trend={{ value: 3.8, positive: true }}
                variant="accent"
              />
              <StatCard
                title="Pass Rate"
                value={`${dashboardStats.passRate}%`}
                subtitle="Students passing"
                icon={<Award className="h-5 w-5" />}
                trend={{ value: 1.5, positive: true }}
                variant="success"
              />
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
              <PerformanceChart data={performanceData} />
              <div className="grid gap-6">
                <GradeDistribution data={gradeDistribution} />
              </div>
            </div>

            {/* Risk Breakdown */}
            <RiskBreakdown data={riskData} />

            {/* Student Table */}
            <StudentTable students={students} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
