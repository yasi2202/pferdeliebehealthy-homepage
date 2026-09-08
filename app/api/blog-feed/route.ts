import { NextResponse } from 'next/server';
import { alleBlogBeitraege } from '@/lib/blog';

// ---------------------------------------------------------------------------
// Die Blogbeiträge als JSON, damit andere Anwendungen sie zeigen können.
//
// WOFÜR: Der Stall Organizer in der Akademie hat einen Bereich „Zum
// Nachlesen". Der liegt auf akademieapp.vercel.app und kommt an die Markdown-
// Dateien dieses Projekts nicht heran. Statt die Beiträge dort ein zweites
// Mal zu pflegen (und beim nächsten Text zu vergessen), holt er sie hier ab.
//
// NUR VERÖFFENTLICHTES: `alleBlogBeitraege()` gibt ohnehin nur heraus, was
// freigegeben ist. Entwürfe mit Unterstrich im Dateinamen tauchen nicht auf.
//
// OFFEN OHNE ANMELDUNG, und das ist richtig: Es steht nichts darin, was nicht
// ohnehin auf der Blogseite steht. Deshalb auch eine Stunde Zwischenspeicher
// beim Ausliefern statt eines Abrufs je Kundin.
// ---------------------------------------------------------------------------

export const revalidate = 3600;

export async function GET() {
  const beitraege = alleBlogBeitraege().map((b) => ({
    slug: b.slug,
    titel: b.titel,
    datum: b.datum,
    aktualisiert: b.aktualisiert || null,
    beschreibung: b.beschreibung,
    kategorie: b.kategorie,
    url: `https://www.pferdeliebehealthy.de/blog/${b.slug}`,
    // Als vollständige Adresse, nicht als Pfad: Wer den Feed liest, sitzt auf
    // einer anderen Domain (der Stall Organizer in der Akademie), und
    // "/images/blog/…" zeigt dort ins Leere.
    bild: b.bild ? `https://www.pferdeliebehealthy.de${b.bild}` : null,
    bildText: b.bildText || null,
  }));

  return NextResponse.json(
    { beitraege },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        // Die Akademie liegt auf einer anderen Adresse und darf lesen.
        'Access-Control-Allow-Origin': '*',
      },
    },
  );
}
