import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, FileText, AlertCircle, CheckCircle2, Download } from "lucide-react";
import { useStudents, NewStudent } from "@/hooks/useStudents";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface ParsedStudent {
  name: string;
  email: string;
  grade: number;
  attendance: number;
  date_of_birth?: string;
  blood_group?: string;
  roll_no?: string;
  internal_marks?: number;
  external_marks?: number;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export function ImportStudentsDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedStudent[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addStudent } = useStudents();

  const resetState = () => {
    setFile(null);
    setParsedData([]);
    setErrors([]);
    setProgress(0);
    setImportResult(null);
  };

  const downloadTemplate = () => {
    const headers = "name,email,grade,attendance,date_of_birth,blood_group,roll_no,internal_marks,external_marks";
    const example = "John Doe,john@example.com,85,92,2005-03-15,A+,R001,42,38";
    const content = `${headers}\n${example}`;
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): string[][] => {
    const lines = text.split("\n").filter(line => line.trim());
    return lines.map(line => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    });
  };

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateDate = (date: string): boolean => {
    if (!date) return true;
    return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date));
  };

  const validateRow = (row: string[], rowIndex: number, headers: string[]): { student: ParsedStudent | null; errors: ValidationError[] } => {
    const rowErrors: ValidationError[] = [];
    const getValue = (field: string): string => {
      const index = headers.indexOf(field);
      return index >= 0 ? (row[index] || "").trim() : "";
    };

    const name = getValue("name");
    const email = getValue("email");
    const gradeStr = getValue("grade");
    const attendanceStr = getValue("attendance");
    const date_of_birth = getValue("date_of_birth");
    const blood_group = getValue("blood_group");
    const roll_no = getValue("roll_no");
    const internal_marks_str = getValue("internal_marks");
    const external_marks_str = getValue("external_marks");

    if (!name) {
      rowErrors.push({ row: rowIndex, field: "name", message: "Name is required" });
    }
    if (!email) {
      rowErrors.push({ row: rowIndex, field: "email", message: "Email is required" });
    } else if (!validateEmail(email)) {
      rowErrors.push({ row: rowIndex, field: "email", message: "Invalid email format" });
    }

    const grade = parseFloat(gradeStr);
    if (isNaN(grade) || grade < 0 || grade > 100) {
      rowErrors.push({ row: rowIndex, field: "grade", message: "Grade must be a number between 0-100" });
    }

    const attendance = parseFloat(attendanceStr);
    if (isNaN(attendance) || attendance < 0 || attendance > 100) {
      rowErrors.push({ row: rowIndex, field: "attendance", message: "Attendance must be a number between 0-100" });
    }

    if (date_of_birth && !validateDate(date_of_birth)) {
      rowErrors.push({ row: rowIndex, field: "date_of_birth", message: "Date must be in YYYY-MM-DD format" });
    }

    const internal_marks = internal_marks_str ? parseFloat(internal_marks_str) : undefined;
    if (internal_marks_str && (isNaN(internal_marks!) || internal_marks! < 0)) {
      rowErrors.push({ row: rowIndex, field: "internal_marks", message: "Internal marks must be a positive number" });
    }

    const external_marks = external_marks_str ? parseFloat(external_marks_str) : undefined;
    if (external_marks_str && (isNaN(external_marks!) || external_marks! < 0)) {
      rowErrors.push({ row: rowIndex, field: "external_marks", message: "External marks must be a positive number" });
    }

    if (rowErrors.length > 0) {
      return { student: null, errors: rowErrors };
    }

    return {
      student: {
        name,
        email,
        grade,
        attendance,
        date_of_birth: date_of_birth || undefined,
        blood_group: blood_group || undefined,
        roll_no: roll_no || undefined,
        internal_marks,
        external_marks,
      },
      errors: [],
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      setErrors([{ row: 0, field: "file", message: "Please select a CSV file" }]);
      return;
    }

    setFile(selectedFile);
    setErrors([]);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = parseCSV(text);
      
      if (rows.length < 2) {
        setErrors([{ row: 0, field: "file", message: "CSV must have a header row and at least one data row" }]);
        return;
      }

      const headers = rows[0].map(h => h.toLowerCase().replace(/\s+/g, "_"));
      const requiredHeaders = ["name", "email", "grade", "attendance"];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        setErrors([{ row: 0, field: "headers", message: `Missing required columns: ${missingHeaders.join(", ")}` }]);
        return;
      }

      const allErrors: ValidationError[] = [];
      const validStudents: ParsedStudent[] = [];

      for (let i = 1; i < rows.length; i++) {
        const { student, errors: rowErrors } = validateRow(rows[i], i + 1, headers);
        allErrors.push(...rowErrors);
        if (student) {
          validStudents.push(student);
        }
      }

      setErrors(allErrors);
      setParsedData(validStudents);
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;

    setImporting(true);
    setProgress(0);
    let success = 0;
    let failed = 0;

    for (let i = 0; i < parsedData.length; i++) {
      try {
        await new Promise<void>((resolve, reject) => {
          addStudent(parsedData[i] as NewStudent, {
            onSuccess: () => {
              success++;
              resolve();
            },
            onError: () => {
              failed++;
              resolve();
            },
          });
        });
      } catch {
        failed++;
      }
      setProgress(Math.round(((i + 1) / parsedData.length) * 100));
    }

    setImporting(false);
    setImportResult({ success, failed });
    
    if (failed === 0) {
      setTimeout(() => {
        setOpen(false);
        resetState();
      }, 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetState();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Students from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk import students. Download the template for the correct format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2">
            <Download className="h-4 w-4" />
            Download Template
          </Button>

          <div
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv"
              className="hidden"
            />
            {file ? (
              <div className="flex items-center justify-center gap-2 text-sm">
                <FileText className="h-5 w-5 text-primary" />
                <span>{file.name}</span>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to select a CSV file or drag and drop
                </p>
              </div>
            )}
          </div>

          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="max-h-32 overflow-y-auto">
                  {errors.slice(0, 5).map((err, i) => (
                    <div key={i} className="text-sm">
                      Row {err.row}: {err.message}
                    </div>
                  ))}
                  {errors.length > 5 && (
                    <div className="text-sm font-medium mt-1">
                      ...and {errors.length - 5} more errors
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {parsedData.length > 0 && errors.length === 0 && !importResult && (
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                {parsedData.length} student{parsedData.length > 1 ? "s" : ""} ready to import
              </AlertDescription>
            </Alert>
          )}

          {importing && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">
                Importing... {progress}%
              </p>
            </div>
          )}

          {importResult && (
            <Alert variant={importResult.failed > 0 ? "destructive" : "default"}>
              <AlertDescription>
                Successfully imported {importResult.success} student{importResult.success !== 1 ? "s" : ""}.
                {importResult.failed > 0 && ` Failed to import ${importResult.failed}.`}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={parsedData.length === 0 || errors.length > 0 || importing}
          >
            {importing ? "Importing..." : `Import ${parsedData.length} Student${parsedData.length !== 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
