-- ============================================================
-- Migration: Add parent_id for hierarchical task nesting
-- Sprint 6 — Subtasks
-- ============================================================

-- Add parent_id column for hierarchical tasks (one level deep in MVP).
-- ON DELETE CASCADE means deleting a parent deletes all its subtasks.
ALTER TABLE public.tasks
  ADD COLUMN parent_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE;

-- Partial index: only index rows that actually have a parent.
-- getTasks() filters WHERE parent_id IS NULL so top-level tasks are fast.
CREATE INDEX idx_tasks_parent ON public.tasks (parent_id)
  WHERE parent_id IS NOT NULL;

COMMENT ON COLUMN public.tasks.parent_id IS
  'Foreign key to the parent task. NULL = top-level task. One level of nesting supported in MVP.';
