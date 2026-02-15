import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useStudents } from "@/hooks/useStudents";
import { useCourses } from "@/hooks/useCourses";
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Award,
  Loader2,
  GraduationCap,
  BookOpen,
  CalendarDays,
  ArrowRight,
  Clock,
  Bell,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { StudentTable } from "@/components/dashboard/StudentTable";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { GradeDistribution } from "@/components/dashboard/GradeDistribution";
import { RiskBreakdown } from "@/components/dashboard/RiskBreakdown";
import { AddStudentDialog } from "@/components/dashboard/AddStudentDialog";
import { ImportStudentsDialog } from "@/components/dashboard/ImportStudentsDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { students, isLoading: studentsLoading } = useStudents();
  const { courses } = useCourses();

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

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Teacher";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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

  const performanceData = [
    { month: "Jan", average: 72, predicted: 73 },
    { month: "Feb", average: 74, predicted: 75 },
    { month: "Mar", average: 71, predicted: 74 },
    { month: "Apr", average: 76, predicted: 77 },
    { month: "May", average: 78, predicted: 79 },
    { month: "Jun", average: averagePerformance || 75, predicted: (averagePerformance || 75) + 2 },
  ];

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

  const atRiskList = students.filter((s) => s.prediction === "at-risk").slice(0, 4);
  const recentStudents = [...students].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Welcome Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-2xl gradient-primary p-6 md:p-8 text-primary-foreground"
            >
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                <div className="absolute right-20 bottom-0 h-24 w-24 rounded-full bg-white/5" />
                <div className="absolute left-1/2 -top-5 h-16 w-16 rounded-full bg-white/10" />
              </div>
              <div className="relative z-10">
                <p className="text-sm text-primary-foreground/70 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {today}
                </p>
                <h1 className="text-2xl md:text-3xl font-bold mt-2">
                  Welcome back, {userName}!
                </h1>
                <p className="text-primary-foreground/80 mt-1 max-w-lg">
                  Always stay updated with your student performance predictions and analytics.
                </p>
                <div className="flex gap-3 mt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-0"
                    onClick={() => navigate("/students")}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    View Students
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-0"
                    onClick={() => navigate("/predictions")}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    AI Predictions
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column - Stats + Charts */}
              <div className="lg:col-span-2 space-y-6">
                {/* Stats Cards */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="card-hover border-0 shadow-md">
                      <CardContent className="p-4 text-center">
                        <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <p className="text-2xl font-bold">{totalStudents}</p>
                        <p className="text-xs text-muted-foreground">Total Students</p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <Card className="card-hover border-0 shadow-md">
                      <CardContent className="p-4 text-center">
                        <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-danger/10 flex items-center justify-center">
                          <AlertTriangle className="h-5 w-5 text-danger" />
                        </div>
                        <p className="text-2xl font-bold">{atRiskStudents}</p>
                        <p className="text-xs text-muted-foreground">At Risk</p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="card-hover border-0 shadow-md">
                      <CardContent className="p-4 text-center">
                        <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                          <Award className="h-5 w-5 text-success" />
                        </div>
                        <p className="text-2xl font-bold">{averagePerformance}%</p>
                        <p className="text-xs text-muted-foreground">Avg Performance</p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <Card className="card-hover border-0 shadow-md">
                      <CardContent className="p-4 text-center">
                        <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-warning" />
                        </div>
                        <p className="text-2xl font-bold">{passRate}%</p>
                        <p className="text-xs text-muted-foreground">Pass Rate</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Enrolled Courses Section */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold">Your Courses</h2>
                    <Link to="/courses" className="text-sm text-primary hover:underline flex items-center gap-1">
                      See all <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    {(courses || []).slice(0, 4).map((course, idx) => (
                      <Card
                        key={course.id}
                        className="card-hover border-0 shadow-md overflow-hidden group cursor-pointer"
                        onClick={() => navigate(`/courses/${course.id}`)}
                      >
                        <CardContent className="p-0">
                          <div className="h-2 gradient-primary" />
                          <div className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-sm line-clamp-1">{course.name}</h3>
                                <p className="text-xs text-muted-foreground mt-1">{course.code}</p>
                              </div>
                              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <BookOpen className="h-4 w-4 text-primary" />
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {course.duration || "16 weeks"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {students.filter(s => s.course_id === course.id).length} students
                              </span>
                            </div>
                            <Button variant="outline" size="sm" className="mt-3 w-full text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                              View Course
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {(!courses || courses.length === 0) && (
                      <Card className="border-dashed border-2 col-span-2">
                        <CardContent className="p-6 text-center text-muted-foreground">
                          <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No courses yet. Create your first course!</p>
                          <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate("/courses")}>
                            Go to Courses
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </motion.div>

                {/* Charts */}
                {students.length > 0 && (
                  <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
                    <PerformanceChart data={performanceData} />
                    <GradeDistribution data={gradeDistribution} />
                  </div>
                )}
              </div>

              {/* Right Column - Alerts & Recent Activity */}
              <div className="space-y-6">
                {/* At-Risk Alerts */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  <Card className="border-0 shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                          <Bell className="h-4 w-4 text-danger" />
                          At-Risk Alerts
                        </CardTitle>
                        <Link to="/students" className="text-xs text-primary hover:underline">
                          See all
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {atRiskList.length > 0 ? atRiskList.map((student) => (
                        <div
                          key={student.id}
                          className="p-3 rounded-lg bg-danger/5 border border-danger/10 cursor-pointer hover:bg-danger/10 transition-colors"
                          onClick={() => navigate(`/students/${student.id}`)}
                        >
                          <p className="font-medium text-sm">{student.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Grade: {student.grade}% · Attendance: {student.attendance}%
                          </p>
                          <span className="text-xs text-primary hover:underline mt-1 inline-block">
                            View details →
                          </span>
                        </div>
                      )) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No at-risk students 🎉
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Quick Stats Summary */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                  <Card className="border-0 shadow-md">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold">Performance Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Excelling</span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-success transition-all"
                              style={{ width: totalStudents ? `${(excellingStudents / totalStudents) * 100}%` : '0%' }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{excellingStudents}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">On Track</span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: totalStudents ? `${(onTrackStudents / totalStudents) * 100}%` : '0%' }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{onTrackStudents}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">At Risk</span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-danger transition-all"
                              style={{ width: totalStudents ? `${(atRiskStudents / totalStudents) * 100}%` : '0%' }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{atRiskStudents}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Recently Added */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                  <Card className="border-0 shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold">Recently Added</CardTitle>
                        <Link to="/students" className="text-xs text-primary hover:underline">
                          See all
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {recentStudents.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => navigate(`/students/${student.id}`)}
                        >
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-medium text-primary">
                              {student.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{student.name}</p>
                            <p className="text-xs text-muted-foreground">Grade: {student.grade}%</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            student.prediction === "excelling" ? "bg-success/10 text-success" :
                            student.prediction === "at-risk" ? "bg-danger/10 text-danger" :
                            "bg-primary/10 text-primary"
                          }`}>
                            {student.prediction}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>

            {/* Risk Breakdown */}
            {students.length > 0 && <RiskBreakdown data={riskData} />}

            {/* Actions Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <ImportStudentsDialog />
              <AddStudentDialog />
            </div>

            {/* Student Table */}
            <StudentTable students={students} isLoading={studentsLoading} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
