import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // -------------------------------------------------------------------------
  // Der Futter-Check ist eine fertige, in sich geschlossene Seite und liegt
  // als public/futter-check.html im Projekt. Er lief bis 25.08.2026 auf
  // Netlify und ist unverändert übernommen worden — Fragen, Auswertung und
  // Ergebnistexte sind deine.
  //
  // Seit 26.08.2026 liegt er hinter der Anmeldung: Unter /futter-check steht
  // jetzt die Infoseite, die bei Google gefunden werden soll und zur alfima-
  // Anmeldung führt. Der Fragebogen selbst hat die unauffällige Adresse
  // /futter-check-start und steht nicht mehr im Suchindex.
  // -------------------------------------------------------------------------
  async rewrites() {
    return [{ source: "/futter-check-start", destination: "/futter-check.html" }];
  },
};

export default nextConfig;
