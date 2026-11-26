-- =====================================================================
-- COMPASS Student Communication Profile — Phase 1 schema
-- =====================================================================
-- REFERENCE COPY ONLY. Already applied to SSS Dashboard
-- (tvdnhcocgvuzeonejiut) on 2026-11-26 as Supabase migrations,
-- in this order:
--   1. create_compass_action_status_enum
--   2. create_compass_student_communication_profiles
--   3. create_compass_profile_goals_and_action_items
--   4. add_compass_updated_at_triggers
--   5. add_compass_rls_policies
--
-- Do NOT run this file again: the CREATE statements will fail because
-- the objects already exist. Change the schema with a new migration.
--
-- Source blueprint: "COMPASS Communication Profile.docx"
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. create_compass_action_status_enum
-- ---------------------------------------------------------------------
create type public.compass_action_status as enum (
  'to_be_completed',
  'in_progress',
  'completed'
);

comment on type public.compass_action_status is
  'Status of a COMPASS profile action item. Optional on each item.';


-- ---------------------------------------------------------------------
-- 2. create_compass_student_communication_profiles
-- ---------------------------------------------------------------------
create table public.compass_student_communication_profiles (
  id uuid primary key default gen_random_uuid(),

  -- Links (no ON DELETE clause, matching goal sheets: deletes are blocked while profiles exist)
  student_id   uuid not null references public.students(id),
  school_id    uuid not null references public.schools(id),
  clinician_id uuid references public.users(id),
  created_by   uuid references public.users(id) default auth.uid(),

  -- A1 Student information
  student_name       text,
  school_name        text,
  clinician_name     text,
  date_of_birth      date,
  date_of_evaluation date,
  report_date        date not null default current_date,
  guardians          jsonb not null default '[]'::jsonb,
  languages          text,

  -- A2 Diagnoses & clinical considerations
  diagnoses_private_notes text,
  diagnoses_report        text,

  -- A3 Student support team, A4 What matters most
  support_team jsonb not null default '[]'::jsonb,
  priorities   jsonb not null default '[]'::jsonb,

  -- B01 About me
  about_me_private_notes text,
  about_me_report        text,

  -- B02 How I communicate
  communication_modes_private jsonb not null default '{}'::jsonb,
  communication_modes_report  jsonb not null default '{}'::jsonb,

  -- B02 What I communicate
  communication_functions_private jsonb not null default '{}'::jsonb,
  communication_functions_report  jsonb not null default '{}'::jsonb,

  -- C How you can support me
  support_categories jsonb not null default '{}'::jsonb,

  -- D My communication plan
  plan_private_notes text,
  plan_report        text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- jsonb shape checks: lists must be arrays, keyed groups must be objects
  constraint compass_profiles_guardians_is_array
    check (jsonb_typeof(guardians) = 'array'),
  constraint compass_profiles_support_team_is_array
    check (jsonb_typeof(support_team) = 'array'),
  constraint compass_profiles_priorities_is_array
    check (jsonb_typeof(priorities) = 'array'),
  constraint compass_profiles_modes_private_is_object
    check (jsonb_typeof(communication_modes_private) = 'object'),
  constraint compass_profiles_modes_report_is_object
    check (jsonb_typeof(communication_modes_report) = 'object'),
  constraint compass_profiles_functions_private_is_object
    check (jsonb_typeof(communication_functions_private) = 'object'),
  constraint compass_profiles_functions_report_is_object
    check (jsonb_typeof(communication_functions_report) = 'object'),
  constraint compass_profiles_support_categories_is_object
    check (jsonb_typeof(support_categories) = 'object')
);

create index compass_profiles_student_id_idx
  on public.compass_student_communication_profiles (student_id);

create index compass_profiles_school_id_idx
  on public.compass_student_communication_profiles (school_id);

-- Lock the table immediately; step 5 adds the policies that let the right people in
alter table public.compass_student_communication_profiles enable row level security;

comment on table public.compass_student_communication_profiles is
  'Compass Student Communication Profile. One row per student per evaluation. '
  '*_private_notes columns are SLP-only and must never appear on the generated report.';


