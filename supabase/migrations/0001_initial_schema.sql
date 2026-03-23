-- ============================================================
-- Meld Database Schema
-- Run in Supabase SQL Editor in this exact order
-- ============================================================

-- -----------------------------------------------
-- 1. PROFILES TABLE (extends auth.users)
-- -----------------------------------------------

CREATE TABLE public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url  text,
  theme       text NOT NULL DEFAULT 'system'
              CHECK (theme IN ('light', 'dark', 'system')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'User profile preferences, 1:1 with auth.users';

-- -----------------------------------------------
-- 2. PROJECTS TABLE
-- -----------------------------------------------

CREATE TABLE public.projects (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  color       text NOT NULL DEFAULT '#6366f1'
              CHECK (color ~ '^#[0-9a-fA-F]{6}$'),
  is_archived boolean NOT NULL DEFAULT false,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_user_archived ON public.projects (user_id, is_archived);
CREATE INDEX idx_projects_user_sort ON public.projects (user_id, sort_order);

COMMENT ON TABLE public.projects IS 'User projects for organizing tasks and notes';

-- -----------------------------------------------
-- 3. TASKS TABLE
-- -----------------------------------------------

CREATE TABLE public.tasks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id   uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  title        text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 500),
  description  text DEFAULT '',
  status       text NOT NULL DEFAULT 'todo'
               CHECK (status IN ('todo', 'done')),
  priority     text NOT NULL DEFAULT 'none'
               CHECK (priority IN ('none', 'low', 'medium', 'high')),
  due_date     date,
  completed_at timestamptz,
  sort_order   integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tasks_user_project ON public.tasks (user_id, project_id);
CREATE INDEX idx_tasks_user_status ON public.tasks (user_id, status);
CREATE INDEX idx_tasks_user_due ON public.tasks (user_id, due_date)
  WHERE due_date IS NOT NULL;
CREATE INDEX idx_tasks_user_priority ON public.tasks (user_id, priority);

-- Full-text search index
ALTER TABLE public.tasks
  ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
  ) STORED;

CREATE INDEX idx_tasks_search ON public.tasks USING GIN (search_vector);

COMMENT ON TABLE public.tasks IS 'User tasks with priority, due dates, and project assignment';

-- -----------------------------------------------
-- 4. NOTES TABLE
-- -----------------------------------------------

CREATE TABLE public.notes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id      uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  title           text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 500),
  content         jsonb DEFAULT '{}',
  content_plain   text NOT NULL DEFAULT '',
  is_pinned       boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notes_user_project ON public.notes (user_id, project_id);
CREATE INDEX idx_notes_user_pinned ON public.notes (user_id, is_pinned)
  WHERE is_pinned = true;

-- Full-text search index
ALTER TABLE public.notes
  ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content_plain, ''))
  ) STORED;

CREATE INDEX idx_notes_search ON public.notes USING GIN (search_vector);

COMMENT ON TABLE public.notes IS 'User notes with TipTap JSON content and plaintext mirror for search';
COMMENT ON COLUMN public.notes.content IS 'TipTap JSON document stored as jsonb';
COMMENT ON COLUMN public.notes.content_plain IS 'Plaintext extraction of content for full-text search';

-- -----------------------------------------------
-- 5. TAGS TABLE
-- -----------------------------------------------

CREATE TABLE public.tags (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name     text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 50),
  color    text DEFAULT '#6b7280'
           CHECK (color ~ '^#[0-9a-fA-F]{6}$'),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Case-insensitive unique constraint (resolves OQ-05: tags are NOT case-sensitive)
CREATE UNIQUE INDEX idx_tags_user_name_unique
  ON public.tags (user_id, lower(name));

CREATE INDEX idx_tags_user ON public.tags (user_id);

COMMENT ON TABLE public.tags IS 'User-scoped tags shared across tasks and notes';

-- -----------------------------------------------
-- 6. JOIN TABLE: task_tags
-- -----------------------------------------------

CREATE TABLE public.task_tags (
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  tag_id  uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);

CREATE INDEX idx_task_tags_tag ON public.task_tags (tag_id);

-- -----------------------------------------------
-- 7. JOIN TABLE: note_tags
-- -----------------------------------------------

CREATE TABLE public.note_tags (
  note_id uuid NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  tag_id  uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);

