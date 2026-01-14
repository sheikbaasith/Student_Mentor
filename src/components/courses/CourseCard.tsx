import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Users, Clock, MoreVertical, Edit, Trash2, UserPlus } from "lucide-react";
import { Course, useCourses } from "@/hooks/useCourses";
import { useStudents } from "@/hooks/useStudents";
import { cn } from "@/lib/utils";
import { EditCourseDialog } from "./EditCourseDialog";
import { CourseStudentsDialog } from "./CourseStudentsDialog";

interface CourseCardProps {
  course: Course;
}

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  upcoming: "bg-accent/10 text-accent border-accent/20",
  completed: "bg-muted text-muted-foreground",
  archived: "bg-muted/50 text-muted-foreground",
};

export function CourseCard({ course }: CourseCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { deleteCourse, isDeleting } = useCourses();
  const { students } = useStudents();

  // Count students enrolled in this course
  const enrolledStudents = students.filter((s) => s.course_id === course.id).length;

  const handleDelete = () => {
    deleteCourse(course.id);
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Card className="card-shadow hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg leading-tight">{course.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{course.code}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn("capitalize", statusStyles[course.status] || "")}
              >
                {course.status}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteDialogOpen(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {course.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {course.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-sm">
                  {enrolledStudents}/{course.max_students}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{course.duration}</span>
              </div>
            </div>
            <CourseStudentsDialog 
              course={course}
              trigger={
                <Button variant="outline" size="sm" className="gap-1">
                  <UserPlus className="h-4 w-4" />
                  Manage
                </Button>
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <EditCourseDialog
        course={course}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{course.name}"? This action cannot
              be undone. Students enrolled in this course will be unassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
