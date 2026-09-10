-- ---------------------------------------------------------------------------
-- Das Empfehlungsprogramm: Wer deine Kurse empfiehlt, bekommt Provision.
--
-- ▸ SO TRÄGST DU SIE EIN:
--   1. supabase.com öffnen und das Projekt "pferdeliebehealthy-akademie"
--      anklicken. ACHTUNG: dasselbe Projekt wie bei allen anderen Tabellen
--      dieser Website. Wenn du im falschen Projekt landest, legt sie sich
--      dort an und die Website findet sie nie.
--   2. Links in der Leiste auf "SQL Editor".
--   3. Diesen ganzen Text hineinkopieren und auf "Run" klicken.
--
-- ▸ WAS HIER ENTSTEHT, IN EINEM SATZ:
--   Drei Tabellen. `empfehler` sind die Menschen, die dich empfehlen.
--   `provisionen` ist für jeden Verkauf eine Zeile, also dein Kontobuch.
--   `provisionsauszahlungen` hält fest, wann du tatsächlich gezahlt hast.
--
-- ▸ WARUM DREI TABELLEN UND NICHT EINE:
--   Weil du drei verschiedene Fragen hast, und jede braucht eine andere
--   Zeile. "Wer macht mit?" ist eine Person. "Welcher Verkauf hat wie viel
--   gebracht?" ist ein Verkauf. "Was habe ich am 1. Oktober überwiesen?" ist
--   eine Zahlung, die viele Verkäufe auf einmal abdeckt. Stünde alles in
--   einer Tabelle, könntest du keine dieser Fragen sauber beantworten.
--
-- ▸ WAS DU DIR HIER ANSCHAUEN SOLLTEST:
--   Das musst du nicht. Alles steht unter /admin/empfehler, in lesbarer
--   Form und mit Knöpfen. Diese Datei ist nur das Fundament darunter.
--
-- ▸ Aufbewahrungspflicht: Provisionen sind Betriebsausgaben, also
--   Geschäftsunterlagen. Zehn Jahre. Lösch hier nichts.
-- ---------------------------------------------------------------------------


-- ---------------------------------------------------------------------------
-- 1. Die Empfehlerinnen
-- ---------------------------------------------------------------------------

create table if not exists empfehler (
  id uuid primary key default gen_random_uuid(),

  angelegt_am timestamptz not null default now(),

  -- ▸ DER CODE, UND WARUM ER SO WICHTIG IST
  --   Er steckt im persönlichen Link, zum Beispiel
  --       https://www.pferdeliebehealthy.de/e/MARIE
  --   Daran und nur daran erkennt die Website später, wem ein Verkauf
  --   gutgeschrieben wird. Er ist kein Rabattcode: Die Käuferin tippt ihn
  --   nirgends ein und bekommt dadurch auch keinen Nachlass.
  --
  --   Groß- und Kleinschreibung ist egal, /e/marie findet MARIE.
  code text not null,

  vorname text not null,
  nachname text not null default '',
  email text not null,

  -- 'angefragt' = hat sich beworben, wartet auf dich. Ihr Link geht noch
  --               nicht, und ein Verkauf über sie zählt nicht.
  -- 'aktiv'     = von dir freigeschaltet. Ab jetzt zählt jeder Verkauf.
  -- 'gesperrt'  = ausgeschieden oder von dir gestoppt. Der Link führt weiter
  --               auf die Website, aber es entsteht keine Provision mehr.
  --               Schon verdiente Provision bleibt selbstverständlich stehen.
  status text not null default 'angefragt',
  freigeschaltet_am timestamptz,
  gesperrt_am timestamptz,

  -- Wo sie empfehlen möchte. Steht so im Anmeldeformular und ist deine
  -- wichtigste Entscheidungshilfe beim Freischalten.
  kanal text not null default '',

  -- ▸ WOHIN DAS GELD GEHT
  --   Eine PayPal-Adresse oder eine IBAN, so wie sie es angibt. Die Website
  --   zahlt nichts von selbst aus, du überweist von Hand und hakst es hier
  --   ab. Genau so machen es deine eigenen Partner bei dir auch.
  zahlweg text not null default '',

  -- ▸ DIE STEUERFRAGE, UND WARUM SIE HIER STEHT
  --   Provision ist Einkommen. Wer sie bekommt, wird damit steuerlich tätig.
  --   Für dich ist die Provision eine Betriebsausgabe, und die brauchst du
  --   belegt. Bei einer Unternehmerin läuft das über eine Rechnung von ihr
  --   oder über eine Gutschrift von dir, mit oder ohne Umsatzsteuer.
  --   Bei einer Privatperson ist es komplizierter.
  --
  --   Deshalb wird beim Anmelden gefragt und die Antwort hier festgehalten.
  --   Bevor du jemanden freischaltest, sieh dir das Feld an.
  unternehmerin boolean not null default false,

  -- Ihre Steuernummer oder USt-IdNr., freiwillig. Steht auf der Gutschrift.
  steuernummer text not null default '',

  -- ▸ DER SCHLÜSSEL FÜR IHR EIGENES KONTO
  --   Damit sieht sie unter /weiterempfehlen/konto ihre Verkäufe und ihren Stand,
  --   ohne Passwort. Sie bekommt den Link per Mail. Wer den Link hat, sieht
  --   ihre Zahlen, sonst niemand. Deshalb ist er lang und zufällig.
  token text not null,

  -- Wie oft ihr Link angeklickt wurde. Nur eine Zahl, es wird nicht
  -- mitgeschrieben, wer geklickt hat. Sie sieht daran, ob ihre Empfehlung
  -- überhaupt ankommt, und du siehst, wer Besuch bringt, aber nichts
  -- verkauft. Das ist meist ein Hinweis darauf, dass sie das falsche
  -- Produkt bewirbt, nicht darauf, dass sie schlecht ist.
  klicks integer not null default 0,

  -- Nur für dich, taucht nirgends öffentlich auf.
  notiz text
);

