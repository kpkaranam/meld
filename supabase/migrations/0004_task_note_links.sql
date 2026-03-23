-- Link table for task-note relationships
CREATE TABLE public.task_note_links (
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  note_id uuid NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (task_id, note_id)
);

CREATE INDEX idx_task_note_links_note ON public.task_note_links (note_id);

-- RLS
ALTER TABLE public.task_note_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own task_note_links"
  ON public.task_note_links FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_note_links.task_id AND tasks.user_id = auth.uid())
  );

CREATE POLICY "Users can create own task_note_links"
  ON public.task_note_links FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_note_links.task_id AND tasks.user_id = auth.uid())
  );

CREATE POLICY "Users can delete own task_note_links"
  ON public.task_note_links FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_note_links.task_id AND tasks.user_id = auth.uid())
  );
