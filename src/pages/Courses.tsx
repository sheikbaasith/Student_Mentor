import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, GraduationCap, Users, Clock, BookOpen } from "lucide-react";

const courses = [
  {
    id: 1,
    name: "Introduction to Machine Learning",
    code: "CS401",
    students: 45,
    duration: "16 weeks",
    status: "Active",
  },
  {
    id: 2,
    name: "Data Structures & Algorithms",
    code: "CS201",
    students: 52,
    duration: "16 weeks",
    status: "Active",
  },
  {
    id: 3,
    name: "Database Management Systems",
    code: "CS301",
    students: 38,
    duration: "14 weeks",
    status: "Active",
  },
  {
    id: 4,
    name: "Web Development",
    code: "CS202",
    students: 60,
    duration: "12 weeks",
    status: "Completed",
  },
];

export default function Courses() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                <GraduationCap className="h-8 w-8 text-primary" />
                Courses
              </h1>
              <p className="text-muted-foreground">
                Manage your courses and curriculum
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {courses.map((course) => (
                <Card key={course.id} className="card-shadow hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{course.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {course.code}
                        </p>
                      </div>
                      <Badge
                        variant={course.status === "Active" ? "default" : "secondary"}
                        className={
                          course.status === "Active"
                            ? "bg-success/10 text-success border-success/20"
                            : ""
                        }
                      >
                        {course.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">{course.students} Students</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{course.duration}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="card-shadow p-8 text-center border-dashed">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                Course management features coming soon
              </p>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
