create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid unique references public.quote_requests(id) on delete set null,
  property_type text,
  address text,
  city text,
  province text,
  status text not null default 'assigned' check (status in ('assigned', 'started', 'completed', 'cancelled')),
  priority integer not null default 2 check (priority between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists jobs_status_idx on public.jobs (status);
create index if not exists jobs_priority_idx on public.jobs (priority);
create index if not exists jobs_created_at_idx on public.jobs (created_at desc);

insert into public.jobs (
  quote_request_id,
  property_type,
  address,
  city,
  province,
  status,
  priority
)
select
  qr.id,
  qr.property_type,
  qr.address,
  qr.city,
  qr.province,
  'assigned',
  case when qr.property_type = 'commercial' then 1 else 2 end
from public.quote_requests qr
where not exists (
  select 1
  from public.jobs j
  where j.quote_request_id = qr.id
);

create table if not exists public.job_assignments (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  crew_user_id uuid not null references auth.users(id) on delete cascade,
  assigned_by uuid references auth.users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  shift_date date,
  route_order integer,
  active boolean not null default true,
  notes text
);

create index if not exists job_assignments_crew_user_active_idx
  on public.job_assignments (crew_user_id, active, shift_date);

create index if not exists job_assignments_route_order_idx
  on public.job_assignments (route_order);

create unique index if not exists job_assignments_one_active_per_job_idx
  on public.job_assignments (job_id)
  where active = true;

alter table public.jobs enable row level security;
alter table public.job_assignments enable row level security;

create policy "crew and admins can read jobs"
  on public.jobs for select
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('crew', 'admin')
    )
  );

create policy "admins can insert jobs"
  on public.jobs for insert
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "admins and assigned crew can update jobs"
  on public.jobs for update
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
    or exists (
      select 1
      from public.job_assignments ja
      where ja.job_id = jobs.id
        and ja.crew_user_id = auth.uid()
        and ja.active = true
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
    or exists (
      select 1
      from public.job_assignments ja
      where ja.job_id = jobs.id
        and ja.crew_user_id = auth.uid()
        and ja.active = true
    )
  );

create policy "crew and admins can read job assignments"
  on public.job_assignments for select
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
    or crew_user_id = auth.uid()
  );

create policy "admins can manage job assignments"
  on public.job_assignments for all
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create table if not exists public.crew_job_actions (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs(id) on delete cascade,
  quote_request_id uuid references public.quote_requests(id) on delete cascade,
  action text not null check (action in ('started', 'completed')),
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.crew_job_actions add column if not exists job_id uuid references public.jobs(id) on delete cascade;
alter table public.crew_job_actions add column if not exists quote_request_id uuid references public.quote_requests(id) on delete cascade;

update public.crew_job_actions cja
set job_id = j.id
from public.jobs j
where cja.job_id is null
  and cja.quote_request_id is not null
  and j.quote_request_id = cja.quote_request_id;

create index if not exists crew_job_actions_job_id_idx
  on public.crew_job_actions (job_id);

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
