-- -----------------------------------------------
-- Development seed data
-- Run AFTER a test user is created via Supabase Auth
--
-- IMPORTANT: Replace the placeholder UUID below with the actual
-- user UUID from your Supabase project's Authentication > Users table.
-- Placeholder: '00000000-0000-0000-0000-000000000000'
-- -----------------------------------------------

DO $$
DECLARE
  uid uuid := '00000000-0000-0000-0000-000000000000';
  proj_work uuid;
  proj_personal uuid;
  tag_urgent uuid;
  tag_reference uuid;
BEGIN
  -- Projects
  INSERT INTO public.projects (id, user_id, name, color, sort_order)
  VALUES
    (gen_random_uuid(), uid, 'Work', '#ef4444', 0)
  RETURNING id INTO proj_work;

  INSERT INTO public.projects (id, user_id, name, color, sort_order)
  VALUES
    (gen_random_uuid(), uid, 'Personal', '#3b82f6', 1)
  RETURNING id INTO proj_personal;

  -- Tags
  INSERT INTO public.tags (id, user_id, name, color)
  VALUES
    (gen_random_uuid(), uid, 'urgent', '#ef4444')
  RETURNING id INTO tag_urgent;

  INSERT INTO public.tags (id, user_id, name, color)
  VALUES
    (gen_random_uuid(), uid, 'reference', '#8b5cf6')
  RETURNING id INTO tag_reference;

  -- Tasks (mix of inbox and project-assigned)
  INSERT INTO public.tasks (user_id, project_id, title, description, priority, due_date, sort_order)
  VALUES
    (uid, NULL,          'Triage inbox items',       'Go through inbox and assign to projects', 'medium', CURRENT_DATE, 0),
    (uid, proj_work,     'Review pull request #42',  'Check the API changes',                   'high',   CURRENT_DATE, 0),
    (uid, proj_work,     'Update deployment docs',   '',                                        'low',    CURRENT_DATE + 3, 1),
    (uid, proj_personal, 'Buy groceries',            'Milk, eggs, bread',                       'none',   CURRENT_DATE + 1, 0),
    (uid, proj_personal, 'Schedule dentist',         '',                                        'medium', CURRENT_DATE + 7, 1);

  -- Notes
  INSERT INTO public.notes (user_id, project_id, title, content, content_plain, is_pinned)
  VALUES
    (uid, NULL, 'Quick ideas',
     '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Some rough ideas to explore later."}]}]}',
     'Some rough ideas to explore later.',
     false),
    (uid, proj_work, 'Meeting notes - Sprint Review',
     '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Sprint Review"}]},{"type":"paragraph","content":[{"type":"text","text":"Discussed the new feature rollout and timeline."}]}]}',
     'Sprint Review Discussed the new feature rollout and timeline.',
     true);
END $$;
