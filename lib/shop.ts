// ---------------------------------------------------------------------------
// Der Warenkorb-Katalog, Stand 31.08.2026.
//
// Übernommen aus dem bisherigen WooCommerce-Shop auf
// shop.pferdeliebehealthy.de.
//
// ▸ DIE TEXTE STEHEN HIER WÖRTLICH SO WIE IM ALTEN SHOP. Sie sind nicht
//   gekürzt, nicht umgestellt und nicht geglättet, auch dort nicht, wo sich
//   etwas wiederholt. So hat Yasemin es am 31.08.2026 ausdrücklich gewollt.
//   Wenn ein Text geändert werden soll, dann hier und bewusst, nicht
//   nebenbei beim Umbauen von etwas anderem.
//
// ▸ ALLE PREISE STEHEN IN CENT. 3499 sind also 34,99 €. Das klingt umständlich,
//   erspart aber Rundungsfehler beim Zusammenrechnen, und Stripe rechnet
//   ohnehin in Cent. Angezeigt wird über `preisText()` weiter unten.
//
// ▸ Preise sind Bruttopreise, also inklusive Mehrwertsteuer. So standen sie
//   auch bei WooCommerce.
//
// ▸ Der Steuersatz (`mwst`) steht bei den Futtermitteln auf 7 %, beim
//   Kaltlaser auf 19 %. Von Yasemin am 31.08.2026 bestätigt. Auf der Seite
//   selbst taucht die Zahl nicht auf, sie wird für die Bestellbestätigung
//   gebraucht.
//
// ▸ ENTSCHEIDUNGEN VON YASEMIN AM 31.08.2026:
//     1. Moventa kommt IMMER im 1,5 kg Eimer. Im alten Shop stand im Fließtext
//        dreimal „Beutel", das war veraltet. Hier steht jetzt überall „Eimer".
//        Das ist die einzige Stelle, an der bewusst vom alten Wortlaut
//        abgewichen wird.
//     2. Moventa kostet regulär 75 €, nicht mehr 55 € mit 75 € als
//        Streichpreis.
//     3. Das Begleitbuch zum Onlinekurs und die Community Box gibt es beide
//        nicht mehr, sie sind aus dem Katalog entfernt. Übrig sind die zwei
//        Futtermittel und der Kaltlaser. Im alten WooCommerce-Shop stehen
//        beide noch drin und müssten dort auch raus.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// IST DER SHOP FÜR BESUCHERINNEN SICHTBAR?
//
// ▸ false bedeutet: Der Shop ist vollständig da und funktioniert, aber er
//   steht nicht im Menü, nicht im Fußbereich und nicht in der Seitenübersicht
//   für Google. Der Warenkorb im Kopf zeigt sich nur, wenn wirklich etwas
//   darin liegt. Erreichbar ist alles über die direkte Adresse /shop.
//
// ▸ WARUM ES DIESEN SCHALTER GIBT (31.08.2026)
//   Der neue Shop war fertig, aber der alte auf shop.pferdeliebehealthy.de
//   lief noch. Beide gleichzeitig sichtbar hiesse: zwei Shops, getrennte
//   Bestände, und Bestellungen im alten tauchen in der neuen Liste nie auf.
//   Yasemin wollte deshalb erst in Ruhe testen. Statt an vier Stellen etwas
//   herauszunehmen und es später wieder einzubauen -- wobei man eine Stelle
//   garantiert vergisst -- hängt alles an dieser einen Zeile.
//
// ▸ SO SCHALTEST DU IHN FREI
//   Hier true schreiben, veröffentlichen, fertig. Menü, Fußbereich,
//   Seitenübersicht und Warenkorb kommen von selbst zurück. Vorher den
//   alten Shop abschalten und umleiten, sonst gibt es beide.
// ---------------------------------------------------------------------------
export const shopSichtbar = false;

export type Bild = {
  datei: string;
  alt: string;
};

/** Ein Baustein der Beschreibung. So lässt sich der Aufbau des alten Shops
 *  eins zu eins nachbilden: Absätze, Zwischenüberschriften und Listen in
 *  genau der Reihenfolge, in der sie dort stehen. */
