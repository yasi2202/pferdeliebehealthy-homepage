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
