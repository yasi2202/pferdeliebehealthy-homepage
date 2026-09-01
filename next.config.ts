import type { NextConfig } from "next";
import { alleBlogBeitraege } from "./lib/blog";

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
    // -----------------------------------------------------------------------
    // Die alten Blogadressen.
    //
    // Bis zum Umzug lagen die Beitraege direkt unter der Wurzel, also
    // pferdeliebehealthy.de/heucobs-worauf-man-beim-kauf-achten-sollte. Google
    // kennt sie bis heute unter diesen Adressen. Ohne Weiterleitung landet
    // jede, die dort klickt, auf einer Fehlerseite, und die Jahre an
    // Bekanntheit dieser Adressen sind verloren.
    //
    // Die Liste entsteht aus den Beitraegen selbst. Ein Beitrag, der noch
    // Entwurf ist (Unterstrich im Dateinamen), bekommt keine Weiterleitung --
    // sie zeigte sonst auf eine Seite, die es nicht gibt, und das waere
    // schlimmer als die Fehlerseite von jetzt.
    //
    // permanent: true, weil die alten Adressen nie wiederkommen. Google
    // uebertraegt damit die Bewertung der alten Adresse auf die neue.
    // -----------------------------------------------------------------------
    const alteBlogadressen = alleBlogBeitraege().map((b) => ({
      source: `/${b.slug}`,
      destination: `/blog/${b.slug}`,
      permanent: true,
    }));

    return [
      ...alteBlogadressen,
      {
        // Diese eine alte Adresse begann mit einem Pferde-Emoji. Der neue
        // Dateiname darf das nicht enthalten, also faengt die Weiterleitung
        // sie von Hand ab. Beide Schreibweisen, weil manche Browser das
        // Zeichen kodiert schicken und manche nicht.
        source: "/%F0%9F%90%B4-futterberatung-fuers-pferd-warum-einfach-fuettern-nicht-mehr-reicht",
        destination: "/blog/futterberatung-fuers-pferd-warum-einfach-fuettern-nicht-mehr-reicht",
        permanent: true,
      },
      {
        source: "/🐴-futterberatung-fuers-pferd-warum-einfach-fuettern-nicht-mehr-reicht",
        destination: "/blog/futterberatung-fuers-pferd-warum-einfach-fuettern-nicht-mehr-reicht",
        permanent: true,
      },
      {
        source: "/danke-futter-check",
        destination: "/futter-check-start",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
