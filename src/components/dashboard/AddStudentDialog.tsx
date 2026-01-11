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
import { Plus, Loader2 } from "lucide-react";
import { useStudents, NewStudent } from "@/hooks/useStudents";

export function AddStudentDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<NewStudent>({
    name: "",
    email: "",
    grade: 0,
    attendance: 0,
  });
  const { addStudent, isAdding } = useStudents();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addStudent(formData, {
      onSuccess: () => {
        setOpen(false);
        setFormData({ name: "", email: "", grade: 0, attendance: 0 });
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Enter the student's information. The AI will automatically generate a prediction.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
