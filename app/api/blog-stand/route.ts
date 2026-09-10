import { NextResponse } from 'next/server';
import { alleBlogBeitraege, blogBeitragLesen } from '@/lib/blog';

// ---------------------------------------------------------------------------
// Der Ausbaustand der Blogbeiträge, als Zahlen für die Verwaltung.
//
// WOFÜR: Die Verwaltung der Akademie zeigt unter "Homepage" an, welche
// Beiträge nach den eigenen Regeln fertig ausgebaut sind und wo noch etwas
// fehlt. Sie liegt auf einer anderen Adresse und kommt an die Markdown-Dateien
// hier nicht heran. Statt die Beiträge dort ein zweites Mal zu zählen, rechnet
// diese Schnittstelle aus derselben Quelle wie die Blogseite selbst, nämlich
// aus lib/blog.ts. Damit kann die Zählung nie von dem abweichen, was Google
// tatsächlich zu sehen bekommt.
//
// WAS GEZÄHLT WIRD, und warum genau das: Es sind die Punkte, nach denen am
// 03. und 07.09.2026 alle Beiträge durchgegangen wurden. Titellänge und
// Beschreibung entscheiden, ob bei Google geklickt wird. Umfang, Abschnitte und
// Fragen entscheiden, ob Google den Beitrag für gründlich hält. Die Verweise
// im Text halten Besucherinnen auf der Seite. Das Kopfbild fehlte bei acht
// Beiträgen.
//
// OFFEN OHNE ANMELDUNG, wie der Blog-Feed nebenan: Es steht nichts darin, was
// nicht ohnehin auf der Blogseite zu sehen ist, und Entwürfe gibt
// alleBlogBeitraege() gar nicht erst heraus.
// ---------------------------------------------------------------------------

export const revalidate = 3600;

/** Der sichtbare Text eines Beitrags, ohne Auszeichnung und ohne Kästen. */
function nurText(html: string): string {
  return html
    // Partner- und Angebotskästen zählen nicht zum Umfang: Sie sind in jedem
    // Beitrag gleich und würden kurze Texte länger aussehen lassen, als sie sind.
    .replace(/<aside[\s\S]*?<\/aside>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Verweise auf eigene Seiten im Text.
 *
 * Gezählt werden Links auf pferdeliebehealthy.de und Pfade, die mit einem
 * Schrägstrich anfangen. Sprungmarken innerhalb des Beitrags zählen nicht,
 * die führen nirgendwohin, und Links in Partnerkästen auch nicht, die zeigen
 * auf fremde Shops.
 */
function eigeneVerweise(html: string): number {
  const ohneKaesten = html.replace(/<aside[\s\S]*?<\/aside>/g, ' ');
  const treffer = ohneKaesten.match(
    /href="(\/(?!\/)[^"#]*|https?:\/\/(www\.)?pferdeliebehealthy\.de\/[^"#]*)"/g
  );
  return treffer ? treffer.length : 0;
}

export async function GET() {
  const beitraege = alleBlogBeitraege().map((kopf) => {
    const voll = blogBeitragLesen(kopf.slug);
    const html = voll?.html ?? '';
    return {
      slug: kopf.slug,
      titel: kopf.titel,
      titelLaenge: kopf.titel.length,
      beschreibung: kopf.beschreibung,
      beschreibungLaenge: kopf.beschreibung.length,
      kategorie: kopf.kategorie,
      datum: kopf.datum,
      aktualisiert: kopf.aktualisiert || null,
      zeichen: nurText(html).length,
      abschnitte: voll?.kapitel.length ?? 0,
      fragen: voll?.fragen.length ?? 0,
      verweise: eigeneVerweise(html),
      bild: Boolean(kopf.bild),
      werbung: voll?.werbung ?? false,
      angebot: kopf.angebot || null,
    };
  });

  return NextResponse.json(
    { stand: new Date().toISOString(), beitraege },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
// ENDE DER DATEI
