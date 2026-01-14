import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useCourses } from "@/hooks/useCourses";
import { useStudents, Student } from "@/hooks/useStudents";
import { BookOpen, Loader2 } from "lucide-react";

interface AssignCourseDialogProps {
  student: Student;
  trigger?: React.ReactNode;
}

export function AssignCourseDialog({ student, trigger }: AssignCourseDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(student.course_id || "");
  const { courses, isLoading: coursesLoading } = useCourses();
  const { updateStudent, isUpdating } = useStudents();

  const handleAssign = () => {
    const courseIdToAssign = selectedCourseId === "none" || selectedCourseId === "" 
      ? null 
      : selectedCourseId;
    
    updateStudent(
      { 
        id: student.id, 
        course_id: courseIdToAssign 
      },
      {
        onSuccess: () => {
          setOpen(false);
        },
      }
    );
  };

  const currentCourse = courses.find((c) => c.id === student.course_id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <BookOpen className="h-4 w-4" />
            {currentCourse ? currentCourse.name : "Assign Course"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Course</DialogTitle>
          <DialogDescription>
            Assign {student.name} to a course
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="course">Select Course</Label>
            {coursesLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading courses...
              </div>
            ) : courses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No courses available. Create a course first.
              </p>
            ) : (
              <Select
                value={selectedCourseId}
                onValueChange={setSelectedCourseId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Course</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name} ({course.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {currentCourse && (
            <div className="text-sm text-muted-foreground">
              Currently assigned to: <span className="font-medium">{currentCourse.name}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssign} 
            disabled={isUpdating || courses.length === 0}
          >
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {selectedCourseId === "none" ? "Remove Assignment" : "Assign"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
