-- Add address and phone columns to students table
ALTER TABLE public.students 
ADD COLUMN phone text,
ADD COLUMN address text;