-- Jeden Code darf es nur einmal geben, unabhängig von Groß- und
-- Kleinschreibung. Sonst gäbe es MARIE und marie nebeneinander, und ein
-- Verkauf ließe sich nicht mehr eindeutig zuordnen.
create unique index if not exists empfehler_code_idx
  on empfehler (upper(code));

create index if not exists empfehler_token_idx on empfehler (token);
create index if not exists empfehler_status_idx on empfehler (status);

alter table empfehler enable row level security;

-- Bewusst KEINE policy: Nur die Website mit dem geheimen Schlüssel kommt
-- heran. Sonst könnte jede Besucherin die Liste aller Empfehlerinnen mit
-- ihren Mailadressen und Bankverbindungen auslesen.


-- ---------------------------------------------------------------------------
-- 2. Die Provisionen: für jeden vermittelten Verkauf eine Zeile
-- ---------------------------------------------------------------------------

create table if not exists provisionen (
  id uuid primary key default gen_random_uuid(),

  angelegt_am timestamptz not null default now(),

  empfehler_id uuid not null references empfehler (id) on delete restrict,

  -- Die Bestellnummer aus digitalbestellungen, zum Beispiel
  -- PFD-20260910-4821. Damit findest du jederzeit den Kauf dahinter.
  --
  -- ▸ WARUM `unique`: Das ist die Sicherung gegen doppelte Gutschriften.
  --   Stripe meldet einen Kauf gelegentlich zweimal, das ist normal und
  --   völlig in Ordnung. Ohne diese Sperre stünde die Provision dann aber
  --   zweimal im Buch und du würdest doppelt zahlen. So lehnt die Datenbank
  --   die zweite Zeile ab, und der Rest des Ablaufs merkt es nicht einmal.
  bestellnummer text not null unique,

  -- Damit du auf der Auszahlungsliste siehst, wofür gezahlt wird, ohne jedes
  -- Mal in die Bestellungen zu springen.
  produkt_slug text not null,
  produkt_name text not null,

  -- ▸ DIE DREI BETRÄGE, UND WARUM ES DREI SIND, ALLE IN CENT
  --   umsatz_brutto: was die Käuferin tatsächlich gezahlt hat, nach Abzug
  --                  eines Rabattcodes.
  --   umsatz_netto:  derselbe Betrag ohne die Umsatzsteuer.
  --   betrag_cent:   die Provision, also der Satz auf den Nettobetrag.
  --
  --   ▸ WARUM DIE PROVISION AUF DEN NETTOBETRAG GEHT UND NICHT AUF DEN
  --     BRUTTOBETRAG: Die Umsatzsteuer gehört dir nie. Du ziehst sie ein und
  --     führst sie ans Finanzamt ab, sie ist ein durchlaufender Posten. Von
  --     29,00 € bleiben dir 24,37 €. Würdest du 20 % auf die 29,00 € zahlen,
  --     gäbest du 5,80 € von 24,37 € ab, das sind in Wahrheit 23,8 %. Auf
  --     den Nettobetrag sind es 4,87 €, und 20 % heißen dann auch 20 %.
  --     So rechnet der Handel, und so rechnen auch die Partner mit dir ab.
  umsatz_brutto integer not null,
  umsatz_netto integer not null,

  -- Der Satz in Prozent, zum Beispiel 20 oder 10. Er wird hier mitgeschrieben
  -- und nicht nur berechnet: Änderst du das Programm in einem halben Jahr,
  -- soll auf den alten Verkäufen weiterhin der Satz stehen, der damals galt.
  satz numeric(5,2) not null,

  betrag_cent integer not null,

  -- 'offen'      = verdient, aber noch in der Schutzfrist. Siehe faellig_ab.
  -- 'faellig'    = darf ausgezahlt werden.
  -- 'ausgezahlt' = erledigt, gehört zu einer Zeile in
  --                provisionsauszahlungen.
  -- 'storniert'  = der Kauf wurde erstattet, die Provision entfällt.
  status text not null default 'offen',

  -- ▸ DIE SCHUTZFRIST, UND WARUM ES SIE GIBT
  --   Erstattest du einen Kauf, hast du die Provision darauf schon gezahlt
  --   und bekommst sie praktisch nie zurück. Deshalb wird jede Provision
  --   erst nach 14 Tagen fällig. Bis dahin steht sie im Konto der
  --   Empfehlerin sichtbar als "noch in der Frist", das ist ehrlich und
  --   erspart Rückfragen.
  faellig_ab timestamptz not null default (now() + interval '14 days'),

  -- Zu welcher Auszahlung sie gehört. Leer, solange nicht gezahlt wurde.
  auszahlung_id uuid,

  hinweis text
);

