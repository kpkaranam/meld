/**
 * Import service — parse and persist data from external sources.
 *
 * Supported formats:
 *   - Todoist CSV export (TYPE, CONTENT, DESCRIPTION, PRIORITY, DATE, STATUS columns)
 *   - Generic Meld JSON export ({ tasks, notes, projects })
 *
 * All functions throw on fatal errors (e.g. not authenticated, unparseable
 * content). Per-row failures are accumulated in ImportResult.errors instead
 * of aborting the whole import.
 */

import { supabase } from '../lib/supabase';

export interface ImportResult {
  tasksImported: number;
  projectsCreated: number;
  errors: string[];
}

export const importService = {
  /**
   * Parse a Todoist CSV export string and persist the rows.
   *
   * Todoist CSV columns (in order):
   *   TYPE, CONTENT, DESCRIPTION, PRIORITY, INDENT, AUTHOR, RESPONSIBLE,
   *   DATE, DATE_LANG, TIMEZONE, STATUS
   *
   * Rows with type "section" or "project" are created as projects.
   * All other rows are created as tasks.
   */
  async importTodoistCSV(csvContent: string): Promise<ImportResult> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const lines = csvContent.split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file appears to be empty or has no data rows');
    }

    const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));

    const typeIdx = headers.indexOf('TYPE');
    const contentIdx = headers.indexOf('CONTENT');
    const descIdx = headers.indexOf('DESCRIPTION');
    const priorityIdx = headers.indexOf('PRIORITY');
    const dateIdx = headers.indexOf('DATE');
    const statusIdx = headers.indexOf('STATUS');

    if (contentIdx === -1) {
      throw new Error(
        'CSV does not appear to be a Todoist export — missing CONTENT column'
      );
    }

    const result: ImportResult = {
      tasksImported: 0,
      projectsCreated: 0,
      errors: [],
    };

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const cols = parseCSVLine(line);
        const type = cols[typeIdx]?.trim().toLowerCase();
        const content = cols[contentIdx]?.trim();

        if (!content) continue;

        if (type === 'section' || type === 'project') {
          const { error } = await supabase.from('projects').insert({
            user_id: user.id,
            name: content.substring(0, 100),
            color: '#6366f1',
          });
          if (error) throw error;
          result.projectsCreated++;
        } else {
          const priority = mapTodoistPriority(cols[priorityIdx]);
          const rawDate = cols[dateIdx]?.trim() || null;
          const status =
            cols[statusIdx]?.trim().toLowerCase() === 'completed'
              ? 'done'
              : 'todo';

          const { error } = await supabase.from('tasks').insert({
            user_id: user.id,
            title: content.substring(0, 500),
            description: cols[descIdx]?.trim() ?? '',
            priority,
            due_date: parseDateString(rawDate),
            status,
            completed_at: status === 'done' ? new Date().toISOString() : null,
          });
          if (error) throw error;
          result.tasksImported++;
        }
      } catch (err) {
        result.errors.push(
          `Line ${i + 1}: ${err instanceof Error ? err.message : 'Unknown error'}`
        );
      }
    }

    return result;
  },

  /**
   * Import from a generic Meld JSON export (or any compatible structure).
   *
   * Expected shape (all keys are optional):
   * {
   *   projects: [{ name, color }],
   *   tasks:    [{ title|content, description, priority, due_date|dueDate, status }],
   *   notes:    [{ title, content_plain|contentPlain }]
   * }
   */
  async importJSON(jsonContent: string): Promise<ImportResult> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let imported: Record<string, any[]>;
    try {
      imported = JSON.parse(jsonContent);
    } catch {
      throw new Error('Invalid JSON — file could not be parsed');
    }

    if (
      typeof imported !== 'object' ||
      imported === null ||
      Array.isArray(imported)
    ) {
      throw new Error(
        'JSON must be an object with optional "tasks", "notes", and "projects" arrays'
      );
    }

    const result: ImportResult = {
      tasksImported: 0,
      projectsCreated: 0,
      errors: [],
    };

    // --- Projects ---
    if (Array.isArray(imported.projects)) {
      for (const proj of imported.projects) {
        try {
          const { error } = await supabase.from('projects').insert({
            user_id: user.id,
            name: (proj.name ?? 'Imported Project').substring(0, 100),
            color: proj.color ?? '#6366f1',
          });
          if (error) throw error;
          result.projectsCreated++;
        } catch (err) {
          result.errors.push(
            `Project "${proj.name ?? '?'}": ${err instanceof Error ? err.message : 'error'}`
          );
        }
      }
    }

    // --- Tasks ---
    if (Array.isArray(imported.tasks)) {
      for (const task of imported.tasks) {
        try {
          const title = (task.title ?? task.content ?? 'Untitled').substring(
            0,
            500
          );
          const dueDate = task.due_date ?? task.dueDate ?? null;
          const { error } = await supabase.from('tasks').insert({
            user_id: user.id,
            title,
            description: task.description ?? '',
            priority: task.priority ?? 'none',
            due_date: parseDateString(dueDate),
            status: task.status ?? 'todo',
          });
          if (error) throw error;
          result.tasksImported++;
        } catch (err) {
          result.errors.push(
            `Task "${task.title ?? task.content ?? '?'}": ${err instanceof Error ? err.message : 'error'}`
          );
        }
      }
    }

    return result;
  },
};

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/**
 * Parse a single CSV line into an array of field values, respecting
 * double-quoted fields that may contain commas.
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  result.push(current);
  return result;
}

/**
 * Map Todoist numeric priority strings to Meld priority labels.
 *
 * Todoist stores priorities as integers where 1 is the highest urgency
 * (displayed as "Priority 1 / p1" in the UI).
 *
 *   Todoist 1 → high
 *   Todoist 2 → medium
 *   Todoist 3 → low
 *   Todoist 4 / anything else → none
 */
function mapTodoistPriority(p: string | undefined): string {
  switch (p?.trim()) {
    case '1':
      return 'high';
    case '2':
      return 'medium';
    case '3':
      return 'low';
    default:
      return 'none';
  }
}

/**
 * Attempt to parse a date string into an ISO YYYY-MM-DD string.
 * Returns null if the input is falsy or not a recognisable date.
 */
function parseDateString(date: string | null | undefined): string | null {
  if (!date) return null;
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split('T')[0];
  } catch {
    return null;
  }
}
