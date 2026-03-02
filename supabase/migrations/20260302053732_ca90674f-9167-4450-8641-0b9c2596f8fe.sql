
-- Drop overly permissive storage policies
DROP POLICY IF EXISTS "Teachers can upload student photos" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can update student photos" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can delete student photos" ON storage.objects;

-- Recreate with path-based ownership checks
CREATE POLICY "Teachers can upload student photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'student-photos'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.students WHERE teacher_id = auth.uid()
  )
);

CREATE POLICY "Teachers can update student photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'student-photos'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.students WHERE teacher_id = auth.uid()
  )
);

CREATE POLICY "Teachers can delete student photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'student-photos'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.students WHERE teacher_id = auth.uid()
  )
);
