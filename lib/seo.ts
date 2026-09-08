// ---------------------------------------------------------------------------
// Die Adresse, unter der die Seite oeffentlich erreichbar ist.
//
// Sie wird nicht fest eingetragen, sondern aus der Umgebung gelesen. Damit
// stimmt sie automatisch weiter, wenn die Seite eines Tages von
// pferdeliebehealthy-homepage.vercel.app auf pferdeliebehealthy.de umzieht --
// ohne dass jemand Sitemap, Kanonische Adressen und Vorschaubilder einzeln
// nachziehen muss.
//
// Reihenfolge:
//   1. NEXT_PUBLIC_SITE_URL, falls in den Vercel-Einstellungen gesetzt.
//      Diesen Weg nimmst du, wenn du die Wunschadresse selbst bestimmen willst.
//   2. Die Produktionsadresse, die Vercel selbst kennt. Traegt man dort eine
//      eigene Domain ein, zeigt sie auf genau diese.
//   3. Der oertliche Entwicklungsserver.
// ---------------------------------------------------------------------------

function ermitteln(): string {
  const eigene = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (eigene) return eigene.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;

  return "http://localhost:3000";
}

export const seitenUrl = ermitteln();

/** Vollstaendige Adresse zu einem Pfad, z. B. "/insider" -> "https://.../insider" */
export function url(pfad: string): string {
  return new URL(pfad, seitenUrl).toString();
}

// ---------------------------------------------------------------------------
// Die Vorschau beim Teilen.
//
// ▸ DAS PROBLEM, DAS DIESE FUNKTION LOEST (gefunden am 08.09.2026)
//   Next.js vererbt Metadaten von app/layout.tsx an jede Seite, die sie
//   nicht selbst setzt. Wer also den Blog bei WhatsApp verschickte, bekam
//   Titel, Text und Bild der Startseite zu sehen, nicht die des Blogs. Auf
//   den Verkaufsseiten stimmte die Facebook-Vorschau, weil sie ein eigenes
//   `openGraph` haben, die Twitter-Karte aber nicht: Die kam ueberall von
//   der Startseite.
//
// ▸ DIE LOESUNG HAT ZWEI HAELFTEN
//   1. In app/layout.tsx steht bei `twitter` nur noch die Kartenform. Fehlen
//      Titel und Text dort, nimmt X automatisch die Open-Graph-Angaben der
//      jeweiligen Seite. Damit ist die Twitter-Karte auf allen Seiten von
//      selbst richtig, ohne dass eine einzige Seite etwas dafuer tun muss.
//   2. Jede oeffentliche Seite braucht ihr eigenes `openGraph`. Dafuer ist
//      diese Funktion da.
//
// ▸ SO WIRD SIE BENUTZT
//     export const metadata: Metadata = {
//       title: TITEL,
//       description: BESCHREIBUNG,
//       alternates: { canonical: "/blog" },
//       ...teilen({ titel: TITEL, beschreibung: BESCHREIBUNG, pfad: "/blog" }),
//     };
//
//   `bild` nur angeben, wenn die Seite ein eigenes Vorschaubild hat. Sonst
//   nimmt sie vorschau.jpg, das Querformat mit Name, Taetigkeit und Ort.
// ---------------------------------------------------------------------------

/** Das Standard-Vorschaubild. Genau 1200 x 630, siehe app/layout.tsx. */
export const vorschaubild = "/images/vorschau.jpg";

export function teilen({
  titel,
  beschreibung,
  pfad,
  bild = vorschaubild,
  typ = "website",
}: {
  titel: string;
  beschreibung: string;
  pfad: string;
  bild?: string;
  typ?: "website" | "article";
}) {
  // Der Markenname haengt bei `title` automatisch dran (die Vorlage in
  // app/layout.tsx), bei Open Graph aber nicht. Also hier von Hand, und nur,
  // wenn er nicht ohnehin schon im Titel steht.
  const ogTitel = titel.includes("Pferdeliebehealthy")
    ? titel
    : `${titel} | Pferdeliebehealthy`;

  return {
    openGraph: {
      type: typ,
      locale: "de_DE",
      siteName: "Pferdeliebehealthy",
      title: ogTitel,
      description: beschreibung,
      url: pfad,
      images: [{ url: bild, width: 1200, height: 630, alt: ogTitel }],
    },
  };
}
