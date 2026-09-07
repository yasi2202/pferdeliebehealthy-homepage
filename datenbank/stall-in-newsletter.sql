-- ---------------------------------------------------------------------------
-- Die Stall-Organizer-Anmeldungen in den Newsletter-Verteiler aufnehmen.
--
-- ▸ SO TRÄGST DU SIE EIN:
--   1. supabase.com öffnen, Projekt "pferdeliebehealthy-akademie" wählen
--      (Kennung pklopjbemmyvpmywoayk).
--   2. Links in der Leiste auf "SQL Editor".
--   3. Diesen ganzen Text hineinkopieren und auf "Run" klicken.
--
-- ▸ WAS DAS PROBLEM WAR
--   Die Ansicht `alle_anmeldungen` fasst zusammen, wen du anschreiben darfst.
--   Bisher schaute sie nur in zwei Tabellen, Futter-Check und Insider. Wer
--   sich den Stall Organizer geholt und das Häkchen gesetzt hat, stand in
--   `stall_anmeldungen` und damit in keinem Verteiler: Die Mailstrecke lief,
--   der Newsletter erreichte sie nie.
--
-- ▸ WAS SICH ÄNDERT
--   Nichts wird kopiert. Eine Ansicht ist nur ein Blick auf die Tabellen,
--   und ab dem Ausführen schaut sie in drei statt in zwei. Alle bisherigen
--   Stall-Anmeldungen sind damit sofort dabei, alle künftigen auch, ohne dass
--   irgendwo etwas nachgetragen werden muss.
--
-- ▸ NUR BESTÄTIGTE BEKOMMEN POST
--   Daran ändert sich nichts. Wer den Zugangslink nicht angeklickt hat, steht
--   in der Ansicht mit `bestaetigt = false`, und der Versand nimmt nur die
--   bestätigten. Eine Adresse, die in mehreren Tabellen steht, erscheint
--   einmal; unter `woher` stehen dann alle ihre Wege.
-- ---------------------------------------------------------------------------

create or replace view alle_anmeldungen as
select
  lower(email)                              as email,
  max(vorname)                              as vorname,
  bool_or(bestaetigt)                       as bestaetigt,
  min(erstellt_am)                          as erste_anmeldung,
  string_agg(distinct woher, ' + ')         as woher
from (
  select email, vorname, bestaetigt, erstellt_am, 'Futter-Check' as woher
  from futter_check_anmeldungen
  union all
  select email, vorname, bestaetigt, erstellt_am, 'Insider' as woher
  from insider_anmeldungen
  union all
  -- Neu seit dem 07.09.2026.
  select email, vorname, bestaetigt, erstellt_am, 'Stall Organizer' as woher
  from stall_anmeldungen
) as zusammen
group by lower(email)
order by min(erstellt_am) desc;
