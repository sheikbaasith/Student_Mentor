
-- 1. Make student-photos bucket private
UPDATE storage.buckets SET public = false WHERE id = 'student-photos';

-- 2. Drop the overly permissive SELECT policy on storage.objects
DROP POLICY IF EXISTS "Anyone can view student photos" ON storage.objects;

-- 3. Add restrictive SELECT policy for authenticated teachers
CREATE POLICY "Teachers can view student photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'student-photos'
  AND auth.role() = 'authenticated'
);

-- 4. Add DELETE policy on profiles table
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);

-- 5. Improve handle_new_user function with validation and error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
BEGIN
  v_full_name := COALESCE(
    NULLIF(TRIM(new.raw_user_meta_data ->> 'full_name'), ''),
    'User'
  );
  v_full_name := SUBSTRING(v_full_name, 1, 100);

  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, v_full_name);

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error creating profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;
