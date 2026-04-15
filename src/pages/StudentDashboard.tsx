import { useNavigate } from "react-router-dom";
import { useStudentAuth } from "@/contexts/StudentAuthContext";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StudentGradeChart } from "@/components/student/StudentGradeChart";
import { StudentRecommendations } from "@/components/student/StudentRecommendations";
import { StudentReportCard } from "@/components/student/StudentReportCard";
import {
  LogOut, GraduationCap, BookOpen, TrendingUp, TrendingDown, Minus,
  User, Phone, Mail, MapPin, Calendar, Heart, Users,
} from "lucide-react";

const predictionConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  "excelling": { label: "Excelling", color: "bg-success/10 text-success border-success/20", icon: TrendingUp },
  "on-track": { label: "On Track", color: "bg-warning/10 text-warning border-warning/20", icon: Minus },
  "at-risk": { label: "At Risk", color: "bg-destructive/10 text-destructive border-destructive/20", icon: TrendingDown },
};

export default function StudentDashboard() {
  const { student, studentLogout, isStudentLoggedIn } = useStudentAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isStudentLoggedIn) navigate("/auth");
  }, [isStudentLoggedIn, navigate]);

  if (!student) return null;

  const pred = predictionConfig[student.prediction] || predictionConfig["on-track"];
  const PredIcon = pred.icon;
  const initials = student.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const courseName = student.courses?.name || "Not assigned";

  const formatDate = (d: string | null) => {
    if (!d) return "N/A";
    return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">EduTrack</span>
            <Badge variant="secondary" className="ml-2">Student</Badge>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => { studentLogout(); navigate("/auth"); }}>
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6 px-4 md:px-6 space-y-6 max-w-6xl mx-auto">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-24 w-24 border-4 border-primary/10">
                {student.photo_url && <AvatarImage src={student.photo_url} alt={student.name} />}
                <AvatarFallback className="text-2xl font-bold bg-primary/5 text-primary">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left space-y-2">
                <h1 className="text-2xl font-bold text-foreground">{student.name}</h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <Badge variant="outline">Roll No: {student.roll_no}</Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> {courseName}
                  </Badge>
                  <Badge className={`${pred.color} border`}>
                    <PredIcon className="h-3 w-3 mr-1" /> {pred.label}
                  </Badge>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-1 text-sm text-muted-foreground">
                  <span>AI Confidence:</span>
                  <Progress value={student.confidence} className="w-24 h-2" />
                  <span className="font-medium text-foreground">{student.confidence}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Grade", value: `${student.grade}%`, color: student.grade >= 75 ? "text-success" : student.grade >= 50 ? "text-warning" : "text-destructive" },
            { label: "Attendance", value: `${student.attendance}%`, color: student.attendance >= 75 ? "text-success" : "text-warning" },
            { label: "Internal Marks", value: student.internal_marks ?? "N/A", color: "text-foreground" },
            { label: "External Marks", value: student.external_marks ?? "N/A", color: "text-foreground" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Personal Details */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Personal Details</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: Mail, label: "Email", value: student.email },
                { icon: Phone, label: "Phone", value: student.phone || "N/A" },
                { icon: Calendar, label: "Date of Birth", value: formatDate(student.date_of_birth) },
                { icon: Heart, label: "Blood Group", value: student.blood_group || "N/A" },
                { icon: Users, label: "Father's Name", value: student.father_name || "N/A" },
                { icon: Users, label: "Mother's Name", value: student.mother_name || "N/A" },
                { icon: MapPin, label: "Address", value: student.address || "N/A" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <item.icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-medium text-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Charts & Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StudentGradeChart student={student as any} />
          <StudentRecommendations student={student as any} />
        </div>

        {/* Report Card */}
        <StudentReportCard student={student as any} />
      </main>
    </div>
  );
}
