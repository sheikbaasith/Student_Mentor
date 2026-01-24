-- Add photo_url column to students table
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Create storage bucket for student photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('student-photos', 'student-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their students' photos
CREATE POLICY "Teachers can upload student photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'student-photos' 
  AND auth.uid() IS NOT NULL
);

-- Allow public read access to student photos
CREATE POLICY "Anyone can view student photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'student-photos');

-- Allow teachers to update their student photos
CREATE POLICY "Teachers can update student photos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'student-photos' AND auth.uid() IS NOT NULL);

-- Allow teachers to delete their student photos
CREATE POLICY "Teachers can delete student photos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'student-photos' AND auth.uid() IS NOT NULL);