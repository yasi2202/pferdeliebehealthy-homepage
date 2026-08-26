import type { MetadataRoute } from "next";

// ---------------------------------------------------------------------------
// Damit sich die Seite auf dem Handy „zum Startbildschirm hinzufügen" lässt
// und sich danach wie eine App verhält: eigenes Symbol, eigener Name, kein
// Browser-Rahmen drumherum.
//
// Die Symbole liegen als JPEG in public/ — bei einem Foto ist das ein
// Bruchteil der Grösse eines PNG, und durchsichtige Ecken braucht hier
// niemand: Android und Apple legen ihre eigene Maske darüber.
//
// Das Symbol im Browser-Tab kommt woanders her: app/icon.png (rund, mit
// durchsichtigen Ecken) und app/apple-icon.png. Diese beiden Dateinamen
// erkennt Next.js von selbst, sie müssen nirgends eingetragen werden.
// ---------------------------------------------------------------------------

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pferdeliebehealthy — Ganzheitliche Pferdefütterung",
    short_name: "Pferdeliebe",
    description:
      "Ernährungsberatung für Pferde von Yasemin Halac: kostenloser Futter-Check, Mineral-Klarheit und die Masterclass zur Pferdefütterung.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "de-DE",
    // Creme als Hintergrund beim Starten, Rosé als Farbe der Statusleiste —
    // dieselben Farben wie auf der Seite.
    background_color: "#F9EDED",
    theme_color: "#B87878",
    categories: ["health", "education", "lifestyle"],
    icons: [
      {
        src: "/icon-192.jpg",
        sizes: "192x192",
        type: "image/jpeg",
        purpose: "any",
      },
      {
        src: "/icon-512.jpg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "any",
      },
    ],
  };
}
