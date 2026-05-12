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

create or replace function public.set_job_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.validate_job_status_transition()
returns trigger as $$
begin
  if new.status is not distinct from old.status then
    return new;
  end if;

  if old.status = 'assigned' and new.status in ('started', 'cancelled') then
    return new;
  end if;

  if old.status = 'started' and new.status in ('completed', 'cancelled') then
    return new;
  end if;

  raise exception 'Invalid job status transition: % -> %', old.status, new.status;
end;
$$ language plpgsql;

drop trigger if exists jobs_set_updated_at on public.jobs;
create trigger jobs_set_updated_at
  before update on public.jobs
  for each row execute procedure public.set_job_updated_at();

drop trigger if exists jobs_status_transition_guard on public.jobs;
create trigger jobs_status_transition_guard
  before update of status on public.jobs
  for each row execute procedure public.validate_job_status_transition();

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

create table if not exists public.route_locks (
  shift_date date primary key,
  locked boolean not null default true,
  locked_at timestamptz not null default now(),
  locked_by uuid references auth.users(id) on delete set null,
  note text
);

create or replace function public.prevent_locked_shift_assignment_changes()
returns trigger as $$
declare
  target_shift date;
begin
  if (tg_op = 'DELETE') then
    target_shift := old.shift_date;
  else
    target_shift := new.shift_date;
  end if;

  if target_shift is null then
    if (tg_op = 'DELETE') then
      return old;
    else
      return new;
    end if;
  end if;

  if exists (
    select 1
    from public.route_locks rl
    where rl.shift_date = target_shift
      and rl.locked = true
  ) then
    raise exception 'Route is locked for shift date %', target_shift;
  end if;

  if (tg_op = 'DELETE') then
    return old;
  else
    return new;
  end if;
end;
$$ language plpgsql;

drop trigger if exists job_assignments_route_lock_guard on public.job_assignments;
create trigger job_assignments_route_lock_guard
  before insert or update or delete on public.job_assignments
  for each row execute procedure public.prevent_locked_shift_assignment_changes();

create table if not exists public.crew_job_actions (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs(id) on delete cascade,
  quote_request_id uuid references public.quote_requests(id) on delete cascade,
  action text not null check (action in ('started', 'completed')),
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.crew_job_actions
  add column if not exists job_id uuid references public.jobs(id) on delete cascade;
alter table public.crew_job_actions
  add column if not exists quote_request_id uuid references public.quote_requests(id) on delete cascade;

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

create or replace function public.validate_crew_job_action_matches_status()
returns trigger as $$
declare
  current_status text;
begin
  if new.job_id is null then
    return new;
  end if;

  select status into current_status
  from public.jobs
  where id = new.job_id;

  if current_status is null then
    raise exception 'Invalid crew job action: job % not found', new.job_id;
  end if;

  if new.action = 'started' and current_status <> 'started' then
    raise exception 'Job % must be in started state before logging started action', new.job_id;
  end if;

  if new.action = 'completed' and current_status <> 'completed' then
    raise exception 'Job % must be in completed state before logging completed action', new.job_id;
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists crew_job_actions_status_guard on public.crew_job_actions;
create trigger crew_job_actions_status_guard
  before insert on public.crew_job_actions
  for each row execute procedure public.validate_crew_job_action_matches_status();

alter table public.jobs enable row level security;
alter table public.job_assignments enable row level security;
alter table public.route_locks enable row level security;
alter table public.crew_job_actions enable row level security;

drop policy if exists "crew and admins can read jobs" on public.jobs;
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

drop policy if exists "admins can insert jobs" on public.jobs;
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

drop policy if exists "admins and assigned crew can update jobs" on public.jobs;
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

drop policy if exists "crew and admins can read job assignments" on public.job_assignments;
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

drop policy if exists "admins can manage job assignments" on public.job_assignments;
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

drop policy if exists "crew and admins can read route locks" on public.route_locks;
create policy "crew and admins can read route locks"
  on public.route_locks for select
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('crew', 'admin')
    )
  );

drop policy if exists "admins can manage route locks" on public.route_locks;
create policy "admins can manage route locks"
  on public.route_locks for all
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

drop policy if exists "crew and admins can read crew job actions" on public.crew_job_actions;
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

drop policy if exists "crew and admins can insert crew job actions" on public.crew_job_actions;
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
