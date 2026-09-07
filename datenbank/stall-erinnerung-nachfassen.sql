-- ---------------------------------------------------------------------------
-- Eine Spalte, damit die Erinnerung genau einmal geht.
--
-- ▸ SO TRÄGST DU SIE EIN:
--   1. supabase.com öffnen, Projekt "pferdeliebehealthy-akademie" wählen.
--   2. Links in der Leiste auf "SQL Editor".
--   3. Diesen Text hineinkopieren und auf "Run" klicken.
--
-- ▸ WOZU SIE DA IST
--   Wer sich den Stall Organizer holt und den Zugangslink nie anklickt, ist
--   sonst dauerhaft weg: kein Organizer, keine Mailstrecke, kein Newsletter.
--   Einen Tag später geht deshalb eine Erinnerung raus, mit demselben Link.
--
--   Hier wird vermerkt, wann das war. Ohne diese Spalte müsste sich der
--   Versand auf ein Zeitfenster verlassen, und wenn der Zeitplan einmal
--   doppelt läuft, bekäme dieselbe Person die Erinnerung zweimal.
--
-- ▸ ES BLEIBT BEI EINER
--   Wer auch danach nicht klickt, hört nichts mehr. Eine zweite Erinnerung
--   an jemanden, der zweimal nicht reagiert hat, ist Belästigung und keine
--   Hilfe.
-- ---------------------------------------------------------------------------

alter table public.stall_anmeldungen
  add column if not exists erinnert_am timestamptz;

-- Der Versand sucht nach offenen Anmeldungen ohne Erinnerung.
create index if not exists stall_anmeldungen_nachfassen_idx
  on public.stall_anmeldungen (bestaetigt, erinnert_am, erstellt_am);
