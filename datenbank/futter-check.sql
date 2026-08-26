-- ---------------------------------------------------------------------------
-- Die Tabelle für die Futter-Check-Anmeldungen.
--
-- ▸ SO TRÄGST DU SIE EIN:
--   1. supabase.com öffnen und dein Projekt anklicken (dasselbe, das schon
--      hinter der Akademie steckt).
--   2. Links in der Leiste auf "SQL Editor".
--   3. Diesen ganzen Text hier hineinkopieren und auf "Run" klicken.
--   4. Fertig. Unter "Table Editor" siehst du die neue Tabelle.
--
-- ▸ SO HOLST DU DIR SPÄTER DIE LISTE:
--   Table Editor → futter_check_anmeldungen → oben rechts der Knopf
--   "Export" → "Download as CSV". Diese Datei kannst du bei alfima,
--   Brevo oder wo auch immer als Kontaktliste hochladen.
--
--   Achte beim Export darauf, nur die Zeilen zu nehmen, bei denen
--   `bestaetigt` auf `true` steht — nur die haben ihre Adresse per
--   Bestätigungslink freigegeben und dürfen Werbung bekommen.
-- ---------------------------------------------------------------------------

create table if not exists futter_check_anmeldungen (
  id uuid primary key default gen_random_uuid(),

  -- Wann die Anmeldung eingegangen ist
  erstellt_am timestamptz not null default now(),

  vorname text not null,
  email text not null,

  -- Erst wenn sie auf den Link in der Bestätigungsmail geklickt hat, steht
  -- hier true. Nur diese Adressen darfst du für Werbung verwenden.
  bestaetigt boolean not null default false,
  bestaetigt_am timestamptz,

  -- Der Schlüssel aus dem Bestätigungslink. Zufällig, nicht erratbar.
  token text not null unique,

  -- Ihr Ergebnis, damit du beim Nachfassen weißt, worüber du sprichst
  ergebnis_titel text,
  ergebnis_text text,
  antworten jsonb,

  -- Woher sie kam, falls du das später auswerten willst
  quelle text
);

-- Eine Adresse nur einmal. Wer den Check zweimal macht, überschreibt seinen
-- eigenen Eintrag, statt doppelt in der Liste zu stehen.
create unique index if not exists futter_check_anmeldungen_email_idx
  on futter_check_anmeldungen (lower(email));

-- Die neuesten zuerst, das ist die Reihenfolge, in der du sie ansiehst.
create index if not exists futter_check_anmeldungen_erstellt_idx
  on futter_check_anmeldungen (erstellt_am desc);

-- ---------------------------------------------------------------------------
-- Zugriffsschutz.
--
-- "Row Level Security" einzuschalten und keine einzige Regel zu vergeben
-- heißt: von außen kommt niemand an die Tabelle. Nur die Website selbst
-- kommt heran, weil sie den geheimen Schlüssel benutzt (SUPABASE_SECRET_KEY),
-- und der umgeht diese Sperre bewusst.
--
-- Ohne diese Zeile könnte jeder, der den öffentlichen Schlüssel deines
-- Supabase-Projekts kennt, deine komplette Adressliste herunterladen.
-- ---------------------------------------------------------------------------
alter table futter_check_anmeldungen enable row level security;
