create table "public"."link_analytics" (
  "id" uuid not null default gen_random_uuid(),
  "link_id" uuid not null,
  "ip_address" text,
  "user_agent" text,
  "device_type" text,
  "referrer" text,
  "country" text,
  "country_region" text,
  "city" text,
  "latitude" double precision,
  "longitude" double precision,
  "timezone" text,
  "postal_code" text,
  "vercel_region" text,
  "vercel_id" text,
  "created_at" timestamp with time zone not null default now()
);

alter table "public"."link_analytics" enable row level security;

create unique index "link_analytics_pkey"
  on "public"."link_analytics" using btree (id);

create index "idx_link_analytics_link_id"
  on "public"."link_analytics" using btree (link_id);

alter table "public"."link_analytics"
  add constraint "link_analytics_pkey"
  primary key using index "link_analytics_pkey";

alter table "public"."link_analytics"
  add constraint "link_analytics_link_id_fkey"
  foreign key (link_id)
  references "public"."shortened_links"(id)
  on update cascade
  on delete cascade;

-- Reads: owners can view analytics for their own short links.
-- Writes: performed by the shortener via the service role (admin client),
-- which bypasses RLS; no insert privileges are granted to anon/authenticated.
grant select on table "public"."link_analytics" to "authenticated";

grant delete on table "public"."link_analytics" to "service_role";
grant insert on table "public"."link_analytics" to "service_role";
grant references on table "public"."link_analytics" to "service_role";
grant select on table "public"."link_analytics" to "service_role";
grant trigger on table "public"."link_analytics" to "service_role";
grant truncate on table "public"."link_analytics" to "service_role";
grant update on table "public"."link_analytics" to "service_role";

create policy "Allow owners to select their link analytics"
on "public"."link_analytics"
as permissive
for select
to authenticated
using (
  link_id in (
    select id
    from "public"."shortened_links"
    where creator_id = auth.uid()
  )
);

comment on table "public"."link_analytics" is
  'Per-scan analytics for shortened links / dynamic QR codes. One row per successful redirect.';