create index if not exists provisionen_empfehler_idx
  on provisionen (empfehler_id, angelegt_am desc);

create index if not exists provisionen_status_idx
  on provisionen (status, faellig_ab);

alter table provisionen enable row level security;


-- ---------------------------------------------------------------------------
-- 3. Die Auszahlungen: was du tatsächlich überwiesen hast
-- ---------------------------------------------------------------------------

create table if not exists provisionsauszahlungen (
  id uuid primary key default gen_random_uuid(),

  angelegt_am timestamptz not null default now(),

  empfehler_id uuid not null references empfehler (id) on delete restrict,

  -- Die Summe aller Provisionen, die mit dieser Zahlung erledigt sind.
  betrag_cent integer not null,

  -- Wie viele Verkäufe darin stecken. Steht auf der Gutschrift.
  anzahl integer not null default 0,

  -- 'paypal', 'ueberweisung' oder was du einträgst.
  weg text not null default '',

  -- ▸ DEINE GUTSCHRIFTNUMMER
  --   Eine Gutschrift ist eine Rechnung, die du im Namen der Empfehlerin
  --   ausstellst, weil sie meist keine schreiben kann oder will. Auch sie
  --   braucht eine fortlaufende Nummer. Sie läuft bewusst getrennt von
  --   deinen Verkaufsrechnungen, damit sich die beiden Reihen nicht
  --   vermischen: G-2026-0001 und so weiter.
  gutschriftnummer text unique,

  notiz text
);

create index if not exists provisionsauszahlungen_empfehler_idx
  on provisionsauszahlungen (empfehler_id, angelegt_am desc);

alter table provisionsauszahlungen enable row level security;


-- ---------------------------------------------------------------------------
-- Die fortlaufende Gutschriftnummer
--
-- Nach demselben Muster wie die Rechnungsnummer in
-- datenbank/digitalbestellungen.sql, aber mit einem G davor und einer
-- eigenen Zählung. Warum eine Sequenz und nicht "höchste Nummer plus eins",
-- steht dort ausführlich erklärt.
-- ---------------------------------------------------------------------------

create sequence if not exists gutschriftnummer_folge start with 1;

create or replace function setze_gutschriftnummer()
returns trigger
language plpgsql
as $$
begin
  if new.gutschriftnummer is null then
    new.gutschriftnummer :=
      'G-' || to_char(now(), 'YYYY') || '-' ||
      lpad(nextval('gutschriftnummer_folge')::text, 4, '0');
  end if;

  return new;
end;
$$;

drop trigger if exists provisionsauszahlungen_nummer on provisionsauszahlungen;

create trigger provisionsauszahlungen_nummer
  before insert on provisionsauszahlungen
  for each row
  execute function setze_gutschriftnummer();


-- ---------------------------------------------------------------------------
-- 4. Die Bestellung merkt sich, wer sie vermittelt hat
--
-- Der Code steht zusätzlich direkt an der Bestellung, nicht nur in der
-- Provisionszeile. Grund: Wenn eine Provision einmal nicht angelegt werden
-- konnte, etwa weil die Empfehlerin in diesem Moment gesperrt war, siehst du
-- an der Bestellung trotzdem noch, woher die Käuferin kam.
-- ---------------------------------------------------------------------------

alter table digitalbestellungen
  add column if not exists empfehler_code text;
