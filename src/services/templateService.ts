/**
 * Template service — sole gateway for all template data operations.
 *
 * No component or hook may call Supabase directly for template data.
 * All reads and writes go through this module.
 *
 * All functions are async and throw on error so callers can use try/catch.
 */

import { supabase } from '../lib/supabase';
import type {
  CreateTemplateInput,
  UpdateTemplateInput,
} from '../types/template';
import { taskService } from './taskService';
import { noteService } from './noteService';

export const templateService = {
  /**
   * Fetch all templates for the current user, optionally filtered by type.
   * Results are ordered by sort_order ascending, then created_at ascending.
   *
   * @param type - 'task' | 'note' | undefined (all types)
   */
  async getTemplates(type?: 'task' | 'note') {
    let query = supabase
      .from('templates')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;
    if (error) {
      console.error(
        '[templateService.getTemplates] Supabase error:',
        error.message,
        error.details,
        error.hint,
        error.code
      );
      throw error;
    }
    return data ?? [];
  },

  /**
   * Create a new template for the currently authenticated user.
   * Throws if no user session exists.
   */
  async createTemplate(input: CreateTemplateInput) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const { data, error } = await supabase
      .from('templates')
      .insert({
        user_id: user.id,
        name: input.name,
        type: input.type,
        title: input.title ?? null,
        description: input.description ?? null,
        priority: input.priority ?? 'none',
        recurrence_rule: input.recurrenceRule ?? null,
        content: (input.content ?? null) as any,
        content_plain: input.contentPlain ?? '',
      } as any)
      .select('*')
      .single();
    /* eslint-enable @typescript-eslint/no-explicit-any */
    if (error) throw error;
    return data;
  },

  /**
   * Apply a partial update to an existing template.
   */
  async updateTemplate(id: string, input: UpdateTemplateInput) {
    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.priority !== undefined) updateData.priority = input.priority;
    if (input.recurrenceRule !== undefined)
      updateData.recurrence_rule = input.recurrenceRule;
    if (input.content !== undefined) updateData.content = input.content;
    if (input.contentPlain !== undefined)
      updateData.content_plain = input.contentPlain;

    const { data, error } = await supabase
      .from('templates')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Permanently delete a template by primary key.
   */
  async deleteTemplate(id: string) {
    const { error } = await supabase.from('templates').delete().eq('id', id);
    if (error) throw error;
  },

  /**
   * Create a template from an existing task.
   * Copies title, description, priority, and recurrence_rule from the task.
   *
   * @param taskId - UUID of the source task
   * @param name   - Name for the new template
   */
  async createFromTask(taskId: string, name: string) {
    const task = await taskService.getTaskById(taskId);

    return this.createTemplate({
      name,
      type: 'task',
      title: (task.title as string) ?? undefined,
      description: (task.description as string | undefined) ?? undefined,
      priority: (task.priority as string | undefined) ?? 'none',
      recurrenceRule: (task.recurrence_rule as string | undefined) ?? undefined,
    });
  },

  /**
   * Create a template from an existing note.
   * Copies title (as template name if no name given), content, and content_plain.
   *
   * @param noteId - UUID of the source note
   * @param name   - Name for the new template
   */
  async createFromNote(noteId: string, name: string) {
    const note = await noteService.getNoteById(noteId);

    return this.createTemplate({
      name,
      type: 'note',
      title: (note.title as string) ?? undefined,
      content: note.content ?? {},
      contentPlain: (note.content_plain as string) ?? '',
    });
  },

  /**
   * Create a new task from a task template.
   * Returns the newly created task row.
   *
   * @param templateId - UUID of the source template (must be type 'task')
   * @param projectId  - Optional project to assign the task to
   */
  async applyTaskTemplate(templateId: string, projectId?: string | null) {
    const { data: template, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .single();
    if (error) throw error;
    if (template.type !== 'task') {
      throw new Error('Template is not a task template');
    }

    return taskService.createTask({
      title: (template.title as string) || 'Untitled Task',
      description: (template.description as string | undefined) ?? '',
      priority:
        (template.priority as 'none' | 'low' | 'medium' | 'high') ?? 'none',
      recurrenceRule:
        (template.recurrence_rule as
          | 'daily'
          | 'weekly'
          | 'monthly'
          | 'weekdays'
          | null) ?? null,
      projectId: projectId ?? null,
    });
  },

  /**
   * Create a new note from a note template.
   * Returns the newly created note row.
   *
   * @param templateId - UUID of the source template (must be type 'note')
   * @param projectId  - Optional project to assign the note to
   */
  async applyNoteTemplate(templateId: string, projectId?: string | null) {
    const { data: template, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .single();
    if (error) throw error;
    if (template.type !== 'note') {
      throw new Error('Template is not a note template');
    }

    return noteService.createNote({
      title: (template.title as string) || 'Untitled Note',
      content: template.content ?? {},
      contentPlain: (template.content_plain as string) ?? '',
      projectId: projectId ?? null,
    });
  },

  /**
   * Seed built-in starter templates for a user if they have none yet.
   * This is idempotent — calling it twice will not duplicate templates.
   */
  async seedStarterTemplates() {
    const existing = await this.getTemplates();
    if (existing.length > 0) return; // Already has templates, skip seeding

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const starters = [
      // Task templates
      {
        user_id: user.id,
        name: 'Meeting Notes Task',
        type: 'task' as const,
        title: 'Meeting Notes',
        description: 'Attendees:\nAgenda:\nAction Items:',
        priority: 'none',
        recurrence_rule: null,
        content: null,
        content_plain: '',
        is_default: true,
        sort_order: 0,
      },
      {
        user_id: user.id,
        name: 'Bug Report',
        type: 'task' as const,
        title: 'Bug Report',
        description: 'Steps to Reproduce:\nExpected:\nActual:',
        priority: 'high',
        recurrence_rule: null,
        content: null,
        content_plain: '',
        is_default: true,
        sort_order: 1,
      },
      // Note templates
      {
        user_id: user.id,
        name: 'Weekly Review',
        type: 'note' as const,
        title: 'Weekly Review',
        description: null,
        priority: 'none',
        recurrence_rule: null,
        content: {
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'What went well' }],
            },
            { type: 'paragraph' },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'What to improve' }],
            },
            { type: 'paragraph' },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Next week goals' }],
            },
            { type: 'paragraph' },
          ],
        },
        content_plain: 'What went well\nWhat to improve\nNext week goals',
        is_default: true,
        sort_order: 2,
      },
      {
        user_id: user.id,
        name: 'Meeting Notes',
        type: 'note' as const,
        title: 'Meeting Notes',
        description: null,
        priority: 'none',
        recurrence_rule: null,
        content: {
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Date' }],
            },
            { type: 'paragraph' },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Attendees' }],
            },
            { type: 'paragraph' },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Discussion' }],
            },
            { type: 'paragraph' },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Action Items' }],
            },
            { type: 'paragraph' },
          ],
        },
        content_plain: 'Date\nAttendees\nDiscussion\nAction Items',
        is_default: true,
        sort_order: 3,
      },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await supabase.from('templates').insert(starters as any);
    if (error) {
      console.error(
        '[templateService.seedStarterTemplates] error:',
        error.message
      );
    }
  },
};
