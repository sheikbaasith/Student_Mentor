import { useState, useMemo } from "react";
import { Check, Search, X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Student } from "@/hooks/useStudents";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface StudentSelectorProps {
  students: Student[];
  selectedStudents: Student[];
  onSelectionChange: (students: Student[]) => void;
  maxSelection?: number;
}

export function StudentSelector({
  students,
  selectedStudents,
  onSelectionChange,
  maxSelection = 5,
}: StudentSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredStudents = useMemo(() => {
    if (!search) return students;
    const searchLower = search.toLowerCase();
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower) ||
        student.roll_no?.toLowerCase().includes(searchLower)
    );
  }, [students, search]);

  const toggleStudent = (student: Student) => {
    const isSelected = selectedStudents.some((s) => s.id === student.id);
    if (isSelected) {
      onSelectionChange(selectedStudents.filter((s) => s.id !== student.id));
    } else if (selectedStudents.length < maxSelection) {
      onSelectionChange([...selectedStudents, student]);
    }
  };

  const removeStudent = (studentId: string) => {
    onSelectionChange(selectedStudents.filter((s) => s.id !== studentId));
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              Select Students
              {selectedStudents.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {selectedStudents.length}/{maxSelection}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <ScrollArea className="h-[300px]">
              {filteredStudents.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No students found
                </div>
              ) : (
                <div className="p-2">
                  {filteredStudents.map((student) => {
                    const isSelected = selectedStudents.some((s) => s.id === student.id);
                    const isDisabled = !isSelected && selectedStudents.length >= maxSelection;

                    return (
                      <button
                        key={student.id}
                        onClick={() => toggleStudent(student)}
                        disabled={isDisabled}
                        className={cn(
                          "w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left",
                          isSelected
                            ? "bg-primary/10 text-primary"
                            : isDisabled
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-muted"
                        )}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={student.photo_url || undefined} alt={student.name} />
                          <AvatarFallback className="text-xs">
                            {student.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{student.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {student.roll_no || student.email}
                          </p>
                        </div>
                        {isSelected && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
            {selectedStudents.length > 0 && (
              <div className="p-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="w-full text-muted-foreground"
                >
                  Clear all
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        <AnimatePresence mode="popLayout">
          {selectedStudents.map((student) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <Badge
                variant="secondary"
                className="gap-1 pl-1.5 pr-1 py-1"
              >
                <Avatar className="h-5 w-5">
                  <AvatarImage src={student.photo_url || undefined} alt={student.name} />
                  <AvatarFallback className="text-[10px]">
                    {student.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate max-w-[100px]">{student.name}</span>
                <button
                  onClick={() => removeStudent(student.id)}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {selectedStudents.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Select up to {maxSelection} students to compare their performance side by side
        </p>
      )}
    </div>
  );
}
