import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface StudentSession {
  id: string;
  name: string;
  email: string;
  roll_no: string;
  grade: number;
  attendance: number;
  prediction: string;
  confidence: number;
  course_id: string | null;
  phone: string | null;
  photo_url: string | null;
  date_of_birth: string | null;
  blood_group: string | null;
  father_name: string | null;
  mother_name: string | null;
  address: string | null;
  internal_marks: number | null;
  external_marks: number | null;
  courses?: { name: string; code: string } | null;
}

interface StudentAuthContextType {
  student: StudentSession | null;
  setStudent: (student: StudentSession | null) => void;
  studentLogout: () => void;
  isStudentLoggedIn: boolean;
}

const StudentAuthContext = createContext<StudentAuthContextType | undefined>(undefined);

const STORAGE_KEY = "edutrack_student_session";

export function StudentAuthProvider({ children }: { children: ReactNode }) {
  const [student, setStudentState] = useState<StudentSession | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setStudentState(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const setStudent = (s: StudentSession | null) => {
    setStudentState(s);
    if (s) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const studentLogout = () => {
    setStudentState(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <StudentAuthContext.Provider value={{ student, setStudent, studentLogout, isStudentLoggedIn: !!student }}>
      {children}
    </StudentAuthContext.Provider>
  );
}

export function useStudentAuth() {
  const ctx = useContext(StudentAuthContext);
  if (!ctx) throw new Error("useStudentAuth must be used within StudentAuthProvider");
  return ctx;
}
