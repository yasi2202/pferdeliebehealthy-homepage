-- ---------------------------------------------------------------------------
-- Die Tabelle für die Bestellungen aus dem Shop.
--
-- ▸ SO TRÄGST DU SIE EIN:
--   1. supabase.com öffnen und das Projekt "pferdeliebehealthy-akademie"
--      anklicken. ACHTUNG: dasselbe Projekt wie bei den anderen Tabellen.
--      Wenn du im falschen Projekt landest, legt sie sich dort an und die
--      Website findet sie nie.
--   2. Links in der Leiste auf "SQL Editor".
--   3. Diesen ganzen Text hineinkopieren und auf "Run" klicken.
--   4. Fertig. Unter "Table Editor" siehst du die neue Tabelle.
--
-- ▸ WIE DU DEINE BESTELLUNGEN SIEHST:
--   Table Editor → bestellungen. Filter auf status = 'bezahlt' setzen, das
--   sind die, die du packen musst. Zeilen mit status = 'offen' sind
--   angefangene Bestellungen, bei denen die Bezahlung abgebrochen wurde --
--   die darfst du NICHT verschicken.
--
-- ▸ WARUM DIE PREISE IN CENT STEHEN:
--   3499 sind 34,99 €. Kommazahlen führen beim Zusammenrechnen zu
--   Rundungsfehlern, ganze Cent nicht. Stripe macht es genauso.
--
-- ▸ Aufbewahrungspflicht: Bestellungen sind Geschäftsunterlagen und müssen
--   zehn Jahre aufbewahrt werden. Lösch hier also nichts, auch keine alten
--   Zeilen.
-- ---------------------------------------------------------------------------

create table if not exists bestellungen (
  id uuid primary key default gen_random_uuid(),

  -- Wann die Bestellung angelegt wurde
  angelegt_am timestamptz not null default now(),

  -- Die Nummer, die auch in deiner Mail und bei Stripe steht,
  -- zum Beispiel PFH-20260831-4821
  nummer text not null unique,

  -- 'offen'   = Kundin ist zur Bezahlung gegangen, Geld ist noch nicht da
  -- 'bezahlt' = Stripe hat die Zahlung bestätigt, du kannst packen
  status text not null default 'offen',
  bezahlt_am timestamptz,

  -- Wer bestellt hat
  email text not null,
  vorname text not null,
  nachname text not null,

  -- Wohin es geht
  strasse text not null,
  plz text not null,
  ort text not null,
  land text not null default 'DE',

  -- Was sie dir noch mitgegeben hat, freiwilliges Feld in der Kasse
  anmerkung text,

  -- Was bestellt wurde. Steht bewusst als Kopie hier drin und nicht als
  -- Verweis auf den Katalog: Wenn du in einem halben Jahr einen Preis
  -- änderst, soll auf der alten Bestellung weiterhin der Preis stehen,
  -- den die Kundin damals bezahlt hat.
  artikel jsonb not null,

  -- Alles in Cent
  summe integer not null,
  versand integer not null,
  gesamt integer not null
);

-- Damit die Suche nach einer Bestellnummer schnell bleibt und der Blick auf
-- "was ist heute reingekommen" nicht die ganze Tabelle lesen muss.
create index if not exists bestellungen_status_idx
  on bestellungen (status, angelegt_am desc);

-- ---------------------------------------------------------------------------
-- Zugriffsschutz
--
-- Die Website spricht mit Supabase über den geheimen Schlüssel und darf
-- alles. Für alle anderen ist die Tabelle zu. Ohne diese beiden Zeilen
-- könnte jede Person mit dem öffentlichen Schlüssel die Anschriften deiner
-- Kundinnen lesen.
-- ---------------------------------------------------------------------------

alter table bestellungen enable row level security;

-- Bewusst KEINE policy: ohne policy kommt mit dem öffentlichen Schlüssel
-- niemand an die Daten. Der geheime Schlüssel, den nur die Website kennt,
-- geht an der Zeilensicherheit ohnehin vorbei.
