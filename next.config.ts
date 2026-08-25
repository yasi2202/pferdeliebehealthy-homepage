import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // -------------------------------------------------------------------------
  // Der Futter-Check ist eine fertige, in sich geschlossene Seite und liegt
  // als public/futter-check.html im Projekt. Er lief bis 25.08.2026 auf
  // Netlify und ist unverändert übernommen worden — Fragen, Auswertung und
  // Ergebnistexte sind deine.
  //
  // Diese Umschreibung sorgt dafür, dass die Adresse sauber
  // pferdeliebehealthy.de/futter-check lautet statt .../futter-check.html.
  // -------------------------------------------------------------------------
  async rewrites() {
    return [{ source: "/futter-check", destination: "/futter-check.html" }];
  },
};

export default nextConfig;
