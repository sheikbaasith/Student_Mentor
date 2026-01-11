-- Add personal details columns to students table
ALTER TABLE public.students
ADD COLUMN date_of_birth date,
ADD COLUMN blood_group text,
ADD COLUMN roll_no text,
ADD COLUMN internal_marks numeric DEFAULT 0,
ADD COLUMN external_marks numeric DEFAULT 0;