-- ---------------------------------------------------------------------------
-- Die Tabelle für die Käufe digitaler Produkte: Kurse und Pläne, die als
-- Zugang zur Akademie geliefert werden.
--
-- ▸ SO TRÄGST DU SIE EIN:
--   1. supabase.com öffnen und das Projekt "pferdeliebehealthy-akademie"
--      anklicken. ACHTUNG: dasselbe Projekt wie bei allen anderen Tabellen
--      dieser Website. Wenn du im falschen Projekt landest, legt sie sich
--      dort an und die Website findet sie nie.
--   2. Links in der Leiste auf "SQL Editor".
--   3. Diesen ganzen Text hineinkopieren und auf "Run" klicken.
--
-- ▸ WARUM NICHT EINFACH IN `bestellungen` MIT DAZU:
--   Eine Warenbestellung hat eine Lieferanschrift und Versandkosten, ein
--   Kurskauf hat einen Zugang und einen Widerrufsverzicht. In einer Tabelle
--   wären bei jeder Zeile die Felder der jeweils anderen Sorte leer, und du
--   könntest nie auf einen Blick sehen, was du packen musst. Getrennt ist
--   `bestellungen` weiterhin genau die Liste für den Versand.
--
-- ▸ WAS DU DIR HIER ANSCHAUEN SOLLTEST:
--   Table Editor → digitalbestellungen → Filter `freigeschaltet = false` bei
--   `status = bezahlt`. Das sind die Fälle, in denen jemand bezahlt hat und
--   NICHT in die Akademie kommt. Sie sollten immer leer sein. Bei jedem
--   solchen Fall bekommst du zusätzlich eine Mail.
--
-- ▸ Aufbewahrungspflicht: Auch das sind Geschäftsunterlagen, zehn Jahre.
--   Lösch hier nichts.
-- ---------------------------------------------------------------------------

create table if not exists digitalbestellungen (
  id uuid primary key default gen_random_uuid(),

  angelegt_am timestamptz not null default now(),

  -- Die Nummer, die auch in der Mail und bei Stripe steht, z. B.
  -- PFD-20260831-4821. PFD statt PFH: so siehst du sofort, dass es ein
  -- digitaler Kauf war und kein Paket.
  --
  -- ACHTUNG, DAS IST KEINE RECHNUNGSNUMMER. Sie endet auf vier Zufallsziffern
  -- und ist damit nicht fortlaufend. Die Rechnungsnummer steht weiter unten.
  nummer text not null unique,

  -- ▸ DIE RECHNUNGSNUMMER, z. B. 2026-0001
  --   Sie muss fortlaufend und einmalig sein, das verlangt § 14 UStG. Deshalb
  --   wird sie NICHT im Programm erzeugt, sondern von der Datenbank, und zwar
  --   erst in dem Moment, in dem eine Bestellung auf "bezahlt" springt.
  --   Der Grund für den späten Zeitpunkt: Wer die Bezahlung abbricht,
  --   bekommt keine Rechnung, würde aber eine Nummer verbrauchen. Am
  --   Jahresende stünden dann Lücken in der Reihe, die du dem Finanzamt
  --   erklären müsstest. So gibt es keine.
  --
  --   Zuständig ist der Auslöser (Trigger) ganz unten in dieser Datei.
  rechnungsnummer text unique,

  -- 'offen'   = zur Bezahlung gegangen, Geld ist noch nicht da
  -- 'bezahlt' = Stripe hat bestätigt, der Zugang ist unterwegs
  status text not null default 'offen',
  bezahlt_am timestamptz,

  -- 'kauf'   = der eigentliche Kauf
  -- 'upsell' = das Angebot, das danach angenommen wurde
  art text not null default 'kauf',

  -- Bei einem Upsell die Nummer des Erstkaufs. So gehören die beiden Zeilen
  -- sichtbar zusammen, etwa wenn du später etwas erstatten musst.
  gehoert_zu text,

  -- Wer gekauft hat, mit vollständiger Rechnungsanschrift.
  --
  -- ▸ Bis 250 € wäre eine Kleinbetragsrechnung ohne Anschrift ausreichend.
  --   Yasemin hat sich am 31.08.2026 bewusst dagegen entschieden, damit alle
  --   Rechnungen gleich aussehen und sich in ein Buchhaltungsprogramm
  --   einlesen lassen, und damit es auch dann noch stimmt, wenn hier einmal
  --   ein teureres Produkt steht.
  email text not null,
  vorname text not null,
  nachname text not null,
  strasse text not null default '',
  plz text not null default '',
  ort text not null default '',

  -- ▸ WOFÜR DAS LAND DA IST, obwohl nichts verschickt wird:
  --   Bei digitalen Leistungen an Privatpersonen im EU-Ausland gilt
  --   grundsätzlich die Steuer des Landes, in dem die Kundin sitzt. Solange
  --   deine Umsätze dorthin unter 10.000 € im Jahr bleiben, darfst du
  --   weiterhin deutsche Mehrwertsteuer abrechnen. Genau so macht es die
  --   Website auch. Damit du merkst, wenn es eng wird, wird hier das Land
  --   mitgeschrieben. Einmal im Jahr nachrechnen, und wenn es sich der
  --   Grenze nähert, mit der Steuerberatung über das OSS-Verfahren sprechen.
  land text not null default 'DE',

  -- Was gekauft wurde, als Kopie und nicht als Verweis auf den Katalog:
  -- Änderst du in einem halben Jahr einen Preis, soll auf dem alten Kauf
  -- weiterhin der Preis stehen, der damals bezahlt wurde.
  artikel jsonb not null,

  -- In Cent. 2900 sind 29,00 €.
  gesamt integer not null,

  -- ▸ DAS WICHTIGSTE FELD DIESER TABELLE:
  --   Bei digitalen Inhalten hat die Kundin vierzehn Tage Widerrufsrecht,
  --   auch wenn sie den Kurs längst gelesen hat. Es erlischt nur, wenn sie
  --   ausdrücklich zustimmt, dass sofort geliefert wird, UND bestätigt, dass
  --   sie dadurch ihr Widerrufsrecht verliert. Steht hier false, kann sie
  --   ihr Geld zurückverlangen. Das ist also kein Formfeld, sondern dein
  --   Beleg. Nie nachträglich ändern.
  widerruf_verzicht boolean not null default false,
  widerruf_verzicht_am timestamptz,

  -- Hat sie beim Kauf zugestimmt, Post von dir zu bekommen? Der Eintrag
  -- selbst landet in insider_anmeldungen, hier steht er als Beleg mit dem
  -- Zeitpunkt des Kaufs.
  newsletter boolean not null default false,

  -- Der Schlüssel für die Angebotsseite nach dem Kauf. Ohne ihn kommt dort
  -- niemand herein, auch nicht mit einer geratenen Bestellnummer.
  zugriff_token text not null,

  -- Die Bezahlseite bei Stripe. Damit lässt sich die Zahlungsart
  -- nachschlagen, ohne auf die Rückmeldung zu warten.
  stripe_sitzung text,

  -- Für das Ein-Klick-Angebot: die Kundenkennung und die gespeicherte
  -- Zahlungsart bei Stripe. Das sind KEINE Kartendaten, sondern nur
  -- Verweise. Die Karte selbst liegt bei Stripe, nie hier.
  stripe_kunde text,
  stripe_zahlungsart text,

  -- Hat die Akademie den Zugang vergeben?
  -- ACHTUNG: true heisst genau genommen "die Meldung ist angekommen". Die
  -- Akademie antwortet auch dann freundlich, wenn sie den Produktnamen nicht
  -- kennt und nichts freigeschaltet hat. Wenn sich eine Kundin meldet, sieh
  -- in der Akademie unter webhook_logs nach.
  freigeschaltet boolean not null default false,
  freischaltung_hinweis text
);

