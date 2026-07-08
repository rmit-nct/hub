-- Dynamic QR codes get their own table so generating a dynamic QR no longer
-- consumes the shortener's per-user 30-link limit. The QR row is still
-- required for the scan to resolve/redirect and for scan analytics, but it
-- lives outside `shortened_links` and has no generation cap.
--
-- Slugs remain a single global namespace (the redirect app resolves one slug
-- to one destination), so uniqueness is enforced across BOTH tables.

create table "public"."dynamic_qr_links" (
  "id" uuid not null default gen_random_uuid(),
  "link" text not null,
  "slug" text not null,
  "domain" text not null,
  "creator_id" uuid not null,
  "created_at" timestamp with time zone not null default now()
);

alter table "public"."dynamic_qr_links" enable row level security;

create unique index "dynamic_qr_links_pkey"
  on "public"."dynamic_qr_links" using btree (id);

create unique index "dynamic_qr_links_slug_key"
  on "public"."dynamic_qr_links" using btree (slug);

create index "idx_dynamic_qr_links_creator_id"
  on "public"."dynamic_qr_links" using btree (creator_id)
  where creator_id is not null;

alter table "public"."dynamic_qr_links"
  add constraint "dynamic_qr_links_pkey"
  primary key using index "dynamic_qr_links_pkey";

alter table "public"."dynamic_qr_links"
  add constraint "dynamic_qr_links_slug_key"
  unique using index "dynamic_qr_links_slug_key";

alter table "public"."dynamic_qr_links"
  add constraint "dynamic_qr_links_creator_id_fkey"
  foreign key (creator_id)
  references "public"."users"(id)
  on update cascade
  on delete set default;

-- Reuse the existing domain-derivation trigger function (it only reads
-- new.link and writes new.domain, so it is table-agnostic).
create trigger "trg_set_dynamic_qr_links_domain"
before insert or update of link
on "public"."dynamic_qr_links"
for each row
execute function set_shortened_links_domain();

-- Cross-table slug uniqueness: a slug must be unique across both
-- `shortened_links` and `dynamic_qr_links`. The per-table unique indexes only
-- guard within a table, so this trigger checks the sibling table on insert.
-- Collisions are raised with errcode 23505 so the app's existing
-- unique-violation retry loop treats them like any other slug collision.
create or replace function "public"."ensure_global_slug_unique"()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_table_name = 'shortened_links' then
    if exists (
      select 1 from "public"."dynamic_qr_links" where slug = new.slug
    ) then
      raise exception 'slug % already exists', new.slug using errcode = '23505';
    end if;
  else
    if exists (
      select 1 from "public"."shortened_links" where slug = new.slug
    ) then
      raise exception 'slug % already exists', new.slug using errcode = '23505';
    end if;
  end if;

  return new;
end;
$$;

create trigger "trg_dynamic_qr_links_slug_unique"
before insert
on "public"."dynamic_qr_links"
for each row
execute function "public"."ensure_global_slug_unique"();

create trigger "trg_shortened_links_slug_unique"
before insert
on "public"."shortened_links"
for each row
execute function "public"."ensure_global_slug_unique"();

-- `link_analytics.link_id` can now reference a row in either table, so a
-- single-table foreign key no longer fits. Drop it and replace the cascade
-- behavior with per-table delete-cleanup triggers.
alter table "public"."link_analytics"
  drop constraint "link_analytics_link_id_fkey";

create or replace function "public"."delete_link_analytics_for_link"()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  delete from "public"."link_analytics" where link_id = old.id;
  return old;
end;
$$;

create trigger "trg_shortened_links_delete_analytics"
after delete
on "public"."shortened_links"
for each row
execute function "public"."delete_link_analytics_for_link"();

create trigger "trg_dynamic_qr_links_delete_analytics"
after delete
on "public"."dynamic_qr_links"
for each row
execute function "public"."delete_link_analytics_for_link"();

-- Extend analytics read access to dynamic QR owners.
drop policy "Allow owners to select their link analytics"
  on "public"."link_analytics";

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
  or link_id in (
    select id
    from "public"."dynamic_qr_links"
    where creator_id = auth.uid()
  )
);

-- Privileges mirror the hardened `shortened_links` state: authenticated users
-- manage their own rows via RLS; the shortener redirect reads via service_role.
grant select on table "public"."dynamic_qr_links" to "authenticated";
grant insert on table "public"."dynamic_qr_links" to "authenticated";
grant update on table "public"."dynamic_qr_links" to "authenticated";
grant delete on table "public"."dynamic_qr_links" to "authenticated";

grant delete on table "public"."dynamic_qr_links" to "service_role";
grant insert on table "public"."dynamic_qr_links" to "service_role";
grant references on table "public"."dynamic_qr_links" to "service_role";
grant select on table "public"."dynamic_qr_links" to "service_role";
grant trigger on table "public"."dynamic_qr_links" to "service_role";
grant truncate on table "public"."dynamic_qr_links" to "service_role";
grant update on table "public"."dynamic_qr_links" to "service_role";

create policy "Allow users to select"
on "public"."dynamic_qr_links"
as permissive
for select
to authenticated
using (
  creator_id = auth.uid()
);

create policy "Allow users to insert"
on "public"."dynamic_qr_links"
as permissive
for insert
to authenticated
with check (
  creator_id = auth.uid()
);

create policy "Allow users to update"
on "public"."dynamic_qr_links"
as permissive
for update
to authenticated
using (
  creator_id = auth.uid()
)
with check (
  creator_id = auth.uid()
);

create policy "Allow users to delete"
on "public"."dynamic_qr_links"
as permissive
for delete
to authenticated
using (
  creator_id = auth.uid()
);

comment on table "public"."dynamic_qr_links" is
  'Destination links for dynamic QR codes. Separate from shortened_links so QR generation does not count against the shortener 30-link limit. Slugs are unique across both tables.';
