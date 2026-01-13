-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  duration TEXT DEFAULT '16 weeks',
  status TEXT NOT NULL DEFAULT 'active',
  max_students INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Teachers can view their own courses" 
ON public.courses 
FOR SELECT 
USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create courses" 
ON public.courses 
FOR INSERT 
WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own courses" 
ON public.courses 
FOR UPDATE 
USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own courses" 
ON public.courses 
FOR DELETE 
USING (auth.uid() = teacher_id);

-- Add trigger for updated_at
CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add course_id to students table for course assignment
ALTER TABLE public.students ADD COLUMN course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL;