-- ---------------------------------------------------------------------------
-- Die Bitte um eine Google-Bewertung, vier Wochen nach dem Kauf.
--
-- ▸ WAS DIESE DATEI MACHT
--   Sie legt eine einzige Spalte an: den Zeitpunkt, zu dem die Bitte
--   verschickt wurde. Ohne sie wüsste niemand, wer schon gefragt wurde, und
--   dieselbe Kundin bekäme die Mail jeden Tag wieder.
--
-- ▸ EINMAL IM SQL-EDITOR VON SUPABASE AUSFÜHREN. Sie ist so geschrieben,
--   dass ein zweiter Durchlauf nichts kaputt macht.
--
-- ▸ WARUM EIN ZEITPUNKT UND KEIN JA-NEIN-FELD
--   Weil man später wissen will, wann gefragt wurde. Wer widerspricht, kann
--   damit belegt werden, und beim Nachsehen im Postfach passt es zusammen.
-- ---------------------------------------------------------------------------

alter table digitalbestellungen
  add column if not exists bewertung_gebeten_am timestamptz;

comment on column digitalbestellungen.bewertung_gebeten_am is
  'Wann die Bitte um eine Google-Bewertung verschickt wurde. Leer heisst: '
  'noch nicht gefragt. Wird sowohl vom taeglichen Lauf unter '
  '/api/bewertungsbitte gesetzt als auch beim Versand von Hand aus dem '
  'Adminbereich.';

-- Der tägliche Lauf sucht nach genau diesem Muster: bezahlt, lange genug
-- her, Newsletter zugestimmt, noch nicht gefragt. Ohne diesen Index geht er
-- bei jedem Durchlauf durch die ganze Tabelle.
create index if not exists digitalbestellungen_bewertung_offen
  on digitalbestellungen (bezahlt_am)
  where bewertung_gebeten_am is null;
