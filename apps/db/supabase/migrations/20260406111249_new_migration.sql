create schema if not exists "pgmq";

create extension if not exists "pgmq" with schema "pgmq";

create schema if not exists "pgmq_public";


  create table "public"."qr_code" (
    "id" uuid not null default gen_random_uuid(),
    "short_code" text not null,
    "target_url" text,
    "qr_type" character varying,
    "design_settings" json,
    "created_at" timestamp without time zone,
    "scan_count" bigint,
    "user_id" uuid default gen_random_uuid()
      );


alter table "public"."qr_code" enable row level security;


  create table "public"."scans" (
    "id" uuid not null default gen_random_uuid(),
    "qr_id" uuid not null default auth.uid(),
    "scanned_at" timestamp without time zone,
    "device_type" character varying,
    "country" character varying,
    "ip_address" text
      );


alter table "public"."scans" enable row level security;

CREATE UNIQUE INDEX qr_code_pkey ON public.qr_code USING btree (id);

CREATE UNIQUE INDEX scans_pkey ON public.scans USING btree (id);

alter table "public"."qr_code" add constraint "qr_code_pkey" PRIMARY KEY using index "qr_code_pkey";

alter table "public"."scans" add constraint "scans_pkey" PRIMARY KEY using index "scans_pkey";

alter table "public"."qr_code" add constraint "qr_code_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."qr_code" validate constraint "qr_code_user_id_fkey";

alter table "public"."scans" add constraint "scans_qr_id_fkey" FOREIGN KEY (qr_id) REFERENCES public.qr_code(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."scans" validate constraint "scans_qr_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION pgmq_public.archive(queue_name text, message_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$ begin return pgmq.archive( queue_name := queue_name, msg_id := message_id ); end; $function$
;

CREATE OR REPLACE FUNCTION pgmq_public.delete(queue_name text, message_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$ begin return pgmq.delete( queue_name := queue_name, msg_id := message_id ); end; $function$
;

CREATE OR REPLACE FUNCTION pgmq_public.pop(queue_name text)
 RETURNS SETOF pgmq.message_record
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$ begin return query select * from pgmq.pop( queue_name := queue_name ); end; $function$
;

CREATE OR REPLACE FUNCTION pgmq_public.read(queue_name text, sleep_seconds integer, n integer)
 RETURNS SETOF pgmq.message_record
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$ begin return query select * from pgmq.read( queue_name := queue_name, vt := sleep_seconds, qty := n ); end; $function$
;

CREATE OR REPLACE FUNCTION pgmq_public.send(queue_name text, message jsonb, sleep_seconds integer DEFAULT 0)
 RETURNS SETOF bigint
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$ begin return query select * from pgmq.send( queue_name := queue_name, msg := message, delay := sleep_seconds ); end; $function$
;

CREATE OR REPLACE FUNCTION pgmq_public.send_batch(queue_name text, messages jsonb[], sleep_seconds integer DEFAULT 0)
 RETURNS SETOF bigint
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$ begin return query select * from pgmq.send_batch( queue_name := queue_name, msgs := messages, delay := sleep_seconds ); end; $function$
;

grant delete on table "public"."qr_code" to "anon";

grant insert on table "public"."qr_code" to "anon";

grant references on table "public"."qr_code" to "anon";

grant select on table "public"."qr_code" to "anon";

grant trigger on table "public"."qr_code" to "anon";

grant truncate on table "public"."qr_code" to "anon";

grant update on table "public"."qr_code" to "anon";

grant delete on table "public"."qr_code" to "authenticated";

grant insert on table "public"."qr_code" to "authenticated";

grant references on table "public"."qr_code" to "authenticated";

grant select on table "public"."qr_code" to "authenticated";

grant trigger on table "public"."qr_code" to "authenticated";

grant truncate on table "public"."qr_code" to "authenticated";

grant update on table "public"."qr_code" to "authenticated";

grant delete on table "public"."qr_code" to "service_role";

grant insert on table "public"."qr_code" to "service_role";

grant references on table "public"."qr_code" to "service_role";

grant select on table "public"."qr_code" to "service_role";

grant trigger on table "public"."qr_code" to "service_role";

grant truncate on table "public"."qr_code" to "service_role";

grant update on table "public"."qr_code" to "service_role";

grant delete on table "public"."scans" to "anon";

grant insert on table "public"."scans" to "anon";

grant references on table "public"."scans" to "anon";

grant select on table "public"."scans" to "anon";

grant trigger on table "public"."scans" to "anon";

grant truncate on table "public"."scans" to "anon";

grant update on table "public"."scans" to "anon";

grant delete on table "public"."scans" to "authenticated";

grant insert on table "public"."scans" to "authenticated";

grant references on table "public"."scans" to "authenticated";

grant select on table "public"."scans" to "authenticated";

grant trigger on table "public"."scans" to "authenticated";

grant truncate on table "public"."scans" to "authenticated";

grant update on table "public"."scans" to "authenticated";

grant delete on table "public"."scans" to "service_role";

grant insert on table "public"."scans" to "service_role";

grant references on table "public"."scans" to "service_role";

grant select on table "public"."scans" to "service_role";

grant trigger on table "public"."scans" to "service_role";

grant truncate on table "public"."scans" to "service_role";

grant update on table "public"."scans" to "service_role";


