/**
 * Supabase database type definitions.
 *
 * This file is manually authored to match the schema defined in ARCHITECTURE.md §4.
 * When a live Supabase project is available, regenerate with:
 *   npx supabase gen types typescript --project-id <ref> > src/types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Views: Record<string, never>;
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          theme: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          theme?: string;
        };
        Update: {
          display_name?: string | null;
          avatar_url?: string | null;
          theme?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          is_archived: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          is_archived?: boolean;
          sort_order?: number;
        };
        Update: {
          name?: string;
          color?: string;
          is_archived?: boolean;
          sort_order?: number;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          parent_id: string | null;
          title: string;
          description: string;
          status: string;
          priority: string;
          due_date: string | null;
          completed_at: string | null;
          sort_order: number;
          recurrence_rule: string | null;
          recurrence_next: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          parent_id?: string | null;
          title: string;
          description?: string;
          status?: string;
          priority?: string;
          due_date?: string | null;
          sort_order?: number;
          recurrence_rule?: string | null;
        };
        Update: {
          project_id?: string | null;
          parent_id?: string | null;
          title?: string;
          description?: string;
          status?: string;
          priority?: string;
          due_date?: string | null;
          completed_at?: string | null;
          sort_order?: number;
          recurrence_rule?: string | null;
          recurrence_next?: string | null;
        };
        Relationships: [];
      };
      task_note_links: {
        Row: { task_id: string; note_id: string; created_at: string };
        Insert: { task_id: string; note_id: string };
        Update: never;
        Relationships: [];
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          title: string;
          content: Json;
          content_plain: string;
          is_pinned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          title: string;
          content?: Json;
          content_plain?: string;
          is_pinned?: boolean;
        };
        Update: {
          project_id?: string | null;
          title?: string;
          content?: Json;
          content_plain?: string;
          is_pinned?: boolean;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string | null;
        };
        Update: {
          name?: string;
          color?: string | null;
        };
        Relationships: [];
      };
      task_tags: {
        Row: {
          task_id: string;
          tag_id: string;
        };
        Insert: {
          task_id: string;
          tag_id: string;
        };
        Update: never;
        Relationships: [];
      };
      note_tags: {
        Row: { note_id: string; tag_id: string };
        Insert: { note_id: string; tag_id: string };
        Update: never;
        Relationships: [];
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          color: string;
          frequency: string;
          target_count: number;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string;
          color?: string;
          frequency?: string;
          target_count?: number;
          is_archived?: boolean;
        };
        Update: {
          name?: string;
          description?: string;
          color?: string;
          frequency?: string;
          target_count?: number;
          is_archived?: boolean;
        };
        Relationships: [];
      };
      habit_completions: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          completed_date: string;
          count: number;
          created_at: string;
        };
        Insert: {
          habit_id: string;
          user_id: string;
          completed_date: string;
          count?: number;
        };
        Update: never;
        Relationships: [];
      };
      templates: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: string;
          title: string | null;
          description: string | null;
          priority: string;
          recurrence_rule: string | null;
          content: Json;
          content_plain: string;
          is_default: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: string;
          title?: string | null;
          description?: string | null;
          priority?: string;
          recurrence_rule?: string | null;
          content?: Json;
          content_plain?: string;
          is_default?: boolean;
          sort_order?: number;
        };
        Update: {
          name?: string;
          type?: string;
          title?: string | null;
          description?: string | null;
          priority?: string;
          recurrence_rule?: string | null;
          content?: Json;
          content_plain?: string;
          is_default?: boolean;
          sort_order?: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      search_items: {
        Args: {
          query: string;
          item_type?: string;
          max_results?: number;
        };
        Returns: Array<{
          id: string;
          type: string;
          title: string;
          snippet: string;
          project_id: string | null;
          rank: number;
          created_at: string;
          updated_at: string;
        }>;
      };
    };
  };
}
