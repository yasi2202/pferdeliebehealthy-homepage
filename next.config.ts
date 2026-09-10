import type { NextConfig } from "next";
import { alleBlogBeitraege } from "./lib/blog";
import { alteAdressen } from "./lib/alte-adressen";
import { mitgliederbereich } from "./lib/seite";

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
      // -----------------------------------------------------------------------
      // Die uebrigen Adressen der alten WordPress-Seite: Ausbildung, Shop,
      // Rechtstexte, Mein Konto. Sie stehen in lib/alte-adressen.ts, damit
      // diese Datei lesbar bleibt.
      //
      // Sie kommen NACH den Blogadressen, weil die einzelnen Beitraege die
      // genaueren Adressen haben.
      // -----------------------------------------------------------------------
      ...alteAdressen(mitgliederbereich.url),
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
      {
        // Das Monatsabo hat einen eigenen Slug (`equidesk-abo`), aber keine
        // eigene Verkaufsseite: /equidesk zeigt seit dem 07.09.2026 ohnehin
        // das Abo. Die Kachel im Shop verlinkt auf /<slug> und lief deshalb
        // in eine Fehlerseite. permanent: false, weil eine eigene Seite
        // später durchaus dazukommen kann.
        source: "/equidesk-abo",
        destination: "/equidesk",
        permanent: false,
      },
    ];
  },

  // -------------------------------------------------------------------------
  // Schutzkopfzeilen, seit 08.09.2026.
  //
  // Vercel setzt von sich aus nur Strict-Transport-Security. Die vier hier
  // kosten nichts und schliessen die ueblichen Luecken:
  //
  //   nosniff            Der Browser haelt sich an den angegebenen Dateityp
  //                      und macht aus einer hochgeladenen Datei kein Skript.
  //   Referrer-Policy    Beim Klick auf einen fremden Link erfaehrt die
  //                      andere Seite nur noch die Domain, nicht die genaue
  //                      Adresse. Wichtig bei Seiten wie /danke/<nummer>.
  //   X-Frame-Options    Niemand kann die Seite unsichtbar in seine eigene
  //                      einbauen und Klicks abfangen (Clickjacking). Eigene
  //                      Einbettungen bleiben erlaubt.
  //   Permissions-Policy Kamera, Mikrofon und Standort sind fuer alle
  //                      abgeschaltet. Die Seite braucht nichts davon.
  //
  // Bewusst NICHT dabei: eine Content-Security-Policy. Die Seite laedt
  // Stripe, Vimeo und Vercel Analytics; eine zu enge Regel legt die Kasse
  // still, und das faellt erst auf, wenn jemand nicht bezahlen kann.
  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // Zwischenstufen fuer die Bildbreiten.
  //
  // next/image baut die Auswahl an Bildbreiten aus zwei Listen: deviceSizes
  // fuer Bilder, die die volle Breite einnehmen, imageSizes fuer Bilder mit
  // fester Breite. Die Werkseinstellung springt bei imageSizes von 384 direkt
  // auf 640 (die erste deviceSize).
  //
  // Genau in dieser Luecke liegen mehrere Bilder der Seite. Das Handybild vom
  // Stall Organizer zum Beispiel ist auf 260 Punkte gedeckelt und braucht auf
  // einem heutigen Handy (Bildschirm rechnet mit Faktor 1,75 bis 3) also rund
  // 460 bis 780 echte Bildpunkte. Der Browser fand nichts dazwischen und nahm
  // 640, wo 512 gereicht haetten.
  //
  // 512 schliesst die Luecke. Mehr Zwischenstufen sind nicht ratsam: Jede
  // zusaetzliche Breite ist eine weitere Fassung, die Vercel berechnen und
  // vorhalten muss.
  // -------------------------------------------------------------------------
  images: {
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
  },

  // -------------------------------------------------------------------------
  // Das Stylesheet steht seit dem 09.09.2026 im Seitenkopf statt in einer
  // eigenen Datei.
  //
  // Ein <link rel="stylesheet"> haelt den Browser an: Er zeichnet nichts, bevor
  // die Datei da ist. Bei uns waren das 12 KB in einer eigenen Anfrage, und im
  // Mobilfunknetz kostet allein das Hin und Her rund 750 Millisekunden, in
  // denen die Seite weiss bleibt. Genau so weist es die Google-Messung aus
  // ("Anfragen zum Blockieren des Renderings").
  //
  // inlineCss legt die Regeln direkt in die HTML-Seite. Damit faellt die
  // Anfrage weg, und der Browser kann zeichnen, sobald die Seite da ist.
  //
  // Der Preis: Die Seite selbst wird um diese 12 KB groesser, und sie sind
  // nicht mehr getrennt zwischengespeichert, kommen also bei jedem Aufruf
  // wieder mit. Fuer eine Seite, auf die Leute ueber Google und Instagram zum
  // ersten Mal kommen, ist das der bessere Tausch: Der erste Eindruck zaehlt
  // mehr als der zweite Aufruf.
  //
  // Die Einstellung ist bei Next.js noch als "experimental" gefuehrt. Wenn nach
  // einem Versionssprung die Seite ploetzlich ohne Gestaltung ankommt, ist das
  // hier die erste Stelle zum Nachsehen.
  // -------------------------------------------------------------------------
  experimental: {
    inlineCss: true,
  },

  async headers() {
    return [
      {
        source: "/:pfad*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
