import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Student, useStudents } from "@/hooks/useStudents";
import { useCourses } from "@/hooks/useCourses";
import { Loader2, User, GraduationCap, FileText, Camera } from "lucide-react";
import { StudentPhotoUpload } from "./StudentPhotoUpload";
import { useQueryClient } from "@tanstack/react-query";

interface EditStudentDialogProps {
  student: Student;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function EditStudentDialog({ student, open, onOpenChange }: EditStudentDialogProps) {
  const { updateStudent, isUpdating } = useStudents();
  const { courses } = useCourses();
  const queryClient = useQueryClient();
  // Personal details
  const [name, setName] = useState(student.name);
  const [email, setEmail] = useState(student.email);
  const [phone, setPhone] = useState(student.phone || "");
  const [address, setAddress] = useState(student.address || "");
  const [rollNo, setRollNo] = useState(student.roll_no || "");
  const [dateOfBirth, setDateOfBirth] = useState(student.date_of_birth || "");
  const [bloodGroup, setBloodGroup] = useState(student.blood_group || "");

  // Academic details
  const [grade, setGrade] = useState(student.grade.toString());
  const [attendance, setAttendance] = useState(student.attendance.toString());
  const [internalMarks, setInternalMarks] = useState(student.internal_marks.toString());
  const [externalMarks, setExternalMarks] = useState(student.external_marks.toString());

  // Course assignment
  const [courseId, setCourseId] = useState(student.course_id || "none");

  // Reset form when student changes
  useEffect(() => {
    setName(student.name);
    setEmail(student.email);
    setPhone(student.phone || "");
    setAddress(student.address || "");
    setRollNo(student.roll_no || "");
    setDateOfBirth(student.date_of_birth || "");
    setBloodGroup(student.blood_group || "");
    setGrade(student.grade.toString());
    setAttendance(student.attendance.toString());
    setInternalMarks(student.internal_marks.toString());
    setExternalMarks(student.external_marks.toString());
    setCourseId(student.course_id || "none");
  }, [student]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const gradeNum = parseFloat(grade);
    const attendanceNum = parseFloat(attendance);
    
    // Calculate prediction based on grade and attendance
    let prediction: "excelling" | "on-track" | "at-risk" = "on-track";
    let confidence = 75;

    if (gradeNum >= 85 && attendanceNum >= 90) {
      prediction = "excelling";
      confidence = 90 + Math.floor(Math.random() * 10);
    } else if (gradeNum < 60 || attendanceNum < 70) {
      prediction = "at-risk";
      confidence = 85 + Math.floor(Math.random() * 15);
    } else {
      confidence = 70 + Math.floor(Math.random() * 20);
    }

    updateStudent(
      {
        id: student.id,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        address: address.trim() || null,
        roll_no: rollNo.trim() || null,
        date_of_birth: dateOfBirth || null,
        blood_group: bloodGroup || null,
        grade: gradeNum,
        attendance: attendanceNum,
        internal_marks: parseFloat(internalMarks) || 0,
        external_marks: parseFloat(externalMarks) || 0,
        course_id: courseId === "none" ? null : courseId,
        prediction,
        confidence,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const isValid = name.trim() && email.trim() && grade && attendance;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
          <DialogDescription>
            Update student information and academic records
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal" className="gap-1">
                <User className="h-3 w-3" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="photo" className="gap-1">
                <Camera className="h-3 w-3" />
                Photo
              </TabsTrigger>
              <TabsTrigger value="academic" className="gap-1">
                <FileText className="h-3 w-3" />
                Academic
              </TabsTrigger>
              <TabsTrigger value="course" className="gap-1">
                <GraduationCap className="h-3 w-3" />
                Course
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  maxLength={100}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  maxLength={255}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 234 567 890"
                    maxLength={20}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rollNo">Roll Number</Label>
                  <Input
                    id="rollNo"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    placeholder="e.g., STU001"
                    maxLength={20}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Select value={bloodGroup} onValueChange={setBloodGroup}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodGroups.map((bg) => (
                        <SelectItem key={bg} value={bg}>
                          {bg}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, City, Country"
                  maxLength={255}
                />
              </div>
            </TabsContent>

            <TabsContent value="photo" className="space-y-4 mt-4">
              <div className="flex flex-col items-center justify-center py-6 space-y-4">
                <StudentPhotoUpload
                  studentId={student.id}
                  studentName={student.name}
                  currentPhotoUrl={student.photo_url}
                  onPhotoUpdated={() => {
                    queryClient.invalidateQueries({ queryKey: ["students"] });
                  }}
                  size="lg"
                />
                <div className="text-center">
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Click the photo to upload or change
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="academic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grade">Current Grade (%) *</Label>
                  <Input
                    id="grade"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="0-100"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attendance">Attendance (%) *</Label>
                  <Input
                    id="attendance"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={attendance}
                    onChange={(e) => setAttendance(e.target.value)}
                    placeholder="0-100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="internal">Internal Marks</Label>
                  <Input
                    id="internal"
                    type="number"
                    min="0"
                    max="100"
                    value={internalMarks}
                    onChange={(e) => setInternalMarks(e.target.value)}
                    placeholder="0-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="external">External Marks</Label>
                  <Input
                    id="external"
                    type="number"
                    min="0"
                    max="100"
                    value={externalMarks}
                    onChange={(e) => setExternalMarks(e.target.value)}
                    placeholder="0-100"
                  />
                </div>
              </div>

              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> AI prediction will be automatically recalculated based on grade and attendance.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="course" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="course">Assigned Course</Label>
                {courses.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">
                    No courses available. Create a course first.
                  </p>
                ) : (
                  <Select value={courseId} onValueChange={setCourseId}>
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

              {courseId !== "none" && courses.find((c) => c.id === courseId) && (
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <p className="text-sm font-medium">
                    {courses.find((c) => c.id === courseId)?.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {courses.find((c) => c.id === courseId)?.description || "No description"}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
