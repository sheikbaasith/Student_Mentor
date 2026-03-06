import { forwardRef, useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Trash2, Loader2, ChevronDown, ChevronUp, Eye, BookOpen, Pencil, Filter, Mail } from "lucide-react";
import { Student, useStudents } from "@/hooks/useStudents";
import { useCourses } from "@/hooks/useCourses";
import { useNavigate } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AssignCourseDialog } from "@/components/students/AssignCourseDialog";
import { EditStudentDialog } from "@/components/students/EditStudentDialog";
import { SendNotificationDialog } from "@/components/students/SendNotificationDialog";

interface StudentTableProps {
  students: Student[];
  isLoading?: boolean;
  className?: string;
}

const predictionStyles = {
  "excelling": "bg-success/10 text-success border-success/20 hover:bg-success/20",
  "on-track": "bg-accent/10 text-accent border-accent/20 hover:bg-accent/20",
  "at-risk": "bg-danger/10 text-danger border-danger/20 hover:bg-danger/20",
};

const predictionLabels = {
  "excelling": "Excelling",
  "on-track": "On Track",
  "at-risk": "At Risk",
};

export const StudentTable = forwardRef<HTMLDivElement, StudentTableProps>(
  ({ students, isLoading, className }, ref) => {
    const { deleteStudent, isDeleting } = useStudents();
    const { courses } = useCourses();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [courseFilter, setCourseFilter] = useState<string>("all");
    const [predictionFilter, setPredictionFilter] = useState<string>("all");
    const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
    const navigate = useNavigate();

    // Resolve signed URLs for student photos
    useEffect(() => {
      const resolveUrls = async () => {
        const studentsWithPhotos = students.filter(s => s.photo_url);
        const urls: Record<string, string> = {};
        for (const s of studentsWithPhotos) {
          const path = s.photo_url!.replace("student-photos/", "");
          const { data } = await supabase.storage
            .from("student-photos")
            .createSignedUrl(path, 3600);
          if (data?.signedUrl) urls[s.id] = data.signedUrl;
        }
        setSignedUrls(urls);
      };
      if (students.length > 0) resolveUrls();
    }, [students]);

    // Filter students by selected course and prediction status
    const filteredStudents = students.filter(student => {
      const matchesCourse = courseFilter === "all" 
        ? true 
        : courseFilter === "unassigned"
          ? !student.course_id
          : student.course_id === courseFilter;
      
      const matchesPrediction = predictionFilter === "all" 
        ? true 
        : student.prediction === predictionFilter;
      
      return matchesCourse && matchesPrediction;
    });

    const getCourseName = (courseId: string | null) => {
      if (!courseId) return null;
      const course = courses.find((c) => c.id === courseId);
      return course ? course.name : null;
    };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 85) return "text-success font-semibold";
    if (grade >= 70) return "text-accent font-semibold";
    if (grade >= 60) return "text-warning font-semibold";
    return "text-danger font-semibold";
  };

  const formatDate = (date: string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card card-shadow p-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="rounded-xl border bg-card card-shadow p-12 text-center animate-slide-up">
        <p className="text-lg font-medium">No students yet</p>
        <p className="text-muted-foreground mt-1">
          Add your first student to start tracking performance
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card card-shadow overflow-hidden animate-slide-up">
      <div className="p-6 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Student Performance Overview</h3>
            <p className="text-sm text-muted-foreground mt-1">
              AI-powered predictions for student outcomes
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={predictionFilter} onValueChange={setPredictionFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="excelling">Excelling</SelectItem>
                <SelectItem value="on-track">On Track</SelectItem>
                <SelectItem value="at-risk">At Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold w-8"></TableHead>
            <TableHead className="font-semibold">Student</TableHead>
            <TableHead className="font-semibold">Roll No</TableHead>
            <TableHead className="font-semibold">Current Grade</TableHead>
            <TableHead className="font-semibold">Course</TableHead>
            <TableHead className="font-semibold">AI Prediction</TableHead>
            <TableHead className="font-semibold w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStudents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No students found for the selected filter
              </TableCell>
            </TableRow>
          ) : null}
          {filteredStudents.map((student, index) => (
            <Collapsible
              key={student.id}
              open={expandedId === student.id}
              onOpenChange={(open) => setExpandedId(open ? student.id : null)}
              asChild
            >
              <>
                <TableRow
                  className="hover:bg-muted/30 transition-colors"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        {expandedId === student.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-primary/10">
                        <AvatarImage src={signedUrls[student.id]} alt={student.name} />
                        <AvatarFallback className="bg-primary/5 text-primary font-medium">
                          {getInitials(student.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{student.roll_no || "N/A"}</span>
                  </TableCell>
                  <TableCell>
                    <span className={getGradeColor(student.grade)}>{student.grade}%</span>
                  </TableCell>
                  <TableCell>
                    <AssignCourseDialog 
                      student={student}
                      trigger={
                        <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                          <BookOpen className="h-3 w-3" />
                          {getCourseName(student.course_id) || "Assign"}
                        </Button>
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-medium transition-colors",
                        predictionStyles[student.prediction]
                      )}
                    >
                      {predictionLabels[student.prediction]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {student.prediction === "at-risk" && (
                        <SendNotificationDialog 
                          student={student} 
                        />
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingStudent(student)}
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/student/${student.id}`)}
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteStudent(student.id)}
                        disabled={isDeleting}
                        className="text-muted-foreground hover:text-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                <CollapsibleContent asChild>
                  <TableRow className="bg-muted/20">
                    <TableCell colSpan={7} className="py-4">
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 px-4">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Date of Birth</p>
                          <p className="font-medium mt-1">{formatDate(student.date_of_birth)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Blood Group</p>
                          <p className="font-medium mt-1">{student.blood_group || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Attendance</p>
                          <p className="font-medium mt-1">{student.attendance}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Internal Marks</p>
                          <p className="font-medium mt-1">{student.internal_marks}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">External Marks</p>
                          <p className="font-medium mt-1">{student.external_marks}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Confidence</p>
                          <p className="font-medium mt-1">{student.confidence}%</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                </CollapsibleContent>
              </>
            </Collapsible>
          ))}
        </TableBody>
      </Table>

      {/* Edit Student Dialog */}
      {editingStudent && (
        <EditStudentDialog
          student={editingStudent}
          open={!!editingStudent}
          onOpenChange={(open) => !open && setEditingStudent(null)}
        />
      )}
    </div>
  );
  }
);

StudentTable.displayName = "StudentTable";
