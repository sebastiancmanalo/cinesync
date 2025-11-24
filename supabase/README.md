# Database Migrations

This directory contains PostgreSQL migration files for setting up the WatchTogether database schema.

## Setup

To apply all migrations to your Supabase database:

```bash
supabase link --project-ref your_project_ref
supabase db push
```

## Migration Files

The migrations are applied in chronological order (by timestamp prefix) and set up:

1. **Initial Schema** - Core tables (profiles, watchlists, watchlist_members, watchlist_items)
2. **RLS Policies** - Row Level Security policies for secure data access
3. **Functions** - Database functions for member counts and user lookups
4. **Reviews System** - Watchlist item reviews and ratings tables
5. **Permissions** - Member management and leave functionality

All migrations are idempotent and safe to run multiple times.

## Schema Overview

- **profiles** - User profile information
- **watchlists** - Watchlist metadata
- **watchlist_members** - Many-to-many relationship between users and watchlists with roles
- **watchlist_items** - Movies/TV shows in watchlists
- **watchlist_item_reviews** - Reviews and ratings for items

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data and shared watchlists.

