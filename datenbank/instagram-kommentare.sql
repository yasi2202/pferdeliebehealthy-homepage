-- ---------------------------------------------------------------------------
-- Die eigene Antwort auf Instagram-Kommentare, als Ersatz für ManyChat
-- (seit 12.09.2026).
--
-- ▸ SO TRÄGST DU SIE EIN:
--   1. supabase.com öffnen, Projekt "pferdeliebehealthy-akademie" wählen
--      (Kennung pklopjbemmyvpmywoayk).
--   2. Links in der Leiste auf "SQL Editor".
--   3. Diesen ganzen Text hineinkopieren und auf "Run" klicken.
--
-- ▸ ZWEI TABELLEN
--   instagram_kommentar_antworten  Jeder Kommentar mit Stichwort, auf den
--                                  geantwortet wurde. Die Kommentarkennung ist
--                                  eindeutig: Schickt Meta denselben Kommentar
--                                  zweimal, wird nur einmal geantwortet.
--                                  Zeilen werden nach zwölf Monaten gelöscht
--                                  (app/api/instagram/zugang-erneuern).
--   instagram_zugang               Der Instagram-Schlüssel. Er läuft nach 60
--                                  Tagen ab; die Website erneuert ihn jede
--                                  Woche selbst und legt den neuen hier ab,
--                                  damit niemand ihn bei Vercel tauschen muss.
-- ---------------------------------------------------------------------------

create table if not exists public.instagram_kommentar_antworten (
  id uuid primary key default gen_random_uuid(),
  erstellt_am timestamptz not null default now(),

  kommentar_id text not null unique,
  beitrag_id text,
  von_id text,
  von_name text,
  text text,
  stichwort text,

  -- Was geklappt hat: die Direktnachricht und die kurze Antwort darunter.
  nachricht_ok boolean,
  antwort_ok boolean,
  fehler text
);

create index if not exists instagram_kommentar_antworten_zeit_idx
  on public.instagram_kommentar_antworten (erstellt_am desc);

alter table public.instagram_kommentar_antworten enable row level security;

create table if not exists public.instagram_zugang (
  schluessel text primary key,
  token text not null,
  gueltig_bis timestamptz,
  erneuert_am timestamptz not null default now()
);

alter table public.instagram_zugang enable row level security;
