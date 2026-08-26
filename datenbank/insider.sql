-- ---------------------------------------------------------------------------
-- Die Tabelle für die Insider-Anmeldungen — plus eine Ansicht, die sie mit
-- den Futter-Check-Anmeldungen zu einer einzigen Liste zusammenfasst.
--
-- ▸ SO TRÄGST DU SIE EIN:
--   1. supabase.com öffnen, Projekt "pferdeliebehealthy-akademie" anklicken.
--      ACHTUNG: dasselbe Projekt wie beim Futter-Check, sonst passt es nicht
--      zusammen.
--   2. Links in der Leiste auf "SQL Editor".
--   3. Diesen ganzen Text hineinkopieren und auf "Run" klicken.
--
-- ▸ WARUM EINE ZWEITE TABELLE:
--   Wer sich für den Insider-Kanal einträgt, hat in etwas anderes eingewilligt
--   als jemand, der den Futter-Check gemacht hat. Getrennt gespeichert kannst
--   du für jede Adresse belegen, wofür und wo sie zugestimmt hat. Das ist der
--   Unterschied zwischen "ich habe eine Liste" und "ich kann meine Liste
--   begründen", falls jemand nachfragt.
--
-- ▸ SO HOLST DU DIR DIE GESAMTE LISTE:
--   Table Editor → in der Liste links "alle_anmeldungen" anklicken → oben
--   rechts "Export" → "Download as CSV". Darin stehen beide Quellen
--   untereinander, mit einer Spalte `woher`, die sagt, wo sie herkommen.
--   Nimm nur Zeilen, bei denen `bestaetigt` auf `true` steht.
-- ---------------------------------------------------------------------------

create table if not exists insider_anmeldungen (
  id uuid primary key default gen_random_uuid(),

  erstellt_am timestamptz not null default now(),

  vorname text not null,
  email text not null,

  -- Erst wenn sie auf den Link in der Bestätigungsmail geklickt hat, steht
  -- hier true. Nur diese Adressen darfst du anschreiben.
  bestaetigt boolean not null default false,
  bestaetigt_am timestamptz,

  -- Der Schlüssel aus dem Bestätigungslink. Zufällig, nicht erratbar.
  token text not null unique,

  -- Von welcher Stelle der Website sie sich eingetragen hat. Nützlich, wenn
  -- du wissen willst, welcher Platz auf der Seite tatsächlich etwas bringt.
  quelle text
);

create unique index if not exists insider_anmeldungen_email_idx
  on insider_anmeldungen (lower(email));

create index if not exists insider_anmeldungen_erstellt_idx
  on insider_anmeldungen (erstellt_am desc);

-- Von außen kommt niemand an die Tabelle. Nur die Website selbst, weil sie
-- den geheimen Schlüssel benutzt, und der umgeht diese Sperre bewusst.
alter table insider_anmeldungen enable row level security;

-- ---------------------------------------------------------------------------
-- Die gemeinsame Ansicht.
--
-- Eine Ansicht ist keine zweite Kopie der Daten, sondern nur ein Blick auf
-- die beiden Tabellen. Es kann also nichts auseinanderlaufen: was du hier
-- siehst, ist immer der aktuelle Stand.
--
-- Steht eine Adresse in beiden Tabellen, erscheint sie einmal, und `woher`
-- nennt dann beide Quellen.
-- ---------------------------------------------------------------------------
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
) as zusammen
group by lower(email)
order by min(erstellt_am) desc;
