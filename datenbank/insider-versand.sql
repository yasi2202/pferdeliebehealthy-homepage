-- ---------------------------------------------------------------------------
-- Merkt sich, welcher Insider-Beitrag schon an den Verteiler geschickt wurde.
--
-- ▸ SO TRÄGST DU SIE EIN:
--   supabase.com → Projekt "pferdeliebehealthy-akademie" → SQL Editor →
--   diesen Text einfügen → Run. Dasselbe Projekt wie die anderen beiden
--   Tabellen, sonst findet die Website sie nicht.
--
-- ▸ WOZU DAS GUT IST:
--   Ohne diesen Vermerk reicht ein zweiter Klick auf "An alle Insider
--   schicken", und dein ganzer Verteiler bekommt dieselbe Mail noch einmal.
--   Das lässt sich nicht zurücknehmen, und es kostet Abmeldungen. Deshalb
--   fragt die Seite hier nach, bevor sie etwas verschickt.
--
--   Falls du einen Beitrag doch noch einmal schicken willst — weil beim
--   ersten Versuch etwas schiefging —, lösch die Zeile im Table Editor.
--   Danach lässt er sich wieder versenden.
-- ---------------------------------------------------------------------------

create table if not exists insider_versand (
  id uuid primary key default gen_random_uuid(),

  -- Der Dateiname des Beitrags ohne .md, z. B. zink-mehr-als-glaenzendes-fell
  slug text not null unique,

  versendet_am timestamptz not null default now(),

  -- An wie viele Adressen die Mail rausging
  empfaenger integer not null default 0
);

alter table insider_versand enable row level security;
