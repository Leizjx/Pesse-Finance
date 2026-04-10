-- Migration: 20260411_smart_ecosystem
-- Description: Adds notifications table and updates subscriptions for manual entry support.

-- 1. Create Notification Types (Enum style via check constraint)
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('budget_alert', 'subscription_reminder', 'ai_insight', 'system')),
  title text not null,
  content text not null,
  is_read boolean not null default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone not null default now()
);

-- Enable RLS for notifications
alter table public.notifications enable row level security;

create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- 2. Update Subscriptions table for Manual Entry
-- Check if 'source' column exists first (though in a fresh migration we just add it)
alter table public.subscriptions 
add column if not exists source text not null default 'gmail' 
check (source in ('gmail', 'manual'));

-- Update unique index to allow multiple manual entries (msg_id is null for manual)
-- Current index: create unique index subscriptions_user_id_gmail_msg_id_idx on public.subscriptions(user_id, gmail_msg_id) where gmail_msg_id is not null;
-- That index is already fine as it only applies when msg_id is NOT null.
-- For manual entries, we'll just let them have null gmail_msg_id.
