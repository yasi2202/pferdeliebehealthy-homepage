// ---------------------------------------------------------------------------
// Die Adressen der alten WordPress-Seite.
//
// Bis zum Umzug lief pferdeliebehealthy.de auf WordPress mit einem
// WooCommerce-Shop. Google kennt viele dieser Adressen bis heute -- sie
// stehen in den Suchergebnissen, in verschickten Mails, in fremden Beitraegen
// und in den Lesezeichen von Kundinnen.
//
// Ohne Weiterleitung landet jede, die dort klickt, auf einer Fehlerseite.
// Genau das war der Grund, warum unter dem Suchergebnis Verweise wie
// „Mein Konto" oder „Pferdefutter" ins Leere fuehrten.
//
// Die Liste stammt aus dem Internet Archive (alle Adressen, die dort mit
// Status 200 aufgezeichnet sind). Die alten Blogbeitraege stehen NICHT hier,
// die baut next.config.ts aus den Beitragsdateien selbst.
//
// permanent: true heisst „diese Adresse kommt nie wieder". Google uebertraegt
// damit die ueber Jahre gewachsene Bewertung der alten Adresse auf die neue.
// ---------------------------------------------------------------------------

/** Alte Adresse -> neue Adresse. Ohne Schraegstrich am Ende: Next.js
 *  entfernt den von selbst, bevor es hier nachschlaegt. */
const zuordnung: Record<string, string> = {
  // ▸ DIE AUSBILDUNG.
  //   Sie hiess auf der alten Seite an fuenf verschiedenen Stellen anders.
  "/ausbildung-natuerliche-pferdefuetterung": "/ausbildung",
  "/ausbildung-natuerliche-pferdefuetterung-ausbildungscampus": "/ausbildung",
  "/ausbildungen": "/ausbildung",
  "/pferdefutterung-ausbildung": "/ausbildung",
  "/natuerliche-pferdefuetterung": "/ausbildung",
  "/ganzheitliche-pferdefuetterung": "/ausbildung",

  // ▸ DIE RECHTSTEXTE.
  //   Sie heissen auf der neuen Seite kuerzer.
  "/datenschutzerklaerung": "/datenschutz",
  "/cookie-richtlinie-eu": "/datenschutz",
  "/abgs": "/agb",
  "/zahlung-versand": "/zahlung-und-versand",
  "/kontaktinformationen": "/impressum",

  // ▸ ÜBER MICH UND KONTAKT.
  //   Beides ist heute ein Abschnitt der Startseite, keine eigene Seite mehr.
  "/uber-mich": "/#ueber-mich",

  // ▸ DER SHOP.
  //   Der Warenkorb und die Kasse von WooCommerce fuehren zur Uebersicht:
  //   ein alter Warenkorb laesst sich nicht wiederherstellen.
  "/pferdefutter": "/shop",
  "/warenkorb": "/shop",
  "/bestellvorgang": "/shop",

  // ▸ EINZELNE PRODUKTE, die es heute noch gibt.
  //   Alles andere faengt weiter unten die Regel fuer /produkt/... ab.
  "/produkt/pferdeliebe-pure-natuerliche-ergaenzung-zur-mineralversorgung": "/shop/pferdeliebe-pure",
  "/produkt/pferdeliebe-moventa-die-sinnvolle-gelenkunterstuetzung-fuer-dein-pferd": "/shop/pferdeliebe-moventa",
  "/produkt/kaltlaser-fuer-pferde": "/shop/kaltlaser",
  "/produkt/ganzjahresfutterplan-kalender": "/ganzjahresfutterplan",
  "/produkt/magen-reset-praxiswissen-rezept-und-schnelle-hilfe-bei-magenproblemen": "/magen-reset",
  "/produkt/rationpro-das-einfache-rationsberechnungs-tool-fuer-pferdebesitzer": "/ratiopro",
  "/produkt/darmsanierung-beim-pferd-schritt-fuer-schritt-zur-gesunden-verdauung-rezept-e-book": "/darmaufbau",

  // ▸ DIE AROMATHERAPIE.
  //   Der Kurs liegt heute in der Akademie und hat auf der Website keine
  //   eigene Seite. Bis es eine gibt, fuehrt die Adresse zur Angebotsuebersicht.
  "/aromatherapie-fuer-pferde": "/#wege",
};

/** Was auf der alten Seite in ganzen Gruppen lag: Produktseiten, Kategorien,
 *  Schlagwoerter, Sammlungen. Einzeln aufzuzaehlen waren das ueber hundert
 *  Adressen, und es kommen keine neuen dazu. */
const gruppen: Array<{ von: string; nach: string }> = [
  { von: "/produkt", nach: "/shop" },
  { von: "/produkt-kategorie", nach: "/shop" },
  { von: "/produkt-schlagwort", nach: "/shop" },
  { von: "/Sammlungen", nach: "/shop" },
  { von: "/sammlungen", nach: "/shop" },
  // Die alten Blogkategorien. Eine eigene Themenseite gibt es erst, wenn
  // Beitraege dazu veroeffentlicht sind -- deshalb geht es zur Uebersicht,
  // wo alle Themen nebeneinanderstehen.
  { von: "/category", nach: "/blog" },
];

/** Der Mitgliederbereich.
 *
 *  „Mein Konto" und „Kunden-Dashboard" waren die WooCommerce-Seiten, auf
 *  denen Kundinnen ihre Kaeufe sahen. Heute ist das die Akademie.
 *
 *  Bewusst NICHT dauerhaft (permanent: false): Sobald die Akademie eine
 *  eigene Adresse unter pferdeliebehealthy.de bekommt, soll der Browser die
 *  alte Weiterleitung nicht fuer immer gespeichert haben. */
const kontoSeiten = ["/mein-konto", "/kunden-dashboard"];

export function alteAdressen(mitgliederbereichUrl: string) {
  return [
    ...Object.entries(zuordnung).map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    })),
    ...gruppen.map(({ von, nach }) => ({
      source: `${von}/:rest*`,
      destination: nach,
      permanent: true,
    })),
    ...kontoSeiten.map((source) => ({
      source,
      destination: mitgliederbereichUrl,
      permanent: false,
    })),
  ];
}
