create table if not exists public.crew_job_actions (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid not null references public.quote_requests(id) on delete cascade,
  action text not null check (action in ('started', 'completed')),
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists crew_job_actions_quote_request_id_idx
  on public.crew_job_actions (quote_request_id);

create index if not exists crew_job_actions_created_at_idx
  on public.crew_job_actions (created_at desc);

alter table public.crew_job_actions enable row level security;

create policy "crew and admins can read crew job actions"
  on public.crew_job_actions for select
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('crew', 'admin')
    )
  );

create policy "crew and admins can insert crew job actions"
  on public.crew_job_actions for insert
  with check (
    auth.uid() = created_by
    and exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('crew', 'admin')
    )
  );
