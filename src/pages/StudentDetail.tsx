import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCourses } from "@/hooks/useCourses";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  Droplets,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  User,
  Hash,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StudentGradeChart } from "@/components/student/StudentGradeChart";
import { StudentRecommendations } from "@/components/student/StudentRecommendations";
import { StudentReportCard } from "@/components/student/StudentReportCard";
import { SendNotificationDialog } from "@/components/students/SendNotificationDialog";
import { StudentPhotoUpload } from "@/components/students/StudentPhotoUpload";
import { Student } from "@/hooks/useStudents";

const predictionStyles = {
  excelling: "bg-success/10 text-success border-success/20",
  "on-track": "bg-primary/10 text-primary border-primary/20",
  "at-risk": "bg-danger/10 text-danger border-danger/20",
};

const predictionIcons = {
  excelling: CheckCircle,
  "on-track": TrendingUp,
  "at-risk": AlertTriangle,
};

export default function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: student, isLoading } = useQuery({
    queryKey: ["student", id],
    queryFn: async () => {
      if (!user || !id) return null;
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("id", id)
        .eq("teacher_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as (Student & { photo_url?: string | null }) | null;
    },
    enabled: !!user && !!id,
  });

  const handlePhotoUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ["student", id] });
    queryClient.invalidateQueries({ queryKey: ["students"] });
  };

  if (authLoading || isLoading) {
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

  if (!student) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-8 flex items-center justify-center">
            <Card className="max-w-md w-full text-center p-8">
              <CardContent>
                <p className="text-lg font-medium">Student not found</p>
                <p className="text-muted-foreground mt-2">
                  The student you're looking for doesn't exist or you don't have access.
                </p>
                <Button onClick={() => navigate("/")} className="mt-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const formatDate = (date: string | null) =>
    date ? new Date(date).toLocaleDateString() : "N/A";

  const PredictionIcon = predictionIcons[student.prediction as keyof typeof predictionIcons];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>

            {/* Profile Header */}
            <Card className="card-shadow animate-slide-up">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <StudentPhotoUpload
                    studentId={student.id}
                    studentName={student.name}
                    currentPhotoUrl={student.photo_url}
                    onPhotoUpdated={handlePhotoUpdated}
                    size="lg"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-2xl font-bold">{student.name}</h1>
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-medium capitalize",
                          predictionStyles[student.prediction as keyof typeof predictionStyles]
                        )}
                      >
                        <PredictionIcon className="h-3 w-3 mr-1" />
                        {student.prediction.replace("-", " ")}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {student.email}
                    </p>
                    {student.roll_no && (
                      <p className="text-muted-foreground flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Roll No: {student.roll_no}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {student.prediction === "at-risk" && (
                      <SendNotificationDialog student={student} />
                    )}
                    <div className="text-right space-y-1">
                      <p className="text-sm text-muted-foreground">AI Confidence</p>
                      <p className="text-3xl font-bold text-primary">{student.confidence}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Details & Academic Stats */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="card-shadow animate-slide-up" style={{ animationDelay: "100ms" }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Personal Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone
                    </span>
                    <span className="font-medium">{student.phone || "N/A"}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date of Birth
                    </span>
                    <span className="font-medium">{formatDate(student.date_of_birth)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Droplets className="h-4 w-4" />
                      Blood Group
                    </span>
                    <span className="font-medium">{student.blood_group || "N/A"}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Roll Number
                    </span>
                    <span className="font-medium">{student.roll_no || "N/A"}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Father's Name
                    </span>
                    <span className="font-medium">{student.father_name || "N/A"}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Mother's Name
                    </span>
                    <span className="font-medium">{student.mother_name || "N/A"}</span>
                  </div>
                  <Separator />
                  <div className="flex items-start justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Address
                    </span>
                    <span className="font-medium text-right max-w-[200px]">{student.address || "N/A"}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-shadow animate-slide-up" style={{ animationDelay: "150ms" }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    Academic Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Current Grade</span>
                    <span
                      className={cn(
                        "font-bold text-lg",
                        student.grade >= 85
                          ? "text-success"
                          : student.grade >= 70
                          ? "text-accent"
                          : student.grade >= 60
                          ? "text-warning"
                          : "text-danger"
                      )}
                    >
                      {student.grade}%
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Attendance</span>
                    <span className="font-bold text-lg">{student.attendance}%</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Internal Marks</span>
                    <span className="font-medium">{student.internal_marks}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">External Marks</span>
                    <span className="font-medium">{student.external_marks}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Marks</span>
                    <span className="font-bold text-primary">
                      {student.internal_marks + student.external_marks}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Grade History Chart */}
            <StudentGradeChart student={student} />

            {/* AI Recommendations */}
            <StudentRecommendations student={student} />

            {/* Printable Report Card */}
            <StudentReportCard student={student} />
          </div>
        </main>
      </div>
    </div>
  );
}
