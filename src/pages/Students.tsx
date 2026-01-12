import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useStudents } from "@/hooks/useStudents";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { StudentTable } from "@/components/dashboard/StudentTable";
import { AddStudentDialog } from "@/components/dashboard/AddStudentDialog";
import { Loader2 } from "lucide-react";

export default function Students() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { students, isLoading } = useStudents();

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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Students
                </h1>
                <p className="text-muted-foreground">
                  Manage and view all your students
                </p>
              </div>
              <AddStudentDialog />
            </div>
            <StudentTable students={students} isLoading={isLoading} />
          </div>
        </main>
      </div>
    </div>
  );
}