export type Block =
  | { art: "absatz"; text: string; betont?: boolean }
  | { art: "ueberschrift"; text: string }
  | { art: "liste"; punkte: string[] };

export type Angabe = {
  titel: string;
  text: string;
};

export type Produkt = {
  /** Teil der Adresse: /shop/pferdeliebe-pure */
  slug: string;
  /** Der volle Name aus dem alten Shop. */
  name: string;
  /** Kurze Form für Warenkorb und Bestellübersicht, wo wenig Platz ist. */
  kurzname: string;
  kategorie: "futtermittel" | "zubehoer";
  /** Die Kurzbeschreibung aus dem alten Shop, wörtlich. */
  kurz: string;
  preis: number;
  /** Früherer Preis, wird durchgestrichen daneben gezeigt. */
  statt?: number;
  mwst: 7 | 19;
  /** Füllmenge, z. B. "1,5 kg". Fehlt sie, wird nichts angezeigt. */
  inhalt?: string;
  /** Preis je Kilogramm, Pflicht bei angegebener Füllmenge. */
  grundpreis?: string;
  vorraetig: boolean;
  /** Steht statt „In den Warenkorb", wenn nichts da ist. */
  ausverkauftText?: string;
  bilder: Bild[];
  /** Die Beschreibung in ihrer ursprünglichen Gliederung. */
  beschreibung: Block[];
  /** Die Klapptexte unter der Beschreibung. Kommen aus den Produktangaben
   *  des alten Shops und stehen dort genau so. */
  angaben?: Angabe[];
  lieferzeit: string;
};

// ---------------------------------------------------------------------------
// Versand
//
// ▸ Stand 31.08.2026: Versendet wird nur noch nach Deutschland, für 7,50 €.
//   Vorher standen hier 6,50 € und zusätzlich Österreich für 14,99 €, so wie
//   im alten Shop. Beides hat Yasemin geändert.
//
// ▸ Österreich steht als auskommentierte Zeile darunter. Wenn du es wieder
//   aufnehmen willst, reicht es, das `//` davor zu entfernen: Die Kasse zeigt
//   dann von selbst wieder ein Auswahlfeld statt einer festen Zeile, und die
//   Seite „Zahlung und Versand" nennt beide Länder. Es gibt keine zweite
//   Stelle, an der Länder gepflegt werden müssten.
//
// Eine Grenze für versandkostenfreie Lieferung gibt es nicht. Wenn du eine
// einführen willst, sag Bescheid, das ist eine Zeile.
// ---------------------------------------------------------------------------

export type Land = {
  code: "DE" | "AT";
  name: string;
  kosten: number;
};

export const laender: Land[] = [
  { code: "DE", name: "Deutschland", kosten: 750 },
  // { code: "AT", name: "Österreich", kosten: 1499 },
];

/** Der Satz unter der Länderwahl und auf den Produktseiten. Er baut sich aus
 *  der Länderliste, damit er nicht stehen bleibt, wenn dort etwas dazukommt
 *  oder wegfällt. */
export const versandhinweis =
  laender.length === 1
    ? `Versand mit DHL innerhalb ${laender[0].code === "DE" ? "Deutschlands" : laender[0].name}. ` +
      "Andere Länder kann ich im Moment nicht beliefern."
    : `Versand mit DHL nach ${laender.map((l) => l.name).join(" und ")}. ` +
      "Andere Länder kann ich im Moment nicht beliefern.";

/** Der Lieferzeittext, der im alten Shop bei beiden Futtermitteln als
 *  Produktangabe „Versand" hinterlegt ist. Wörtlich übernommen. */
const LIEFERZEITEN_FUTTER =
  "Lieferzeiten\n\nDie Standardlieferzeit beträgt nach Versand 3–7 Werktage. " +
  "Je nach Versandtermin und Auslastung kann die Gesamtlieferzeit vom " +
  "Bestelldatum an bis zu 14 Tage betragen.\n\nBei Vorbestellungen beträgt " +
  "die reguläre Lieferzeit 6 Wochen. In Ausnahmefällen, etwa bei hoher " +
  "Nachfrage oder Lieferengpässen, kann sich die Lieferzeit auf 10–12 Wochen " +
  "verlängern. Wir informieren dich in diesem Fall rechtzeitig.\n\nBitte " +
  "beachte, dass an Sonn- und Feiertagen kein Versand erfolgt.";