-- ---------------------------------------------------------------------
-- 3. create_compass_profile_goals_and_action_items
-- ---------------------------------------------------------------------
-- D · My communication goals
create table public.compass_profile_goals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null
    references public.compass_student_communication_profiles(id) on delete cascade,
  objective  text not null,
  notes      text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index compass_profile_goals_profile_id_idx
  on public.compass_profile_goals (profile_id, sort_order);

alter table public.compass_profile_goals enable row level security;

comment on table public.compass_profile_goals is
  'COMPASS "My Communication Goals": one row per objective on a profile. Updated at weekly COMPASS meetings.';

-- D · Action items & next steps
create table public.compass_profile_action_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null
    references public.compass_student_communication_profiles(id) on delete cascade,
  description text not null,
  assigned_to text,
  status      public.compass_action_status,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index compass_profile_action_items_profile_id_idx
  on public.compass_profile_action_items (profile_id, sort_order);

alter table public.compass_profile_action_items enable row level security;

comment on table public.compass_profile_action_items is
  'COMPASS "Action Items & Next Steps": one row per action on a profile. assigned_to is free text (often parents or team members without accounts).';


-- ---------------------------------------------------------------------
-- 4. add_compass_updated_at_triggers
--    Reuses the existing public.update_updated_at_column() (also used by speech_screenings)
-- ---------------------------------------------------------------------
create trigger compass_profiles_set_updated_at
  before update on public.compass_student_communication_profiles
  for each row execute function public.update_updated_at_column();

create trigger compass_profile_goals_set_updated_at
  before update on public.compass_profile_goals
  for each row execute function public.update_updated_at_column();

create trigger compass_profile_action_items_set_updated_at
  before update on public.compass_profile_action_items
  for each row execute function public.update_updated_at_column();


-- ---------------------------------------------------------------------
-- 5. add_compass_rls_policies
-- ---------------------------------------------------------------------
-- ── Profiles ──────────────────────────────────────────────

create policy "Org members can view COMPASS profiles for their schools"
  on public.compass_student_communication_profiles
  for select
  to authenticated
  using (
    school_id in (
      select s.id from public.schools s
      where s.organization_id = (select public.get_user_organization_id())
    )
  );

create policy "Org members can add COMPASS profiles for their schools"
  on public.compass_student_communication_profiles
  for insert
  to authenticated
  with check (
    created_by = (select auth.uid())
    and school_id in (
      select s.id from public.schools s
      where s.organization_id = (select public.get_user_organization_id())
    )
  );

create policy "Org members can edit COMPASS profiles for their schools"
  on public.compass_student_communication_profiles
  for update
  to authenticated
  using (
    school_id in (
      select s.id from public.schools s
      where s.organization_id = (select public.get_user_organization_id())
    )
  )
  with check (
    school_id in (
      select s.id from public.schools s
      where s.organization_id = (select public.get_user_organization_id())
    )
  );

create policy "Creator or admin can delete COMPASS profiles"
  on public.compass_student_communication_profiles
  for delete
  to authenticated
  using (
    school_id in (
      select s.id from public.schools s
      where s.organization_id = (select public.get_user_organization_id())
    )
    and (
      created_by = (select auth.uid())
      or exists (
        select 1 from public.users u
        where u.id = (select auth.uid())
          and u.role in ('admin', 'super_admin')
      )
    )
  );

-- created_by can never change after insert, so the delete rule can't be bypassed
create or replace function public.compass_keep_created_by()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.created_by := old.created_by;
  return new;
end;
$$;

create trigger compass_profiles_keep_created_by
  before update on public.compass_student_communication_profiles
  for each row execute function public.compass_keep_created_by();

-- ── Goals & action items: allowed if you can see the parent profile ──

create policy "Org members can manage COMPASS goals via their profile"
  on public.compass_profile_goals
  for all
  to authenticated
  using (
    exists (select 1 from public.compass_student_communication_profiles p
            where p.id = compass_profile_goals.profile_id)
  )
  with check (
    exists (select 1 from public.compass_student_communication_profiles p
            where p.id = compass_profile_goals.profile_id)
  );

create policy "Org members can manage COMPASS action items via their profile"
  on public.compass_profile_action_items
  for all
  to authenticated
  using (
    exists (select 1 from public.compass_student_communication_profiles p
            where p.id = compass_profile_action_items.profile_id)
  )
  with check (
    exists (select 1 from public.compass_student_communication_profiles p
            where p.id = compass_profile_action_items.profile_id)
  );
