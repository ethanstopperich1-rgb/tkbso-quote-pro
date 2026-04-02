-- Migration: create follow_ups table
-- Run in Supabase SQL Editor or apply via: supabase db push

create table if not exists public.follow_ups (
  id                uuid primary key default gen_random_uuid(),
  estimate_id       uuid not null references public.estimates(id) on delete cascade,
  contractor_id     uuid not null references public.contractors(id) on delete cascade,
  day_number        integer not null check (day_number in (3, 7, 10)),
  template_key      text not null,
  sent_at           timestamptz not null default now(),
  resend_email_id   text,
  recipient_email   text not null,
  opened_at         timestamptz,
  clicked_at        timestamptz,
  created_at        timestamptz not null default now()
);

-- One follow-up per day tier per estimate
create unique index if not exists follow_ups_estimate_day_unique
  on public.follow_ups (estimate_id, day_number);

-- RLS
alter table public.follow_ups enable row level security;

-- Contractors can read their own follow-ups
create policy "Contractors read own follow_ups"
  on public.follow_ups for select
  using (contractor_id = (select contractor_id from public.profiles where id = auth.uid()));

-- Service role can do everything (Edge Function uses service role key)
create policy "Service role full access"
  on public.follow_ups for all
  using (true)
  with check (true);

-- Also add sent_at to estimates table if it doesn't exist
-- (tracks when the estimate was first set to 'sent')
alter table public.estimates
  add column if not exists sent_at timestamptz,
  add column if not exists follow_up_count integer not null default 0,
  add column if not exists approved_at timestamptz,
  add column if not exists declined_at timestamptz;

-- Index for the scheduled job query
create index if not exists estimates_followup_idx
  on public.estimates (status, sent_at)
  where status = 'sent';

-- pg_cron setup (enable the pg_cron extension first in Supabase Dashboard → Extensions)
-- Then run this to schedule the Edge Function hourly:
--
-- select cron.schedule(
--   'hourly-followups',
--   '0 * * * *',
--   $$
--     select net.http_post(
--       url := current_setting('app.edge_function_url') || '/scheduled-followups',
--       headers := jsonb_build_object(
--         'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
--         'Content-Type', 'application/json'
--       ),
--       body := '{}'::jsonb
--     );
--   $$
-- );
