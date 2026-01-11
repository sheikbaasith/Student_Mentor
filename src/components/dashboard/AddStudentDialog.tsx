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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { useStudents, NewStudent } from "@/hooks/useStudents";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function AddStudentDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<NewStudent>({
    name: "",
    email: "",
    grade: 0,
    attendance: 0,
    date_of_birth: "",
    blood_group: "",
    roll_no: "",
    internal_marks: 0,
    external_marks: 0,
  });
  const { addStudent, isAdding } = useStudents();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addStudent(formData, {
      onSuccess: () => {
        setOpen(false);
        setFormData({
          name: "",
          email: "",
          grade: 0,
          attendance: 0,
          date_of_birth: "",
          blood_group: "",
          roll_no: "",
          internal_marks: 0,
          external_marks: 0,
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-primary text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Enter the student's information. The AI will automatically generate a prediction.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roll_no">Roll Number</Label>
              <Input
                id="roll_no"
                placeholder="STU001"
                value={formData.roll_no || ""}
                onChange={(e) => setFormData({ ...formData, roll_no: e.target.value })}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@university.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={formData.date_of_birth || ""}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blood_group">Blood Group</Label>
              <Select
                value={formData.blood_group || ""}
                onValueChange={(value) => setFormData({ ...formData, blood_group: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  {bloodGroups.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grade">Current Grade (%)</Label>
              <Input
                id="grade"
                type="number"
                min="0"
                max="100"
                placeholder="75"
                value={formData.grade || ""}
                onChange={(e) =>
                  setFormData({ ...formData, grade: Number(e.target.value) })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attendance">Attendance (%)</Label>
              <Input
                id="attendance"
                type="number"
                min="0"
                max="100"
                placeholder="85"
                value={formData.attendance || ""}
                onChange={(e) =>
                  setFormData({ ...formData, attendance: Number(e.target.value) })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="internal_marks">Internal Marks</Label>
              <Input
                id="internal_marks"
                type="number"
                min="0"
                placeholder="40"
                value={formData.internal_marks || ""}
                onChange={(e) =>
                  setFormData({ ...formData, internal_marks: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="external_marks">External Marks</Label>
              <Input
                id="external_marks"
                type="number"
                min="0"
                placeholder="60"
                value={formData.external_marks || ""}
                onChange={(e) =>
                  setFormData({ ...formData, external_marks: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isAdding} className="gradient-primary text-primary-foreground">
              {isAdding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Student"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
