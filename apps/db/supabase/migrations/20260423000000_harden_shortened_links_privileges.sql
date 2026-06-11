revoke all privileges on table "public"."shortened_links" from "anon";

revoke references, trigger, truncate on table "public"."shortened_links"
from "authenticated";
