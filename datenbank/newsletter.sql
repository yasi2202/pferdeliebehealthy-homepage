-- ---------------------------------------------------------------------------
-- Das Newsletter-Programm: vier Tabellen.
--
-- ▸ SO TRÄGST DU SIE EIN:
--   supabase.com → Projekt "pferdeliebehealthy-akademie" → SQL Editor →
--   diesen ganzen Text einfügen → Run. Dasselbe Projekt wie die Adressen,
--   sonst findet die Website die Tabellen nicht. Prüf oben links den
--   Projektnamen, bevor du auf Run drückst.
--
--   Das Skript lässt sich gefahrlos zweimal laufen: Jede Anweisung steht
--   unter "if not exists".
--
-- ▸ WAS DIE VIER TABELLEN TUN:
--   newsletter_briefe       — deine Newsletter, Entwürfe wie versendete
--   newsletter_abmeldungen  — wer sich abgemeldet hat (die Sperrliste)
--   newsletter_ereignisse   — wer geöffnet und geklickt hat
--   newsletter_strecken*    — die Mailserien, die von selbst laufen
-- ---------------------------------------------------------------------------


-- ---------------------------------------------------------------------------
-- 1. Die Newsletter selbst
-- ---------------------------------------------------------------------------

create table if not exists newsletter_briefe (
  id uuid primary key default gen_random_uuid(),

  erstellt_am  timestamptz not null default now(),
  geaendert_am timestamptz not null default now(),

  -- Die Betreffzeile. Das Einzige, was im Postfach zuerst zu sehen ist.
  betreff text not null default '',

  -- Der graue Text, den viele Postfächer hinter dem Betreff anzeigen.
  -- Bleibt er leer, nimmt das Postfach den Anfang des Textes.
  vorschautext text not null default '',

  -- Dein Text in der einfachen Auszeichnung (siehe lib/newsletter.ts).
  inhalt text not null default '',

  -- 'entwurf' oder 'versendet'. Ein versendeter Brief lässt sich nicht mehr
  -- ändern und nicht ein zweites Mal verschicken -- das ist die Sperre, die
  -- verhindert, dass dein ganzer Verteiler dieselbe Mail doppelt bekommt.
  status text not null default 'entwurf',

  -- An welche Gruppe er ging. Zurzeit immer 'alle'; das Feld steht schon
  -- hier, damit später weitere Gruppen dazukommen können, ohne dass die
  -- alten Zeilen umgebaut werden müssen.
  gruppe text not null default 'alle',

  versendet_am  timestamptz,
  empfaenger    integer not null default 0,
  uebersprungen integer not null default 0
);

create index if not exists newsletter_briefe_geaendert_idx
  on newsletter_briefe (geaendert_am desc);


-- ---------------------------------------------------------------------------
-- 2. Die Sperrliste
--
-- ▸ WARUM ES SIE GIBT, obwohl das Abmelden die Adresse löscht:
--   Beim Abmelden verschwindet die Zeile aus den Anmeldungen -- aber du
--   spielst immer wieder Adressen aus alten Verkäufen nach. Ohne diese
--   Liste käme jemand, der sich abgemeldet hat, beim nächsten Import
--   stillschweigend zurück. Das ist der Fehler, der Abmahnungen kostet.
--
--   Deshalb bleibt hier die Adresse stehen, und nur sie. Kein Name, keine
--   Bestellung, kein Verlauf. Rechtlich ist genau das erlaubt und sogar
--   erwünscht: Es ist dein Nachweis, dass du den Widerspruch beachtest.
--   ▸ Ein Satz dazu gehört in die Datenschutzerklärung.
-- ---------------------------------------------------------------------------

create table if not exists newsletter_abmeldungen (
  -- Die id sieht überflüssig aus, die Adresse wäre ja eindeutig. Sie muss
  -- aber sein: Die Zählfunktion der Website fragt Supabase nach der Spalte
  -- `id`, und ohne sie käme bei jeder Zählung ein Fehler statt einer Zahl.
  id uuid primary key default gen_random_uuid(),

  email         text not null unique,
  abgemeldet_am timestamptz not null default now(),

  -- 'link' (Klick in der Mail) oder 'hand' (von dir eingetragen)
  quelle text not null default 'link'
);


-- ---------------------------------------------------------------------------
-- 3. Öffnungen und Klicks
--
-- ▸ Gespeichert wird die Adresse, weil du sonst nicht sehen könntest, wer
--   sich für was interessiert. Wer sich abmeldet, verschwindet auch hier.
-- ---------------------------------------------------------------------------

