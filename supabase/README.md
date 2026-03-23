# Supabase Setup for Meld

This directory contains the database migration and seed data for the Meld app.

---

## Prerequisites

- A [Supabase](https://supabase.com) account
- A new Supabase project created in the dashboard

---

## Environment Variables

Copy `.env.example` to `.env` in the project root and fill in the values from your Supabase project settings (Settings > API):

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | Project URL (e.g. `https://xxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | `anon` / `public` key under Project API keys |

Never commit `.env` to source control.

---

## Running the Migration

1. Open your Supabase project in the dashboard.
2. Navigate to **SQL Editor**.
3. Click **New query**.
4. Copy the full contents of `migrations/0001_initial_schema.sql` and paste it into the editor.
5. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`).

The migration creates the following in order:
- 7 tables: `profiles`, `projects`, `tasks`, `notes`, `tags`, `task_tags`, `note_tags`
- All indexes (composite, partial, GIN for full-text search)
- `handle_updated_at()` trigger applied to 4 tables
- `handle_new_user()` trigger on `auth.users` to auto-create profiles on signup
- Row Level Security enabled and policies applied to all 7 tables
- `search_items()` RPC function for unified full-text search

---

## Enabling Google OAuth

1. In the Supabase dashboard, go to **Authentication > Providers**.
2. Find **Google** and enable it.
3. Create OAuth credentials in the [Google Cloud Console](https://console.cloud.google.com/):
   - Create a project or select an existing one.
   - Go to **APIs & Services > Credentials > Create Credentials > OAuth client ID**.
   - Set **Application type** to **Web application**.
   - Add the following to **Authorized redirect URIs**:
     ```
     {SUPABASE_URL}/auth/v1/callback
     ```
     Replace `{SUPABASE_URL}` with your actual project URL (e.g. `https://xxxx.supabase.co`).
4. Copy the **Client ID** and **Client Secret** from Google and paste them into the Supabase Google provider settings.
5. Save.

---

## Running the Seed Data

The seed data in `seed.sql` is for development only. It creates two projects, two tags, five tasks, and two notes under a test user account.

1. First, create a test user via **Authentication > Users > Invite user** (or sign up through the app).
2. Copy the user's UUID from the Users table.
3. Open `seed.sql` and replace `'00000000-0000-0000-0000-000000000000'` with the actual UUID.
4. In the **SQL Editor**, create a new query, paste the updated seed contents, and run it.

> The seed script must be run after the migration in step above, as it inserts into tables that the migration creates.

---

## Schema Overview

```
auth.users (managed by Supabase)
    |
    +-- profiles (1:1, auto-created on signup)
    |
    +-- projects (1:many)
    |       |
    |       +-- tasks (many:1, nullable project)
    |       +-- notes (many:1, nullable project)
    |
    +-- tasks
    |       |
    |       +-- task_tags (join) --> tags
    |
    +-- notes
    |       |
    |       +-- note_tags (join) --> tags
    |
    +-- tags
```

All tables have Row Level Security enabled. Users can only access their own data.

Full-text search is powered by PostgreSQL `tsvector` generated columns with GIN indexes. Use the `search_items(query, item_type, max_results)` RPC function for unified search across tasks and notes.
