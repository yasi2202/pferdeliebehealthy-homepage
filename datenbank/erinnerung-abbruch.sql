-- ---------------------------------------------------------------------------
-- Die Erinnerung an eine angefangene und nicht bezahlte Bestellung.
--
-- ▸ WAS DIESE DATEI MACHT
--   Sie legt eine einzige Spalte an: den Zeitpunkt, zu dem die Erinnerung
--   verschickt wurde. Ohne sie wüsste niemand, wer schon erinnert wurde, und
--   dieselbe Kundin bekäme die Mail bei jedem Klick noch einmal.
--
-- ▸ EINMAL IM SQL-EDITOR VON SUPABASE AUSFÜHREN, im Projekt
--   "pferdeliebehealthy-akademie" (dasselbe wie alle anderen Tabellen dieser
--   Website). Sie ist so geschrieben, dass ein zweiter Durchlauf nichts
--   kaputt macht.
--
--   Solange sie nicht gelaufen ist, sagt die Auswertungsseite das auch. Die
--   Liste der Abbrüche ist trotzdem da, nur der Knopf zum Erinnern fehlt.
--
-- ▸ WARUM EIN ZEITPUNKT UND KEIN JA-NEIN-FELD
--   Weil man später wissen will, wann erinnert wurde. Wer widerspricht, kann
--   damit belegt werden, und beim Nachsehen im Postfach passt es zusammen.
--   Dasselbe Muster wie bei bewertung_gebeten_am.
-- ---------------------------------------------------------------------------

alter table digitalbestellungen
  add column if not exists erinnert_am timestamptz;

comment on column digitalbestellungen.erinnert_am is
  'Wann an eine angefangene, nicht bezahlte Bestellung erinnert wurde. Leer '
  'heisst: noch nicht erinnert. Wird nur von Hand aus dem Adminbereich '
  'gesetzt, es gibt bewusst keinen taeglichen Lauf dafuer.';

-- Gesucht wird immer nach demselben Muster: offen und noch nicht erinnert.
create index if not exists digitalbestellungen_abbruch_offen
  on digitalbestellungen (angelegt_am)
  where status = 'offen' and erinnert_am is null;
