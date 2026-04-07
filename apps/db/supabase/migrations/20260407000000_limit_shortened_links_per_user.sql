create table if not exists "public"."shortened_link_usage" (
  "user_id" uuid not null,
  "used_count" integer not null default 0,
  "created_at" timestamp with time zone not null default now(),
  "updated_at" timestamp with time zone not null default now()
);

create unique index if not exists "shortened_link_usage_pkey"
  on "public"."shortened_link_usage" using btree ("user_id");

alter table "public"."shortened_link_usage"
  add constraint "shortened_link_usage_pkey"
  primary key using index "shortened_link_usage_pkey";

alter table "public"."shortened_link_usage"
  add constraint "shortened_link_usage_user_id_fkey"
  foreign key ("user_id")
  references "public"."users"("id")
  on update cascade
  on delete cascade;

alter table "public"."shortened_link_usage"
  add constraint "shortened_link_usage_used_count_check"
  check ("used_count" >= 0 and "used_count" <= 30);

insert into "public"."shortened_link_usage" ("user_id", "used_count")
select
  "creator_id",
  least(count(*), 30)::integer
from "public"."shortened_links"
group by "creator_id"
on conflict ("user_id") do update
set
  "used_count" = greatest(
    "public"."shortened_link_usage"."used_count",
    excluded."used_count"
  ),
  "updated_at" = now();

drop policy if exists "Allow users to insert"
on "public"."shortened_links";

create or replace function "public"."enforce_shortened_links_limit"()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_used_count integer;
begin
  perform pg_advisory_xact_lock(hashtext(new.creator_id::text));

  insert into "public"."shortened_link_usage" ("user_id", "used_count")
  values (new.creator_id, 0)
  on conflict ("user_id") do nothing;

  select "used_count"
  into current_used_count
  from "public"."shortened_link_usage"
  where "user_id" = new.creator_id
  for update;

  if current_used_count >= 30 then
    raise exception 'You have reached the 30-link limit for your account';
  end if;

  update "public"."shortened_link_usage"
  set
    "used_count" = "used_count" + 1,
    "updated_at" = now()
  where "user_id" = new.creator_id;

  return new;
end;
$$;

drop trigger if exists "trg_enforce_shortened_links_limit"
on "public"."shortened_links";

create trigger "trg_enforce_shortened_links_limit"
before insert
on "public"."shortened_links"
for each row
execute function "public"."enforce_shortened_links_limit"();

create policy "Allow users to insert"
on "public"."shortened_links"
as permissive
for insert
to authenticated
with check (
  creator_id = auth.uid()
);
