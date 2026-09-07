-- ---------------------------------------------------------------------------
-- Die Tabelle für die Webinar-Anmeldungen.
--
-- ▸ SO TRÄGST DU SIE EIN:
--   1. supabase.com öffnen, Projekt "pferdeliebehealthy-akademie" wählen
--      (Kennung pklopjbemmyvpmywoayk, dasselbe wie bei den anderen Tabellen).
--   2. Links in der Leiste auf "SQL Editor".
--   3. Diesen ganzen Text hineinkopieren und auf "Run" klicken.
--
-- ▸ WOZU SIE DA IST
--   Das kostenlose Webinar läuft zu festen Zeiten, aber immer dieselbe
--   Aufzeichnung. Wer sich anmeldet, wählt einen Termin und bekommt einen
--   persönlichen Link. Der Link führt vor dem Termin in einen Warteraum und
--   erst zur vollen Stunde ins Video.
--
-- ▸ WARUM EINE EIGENE TABELLE
--   Wie beim Stall Organizer und beim Insider-Kanal: Wer sich hier einträgt,
--   hat in etwas anderes eingewilligt. Getrennt gespeichert lässt sich für
--   jede Adresse belegen, wofür und wo sie zugestimmt hat.
--
-- ▸ DIE ADRESSE IST BESTÄTIGT, SOBALD DER RAUM GEÖFFNET WURDE
--   Ein doppeltes Opt-in mit eigener Bestätigungsmail wäre hier eine Hürde
--   zu viel: Die Anmeldemail enthält den Zugangslink, und wer ihn anklickt,
--   hat damit belegt, dass die Adresse ihm gehört. Genau das trägt
--   `raum_geoeffnet_am` ein.
-- ---------------------------------------------------------------------------

create table if not exists public.webinar_anmeldungen (
  id uuid primary key default gen_random_uuid(),

  erstellt_am timestamptz not null default now(),

  vorname text,
  email text not null,

  -- Welches Webinar. Damit später ein zweites danebenlaufen kann, ohne dass
  -- die Tabelle geändert werden muss.
  webinar text not null default 'heu',

  -- Der gewählte Termin, als Zeitpunkt. Immer in UTC gespeichert, angezeigt
  -- wird in Europe/Berlin. Wer das verwechselt, verschiebt im Winter alles
  -- um eine Stunde.
  termin timestamptz not null,

  -- Der persönliche Zugangsschlüssel für den Warteraum. Steht im Link.
  token text not null unique,

  -- Wann der Raum zum ersten Mal geöffnet wurde. Zugleich der Beleg, dass die
  -- Adresse der Person gehört.
  raum_geoeffnet_am timestamptz,

  -- Wie weit sie gekommen ist. Für die Auswertung, welcher Teil trägt.
  gesehen_bis_sekunde integer,

  -- Welche Mails schon rausgingen. Verhindert Doppelversand, wenn der
  -- Zeitplan zweimal läuft.
  anmeldemail_am timestamptz,
  erinnerung_tag_am timestamptz,
  erinnerung_stunde_am timestamptz,
  nachfass_am timestamptz,

  -- Womit sie zugestimmt hat, im Wortlaut.
  einwilligung_text text,

  -- Woher sie kam: 'website', 'newsletter', 'instagram' und so weiter.
  quelle text
);

-- Der Warteraum sucht über den Token.
create index if not exists webinar_anmeldungen_token_idx
  on public.webinar_anmeldungen (token);

-- Der Zeitplan sucht nach anstehenden Terminen.
create index if not exists webinar_anmeldungen_termin_idx
  on public.webinar_anmeldungen (termin);

-- Dieselbe Adresse darf sich für denselben Termin nur einmal eintragen.
-- Für einen anderen Termin schon: Wer den ersten verpasst, meldet sich neu an.
create unique index if not exists webinar_anmeldungen_einmalig_idx
  on public.webinar_anmeldungen (lower(email), webinar, termin);

alter table public.webinar_anmeldungen enable row level security;

-- Bewusst keine Regel für anonyme Zugriffe: Die Website spricht die Datenbank
-- ausschließlich mit dem geheimen Schlüssel vom Server aus an.

comment on table public.webinar_anmeldungen is
  'Anmeldungen zum kostenlosen Webinar. Eine Zeile je Person und Termin.';


-- ---------------------------------------------------------------------------
-- Kontrolle
-- ---------------------------------------------------------------------------

select column_name, data_type, is_nullable
  from information_schema.columns
 where table_name = 'webinar_anmeldungen'
 order by ordinal_position;
