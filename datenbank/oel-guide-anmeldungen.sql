-- ---------------------------------------------------------------------------
-- Die Tabelle für die Anmeldungen zum Öl-Guide von aromahorseoil.
--
-- ▸ SO TRÄGST DU SIE EIN:
--   1. supabase.com öffnen, Projekt "pferdeliebehealthy-akademie" wählen
--      (Kennung pklopjbemmyvpmywoayk, dasselbe wie bei den anderen Tabellen).
--   2. Links in der Leiste auf "SQL Editor".
--   3. Diesen ganzen Text hineinkopieren und auf "Run" klicken.
--
-- ▸ WOZU SIE DA IST
--   Der Öl-Guide gibt es seit dem 12.09.2026 nur noch gegen Mailadresse. Hier
--   stehen alle, die ihn angefordert haben. Fehlt die Tabelle, bekommen sie den
--   Guide trotzdem, aber ihre Adresse wird nirgends festgehalten.
--
-- ▸ NUR BESTÄTIGTE DÜRFEN POST BEKOMMEN
--   `bestaetigt` wird erst true, wenn sie den Link zum Guide in der Mail
--   angeklickt hat. Damit ist belegt, dass die Adresse ihr gehört.
--
-- ▸ BEWUSST NICHT IN DER ANSICHT `alle_anmeldungen`
--   Diese Leute haben Tipps zu ätherischen Ölen bestellt, nicht den
--   Newsletter zur Fütterung. Sie bleiben deshalb in einer eigenen Liste.
-- ---------------------------------------------------------------------------

create table if not exists public.oel_guide_anmeldungen (
  id uuid primary key default gen_random_uuid(),

  erstellt_am timestamptz not null default now(),

  -- Freiwillig. Fehlt er, wird in den Mails ohne Namen gegrüßt.
  vorname text,
  email text not null unique,

  -- Erst wenn sie den Link zum Guide angeklickt hat, steht hier true.
  bestaetigt boolean not null default false,
  bestaetigt_am timestamptz,

  -- Womit sie zugestimmt hat, im Wortlaut.
  einwilligung_text text,

  -- Woher sie kam: 'instagram' über die Linkseite, sonst 'aromahorseoil'.
  quelle text
);

create index if not exists oel_guide_anmeldungen_bestaetigt_idx
  on public.oel_guide_anmeldungen (bestaetigt, bestaetigt_am);

-- Gelesen und geschrieben wird ausschliesslich vom Server mit dem geheimen
-- Schlüssel. Ohne eigene Regel kommt mit dem öffentlichen Schlüssel niemand
-- an die Adressen heran.
alter table public.oel_guide_anmeldungen enable row level security;
