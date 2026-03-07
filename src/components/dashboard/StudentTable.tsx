import { forwardRef, useMemo, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Trash2, Loader2, ChevronDown, ChevronUp, Eye, BookOpen, Pencil, Filter, Search, Download, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { useToast } from "@/hooks/use-toast";

interface StudentTableProps {
  students: Student[];
  isLoading?: boolean;
  className?: string;
}

const predictionStyles = {
  "excelling": "bg-success/10 text-success border-success/20 hover:bg-success/20",
  "on-track": "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
  "at-risk": "bg-danger/10 text-danger border-danger/20 hover:bg-danger/20",
};

const predictionLabels = {
  "excelling": "Excelling",
  "on-track": "On Track",
  "at-risk": "At Risk",
};

const escapeCsv = (value: unknown) => {
  const stringValue = value == null ? "" : String(value);
  return `"${stringValue.replace(/"/g, '""')}"`;
};

const extractStoragePath = (photoUrl: string) => {
  if (photoUrl.startsWith("student-photos/")) {
    return photoUrl.replace("student-photos/", "");
  }

  if (photoUrl.includes("/storage/v1/object/public/student-photos/")) {
    return photoUrl.split("/storage/v1/object/public/student-photos/")[1] ?? "";
  }

  if (photoUrl.includes("/storage/v1/object/sign/student-photos/")) {
    return photoUrl.split("/storage/v1/object/sign/student-photos/")[1]?.split("?")[0] ?? "";
  }

  return photoUrl;
};

export const StudentTable = forwardRef<HTMLDivElement, StudentTableProps>(
  ({ students, isLoading, className }, ref) => {
    const { deleteStudent, isDeleting } = useStudents();
    const { courses } = useCourses();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [courseFilter, setCourseFilter] = useState<string>("all");
    const [predictionFilter, setPredictionFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [bulkCourseId, setBulkCourseId] = useState<string>("none");
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
      const resolveUrls = async () => {
        const studentsWithPhotos = students.filter((s) => s.photo_url);
        const urls: Record<string, string> = {};

        for (const s of studentsWithPhotos) {
          const rawPath = s.photo_url ? extractStoragePath(s.photo_url) : "";
          if (!rawPath) continue;

          const { data } = await supabase.storage
            .from("student-photos")
            .createSignedUrl(rawPath, 3600);

          if (data?.signedUrl) urls[s.id] = data.signedUrl;
        }

        setSignedUrls(urls);
      };

      if (students.length > 0) resolveUrls();
    }, [students]);

    const filteredStudents = students.filter((student) => {
      const matchesCourse = courseFilter === "all"
        ? true
        : courseFilter === "unassigned"
          ? !student.course_id
          : student.course_id === courseFilter;

      const matchesPrediction = predictionFilter === "all"
        ? true
        : student.prediction === predictionFilter;

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query ||
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        (student.father_name?.toLowerCase().includes(query) ?? false) ||
        (student.mother_name?.toLowerCase().includes(query) ?? false) ||
        (student.roll_no?.toLowerCase().includes(query) ?? false);

      return matchesCourse && matchesPrediction && matchesSearch;
    });

    const selectedCount = selectedStudentIds.length;

    const allFilteredSelected = useMemo(
      () => filteredStudents.length > 0 && filteredStudents.every((s) => selectedStudentIds.includes(s.id)),
      [filteredStudents, selectedStudentIds]
    );

    const getCourseName = (courseId: string | null) => {
      if (!courseId) return null;
      const course = courses.find((c) => c.id === courseId);
      return course ? course.name : null;
    };

    const getInitials = (name: string) =>
      name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

    const getGradeColor = (grade: number) => {
      if (grade >= 85) return "text-success font-semibold";
      if (grade >= 70) return "text-primary font-semibold";
      if (grade >= 60) return "text-warning font-semibold";
      return "text-danger font-semibold";
    };

    const formatDate = (date: string | null) => {
      if (!date) return "N/A";
      return new Date(date).toLocaleDateString();
    };

    const toggleStudentSelection = (studentId: string, checked: boolean) => {
      setSelectedStudentIds((prev) =>
        checked ? [...prev, studentId] : prev.filter((id) => id !== studentId)
      );
    };

    const toggleAllFilteredSelection = (checked: boolean) => {
      if (checked) {
        setSelectedStudentIds((prev) => Array.from(new Set([...prev, ...filteredStudents.map((s) => s.id)])));
      } else {
        const filteredIds = new Set(filteredStudents.map((s) => s.id));
        setSelectedStudentIds((prev) => prev.filter((id) => !filteredIds.has(id)));
      }
    };

    const handleExportCSV = () => {
      const headers = [
        "Student Name",
        "Email",
        "Phone",
        "Father Name",
        "Mother Name",
        "Roll No",
        "Course",
        "Grade",
        "Attendance",
        "Prediction",
        "Confidence",
      ];

      const csv = [
        headers.join(","),
        ...students.map((s) => [
          escapeCsv(s.name),
          escapeCsv(s.email),
          escapeCsv(s.phone),
          escapeCsv(s.father_name),
          escapeCsv(s.mother_name),
          escapeCsv(s.roll_no),
          escapeCsv(getCourseName(s.course_id) || "Not Assigned"),
          escapeCsv(s.grade),
          escapeCsv(s.attendance),
          escapeCsv(s.prediction),
          escapeCsv(s.confidence),
        ].join(",")),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `students_full_list_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "CSV Exported",
        description: `Downloaded ${students.length} student records with parent details.`,
      });
    };

    const handleBulkAssign = async () => {
      if (selectedStudentIds.length === 0) return;

      const courseIdToAssign = bulkCourseId === "none" ? null : bulkCourseId;

      setIsBulkProcessing(true);
      try {
        const { error } = await supabase
          .from("students")
          .update({ course_id: courseIdToAssign })
          .in("id", selectedStudentIds);

        if (error) throw error;

        await queryClient.invalidateQueries({ queryKey: ["students"] });
        setSelectedStudentIds([]);

        toast({
          title: "Bulk assignment complete",
          description: `Updated course for ${selectedCount} selected students.`,
        });
      } catch (error: any) {
        toast({ title: "Bulk assignment failed", description: error.message, variant: "destructive" });
      } finally {
        setIsBulkProcessing(false);
      }
    };

    const handleBulkDelete = async () => {
      if (selectedStudentIds.length === 0) return;
      const confirmed = window.confirm(`Delete ${selectedStudentIds.length} selected students? This cannot be undone.`);
      if (!confirmed) return;

      setIsBulkProcessing(true);
      try {
        const { error } = await supabase.from("students").delete().in("id", selectedStudentIds);
        if (error) throw error;

        await queryClient.invalidateQueries({ queryKey: ["students"] });
        setSelectedStudentIds([]);

        toast({
          title: "Students deleted",
          description: `Deleted ${selectedCount} selected students.`,
        });
      } catch (error: any) {
        toast({ title: "Bulk delete failed", description: error.message, variant: "destructive" });
      } finally {
        setIsBulkProcessing(false);
      }
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
      <div ref={ref} className={cn("rounded-xl border bg-card card-shadow overflow-hidden animate-slide-up", className)}>
        <div className="p-6 border-b space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Student Performance Overview</h3>
              <p className="text-sm text-muted-foreground mt-1">
                AI-powered predictions for student outcomes
              </p>
            </div>
            <Button onClick={handleExportCSV} variant="outline" className="gap-2 w-full sm:w-auto">
              <Download className="h-4 w-4" />
              Export Full CSV
            </Button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, parent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-[220px] bg-muted/50 border-0 focus-visible:ring-1"
              />
            </div>

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

          {selectedCount > 0 && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Users className="h-4 w-4 text-primary" />
                {selectedCount} student{selectedCount > 1 ? "s" : ""} selected
              </div>

              <div className="flex flex-1 flex-wrap items-center gap-2">
                <Select value={bulkCourseId} onValueChange={setBulkCourseId}>
                  <SelectTrigger className="w-[180px] bg-background">
                    <SelectValue placeholder="Assign course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Course</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  size="sm"
                  onClick={handleBulkAssign}
                  disabled={isBulkProcessing}
                  className="gap-2"
                >
                  {isBulkProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
                  Bulk Assign
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleBulkDelete}
                  disabled={isBulkProcessing || isDeleting}
                  className="gap-2"
                >
                  {isBulkProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Bulk Delete
                </Button>
              </div>
            </div>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold w-10">
                <Checkbox
                  checked={allFilteredSelected}
                  onCheckedChange={(checked) => toggleAllFilteredSelection(Boolean(checked))}
                  aria-label="Select all filtered students"
                />
              </TableHead>
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
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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
                  <TableRow className="hover:bg-muted/30 transition-colors" style={{ animationDelay: `${index * 50}ms` }}>
                    <TableCell>
                      <Checkbox
                        checked={selectedStudentIds.includes(student.id)}
                        onCheckedChange={(checked) => toggleStudentSelection(student.id, Boolean(checked))}
                        aria-label={`Select ${student.name}`}
                      />
                    </TableCell>
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
                          <p className="font-medium text-foreground">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-foreground">{student.roll_no || "N/A"}</span>
                    </TableCell>
                    <TableCell>
                      <span className={getGradeColor(student.grade)}>{student.grade}%</span>
                    </TableCell>
                    <TableCell>
                      <AssignCourseDialog
                        student={student}
                        trigger={
                          <Button variant="ghost" size="sm" className="gap-1 text-xs h-7 text-foreground hover:text-primary">
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
                            courseName={getCourseName(student.course_id) || "Not Assigned"}
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
                      <TableCell colSpan={8} className="py-4">
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 px-4">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Date of Birth</p>
                            <p className="font-medium mt-1 text-foreground">{formatDate(student.date_of_birth)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Blood Group</p>
                            <p className="font-medium mt-1 text-foreground">{student.blood_group || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Attendance</p>
                            <p className="font-medium mt-1 text-foreground">{student.attendance}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Internal Marks</p>
                            <p className="font-medium mt-1 text-foreground">{student.internal_marks}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">External Marks</p>
                            <p className="font-medium mt-1 text-foreground">{student.external_marks}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Confidence</p>
                            <p className="font-medium mt-1 text-foreground">{student.confidence}%</p>
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
