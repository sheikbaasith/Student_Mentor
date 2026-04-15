-- Tighten the SELECT policy on student-photos to only allow teachers to view their own students' photos
DROP POLICY IF EXISTS "Teachers can view student photos" ON storage.objects;

CREATE POLICY "Teachers can view their own student photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'student-photos'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.students WHERE teacher_id = auth.uid()
  )
);