create table if not exists newsletter_ereignisse (
  id uuid primary key default gen_random_uuid(),

  brief_id  uuid not null references newsletter_briefe (id) on delete cascade,
  email     text not null,

  -- 'geoeffnet' oder 'geklickt'
  art       text not null,

  -- Bei einem Klick: wohin. Bei einer Öffnung leer.
  ziel      text,

  zeitpunkt timestamptz not null default now()
);

create index if not exists newsletter_ereignisse_brief_idx
  on newsletter_ereignisse (brief_id, art);

-- Verhindert, dass dieselbe Person zwanzigmal als Öffnung zählt, wenn sie
-- die Mail zwanzigmal aufmacht. Gezählt wird die Person, nicht der Klick.
create unique index if not exists newsletter_ereignisse_einmal_idx
  on newsletter_ereignisse (brief_id, email, art, coalesce(ziel, ''));


-- ---------------------------------------------------------------------------
-- 4. Die Mailstrecken
--
-- Eine Strecke ist eine Kette von Mails, die nach der Anmeldung von selbst
-- losläuft: Mail 1 sofort, Mail 2 nach drei Tagen, Mail 3 nach sieben.
-- Ausgelöst wird sie einmal täglich von Vercel, so wie die Bewertungsbitte.
-- ---------------------------------------------------------------------------

create table if not exists newsletter_strecken (
  id uuid primary key default gen_random_uuid(),

  erstellt_am timestamptz not null default now(),

  name text not null,

  -- Wer hineinläuft: 'insider', 'futter-check' oder 'alle'.
  ausloeser text not null default 'insider',

  -- Solange das aus ist, geht nichts raus. Neue Strecken stehen bewusst auf
  -- aus, damit nicht schon beim Anlegen der erste Lauf hinausgeht.
  aktiv boolean not null default false,

  -- ▸ DIE WICHTIGSTE SPALTE HIER, auch wenn sie unscheinbar aussieht:
  --   Wann die Strecke eingeschaltet wurde. Es laufen nur Menschen hinein,
  --   die sich NACH diesem Zeitpunkt angemeldet haben.
  --
  --   Ohne diese Sperre bekämen beim Einschalten schlagartig alle
  --   Bestandsadressen die Willkommensserie -- tausend Menschen, die seit
  --   Jahren dabei sind, bekämen „schön, dass du da bist". Das ist der
  --   peinlichste Fehler, den ein Newsletter-Programm machen kann, und er
  --   passiert jedem einmal.
  aktiv_seit timestamptz
);

create table if not exists newsletter_strecken_mails (
  id uuid primary key default gen_random_uuid(),

  strecke_id uuid not null references newsletter_strecken (id) on delete cascade,

  -- Die Reihenfolge in der Kette, beginnend bei 1.
  schritt integer not null,

  -- Wie viele Tage nach der Anmeldung diese Mail rausgeht. 0 heisst: beim
  -- nächsten Lauf, also am Tag darauf.
  tage_danach integer not null default 0,

  betreff text not null default '',
  inhalt  text not null default ''
);

create unique index if not exists newsletter_strecken_mails_schritt_idx
  on newsletter_strecken_mails (strecke_id, schritt);

-- Was schon rausging. Ohne diesen Vermerk bekäme dieselbe Person dieselbe
-- Mail jeden Tag wieder, solange sie im Zeitfenster liegt.
create table if not exists newsletter_strecken_versand (
  id uuid primary key default gen_random_uuid(),

  mail_id      uuid not null references newsletter_strecken_mails (id) on delete cascade,
  email        text not null,
  versendet_am timestamptz not null default now()
);

create unique index if not exists newsletter_strecken_versand_einmal_idx
  on newsletter_strecken_versand (mail_id, email);


-- ---------------------------------------------------------------------------
-- Von aussen kommt an keine dieser Tabellen jemand heran. Nur die Website
-- selbst, weil sie den geheimen Schlüssel benutzt, und der umgeht diese
-- Sperre bewusst.
-- ---------------------------------------------------------------------------

alter table newsletter_briefe            enable row level security;
alter table newsletter_abmeldungen       enable row level security;
alter table newsletter_ereignisse        enable row level security;
alter table newsletter_strecken          enable row level security;
alter table newsletter_strecken_mails    enable row level security;
alter table newsletter_strecken_versand  enable row level security;
