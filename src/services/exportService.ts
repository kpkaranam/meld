/**
 * Export service — generates and downloads a full data export of the user's
 * tasks, notes, projects, and tags.
 *
 * Two formats are supported:
 *   - Markdown: human-readable document grouped by project
 *   - JSON: raw structured data for backup / programmatic use
 *
 * No component may call Supabase directly for export data.
 * All reads go through the existing service layer.
 */

import { taskService } from './taskService';
import { noteService } from './noteService';
import { projectService } from './projectService';
import { tagService } from './tagService';

// ---------------------------------------------------------------------------
// Types (local — we work with the raw Supabase row shapes)
// ---------------------------------------------------------------------------

type TaskRow = Awaited<ReturnType<typeof taskService.getTasks>>[number];
type NoteRow = Awaited<ReturnType<typeof noteService.getNotes>>[number];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function priorityLabel(priority: string): string {
  const map: Record<string, string> = {
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    none: '',
  };
  return map[priority] ?? '';
}

function formatDueDate(dueDate: string | null): string {
  if (!dueDate) return '';
  return `Due: ${dueDate}`;
}

function taskLine(task: TaskRow): string {
  const checkbox = task.status === 'done' ? '[x]' : '[ ]';
  const parts: string[] = [];
  const prio = priorityLabel(task.priority);
  if (prio) parts.push(prio + ' priority');
  const due = formatDueDate(task.due_date);
  if (due) parts.push(due);
  const meta = parts.length > 0 ? ` *(${parts.join(', ')})*` : '';
  return `- ${checkbox} ${task.title}${meta}`;
}

function noteBlock(note: NoteRow): string {
  const lines: string[] = [`**${note.title || 'Untitled Note'}**`];
  if (note.content_plain && note.content_plain.trim()) {
    lines.push('');
    lines.push(note.content_plain.trim());
  }
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Export service
// ---------------------------------------------------------------------------

export const exportService = {
  /**
   * Fetch all user data and build Markdown + JSON export strings.
   *
   * Throws if any service call fails (the UI layer should catch and show a
   * toast).
   */
  async exportAllData(): Promise<{ markdown: string; json: string }> {
    // Parallel fetch
    const [projects, allTasks, allNotes, tags] = await Promise.all([
      projectService.getProjects(true), // include archived
      taskService.getTasks(undefined), // all tasks
      noteService.getNotes(undefined), // all notes
      tagService.getTags(),
    ]);

    const exportedAt = new Date().toISOString();

    // Partition tasks and notes by project
    const projectTasks: Record<string, TaskRow[]> = {};
    const projectNotes: Record<string, NoteRow[]> = {};
    const inboxTasks: TaskRow[] = [];
    const inboxNotes: NoteRow[] = [];

    for (const task of allTasks) {
      if (task.project_id) {
        (projectTasks[task.project_id] ??= []).push(task);
      } else {
        inboxTasks.push(task);
      }
    }

    for (const note of allNotes) {
      if (note.project_id) {
        (projectNotes[note.project_id] ??= []).push(note);
      } else {
        inboxNotes.push(note);
      }
    }

    // -----------------------------------------------------------------------
    // Build Markdown
    // -----------------------------------------------------------------------
    const md: string[] = [];

    md.push('# Meld Export');
    md.push('');
    md.push(`*Exported on ${new Date(exportedAt).toLocaleString()}*`);
    md.push('');

    // Inbox section
    md.push('## Inbox');
    md.push('');

    if (inboxTasks.length > 0) {
      md.push('### Tasks');
      md.push('');
      for (const task of inboxTasks) {
        md.push(taskLine(task));
      }
      md.push('');
    }

    if (inboxNotes.length > 0) {
      md.push('### Notes');
      md.push('');
      for (const note of inboxNotes) {
        md.push(noteBlock(note));
        md.push('');
      }
    }

    if (inboxTasks.length === 0 && inboxNotes.length === 0) {
      md.push('*No items in Inbox.*');
      md.push('');
    }

    // Projects
    if (projects.length > 0) {
      md.push('## Projects');
      md.push('');

      for (const project of projects) {
        md.push(
          `### ${project.name}${project.is_archived ? ' *(archived)*' : ''}`
        );
        md.push('');

        const tasks = projectTasks[project.id] ?? [];
        const notes = projectNotes[project.id] ?? [];

        if (tasks.length > 0) {
          md.push('#### Tasks');
          md.push('');
          for (const task of tasks) {
            md.push(taskLine(task));
          }
          md.push('');
        }

        if (notes.length > 0) {
          md.push('#### Notes');
          md.push('');
          for (const note of notes) {
            md.push(noteBlock(note));
            md.push('');
          }
        }

        if (tasks.length === 0 && notes.length === 0) {
          md.push('*No items.*');
          md.push('');
        }
      }
    }

    // Tags
    if (tags.length > 0) {
      md.push('## Tags');
      md.push('');
      md.push(tags.map((t) => t.name).join(', '));
      md.push('');
    }

    const markdown = md.join('\n');

    // -----------------------------------------------------------------------
    // Build JSON
    // -----------------------------------------------------------------------
    const json = JSON.stringify(
      {
        exportedAt,
        version: 1,
        projects,
        tasks: allTasks,
        notes: allNotes,
        tags,
      },
      null,
      2
    );

    return { markdown, json };
  },

  /**
   * Trigger a browser file download for the given content.
   *
   * @param content  - File contents as a string
   * @param filename - Suggested download filename
   * @param mimeType - MIME type (e.g. 'text/markdown' or 'application/json')
   */
  downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    // Append to body briefly so Firefox triggers the download
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
