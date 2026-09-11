-- ---------------------------------------------------------------------------
-- Woher ein Kauf kam: die Angabe aus ?von= in der Adresse, zum Beispiel
-- "meta-zink" für die Anzeige „zink“ bei Meta. Angelegt am 11.09.2026 für die
-- Auswertung unter /admin/werbung.
--
-- EINMAL IM SQL-EDITOR VON SUPABASE AUSFÜHREN. Bis dahin speichert die Kasse
-- Käufe ganz normal weiter, nur ohne Herkunft: digitalSpeichern in
-- lib/digital-server.ts versucht es ohne die Spalte noch einmal, wenn die
-- Datenbank sie noch nicht kennt. Ein Kauf ohne Herkunft ist ärgerlich, ein
-- Kauf, der gar nicht zustande kommt, wäre ein Schaden.
--
-- Mehrfaches Ausführen schadet nicht.
-- ---------------------------------------------------------------------------

alter table digitalbestellungen
  add column if not exists quelle text;

create index if not exists digitalbestellungen_quelle
  on digitalbestellungen (quelle)
  where quelle is not null;

-- Sagt der Schnittstelle, dass es eine neue Spalte gibt. Ohne diese Zeile
-- kennt sie die Spalte erst nach ein paar Minuten.
notify pgrst, 'reload schema';
