create table "public"."shortened_links" (
  "id" uuid not null default gen_random_uuid(),
  "link" text not null,
  "slug" text not null,
  "domain" text not null,
  "password_hash" text,
  "password_hint" text,
  "creator_id" uuid not null,
  "created_at" timestamp with time zone not null default now()
);

alter table "public"."shortened_links" enable row level security;

create or replace function extract_domain(url text)
returns text as $$
begin
  return case
    when url ~ '^https?://' then
      regexp_replace(regexp_replace(url, '^https?://', ''), '/.*$', '')
    when url ~ '^//' then
      regexp_replace(regexp_replace(url, '^//', ''), '/.*$', '')
    else
      regexp_replace(url, '/.*$', '')
  end;
end;
$$ language plpgsql immutable;

create unique index "shortened_links_pkey"
  on "public"."shortened_links" using btree (id);

create unique index "shortened_links_slug_key"
  on "public"."shortened_links" using btree (slug);

create index "idx_shortened_links_creator_id"
  on "public"."shortened_links" using btree (creator_id)
  where creator_id is not null;

alter table "public"."shortened_links"
  add constraint "shortened_links_pkey"
  primary key using index "shortened_links_pkey";

alter table "public"."shortened_links"
  add constraint "shortened_links_slug_key"
  unique using index "shortened_links_slug_key";

alter table "public"."shortened_links"
  add constraint "shortened_links_creator_id_fkey"
  foreign key (creator_id)
  references "public"."users"(id)
  on update cascade
  on delete set default;

alter table "public"."shortened_links"
  add constraint "shortened_links_password_hint_length"
  check (password_hint is null or char_length(password_hint) <= 200);

create or replace function set_shortened_links_domain()
returns trigger
language plpgsql
as $$
begin
  new.domain := regexp_replace(
    regexp_replace(new.link, '^https?://|^//', ''),
    '/.*$',
    ''
  );
  return new;
end;
$$;

create trigger "trg_set_shortened_links_domain"
before insert or update of link
on "public"."shortened_links"
for each row
execute function set_shortened_links_domain();

create or replace function "public"."enforce_shortened_links_limit"()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_link_count integer;
begin
  if new.creator_id is null then
    raise exception 'creator_id is required';
  end if;

  -- prevent race condition
  perform pg_advisory_xact_lock(hashtext(new.creator_id::text));

  select count(*)::integer
  into current_link_count
  from "public"."shortened_links"
  where "creator_id" = new.creator_id;

  if current_link_count >= 30 then
    raise exception 'You have reached the 30-link limit for your account'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create trigger "trg_enforce_shortened_links_limit"
before insert
on "public"."shortened_links"
for each row
execute function "public"."enforce_shortened_links_limit"();

grant delete on table "public"."shortened_links" to "anon";
grant insert on table "public"."shortened_links" to "anon";
grant references on table "public"."shortened_links" to "anon";
grant select on table "public"."shortened_links" to "anon";
grant trigger on table "public"."shortened_links" to "anon";
grant truncate on table "public"."shortened_links" to "anon";
grant update on table "public"."shortened_links" to "anon";

grant delete on table "public"."shortened_links" to "authenticated";
grant insert on table "public"."shortened_links" to "authenticated";
grant references on table "public"."shortened_links" to "authenticated";
grant select on table "public"."shortened_links" to "authenticated";
grant trigger on table "public"."shortened_links" to "authenticated";
grant truncate on table "public"."shortened_links" to "authenticated";
grant update on table "public"."shortened_links" to "authenticated";

grant delete on table "public"."shortened_links" to "service_role";
grant insert on table "public"."shortened_links" to "service_role";
grant references on table "public"."shortened_links" to "service_role";
grant select on table "public"."shortened_links" to "service_role";
grant trigger on table "public"."shortened_links" to "service_role";
grant truncate on table "public"."shortened_links" to "service_role";
grant update on table "public"."shortened_links" to "service_role";

create policy "Allow users to select"
on "public"."shortened_links"
as permissive
for select
to authenticated
using (
  creator_id = auth.uid()
);

create policy "Allow users to insert"
on "public"."shortened_links"
as permissive
for insert
to authenticated
with check (
  creator_id = auth.uid()
);

create policy "Allow users to update"
on "public"."shortened_links"
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
on "public"."shortened_links"
as permissive
for delete
to authenticated
using (
  creator_id = auth.uid()
);

comment on column "public"."shortened_links"."password_hash" is
  'bcrypt-hashed password for link protection. NULL means no password protection.';

comment on column "public"."shortened_links"."password_hint" is
  'Optional plaintext hint to help users remember the password. Max 200 characters.';