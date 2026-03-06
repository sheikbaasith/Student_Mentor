import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface Student {
  id: string;
  teacher_id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  father_name: string | null;
  mother_name: string | null;
  grade: number;
  attendance: number;
  prediction: "excelling" | "on-track" | "at-risk";
  confidence: number;
  date_of_birth: string | null;
  blood_group: string | null;
  roll_no: string | null;
  internal_marks: number;
  external_marks: number;
  course_id: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewStudent {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  father_name?: string;
  mother_name?: string;
  grade: number;
  attendance: number;
  date_of_birth?: string;
  blood_group?: string;
  roll_no?: string;
  internal_marks?: number;
  external_marks?: number;
  course_id?: string;
  prediction?: "excelling" | "on-track" | "at-risk";
  confidence?: number;
}

export function useStudents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const studentsQuery = useQuery({
    queryKey: ["students", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("teacher_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Student[];
    },
    enabled: !!user,
  });

  const addStudentMutation = useMutation({
    mutationFn: async (student: NewStudent) => {
      if (!user) throw new Error("Not authenticated");
      
      // Simple prediction logic based on grade and attendance
      let prediction: "excelling" | "on-track" | "at-risk" = "on-track";
      let confidence = 75;

      if (student.grade >= 85 && student.attendance >= 90) {
        prediction = "excelling";
        confidence = 90 + Math.floor(Math.random() * 10);
      } else if (student.grade < 60 || student.attendance < 70) {
        prediction = "at-risk";
        confidence = 85 + Math.floor(Math.random() * 15);
      } else {
        confidence = 70 + Math.floor(Math.random() * 20);
      }

      const { data, error } = await supabase
        .from("students")
        .insert({
          teacher_id: user.id,
          name: student.name,
          email: student.email,
          phone: student.phone || null,
          address: student.address || null,
          father_name: student.father_name || null,
          mother_name: student.mother_name || null,
          grade: student.grade,
          attendance: student.attendance,
          date_of_birth: student.date_of_birth || null,
          blood_group: student.blood_group || null,
          roll_no: student.roll_no || null,
          internal_marks: student.internal_marks || 0,
          external_marks: student.external_marks || 0,
          prediction,
          confidence,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast({
        title: "Student added",
        description: "The student has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateStudentMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Student> & { id: string }) => {
      const { data, error } = await supabase
        .from("students")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast({
        title: "Student updated",
        description: "The student has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast({
        title: "Student deleted",
        description: "The student has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    students: studentsQuery.data ?? [],
    isLoading: studentsQuery.isLoading,
    error: studentsQuery.error,
    addStudent: addStudentMutation.mutate,
    updateStudent: updateStudentMutation.mutate,
    deleteStudent: deleteStudentMutation.mutate,
    isAdding: addStudentMutation.isPending,
    isUpdating: updateStudentMutation.isPending,
    isDeleting: deleteStudentMutation.isPending,
  };
}
