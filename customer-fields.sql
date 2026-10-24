-- PTY-TECH Customer Details Migration
-- Safe to run on the existing project. Does not delete or recreate any data.
alter table public.repair_jobs
  add column if not exists customer_address text;

comment on column public.repair_jobs.customer_address is
  'Customer address for PTY-TECH repair job records';
