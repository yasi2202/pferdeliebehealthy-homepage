import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // -------------------------------------------------------------------------
  // Der Futter-Check ist eine fertige, in sich geschlossene Seite und liegt
  // als public/futter-check.html im Projekt. Er lief bis 25.08.2026 auf
  // Netlify und ist unverändert übernommen worden — Fragen, Auswertung und
  // Ergebnistexte sind deine.
  //
  // Seit 26.08.2026 steht unter /futter-check die Infoseite, die bei Google
  // gefunden werden soll. Der Fragebogen selbst hat die Adresse
  // /futter-check-start und ist nicht im Suchindex — er fragt die
  // E-Mail-Adresse inzwischen selbst ab, direkt vor dem Ergebnis.
  // -------------------------------------------------------------------------
  async rewrites() {
    return [{ source: "/futter-check-start", destination: "/futter-check.html" }];
  },

  // -------------------------------------------------------------------------
  // Der kurze Umweg über alfima, den es am 26.08.2026 einen halben Tag lang
  // gab. Die Weiterleitung bleibt stehen, damit ein Link aus dieser Zeit --
  // in einer verschickten Mail, in einem alfima-Produkt, in einem Beitrag --
  // nicht auf einer Fehlerseite endet.
  //
  // Dauerhaft (permanent: true) ist sie bewusst nicht: falls die Adresse
  // eines Tages wieder gebraucht wird, hätten Browser sie sonst für immer
  // gespeichert.
  // -------------------------------------------------------------------------
  async redirects() {
    return [
      {
        source: "/danke-futter-check",
        destination: "/futter-check-start",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
