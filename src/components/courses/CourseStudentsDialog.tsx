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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useStudents, Student } from "@/hooks/useStudents";
import { Course } from "@/hooks/useCourses";
import { Users, Loader2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CourseStudentsDialogProps {
  course: Course;
  trigger?: React.ReactNode;
}

export function CourseStudentsDialog({ course, trigger }: CourseStudentsDialogProps) {
  const [open, setOpen] = useState(false);
  const { students, updateStudent, isUpdating } = useStudents();
  const { toast } = useToast();
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [isAssigning, setIsAssigning] = useState(false);

  // Students currently in this course
  const enrolledStudents = students.filter((s) => s.course_id === course.id);
  // Students not in any course or in a different course
  const availableStudents = students.filter((s) => s.course_id !== course.id);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const toggleStudent = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleAssignSelected = async () => {
    if (selectedStudents.size === 0) return;
    
    setIsAssigning(true);
    try {
      const promises = Array.from(selectedStudents).map((studentId) =>
        new Promise<void>((resolve, reject) => {
          updateStudent(
            { id: studentId, course_id: course.id },
            {
              onSuccess: () => resolve(),
              onError: (error) => reject(error),
            }
          );
        })
      );
      
      await Promise.all(promises);
      setSelectedStudents(new Set());
      toast({
        title: "Students assigned",
        description: `${selectedStudents.size} student(s) have been assigned to ${course.name}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign some students.",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveFromCourse = (student: Student) => {
    updateStudent({ id: student.id, course_id: null });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Users className="h-4 w-4" />
            Manage Students
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Manage Course Students</DialogTitle>
          <DialogDescription>
            {course.name} ({course.code}) - {enrolledStudents.length} enrolled
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Enrolled Students */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Enrolled Students ({enrolledStudents.length})
            </h4>
            {enrolledStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No students enrolled in this course yet.
              </p>
            ) : (
              <ScrollArea className="h-[150px] rounded-md border p-2">
                <div className="space-y-2">
                  {enrolledStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials(student.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFromCourse(student)}
                        disabled={isUpdating}
                        className="text-danger hover:text-danger"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Available Students to Add */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add Students ({availableStudents.length} available)
            </h4>
            {availableStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                All students are already enrolled in this course.
              </p>
            ) : (
              <>
                <ScrollArea className="h-[200px] rounded-md border p-2">
                  <div className="space-y-1">
                    {availableStudents.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => toggleStudent(student.id)}
                      >
                        <Checkbox
                          checked={selectedStudents.has(student.id)}
                          onCheckedChange={() => toggleStudent(student.id)}
                        />
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                            {getInitials(student.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {student.email}
                            {student.course_id && " • Currently in another course"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                {selectedStudents.size > 0 && (
                  <Button
                    onClick={handleAssignSelected}
                    disabled={isAssigning}
                    className="w-full"
                  >
                    {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Assign {selectedStudents.size} Student(s)
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