-- Für den Blick auf "heute reingekommen" und auf die Problemfälle.
create index if not exists digitalbestellungen_status_idx
  on digitalbestellungen (status, angelegt_am desc);

create index if not exists digitalbestellungen_gehoert_zu_idx
  on digitalbestellungen (gehoert_zu);

-- ---------------------------------------------------------------------------
-- Zugriffsschutz
--
-- Wie bei den Warenbestellungen: Die Website spricht mit Supabase über den
-- geheimen Schlüssel und darf alles. Für alle anderen ist die Tabelle zu.
-- Bewusst KEINE policy: ohne policy kommt mit dem öffentlichen Schlüssel
-- niemand an die Daten.
-- ---------------------------------------------------------------------------

alter table digitalbestellungen enable row level security;

-- ---------------------------------------------------------------------------
-- Die fortlaufende Rechnungsnummer
--
-- ▸ WARUM EINE SEQUENZ UND KEIN "höchste Nummer plus eins":
--   Kaufen zwei Kundinnen im selben Augenblick, würden beide dieselbe höchste
--   Nummer lesen und dieselbe nächste vergeben. Eine Sequenz kann das nicht
--   passieren, sie gibt jede Zahl genau einmal aus.
--
-- ▸ WAS BEIM JAHRESWECHSEL PASSIERT:
--   Der Zähler läuft weiter, das Jahr im Namen wechselt. Aus 2026-0087 wird
--   also 2027-0088. Das ist zulässig, die Reihe muss fortlaufend und
--   einmalig sein, sie muss nicht jedes Jahr bei eins beginnen. Wer bei eins
--   beginnen möchte, müsste die Sequenz am 1. Januar zurücksetzen, und genau
--   das vergisst man. Deshalb läuft sie bewusst durch.
--
-- ▸ WENN DU SPÄTER AUF LEXOFFICE ODER SEVDESK UMSTELLST:
--   Dann vergibt das Programm die Nummern, und dieser Auslöser muss weg,
--   sonst gibt es zwei Reihen nebeneinander. Sag vorher Bescheid.
-- ---------------------------------------------------------------------------

create sequence if not exists rechnungsnummer_folge start with 1;

create or replace function setze_rechnungsnummer()
returns trigger
language plpgsql
as $$
begin
  -- Nur beim Übergang auf "bezahlt", und nur, wenn noch keine da ist.
  if new.status = 'bezahlt' and new.rechnungsnummer is null then
    new.rechnungsnummer :=
      to_char(now(), 'YYYY') || '-' ||
      lpad(nextval('rechnungsnummer_folge')::text, 4, '0');
  end if;

  return new;
end;
$$;

drop trigger if exists digitalbestellungen_rechnungsnummer on digitalbestellungen;

create trigger digitalbestellungen_rechnungsnummer
  before insert or update on digitalbestellungen
  for each row
  execute function setze_rechnungsnummer();
