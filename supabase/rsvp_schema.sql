create table if not exists public.wedding_rsvps (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  mobile_number text not null,
  number_of_guests integer,
  attendance_status text not null,
  attending_events text[] not null default '{}'::text[],
  created_at timestamptz not null default now()
);

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'wedding_rsvps'
      and column_name = 'guests_attending'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'wedding_rsvps'
      and column_name = 'number_of_guests'
  ) then
    alter table public.wedding_rsvps
      rename column guests_attending to number_of_guests;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'wedding_rsvps'
      and column_name = 'attendance'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'wedding_rsvps'
      and column_name = 'attendance_status'
  ) then
    alter table public.wedding_rsvps
      rename column attendance to attendance_status;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'wedding_rsvps'
      and column_name = 'celebrations'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'wedding_rsvps'
      and column_name = 'attending_events'
  ) then
    alter table public.wedding_rsvps
      rename column celebrations to attending_events;
  end if;
end
$$;

alter table public.wedding_rsvps
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists guest_name text,
  add column if not exists mobile_number text,
  add column if not exists number_of_guests integer,
  add column if not exists attendance_status text,
  add column if not exists attending_events text[] default '{}'::text[],
  add column if not exists created_at timestamptz default now();

alter table public.wedding_rsvps
  alter column id set default gen_random_uuid(),
  alter column created_at set default now();

alter table public.wedding_rsvps
  drop constraint if exists wedding_rsvps_guest_name_check,
  drop constraint if exists wedding_rsvps_mobile_number_check,
  drop constraint if exists wedding_rsvps_attendance_status_check,
  drop constraint if exists wedding_rsvps_attending_events_check,
  drop constraint if exists wedding_rsvps_response_check;

update public.wedding_rsvps
set attendance_status = case attendance_status
  when 'joyfully_accept' then 'attending'
  when 'regretfully_decline' then 'not_attending'
  else attendance_status
end;

update public.wedding_rsvps as response
set attending_events = coalesce((
  select array_agg(mapped_event order by first_position)
  from (
    select mapped_event, min(ordinal) as first_position
    from (
      select
        case lower(submitted.event_name)
          when 'sangeet' then 'Cocktail'
          when 'cocktail' then 'Cocktail'
          when 'haldi' then 'Haldi'
          when 'mehendi' then 'Mehendi'
          when 'wedding' then 'Wedding'
          else submitted.event_name
        end as mapped_event,
        submitted.ordinal
      from unnest(response.attending_events) with ordinality
        as submitted(event_name, ordinal)
    ) as mapped_events
    group by mapped_event
  ) as distinct_events
), '{}'::text[]);

create index if not exists wedding_rsvps_created_at_idx
  on public.wedding_rsvps (created_at desc);

update public.wedding_rsvps
set number_of_guests = null,
    attending_events = '{}'::text[]
where attendance_status = 'not_attending';

alter table public.wedding_rsvps
  alter column id set not null,
  alter column guest_name set not null,
  alter column mobile_number set not null,
  alter column attendance_status set not null,
  alter column attending_events set default '{}'::text[],
  alter column attending_events set not null,
  alter column created_at set default now(),
  alter column created_at set not null;

create or replace function public.rsvp_event_names_valid(_events text[])
returns boolean
language sql
immutable
set search_path = ''
as $function$
  select cardinality(_events) <= 4
    and _events <@ array['Cocktail', 'Haldi', 'Mehendi', 'Wedding']::text[]
    and cardinality(_events) = (
      select count(distinct event_name)::integer
      from unnest(_events) as submitted(event_name)
    );
$function$;

revoke all on function public.rsvp_event_names_valid(text[]) from public, anon, authenticated;
grant execute on function public.rsvp_event_names_valid(text[]) to anon, authenticated;

alter table public.wedding_rsvps
  add constraint wedding_rsvps_guest_name_check
    check (char_length(trim(guest_name)) between 1 and 120),
  add constraint wedding_rsvps_mobile_number_check
    check (mobile_number ~ '^\+?[0-9]{7,15}$'),
  add constraint wedding_rsvps_attendance_status_check
    check (attendance_status in ('attending', 'not_attending')),
  add constraint wedding_rsvps_attending_events_check
    check (public.rsvp_event_names_valid(attending_events)),
  add constraint wedding_rsvps_response_check
    check (
      (
        attendance_status = 'attending'
        and number_of_guests is not null
        and number_of_guests >= 1
        and cardinality(attending_events) >= 1
      )
      or
      (
        attendance_status = 'not_attending'
        and number_of_guests is null
        and cardinality(attending_events) = 0
      )
    );

create table if not exists public.rsvp_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.rsvp_admins enable row level security;
revoke all on table public.rsvp_admins from public, anon, authenticated;

create or replace function public.is_rsvp_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.rsvp_admins
    where user_id = (select auth.uid())
  );
$function$;

revoke all on function public.is_rsvp_admin() from public, anon, authenticated;
grant execute on function public.is_rsvp_admin() to authenticated;

alter table public.wedding_rsvps enable row level security;
revoke all on table public.wedding_rsvps from public, anon, authenticated;
grant insert (
  guest_name,
  mobile_number,
  number_of_guests,
  attendance_status,
  attending_events
) on table public.wedding_rsvps to anon, authenticated;
grant select on table public.wedding_rsvps to authenticated;
grant update (
  guest_name,
  mobile_number,
  number_of_guests,
  attendance_status,
  attending_events
) on table public.wedding_rsvps to authenticated;
grant delete on table public.wedding_rsvps to authenticated;

do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'wedding_rsvps'
  loop
    execute format(
      'drop policy %I on public.wedding_rsvps',
      existing_policy.policyname
    );
  end loop;
end
$$;

create policy "Public can submit valid RSVPs"
  on public.wedding_rsvps
  for insert
  to anon, authenticated
  with check (
    char_length(trim(guest_name)) between 1 and 120
    and mobile_number ~ '^\+?[0-9]{7,15}$'
    and attendance_status in ('attending', 'not_attending')
    and public.rsvp_event_names_valid(attending_events)
    and (
      (
        attendance_status = 'attending'
        and number_of_guests is not null
        and number_of_guests >= 1
        and cardinality(attending_events) >= 1
      )
      or
      (
        attendance_status = 'not_attending'
        and number_of_guests is null
        and cardinality(attending_events) = 0
      )
    )
  );

create policy "RSVP administrators can read responses"
  on public.wedding_rsvps
  for select
  to authenticated
  using (public.is_rsvp_admin());

create policy "RSVP administrators can update responses"
  on public.wedding_rsvps
  for update
  to authenticated
  using (public.is_rsvp_admin())
  with check (public.is_rsvp_admin());

create policy "RSVP administrators can delete responses"
  on public.wedding_rsvps
  for delete
  to authenticated
  using (public.is_rsvp_admin());
