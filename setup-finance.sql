-- PTY-TECH Finance Module
-- Run this script in Supabase SQL Editor for the EXISTING project.
-- It creates only new tables; it does not drop or modify existing repair/inventory data.

create table if not exists public.repair_payments (
  id uuid primary key default gen_random_uuid(),
  repair_job_id uuid null references public.repair_jobs(id) on delete restrict,
  amount numeric(14,2) not null check (amount > 0),
  payment_date date not null default current_date,
  payment_method text not null default 'cash'
    check (payment_method in ('cash','bank','mobile_wallet','other')),
  notes text,
  recorded_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.business_expenses (
  id uuid primary key default gen_random_uuid(),
  repair_job_id uuid null references public.repair_jobs(id) on delete restrict,
  category text not null
    check (category in ('parts','tools','transport','utilities','rent','salary','other')),
  amount numeric(14,2) not null check (amount > 0),
  expense_date date not null default current_date,
  notes text,
  recorded_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists repair_payments_date_idx
  on public.repair_payments (payment_date desc);
create index if not exists repair_payments_job_idx
  on public.repair_payments (repair_job_id);
create index if not exists business_expenses_date_idx
  on public.business_expenses (expense_date desc);
create index if not exists business_expenses_job_idx
  on public.business_expenses (repair_job_id);

alter table public.repair_payments enable row level security;
alter table public.business_expenses enable row level security;

drop policy if exists "PTY admin manages repair payments" on public.repair_payments;
create policy "PTY admin manages repair payments"
  on public.repair_payments
  for all to authenticated
  using (public.is_pty_admin())
  with check (public.is_pty_admin());

drop policy if exists "PTY admin manages business expenses" on public.business_expenses;
create policy "PTY admin manages business expenses"
  on public.business_expenses
  for all to authenticated
  using (public.is_pty_admin())
  with check (public.is_pty_admin());

grant select, insert, update, delete on public.repair_payments to authenticated;
grant select, insert, update, delete on public.business_expenses to authenticated;

-- Sanity check: these two tables should appear after running the script.
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('repair_payments', 'business_expenses')
order by table_name;
