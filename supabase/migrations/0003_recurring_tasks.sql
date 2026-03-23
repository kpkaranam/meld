-- ============================================================
-- Migration: Add recurrence fields to tasks
-- Sprint 7 — Recurring Tasks
-- ============================================================

-- recurrence_rule stores a simple pattern: 'daily', 'weekly', 'monthly', 'weekdays', or null
-- recurrence_next stores the next occurrence date after completion
ALTER TABLE public.tasks
  ADD COLUMN recurrence_rule text DEFAULT NULL
    CHECK (recurrence_rule IN ('daily', 'weekly', 'monthly', 'weekdays')),
  ADD COLUMN recurrence_next date DEFAULT NULL;

-- Partial index: only index rows that have a recurrence rule set.
-- Used for querying upcoming recurring tasks.
CREATE INDEX idx_tasks_recurrence ON public.tasks (recurrence_next)
  WHERE recurrence_rule IS NOT NULL;

COMMENT ON COLUMN public.tasks.recurrence_rule IS
  'Recurrence pattern: daily, weekly, monthly, weekdays. NULL = non-recurring task.';

COMMENT ON COLUMN public.tasks.recurrence_next IS
  'The next scheduled occurrence date. Set when a recurring task is completed.';