// ---------------------------------------------------------------------------
// Die Produkte
// ---------------------------------------------------------------------------

export const produkte: Produkt[] = [
  {
    slug: "pferdeliebe-pure",
    name: "Pferdeliebe Pure – Natürliche Ergänzung zur Mineralversorgung",
    kurzname: "Pferdeliebe Pure",
    kategorie: "futtermittel",
    kurz:
      "Pferdeliebe Pure ist eine naturbelassene Mischung aus Saaten, Kräutern " +
      "und Grünmehlen zur ernährungsphysiologischen Aufwertung des " +
      "Grundfutters. Ohne synthetische Mineralstoffe, künstliche Aromen oder " +
      "Melasse. Im 1,5 kg Eimer.",
    preis: 3499,
    mwst: 7,
    inhalt: "1,5 kg Eimer",
    grundpreis: "23,33 € / kg",
    vorraetig: true,
    lieferzeit: "3 bis 7 Werktage nach Versand",
    bilder: [
      {
        datei: "/images/shop/pure-1.jpeg",
        alt: "Der weisse Eimer Pferdeliebe Pure wird einem braunen Pferd auf der Wiese hingehalten",
      },
      {
        datei: "/images/shop/pure-2.jpg",
        alt: "Das Etikett von Pferdeliebe Pure mit allen Angaben",
      },
      {
        datei: "/images/shop/pure-3.png",
        alt: "Übersicht der Inhaltsstoffe von Pferdeliebe Pure",
      },
    ],
    beschreibung: [
      {
        art: "absatz",
        text: "Pferdeliebe Pure ergänzt die tägliche Ration auf natürliche Weise. Die Mischung aus Hagebuttenschalen, Hanfsamen, Moringa, Seealgenmehl, Brennnesselsamen, Bockshornkleesamen und Grasgrünmehl liefert natürliche Nährstoffe und sekundäre Pflanzenstoffe, ganz ohne künstliche Zusatzstoffe oder synthetische Mineralstoffkomponenten.",
      },
      {
        art: "absatz",
        text: "Die enthaltenen Rohstoffe wurden gezielt ausgewählt: Hanfsamen und Brennnesselsamen liefern wertvolle Fettsäuren und Aminosäuren. Hagebuttenschalen bringen natürliche Vitamin-C-Quellen mit. Seealgenmehl ergänzt die Ration mit natürlich vorkommenden Spurenelementen. Huminsäure unterstützt die ernährungsphysiologische Versorgung des Magen-Darm-Trakts. Bockshornkleesamen enthält natürliche Schleimstoffe und Grasgrünmehl rundet die Mischung mit natürlichen Pflanzenstoffen ab.",
      },
      {
        art: "absatz",
        text: "Pferdeliebe Pure ist für alle Pferdetypen und Rassen geeignet, vom Freizeitpferd über Sportpferde bis hin zu Senioren und Pferden mit empfindlichem Verdauungssystem. Besonders sinnvoll wenn die Futterqualität variiert oder die Versorgung über das Grundfutter schwankt.",
      },
    ],
    angaben: [
      {
        titel: "Zusammensetzung",
        text: "Hagebuttenschalen, Hanfsamen, Moringa, Seealgenmehl, Brennnesselsamen, Bockshornkleesamen und Grasgrünmehl.",
      },
      {
        titel: "Fütterungsempfehlung",
        text: "Pferde: 30 bis 50 g täglich. Ponys: 15 bis 30 g täglich. Dauerhaft oder kurweise einsetzbar.",
      },
      {
        titel: "Analytische Bestandteile",
        text: "Rohprotein: 14 %\n\nRohfett: 10 %\n\nRohfaser: 15 %\n\nRohasche: 12 %\n\nNatürlich vorkommende Mineralstoffe\n(typische natürliche Schwankungen möglich)\n\nCalcium, Phosphor, Magnesium, Natrium, Zink, Mangan, Eisen, Kupfer, Selen (<0,1 mg/kg) und Jod (aus Seealgen)",
      },
      {
        titel: "Weitere Infos",
        text: "Kühl, trocken und lichtgeschützt lagern. Inhalt: 1,5 kg Eimer.",
      },
      { titel: "Versand", text: LIEFERZEITEN_FUTTER },
    ],
  },
  {
    slug: "pferdeliebe-moventa",
    name: "Pferdeliebe „Moventa“ – Unterstützung für Gelenkstoffwechsel und Beweglichkeit",
    kurzname: "Pferdeliebe Moventa",
    kategorie: "futtermittel",
    kurz:
      "Pferdeliebe Moventa vereint Glucosamin-HCl, Kollagen, Chondroitinsulfat " +
      "und Hyaluron mit Hagebutte, Ackerschachtelhalm und Stiefmütterchen, " +
      "abgerundet mit einem feinen Weihraucharoma. Ohne Zucker, Melasse, " +
      "Getreide oder künstliche Aromastoffe. Hergestellt in Deutschland, als " +
      "Pulver im 1,5 kg Eimer.",
    // 75 € ist seit dem 31.08.2026 der reguläre Preis. Im alten Shop stand er
    // als Streichpreis neben 55 €. Der Streichpreis ist deshalb weg: Ein Preis,
    // zu dem gar nicht mehr verkauft wird, darf nicht durchgestrichen daneben
    // stehen, das wäre Werbung mit einer Ersparnis, die es nicht gibt.
    preis: 7500,
    mwst: 7,
    inhalt: "1,5 kg Eimer",
    grundpreis: "50,00 € / kg",
    vorraetig: true,
    lieferzeit: "3 bis 7 Werktage nach Versand",
    bilder: [
      {
        datei: "/images/shop/moventa-1.jpg",
        alt: "Der geöffnete Eimer Pferdeliebe Moventa mit Messlöffel im Pulver",
      },
      {
        datei: "/images/shop/moventa-2.jpeg",
        alt: "Pferdeliebe Moventa von vorne",
      },
      {
        datei: "/images/shop/moventa-3.jpg",
        alt: "Das Etikett von Pferdeliebe Moventa mit allen Angaben",
      },
    ],
    beschreibung: [
      {
        art: "absatz",
        betont: true,
        text: "Ergänzungsfuttermittel für Pferde · Pulver · Zur Unterstützung des Bewegungsapparates",
      },
      {
        art: "absatz",
        text: "Pferdeliebe Moventa haben wir für Pferde zusammengestellt, deren Bewegungsapparat im Alltag besondere Aufmerksamkeit verdient. Eine pulverförmige Mischung aus sieben Komponenten, die in der ganzheitlichen Pferdefütterung lange ihren festen Platz haben.",
      },
      {
        art: "absatz",
        text: "Im Eimer findest du Glucosamin-HCl, Chondroitinsulfat aus porciner Herkunft, Kollagen und Hyaluron als tierische Bausteine. Auf pflanzlicher Seite kommen Hagebutte als natürliche Vitamin C Quelle, Ackerschachtelhalm als Silikatlieferant sowie Stiefmütterchen hinzu, eine traditionsreiche Pflanze in der Kräuterkunde. Abgerundet wird die Mischung durch Lecithin und ein Weihraucharoma, das Moventa seinen unverkennbaren Charakter gibt.",
      },
      {
        art: "absatz",
        text: "Wir verzichten bewusst auf unnötige Füllstoffe und Trägermaterialien. Was im Eimer ist, ist da, weil es seinen Platz dort verdient. Die Pulverkonsistenz lässt sich unkompliziert in das gewohnte Krippenfutter einrühren und wird in der Regel gerne aufgenommen.",
      },
      {
        art: "absatz",
        text: "Die tägliche Fütterungsmenge liegt bei 25 bis 50 Gramm für ein Großpferd, je nach Bedarf und Konstitution. Ein mitgelieferter Messlöffel fasst rund 25 Gramm. Bewahre den Eimer kühl und trocken auf, dann bleibt das Pulver in seiner besten Form.",
      },
      {
        art: "absatz",
        text: "Eine wichtige Anmerkung am Ende: Moventa ist nicht ADMR-konform. Wenn du im Turniersport unterwegs bist, plane bitte eine Karenzzeit von mindestens 48 Stunden vor dem Start ein.",
      },
    ],
    angaben: [{ titel: "Versand", text: LIEFERZEITEN_FUTTER }],
  },
  {
    slug: "kaltlaser",
    name: "Kaltlaser für Pferde",
    kurzname: "Kaltlaser",
    kategorie: "zubehoer",
    // Auch hier hat der alte Shop keine Kurzbeschreibung, deshalb der erste
    // Satz der Beschreibung, gekürzt auf Kartenlänge.
    kurz:
      "Der Kaltlaser (oder Low-Level-Lasertherapie) wird immer häufiger in der " +
      "Pferdemedizin eingesetzt, um eine Vielzahl von Beschwerden zu behandeln " +
      "und die Heilung zu unterstützen.",
    preis: 14900,
    mwst: 19,
    vorraetig: true,
    lieferzeit: "3 bis 7 Werktage nach Versand",
    bilder: [
      {
        datei: "/images/shop/kaltlaser-1.jpeg",
        alt: "Der schwarze Kaltlaser in einer Hand, das Display zeigt fünf Minuten",
      },
      {
        datei: "/images/shop/kaltlaser-2.jpeg",
        alt: "Der Kaltlaser von der Seite",
      },
      {
        datei: "/images/shop/kaltlaser-3.jpeg",
        alt: "Der Kaltlaser mit eingeschaltetem Licht",
      },
    ],
    beschreibung: [
      {
        art: "absatz",
        text: "Der Kaltlaser (oder Low-Level-Lasertherapie) wird immer häufiger in der Pferdemedizin eingesetzt, um eine Vielzahl von Beschwerden zu behandeln und die Heilung zu unterstützen. Es handelt sich dabei um einen Laser, der mit einer niedrigen Leistungsdichte arbeitet und nicht die Gewebe verbrennt, sondern durch Lichtstrahlen positive biologische Reaktionen im Körper anregt.",
      },
      {
        art: "liste",
        punkte: [
          "Schmerzlinderung und Entzündungshemmung",
          "Förderung der Heilung von Gewebe und Wunden",
          "Reduzierung von Ödemen (Schwellungen)",
          "Verbesserung der Durchblutung",
          "Muskelentspannung und Verbesserung der Beweglichkeit",
          "Nicht-invasiv und schmerzfrei",
          "Verkürzung der Genesungszeit nach Verletzungen",
          "Wirkung bei chronischen Erkrankungen",
        ],
      },
      {
        art: "absatz",
        text: "Der Laser ist ein innovatives Gerät, das zur therapeutischen Anwendung bei Tieren, insbesondere bei Pferden, genutzt wird. Dieser Laser arbeitet mit zwei unterschiedlichen Wellenlängen: 650 nm und 808 nm. Die Kombination dieser beiden Wellenlängen ermöglicht eine tiefgehende und vielseitige Behandlung, da jede Wellenlänge unterschiedliche Gewebetiefen erreicht und so eine umfassende therapeutische Wirkung erzielt werden kann.",
      },
      {
        art: "absatz",
        betont: true,
        text: "Farbe: Abbildung kann abweichen, die technischen Daten bleiben aber gleich. Die Farbe vom Laser ist schwarz.",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Kleine Helfer
// ---------------------------------------------------------------------------

export const kategorien = [
  { schluessel: "futtermittel", name: "Futtermittel" },
  { schluessel: "zubehoer", name: "Zubehör" },
] as const;

/** Macht aus 3499 die Zeichenkette "34,99 €". */
export function preisText(cent: number): string {
  return (cent / 100).toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
  });
}

export function produktFinden(slug: string): Produkt | undefined {
  return produkte.find((p) => p.slug === slug);
}

/** Die Versandkosten für ein Land. Unbekanntes Land = Deutschland. */
export function versandkosten(landCode: string): number {
  return laender.find((l) => l.code === landCode)?.kosten ?? laender[0].kosten;
}
