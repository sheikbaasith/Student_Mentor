CREATE TABLE IF NOT EXISTS public.notification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  course_name TEXT,
  current_grade NUMERIC NOT NULL DEFAULT 0,
  risk_status TEXT NOT NULL,
  channels TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  email_sent BOOLEAN NOT NULL DEFAULT FALSE,
  sms_sent BOOLEAN NOT NULL DEFAULT FALSE,
  custom_message TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers can view their own notification history" ON public.notification_history;
CREATE POLICY "Teachers can view their own notification history"
ON public.notification_history
FOR SELECT
USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers can insert their own notification history" ON public.notification_history;
CREATE POLICY "Teachers can insert their own notification history"
ON public.notification_history
FOR INSERT
WITH CHECK (auth.uid() = teacher_id);

CREATE INDEX IF NOT EXISTS idx_notification_history_teacher_sent_at
ON public.notification_history (teacher_id, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_history_student
ON public.notification_history (student_id);