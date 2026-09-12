-- ---------------------------------------------------------------------------
-- Die Tabelle für den kostenlosen Minikurs „Heu 2026“ (seit 12.09.2026),
-- und die Aufnahme in den Newsletter-Verteiler.
--
-- ▸ SO TRÄGST DU SIE EIN:
--   1. supabase.com öffnen, Projekt "pferdeliebehealthy-akademie" wählen
--      (Kennung pklopjbemmyvpmywoayk, dasselbe wie bei den anderen Tabellen).
--   2. Links in der Leiste auf "SQL Editor".
--   3. Diesen ganzen Text hineinkopieren und auf "Run" klicken.
--   Danach unter /admin/newsletter die Strecke "Minikurs Heu 2026" einschalten.
--
-- ▸ WOZU SIE DA IST
--   Wer sich auf /heu-2026 einträgt, landet hier. Die Mailstrecke mit dem
--   Auslöser "heu-minikurs" schickt die fünf Mails, sobald `bestaetigt` true
--   ist. Fehlt die Tabelle, bekommt die Besucherin trotzdem die
--   Bestätigungsmail, aber danach nichts, weil die Strecke niemanden findet.
--
-- ▸ NUR BESTÄTIGTE BEKOMMEN POST
--   `bestaetigt` wird erst true, wenn sie den Link in der Bestätigungsmail
--   angeklickt hat. Damit ist belegt, dass die Adresse ihr gehört.
--
-- ▸ IN DER ANSICHT `alle_anmeldungen`, anders als der Öl-Guide
--   Das Häkchen deckt ausdrücklich auch Tipps zu Fütterung und
--   Pferdegesundheit nach dem Minikurs ab. Deshalb gehören diese Adressen in
--   denselben Verteiler wie Futter-Check, Insider und Stall Organizer.
--   Die Ansicht unten ist die aus stall-in-newsletter.sql plus eine Zeile.
-- ---------------------------------------------------------------------------

create table if not exists public.heu_minikurs_anmeldungen (
  id uuid primary key default gen_random_uuid(),

  erstellt_am timestamptz not null default now(),

  -- Freiwillig. Fehlt er, wird in den Mails ohne Namen gegrüßt.
  vorname text,
  email text not null unique,

  -- Erst wenn sie den Link in der Bestätigungsmail angeklickt hat.
  bestaetigt boolean not null default false,
  bestaetigt_am timestamptz,

  -- Womit sie zugestimmt hat, im Wortlaut.
  einwilligung_text text,

  -- Woher sie kam, aus ?von= in der Adresse, sonst 'website'.
  quelle text
);

create index if not exists heu_minikurs_anmeldungen_bestaetigt_idx
  on public.heu_minikurs_anmeldungen (bestaetigt, bestaetigt_am);

-- Gelesen und geschrieben wird ausschliesslich vom Server mit dem geheimen
-- Schlüssel. Ohne eigene Regel kommt mit dem öffentlichen Schlüssel niemand
-- an die Adressen heran.
alter table public.heu_minikurs_anmeldungen enable row level security;

create or replace view alle_anmeldungen as
select
  lower(email)                              as email,
  max(vorname)                              as vorname,
  bool_or(bestaetigt)                       as bestaetigt,
  min(erstellt_am)                          as erste_anmeldung,
  string_agg(distinct woher, ' + ')         as woher
from (
  select email, vorname, bestaetigt, erstellt_am, 'Futter-Check' as woher
  from futter_check_anmeldungen
  union all
  select email, vorname, bestaetigt, erstellt_am, 'Insider' as woher
  from insider_anmeldungen
  union all
  select email, vorname, bestaetigt, erstellt_am, 'Stall Organizer' as woher
  from stall_anmeldungen
  union all
  -- Neu seit dem 12.09.2026.
  select email, vorname, bestaetigt, erstellt_am, 'Minikurs Heu 2026' as woher
  from heu_minikurs_anmeldungen
) as zusammen
group by lower(email)
order by min(erstellt_am) desc;
