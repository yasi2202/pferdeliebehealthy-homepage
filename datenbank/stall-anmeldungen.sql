-- ---------------------------------------------------------------------------
-- Die Tabelle für die Stall-Organizer-Anmeldungen.
--
-- ▸ SO TRÄGST DU SIE EIN:
--   1. supabase.com öffnen, Projekt "pferdeliebehealthy-akademie" wählen
--      (Kennung pklopjbemmyvpmywoayk, dasselbe wie bei den anderen Tabellen).
--   2. Links in der Leiste auf "SQL Editor".
--   3. Diesen ganzen Text hineinkopieren und auf "Run" klicken.
--
-- ▸ WOZU SIE DA IST
--   Der Stall Organizer selbst braucht sie nicht, der läuft über
--   `kursteilnehmer`. Diese Tabelle ist ausschließlich für die Mailstrecke:
--   Sie sammelt die, die bei der Anmeldung ausdrücklich zugestimmt haben,
--   Tipps per Mail zu bekommen. Ohne diese Trennung bekäme jede Kundin der
--   Akademie die Serie, auch die, die nur einen Kurs gekauft hat.
--
-- ▸ NUR BESTÄTIGTE DÜRFEN POST BEKOMMEN
--   `bestaetigt` wird erst true, wenn sie den Zugangslink in der Mail
--   angeklickt hat. Damit ist belegt, dass die Adresse ihr gehört. Das
--   Streckensystem holt sich ohnehin nur Zeilen mit bestaetigt = true.
-- ---------------------------------------------------------------------------

create table if not exists public.stall_anmeldungen (
  id uuid primary key default gen_random_uuid(),

  erstellt_am timestamptz not null default now(),

  -- Der Vorname ist freiwillig: Beim Stall Organizer reicht die Adresse zum
  -- Anmelden, und ein Pflichtfeld mehr kostet Anmeldungen. Fehlt er, wird in
  -- den Mails ohne Namen gegrüßt.
  vorname text,
  email text not null unique,

  -- Erst wenn sie den Zugangslink angeklickt hat, steht hier true.
  bestaetigt boolean not null default false,
  bestaetigt_am timestamptz,

  -- Womit sie zugestimmt hat, im Wortlaut. Wer je nachweisen muss, worauf
  -- sich die Einwilligung bezog, findet es hier und muss nicht raten, wie
  -- die Seite damals aussah.
  einwilligung_text text,

  -- Woher sie kam, für die Auswertung: 'website' oder 'akademie'.
  quelle text
);

-- Das Streckensystem fragt nach bestaetigt und bestaetigt_am.
create index if not exists stall_anmeldungen_bestaetigt_idx
  on public.stall_anmeldungen (bestaetigt, bestaetigt_am);

-- Gelesen und geschrieben wird ausschliesslich vom Server mit dem geheimen
-- Schlüssel. Ohne eigene Regel kommt mit dem öffentlichen Schlüssel niemand
-- an die Adressen heran.
alter table public.stall_anmeldungen enable row level security;

-- ---------------------------------------------------------------------------
-- ZWEITER TEIL: Mails überspringen, wenn schon gekauft wurde.
--
-- ▸ DAS PROBLEM, DAS DAMIT WEGGEHT
--   Eine Mailstrecke schickt bisher an alle, die im Zeitfenster liegen. Wer
--   also an Tag 12 Mineral-Klarheit kauft, bekommt an Tag 18 und an Tag 30
--   weiter Werbung für genau diesen Kurs. Das wirkt, als würdest du nicht
--   mitbekommen, wer bei dir kauft.
--
-- ▸ WIE ES JETZT GEHT
--   In dieser Spalte steht der Zugangsschlüssel eines Produkts, zum Beispiel
--   `mineral-klarheit`. Wer ihn schon hat, überspringt diese eine Mail; die
--   übrigen Mails der Strecke bekommt sie weiter. Leer heisst: geht an alle,
--   so wie bisher.
--
--   Den Schlüssel findest du in lib/digital.ts beim jeweiligen Produkt unter
--   `slug`.
-- ---------------------------------------------------------------------------

alter table public.newsletter_strecken_mails
  add column if not exists nicht_wenn_zugang text;