CREATE INDEX idx_note_tags_tag ON public.note_tags (tag_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- -----------------------------------------------
-- updated_at trigger function (shared)
-- -----------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------
-- Auto-create profile on user signup
-- -----------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- -----------------------------------------------
-- Enable RLS on all tables
-- -----------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_tags ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------
-- PROFILES
-- -----------------------------------------------

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- INSERT is handled by trigger, not by client
-- DELETE is not allowed (profile lives as long as auth.users row)

-- -----------------------------------------------
-- PROJECTS
-- -----------------------------------------------

CREATE POLICY "Users can view own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------
-- TASKS
-- -----------------------------------------------

CREATE POLICY "Users can view own tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON public.tasks FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------
-- NOTES
-- -----------------------------------------------

CREATE POLICY "Users can view own notes"
  ON public.notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notes"
  ON public.notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON public.notes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON public.notes FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------
-- TAGS
-- -----------------------------------------------

CREATE POLICY "Users can view own tags"
  ON public.tags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tags"
  ON public.tags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags"
  ON public.tags FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags"
  ON public.tags FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------
-- TASK_TAGS (access via task ownership)
-- -----------------------------------------------

CREATE POLICY "Users can view own task_tags"
  ON public.task_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks
      WHERE tasks.id = task_tags.task_id
        AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own task_tags"
  ON public.task_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks
      WHERE tasks.id = task_tags.task_id
        AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own task_tags"
  ON public.task_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks
      WHERE tasks.id = task_tags.task_id
        AND tasks.user_id = auth.uid()
    )
  );

-- -----------------------------------------------
-- NOTE_TAGS (access via note ownership)
-- -----------------------------------------------

CREATE POLICY "Users can view own note_tags"
  ON public.note_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.notes
      WHERE notes.id = note_tags.note_id
        AND notes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own note_tags"
  ON public.note_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.notes
      WHERE notes.id = note_tags.note_id
        AND notes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own note_tags"
  ON public.note_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.notes
      WHERE notes.id = note_tags.note_id
        AND notes.user_id = auth.uid()
    )
  );

-- ============================================================
-- FULL-TEXT SEARCH RPC FUNCTIONS
-- ============================================================

-- -----------------------------------------------
-- Unified search across tasks and notes
-- -----------------------------------------------

CREATE OR REPLACE FUNCTION public.search_items(
  query text,
  item_type text DEFAULT 'all',  -- 'all' | 'tasks' | 'notes'
  max_results integer DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  type text,
  title text,
  snippet text,
  project_id uuid,
  rank real,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tsquery_val tsquery;
BEGIN
  -- Convert plain text query to tsquery with prefix matching
  tsquery_val := plainto_tsquery('english', query);

  -- If the query is empty, return nothing
  IF tsquery_val IS NULL OR query = '' THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH results AS (
    -- Tasks
    SELECT
      t.id,
      'task'::text AS type,
      t.title,
      ts_headline('english', t.title || ' ' || coalesce(t.description, ''),
        tsquery_val, 'MaxWords=50, MinWords=20, StartSel=<mark>, StopSel=</mark>'
      ) AS snippet,
      t.project_id,
      ts_rank(t.search_vector, tsquery_val) AS rank,
      t.created_at,
      t.updated_at
    FROM public.tasks t
    WHERE t.user_id = auth.uid()
      AND t.search_vector @@ tsquery_val
      AND (item_type = 'all' OR item_type = 'tasks')

    UNION ALL

    -- Notes
    SELECT
      n.id,
      'note'::text AS type,
      n.title,
      ts_headline('english', n.title || ' ' || coalesce(n.content_plain, ''),
        tsquery_val, 'MaxWords=50, MinWords=20, StartSel=<mark>, StopSel=</mark>'
      ) AS snippet,
      n.project_id,
      ts_rank(n.search_vector, tsquery_val) AS rank,
      n.created_at,
      n.updated_at
    FROM public.notes n
    WHERE n.user_id = auth.uid()
      AND n.search_vector @@ tsquery_val
      AND (item_type = 'all' OR item_type = 'notes')
  )
  SELECT * FROM results
  ORDER BY rank DESC
  LIMIT max_results;
END;
$$;
