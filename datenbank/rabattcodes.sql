-- ---------------------------------------------------------------------------
-- Rabattcodes für die Kasse.
--
-- ▸ SO TRÄGST DU SIE EIN:
--   supabase.com, Projekt "pferdeliebehealthy-akademie", SQL Editor, diesen
--   ganzen Text einfügen, Run. Wie bei den anderen Tabellen auch.
--
-- ▸ WARUM EIGENE CODES UND NICHT DIE VON STRIPE
--   Stripe kann selbst Rabattcodes, das Feld erscheint dann aber erst auf
--   der Bezahlseite von Stripe. Dann stünde in deiner eigenen Kasse über dem
--   Bestellknopf noch der volle Preis, und der Endpreis käme erst danach.
--   Genau das verbietet die Button-Lösung (§ 312j BGB): Der Gesamtpreis muss
--   unmittelbar über dem Knopf stehen, mit dem bestellt wird. Deshalb liegt
--   der Rabatt hier, wird in der Kasse angezeigt und fließt in den Preis
--   ein, den Stripe danach nur noch einzieht.
--
-- ▸ SO LEGST DU EINEN CODE AN
--   Table Editor → rabattcodes → Insert row. Nötig sind nur `code` und
--   entweder `prozent` oder `betrag_cent`. Alles andere hat sinnvolle
--   Vorgaben.
--
--   Beispiele:
--     FELLWECHSEL25   prozent = 25                  -> 25 % auf alles
--     INSIDER10       betrag_cent = 1000            -> 10 € Nachlass
--     NURPLAN         prozent = 20, nur_fuer = '{ganzjahresfutterplan}'
--
-- ▸ Groß- und Kleinschreibung ist egal. "fellwechsel25" findet FELLWECHSEL25.
-- ---------------------------------------------------------------------------

create table if not exists rabattcodes (
  id uuid primary key default gen_random_uuid(),

  angelegt_am timestamptz not null default now(),

  -- Der Code, den die Kundin eintippt. Wird immer in Großbuchstaben
  -- verglichen, du kannst ihn also schreiben, wie du magst.
  code text not null,

  -- ▸ ENTWEDER prozent ODER betrag_cent, nicht beides.
  --   prozent = 25     bedeutet 25 % Nachlass.
  --   betrag_cent = 500 bedeutet 5,00 € Nachlass.
  --   Sind beide gesetzt, gewinnt der Prozentsatz.
  prozent integer,
  betrag_cent integer,

  -- Bis wann er gilt. Leer heisst: unbegrenzt.
  gueltig_bis timestamptz,

  -- Wie oft er insgesamt eingelöst werden darf. Leer heisst: beliebig oft.
  -- Praktisch für eine Aktion mit begrenzter Stückzahl.
  max_einloesungen integer,

  -- Wie oft er schon benutzt wurde. Zählt die Kasse selbst hoch.
  einloesungen integer not null default 0,

  -- ▸ FÜR WELCHE PRODUKTE ER GILT
  --   Leer heisst: für alle. Sonst die Kennungen aus lib/digital.ts,
  --   zum Beispiel '{ganzjahresfutterplan,basisfutterkurs}'.
  nur_fuer text[],

  -- Zum Abschalten, ohne den Code zu löschen. Löschen wäre schlechter: Du
  -- willst später noch nachsehen können, welcher Code wie oft lief.
  aktiv boolean not null default true,

  -- Nur für dich, taucht nirgends öffentlich auf.
  notiz text
);

-- Jeder Code darf es nur einmal geben, unabhängig von Groß- und
-- Kleinschreibung. Ohne diesen Index gäbe es sonst FELLWECHSEL25 und
-- fellwechsel25 nebeneinander, mit unterschiedlichen Rabatten.
create unique index if not exists rabattcodes_code_idx
  on rabattcodes (upper(code));

alter table rabattcodes enable row level security;

-- Bewusst KEINE policy: Nur die Website mit dem geheimen Schlüssel kommt
-- heran. Sonst könnte jede Besucherin die Liste aller Codes auslesen, und
-- deine Aktionen wären wertlos.

-- ---------------------------------------------------------------------------
-- Die Kasse merkt sich, welcher Code benutzt wurde
-- ---------------------------------------------------------------------------

alter table digitalbestellungen
  add column if not exists rabattcode text,
  add column if not exists rabatt_cent integer not null default 0;

-- ---------------------------------------------------------------------------
-- Ein Beispielcode zum Ausprobieren.
--
-- Er gilt für alles, gibt 100 % Nachlass und ist auf EINE Einlösung
-- begrenzt. Damit kannst du den ganzen Ablauf durchspielen, ohne zu bezahlen.
-- Danach ist er von selbst verbraucht.
--
-- ACHTUNG: Bei 100 % ist der Endbetrag null. Stripe kann keine Zahlung über
-- 0,00 € anlegen, deshalb überspringt die Kasse in diesem Fall die
-- Bezahlseite und schaltet sofort frei. Das ist Absicht und praktisch für
-- Testkäufe, aber gib den Code niemandem, der ihn nicht bekommen soll.
-- ---------------------------------------------------------------------------

insert into rabattcodes (code, prozent, max_einloesungen, notiz)
values ('PROBELAUF', 100, 1, 'Zum Testen des Ablaufs, einmalig, danach verbraucht')
on conflict do nothing;
