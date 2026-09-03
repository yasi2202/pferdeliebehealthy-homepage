// ---------------------------------------------------------------------------
// Die digitalen Produkte: Kurse, Pläne und die Beratung.
//
// ▸ WARUM EINE EIGENE DATEI NEBEN lib/shop.ts
//   Ein Kurs ist etwas anderes als ein Eimer Futter. Es gibt keinen Versand,
//   keine Anschrift für die Lieferung und keinen Vorrat, dafür einen
//   Zugangsschlüssel, ein Widerrufsrecht mit anderen Regeln und die
//   Freischaltung in der Akademie.
//
// ▸ ALLE PREISE STEHEN IN CENT. 2900 sind 29,00 €.
//   Stand 01.09.2026, von den alfima-Seiten übernommen.
//
// ▸ DER `akademieName` IST DER WICHTIGSTE WERT IN DIESER DATEI.
//   Mit genau diesem Namen meldet die Website den Kauf an die Akademie, und
//   dort entscheidet lib/produkt-zugang.ts anhand des Namens, welcher Zugang
//   freigeschaltet wird. Passt er auf keine Regel, wird NICHTS
//   freigeschaltet, und der Kauf steht im Protokoll der Akademie unter
//   "Produktname unbekannt". Das ist Absicht und besser als ein falsch
//   vergebener Zugang, aber du musst es merken. Jeder Name hier ist gegen
//   die Regeln dort geprüft worden, siehe den Kommentar am jeweiligen
//   Produkt. Niemals ändern, ohne dort nachzusehen.
//
// ▸ WAS ABSICHTLICH FEHLT
//   - Aroma Horse (397 €): anderes Publikum, gehört nicht in die Ketten.
//     Von Yasemin am 01.09.2026 so entschieden.
//   - Die Masterclass (899 €): 899 € kauft niemand nebenbei nach einem
//     29-Euro-Kauf. Die gehört an das Ende einer Mailstrecke.
//   - Rezeptbuch und Rezept E-Book 2.0: dafür gibt es noch keine Preise.
//   - Stall Organizer (kostenlos) und die Masterclass als Buch (Beigabe).
// ---------------------------------------------------------------------------

export type DigitalBlock =
  | { art: "absatz"; text: string; betont?: boolean }
  | { art: "ueberschrift"; text: string }
  | { art: "liste"; punkte: string[] };

export type DigitalProdukt = {
  /** Teil der Adresse: /ganzjahresfutterplan und /kasse/ganzjahresfutterplan */
  slug: string;
  /** Der volle Name, wie er auf der Verkaufsseite und in der Mail steht. */
  name: string;
  /** Kurze Form für Kasse, Mail und Bestellübersicht. */
  kurzname: string;
  /** Der Preis, zu dem verkauft wird. In Cent. */
  preis: number;
  /**
   * Früherer Preis, wird durchgestrichen daneben gezeigt.
   *
   * ▸ NUR SETZEN, WENN TATSÄCHLICH ZU DIESEM PREIS VERKAUFT WURDE oder es
   *   sich um eine echte, befristete Aktion handelt. Ein durchgestrichener
   *   Preis, zu dem nie verkauft wurde, ist Werbung mit einer Ersparnis, die
   *   es nicht gibt. Genau deshalb ist beim Moventa im Shop am 31.08.2026
   *   der Streichpreis entfernt worden, und deshalb steht beim
   *   Ganzjahresfutterplan die 99 € von alfima hier bewusst NICHT.
   */
  statt?: number;
  /**
   * Digitale Leistungen: immer 19 %. Der ermäßigte Satz von 7 % gilt für
   * Bücher, auch für E-Books, NICHT aber für Onlinekurse und den Zugang zu
   * einer Lernplattform. Bevor hier bei einem neuen Produkt eine 7 steht,
   * bitte einmal mit der Steuerberatung sprechen.
   */
  mwst: 19;
  /**
   * ▸ DER WICHTIGSTE UNTERSCHIED FÜR DEN WIDERRUF
   *   "kurs"  = digitaler Inhalt. Das Widerrufsrecht erlischt, sobald die
   *             Kundin den Zugang bekommt, wenn sie vorher ausdrücklich
   *             zugestimmt hat. Dafür ist das Pflichthäkchen in der Kasse da.
   *   "dienstleistung" = eine Leistung, die über Zeit erbracht wird, etwa die
   *             Jahresbegleitung. Dort erlischt das Widerrufsrecht erst nach
   *             VOLLSTÄNDIGER Erbringung, also nach einem Jahr. Vierzehn Tage
   *             Widerruf bleiben also bestehen, egal was angekreuzt wird, und
   *             die Kundin bekommt anteilig Geld zurück. Das lässt sich nicht
   *             wegankreuzen, deshalb steht dort ein anderer Häkchentext.
   *   "fernunterricht" = ein Lehrgang nach dem Fernunterrichtsschutzgesetz,
   *             also die Ausbildung. Dort gilt ein EIGENES Widerrufsrecht aus
   *             § 4 FernUSG, und § 8 FernUSG macht jede Abweichung zum
   *             Nachteil der Teilnehmerin unwirksam. Ein Häkchen "mein
   *             Widerrufsrecht erlischt" hätte dort also schlicht keine
   *             Wirkung, es würde nur so aussehen. Deshalb steht in der Kasse
   *             bei dieser Art gar kein Verzichtshäkchen, sondern ein
   *             ehrlicher Hinweis auf die vierzehn Tage.
   */
  art: "kurs" | "dienstleistung" | "fernunterricht";
  /**
   * Ab wann verkauft werden darf, als "2026-10-01". Fehlt der Wert, gilt das
   * Angebot sofort.
   *
   * ▸ WOZU DAS DA IST: Zulassungspflichtiger Fernunterricht darf erst
   *   vertrieben werden, wenn die Zulassung vorliegt. Die Kasse weist einen
   *   Kauf vor diesem Datum ab, statt sich darauf zu verlassen, dass niemand
   *   die Adresse kennt.
   */
  verkaufAb?: string;
  /**
   * Bis wann verkauft werden darf, als "2026-09-05". Der Tag zaehlt noch mit,
   * Schluss ist um 23:59 Uhr. Fehlt der Wert, laeuft das Angebot weiter.
   *
   * ▸ WARUM DAS NICHT NUR KOSMETIK IST
   *   Wer in einer Mail schreibt "der Preis gilt nur zwei Tage" und danach
   *   weiter zu diesem Preis verkauft, wirbt mit einer Verknappung, die es
   *   nicht gibt. Das ist irrefuehrend im Sinne des UWG, und abgesehen davon
   *   glaubt die naechste Frist dann niemand mehr. Deshalb weist die Kasse
   *   den Kauf nach diesem Datum tatsaechlich ab, genau wie vor `verkaufAb`.
   *
   *   Soll das Angebot bleiben, wird der Preis regulaer und dieses Datum
   *   verschwindet. Soll es weg, kommt `versteckt` dazu oder das Produkt
   *   fliegt raus.
   */
  verkaufBis?: string;
  /**
   * Wohin das Angebot auf der Uebersichtsseite gehoert.
   *
   * ▸ Das ist eine THEMATISCHE Einordnung, nicht dieselbe wie `art`. `art`
   *   sagt, welches Widerrufsrecht gilt; `gruppe` sagt, wo eine Besucherin
   *   danach sucht. Ein Kurs und ein E-Book haben dasselbe Widerrufsrecht,
   *   aber wer ein Nachschlagewerk sucht, sucht nicht in den Kursen.
   */
  gruppe: "einstieg" | "kurs" | "werkzeug" | "begleitung";
  /**
   * Ein Angebot, das es gibt, aber das nirgends aufgelistet wird.
   *
   * ▸ WAS "VERSTECKT" HEISST UND WAS NICHT
   *   Verkauft wird ganz normal über /kasse/<slug>, mit Rechnung,
   *   Widerrufsbelehrung und Freischaltung wie bei jedem anderen Angebot.
   *   Es fehlt nur in der Übersicht unter /shop, in der Auszeichnung für
   *   Google und in der Sitemap. Es ist damit nicht geheim: Wer die Adresse
   *   kennt oder weitergibt, kann kaufen. Das ist so gewollt.
   *
   * ▸ WOFÜR ES GEDACHT IST
   *   Zusatzmodule, die ohne das Hauptprodukt keinen Sinn ergeben. Das
   *   Pro-Modul "Metabolisches Gewicht" ist ein Teil von RatioPro; wer
   *   RatioPro nicht hat, kann damit nichts anfangen. Auf der Übersicht
   *   stünde es zwischen zwei vollständigen Angeboten und würde nur
   *   verwirren. Verlinkt wird es an genau einer Stelle: in RatioPro selbst,
   *   in der noch gesperrten Karte.
   */
  versteckt?: boolean;
  /** Die Zeile unter dem Namen, kurz. */
  kurz: string;
  /** Was in der Kasse als Leistungsbeschreibung über dem Knopf steht. */
  leistung: string;
  /** Der Produktname für die Meldung an die Akademie. Siehe Kopf der Datei. */
  akademieName: string;
  /** Nur zur Kontrolle: welchen Zugang die Akademie daraufhin vergibt. */
  erwarteterZugang: string;
  /** Der Verkaufstext der Seite. */
  beschreibung: DigitalBlock[];
  /**
   * Ein Bildschirmausschnitt des Werkzeugs, gezeigt auf den Angebotsseiten
   * nach dem Kauf. Wer dort in zehn Sekunden entscheiden soll, kauft eher,
   * wenn sie sieht, was sie bekommt, statt es nur zu lesen.
   *
   * Nur bei Werkzeugen sinnvoll. Ein Heft sieht auf einem Foto aus wie jedes
   * andere Heft, da fehlt lieber ein Bild als ein nichtssagendes.
   */
  bild?: { datei: string; alt: string; breite: number; hoehe: number };
};

// ---------------------------------------------------------------------------
// Die Produkte, aufsteigend nach Preis
// ---------------------------------------------------------------------------

export const digitalprodukte: DigitalProdukt[] = [
  {
    slug: "salzratgeber",
    gruppe: "einstieg",
    name: "Natürliche Salzversorgung für dein Pferd",
    kurzname: "Salzratgeber",
    // Preis am 02.09.2026 von 7,99 auf 12,99 angehoben. Grund: Das zweite
    // Heft, die Elektrolytmischung, ist seitdem tatsächlich dabei. Der
    // Verkaufstext hatte es vorher schon versprochen.
    preis: 1299,
    mwst: 19,
    art: "kurs",
    kurz: "Zwei Hefte: das Wissen und das Rezept zum Selbermischen.",
    leistung:
      "Digitaler Zugang zum Salzratgeber und zum Rezeptheft " +
      "„Natürliche Elektrolytmischung“ in der Pferdeliebehealthy Akademie, " +
      "dauerhaft abrufbar.",
    // Trifft die Regel /nat[üu]rliche salzversorgung/i.
    // Geprüft: keine der NIEMALS-Regeln greift, insbesondere nicht
    // /salz versorgt\. aber wie steht es/i oder /versorgt mit salz/i.
    akademieName: "Natürliche Salzversorgung für dein Pferd",
    erwarteterZugang: "salzratgeber",
    beschreibung: [
      {
        art: "absatz",
        text:
          "Natürliche Salzversorgung für dein Pferd: zwei Hefte, einmal das " +
          "Wissen und einmal das Rezept. Der Ratgeber auf 14 Seiten sagt dir, " +
          "wie viel Salz dein Pferd braucht, welches Salz dafür taugt und " +
          "woran du Mangel und Überschuss erkennst. Das Rezeptheft auf 7 " +
          "Seiten enthält die Elektrolytmischung zum Selbermischen, mit " +
          "Grammangaben, Dosierung nach Schweißverlust und Einkaufsliste. " +
          "Ohne Traubenzucker, ohne Aromen, ohne Füllstoffe.",
      },
    ],
  },
  {
    slug: "magen-reset",
    gruppe: "einstieg",
    name: "Magen Reset",
    kurzname: "Magen Reset",
    preis: 799,
    mwst: 19,
    art: "kurs",
    kurz: "Praxiswissen, Rezept und schnelle Hilfe bei Magenproblemen.",
    leistung:
      "Digitaler Zugang zum Magen Reset in der Pferdeliebehealthy Akademie, " +
      "dauerhaft abrufbar.",
    // Trifft /magen reset/i. Nicht zu verwechseln mit /^der magenguide/i
    // aus der NIEMALS-Liste, das ist ein anderes, kostenloses Produkt.
    akademieName: "Magen Reset",
    erwarteterZugang: "magen-reset",
    beschreibung: [
      {
        art: "absatz",
        text: "Praxiswissen, Rezept und schnelle Hilfe bei Magenproblemen. Mit Symptom-Checkliste zum Abhaken.",
      },
    ],
  },
  {
    slug: "mineral-klarheit",
    gruppe: "kurs",
    name: "Mineral-Klarheit",
    kurzname: "Mineral-Klarheit",
    // 27 € statt regulär 49 €, von Yasemin am 01.09.2026 festgelegt.
    // Der Streichpreis ist eine laufende Aktion auf den regulären Preis und
    // damit zulässig. Endet die Aktion, gehört `statt` weg und `preis` auf
    // 4900, nicht umgekehrt.
    preis: 2700,
    statt: 4900,
    mwst: 19,
    art: "kurs",
    kurz: "Mineralfutter selbst durchrechnen statt raten.",
    leistung:
      "Digitaler Zugang zu Mineral-Klarheit in der Pferdeliebehealthy " +
      "Akademie, mit eingebautem Rechner, dauerhaft abrufbar.",
    // Trifft /mineral-klarheit|mineral mastery/i.
    akademieName: "Mineral-Klarheit",
    erwarteterZugang: "mineral-klarheit",
    bild: {
      datei: "/images/mineral-klarheit/rechner.webp",
      alt: "Der Mineralfutter-Eignungscheck im Kurs, mit Eingabefeldern für Gewicht und Lebensphase",
      breite: 1100,
      hoehe: 820,
    },
    beschreibung: [
      {
        art: "absatz",
        text: "Mineralfutter selbst durchrechnen statt raten. Bedarf verstehen, Etiketten wirklich lesen, und mit dem eingebauten Rechner jedes Produkt direkt auf dein Pferd prüfen.",
      },
    ],
  },
  {
    slug: "ganzjahresfutterplan",
    // ▸ PREIS AM 02.09.2026 VON 29 AUF 59 EURO.
    //   Grund war ein Marktvergleich: Sarah Ullrich nimmt fuer denselben
    //   Zuschnitt (Jahresplan, Monatsmodule) 111 Euro, hier standen 29. Zwoelf
    //   Monatsplaene plus fuenf Sonderhefte sind mehr als ein Viertel davon
    //   wert.
    //
    //   KEIN Streichpreis dazu. Der niedrigste Preis der letzten dreissig Tage
    //   waren die 29 Euro, ein durchgestrichenes „99" waere nach § 11 PAngV
    //   unzulaessig, auch wenn auf alfima einmal 99 stand.
    gruppe: "kurs",
    name: "Ganzjahresfutterplan für Pferde, natürlich durchs Jahr",
    kurzname: "Ganzjahresfutterplan",
    preis: 5900,
    mwst: 19,
    art: "kurs",
    kurz:
      "Zwölf Monatspläne, die dich vom Fellwechsel bis zur Winterruhe " +
      "begleiten.",
    leistung:
      "Digitaler Zugang zum Ganzjahresfutterplan in der Pferdeliebehealthy " +
      "Akademie, zwölf Monatspläne, dauerhaft abrufbar.",
    // Trifft /ganzjahresfutterplan/i.
    akademieName: "Ganzjahresfutterplan für Pferde, natürlich durchs Jahr",
    erwarteterZugang: "ganzjahresfutterplan",
    beschreibung: [
      {
        art: "absatz",
        text: "Der digitale Ganzjahres-Futterplan begleitet dich Monat für Monat durch das Pferdejahr, mit natürlichen Futterempfehlungen, abgestimmt auf Fellwechsel, Weidezeit, Witterung und die jeweilige Jahreszeit.",
      },
      { art: "ueberschrift", text: "Was du bekommst:" },
      {
        art: "liste",
        punkte: [
          "12 Monatspläne mit Futterplan, Mineralien, Kräutern und saisonalen Schwerpunkten",
          "Onboarding-Bereich mit den wichtigsten Grundlagen zur natürlichen Pferdefütterung",
          "Schritt-für-Schritt-Anleitung zur Erstellung deines eigenen Futterplans",
          "Spezielle Themen wie Impfung, Wurmkur, Wetterwechsel und Senior Pferd",
          "Rabattcodes bei über 13 ausgewählten Partnern",
        ],
      },
      {
        art: "absatz",
        text: "Die Pläne werden zwei Monate im Voraus bereitgestellt, sodass du genug Zeit hast, alles vorzubereiten.",
      },
      {
        art: "absatz",
        text: "Nach dem Kauf bekommst du eine E-Mail mit deinem persönlichen Zugang zur Akademie.",
      },
      {
        art: "absatz",
        betont: true,
        text: "Natürlich füttern. Gesund begleiten.",
      },
    ],
  },
  {
    slug: "basisfutterkurs",
    gruppe: "kurs",
    name: "Basisfutterkurs",
    kurzname: "Basisfutterkurs",
    // ▸ PREIS AM 02.09.2026 VON 39 AUF 69 EURO.
    //   Zwanzig Lektionen standen fuer 39 Euro neben dem Darmaufbau, der 22
    //   Euro fuer zwanzig PDF-Seiten kostet. Ein Kurs ist mehr wert als ein
    //   Heft, und der naechste Wettbewerber nimmt 159,90 Euro fuer vier
    //   Stunden Video.
    //
    //   Im Anschlussangebot zum Ganzjahresfutterplan kostet er 49 statt 29
    //   Euro, die Angebotsseite zeigt dort also 20 Euro Ersparnis, siehe
    //   `ersparnis()` weiter unten. Damit der Vergleich zulaessig bleibt, muss
    //   er hier auch wirklich einzeln fuer 69 Euro angeboten werden.
    //
    //   KEIN Streichpreis: Der niedrigste Preis der letzten dreissig Tage
    //   waren 39 Euro, ein hoeherer Vergleichspreis waere erfunden.
    preis: 6900,
    mwst: 19,
    art: "kurs",
    kurz:
      "Die Grundlagen der ganzheitlichen Pferdefütterung in zwanzig Lektionen.",
    leistung:
      "Digitaler Zugang zum Basisfutterkurs in der Pferdeliebehealthy " +
      "Akademie, zwanzig Lektionen, dauerhaft abrufbar.",
    // Trifft /basisfutterkurs/i.
    akademieName: "Basisfutterkurs",
    erwarteterZugang: "basisfutterkurs",
    bild: {
      datei: "/images/basisfutterkurs/lektionen.webp",
      alt: "Der Basisfutterkurs mit der Lektionsliste links und dem Kurstext rechts",
      breite: 1100,
      hoehe: 820,
    },
    beschreibung: [
      {
        art: "absatz",
        text: "Die Grundlagen der ganzheitlichen Pferdefütterung: Futterdeklarationen lesen, Mineralien verstehen, Darm sanieren, Leber und Niere unterstützen, dazu Ekzem, Futterumstellung und Entwurmung.",
      },
      {
        art: "absatz",
        text: "Zwanzig Lektionen, dauerhafter Zugang, in deinem Tempo.",
      },
    ],
  },
  {
    slug: "darmaufbau",
    // ▸ STAND 02.09.2026 BEI DEN E-BOOKS, NICHT MEHR BEI DEN KURSEN.
    //   Es ist eines, sagt sein eigener Kurztext, und in der Kursreihe stand
    //   es als viertes allein in einer neuen Zeile.
    gruppe: "einstieg",
    name: "Darmaufbau beim Pferd",
    kurzname: "Darmaufbau",
    // Von 39 auf 22 Euro heruntergesetzt am 02.09.2026. Der Streichpreis ist
    // echt: 39 Euro war bis dahin der verlangte Preis.
    preis: 2200,
    statt: 3900,
    mwst: 19,
    art: "kurs",
    kurz: "Das E-Book für eine gesunde Verdauung.",
    leistung:
      "Digitaler Zugang zum E-Book Darmaufbau in der Pferdeliebehealthy " +
      "Akademie, dauerhaft abrufbar.",
    // Trifft /darmaufbau beim pferd/i. Der Name muss vollständig sein:
    // "Darmaufbau" allein trifft die Regel nicht, und /darm-?\s*&/i sowie
    // /14-tage-darm-reset/i in der NIEMALS-Liste sind andere Produkte.
    akademieName: "Darmaufbau beim Pferd",
    erwarteterZugang: "darmaufbau",
    beschreibung: [
      {
        art: "absatz",
        text: "Das E-Book für eine gesunde Verdauung. Wie ein widerstandsfähiger Darm aufgebaut wird und welche Bausteine dein Pferd dafür wirklich braucht.",
      },
    ],
  },
  {
    slug: "symptom-navigator",
    gruppe: "werkzeug",
    name: "Symptom-Navigator",
    kurzname: "Symptom-Navigator",
    preis: 3900,
    mwst: 19,
    art: "kurs",
    kurz: "Das Nachschlagewerk für den Alltag.",
    leistung:
      "Digitaler Zugang zum Symptom-Navigator in der Pferdeliebehealthy " +
      "Akademie, dauerhaft abrufbar.",
    // Trifft /symptom[- ]navigator/i.
    akademieName: "Symptom-Navigator",
    erwarteterZugang: "symptom-navigator",
    beschreibung: [
      {
        art: "absatz",
        text: "Erkenne Symptome bei deinem Pferd und ordne sie richtig ein. Das Nachschlagewerk für den Alltag, mit klaren Hinweisen, wann du selbst handeln kannst und wann ein Tierarzt gebraucht wird.",
      },
    ],
    bild: {
      datei: "/images/symptom-navigator-ansicht.webp",
      alt: "Der Symptom-Navigator mit elf Körperbereichen und 58 Symptomen",
      breite: 1000,
      hoehe: 379,
    },
  },
  {
    // ▸ DAS BUENDEL FUER DIE AUSBILDUNGSTEILNEHMERINNEN OHNE RATIOPRO.
    //   56 von ihnen haben den Rechner nicht, fuer die waere das Modul allein
    //   wertlos. Deshalb beide zusammen, und zwar befristet: Der Preis gilt
    //   bis zum in `verkaufBis` genannten Tag, danach weist die Kasse den Kauf
    //   ab. Wenn du die Mail spaeter verschickst, MUSS dieses Datum mit.
    slug: "ratiopro-buendel",
    gruppe: "werkzeug",
    versteckt: true,
    verkaufBis: "2026-09-05",
    name: "RatioPro und das Pro-Modul Metabolisches Gewicht",
    kurzname: "RatioPro plus Pro-Modul",
    // 69 + 29 = 98 Euro einzeln. Beide werden tatsaechlich zu diesen Preisen
    // verkauft, der Streichpreis ist also belegt und keine erfundene
    // Ersparnis.
    preis: 7900,
    statt: 9800,
    mwst: 19,
    art: "kurs",
    kurz: "Der Rechner und das Pro-Modul zusammen.",
    leistung:
      "Digitaler Zugang zu RatioPro in der Pferdeliebehealthy Akademie, " +
      "unbegrenzte Berechnungen, dauerhaft abrufbar, zusammen mit dem " +
      "Pro-Modul „Metabolisches Gewicht“ im Rechner.",
    // Trifft die Buendelregel in lib/produkt-zugang.ts der Akademie, die als
    // einzige ZWEI Zugaenge vergibt: 'ratiopro' und 'ratiopro-metabolisch'.
    // Der Name darf deshalb nicht geaendert werden, ohne dort nachzusehen.
    akademieName: "RatioPro und Pro-Modul Metabolisches Gewicht",
    erwarteterZugang: "ratiopro + ratiopro-metabolisch",
    beschreibung: [
      {
        art: "absatz",
        text: "RatioPro rechnet dir die ganze Ration deines Pferdes durch: Bedarf, Versorgung, Lücken und Überschüsse, aus einer Futtermitteldatenbank mit über 470 Einträgen. Das Pro-Modul legt zusätzlich offen, wie der Bedarf überhaupt zustande kommt, und rechnet den metabolischen und den linearen Weg nebeneinander.",
      },
      {
        art: "liste",
        punkte: [
          "RatioPro mit unbegrenzten Berechnungen, dauerhaft abrufbar",
          "Das Pro-Modul „Metabolisches Gewicht“ direkt im Rechner",
          "Erhaltungsbedarf nach GfE 2014, getrennt nach Pony, Warmblut und Vollblut",
          "Anleitung in sechs Schritten zum Nachrechnen von Hand, dazu die Erklärung als PDF",
        ],
      },
      {
        art: "absatz",
        text: "Einzeln kosten die beiden zusammen 98 €. Dieser Preis gilt nur bis zum 5. September 2026, danach nimmt die Kasse ihn nicht mehr an.",
        betont: true,
      },
    ],
  },
  {
    // ▸ DAS ANGEBOT FUER DIE, DIE RATIOPRO SCHON HABEN, STAND 03.09.2026.
    //   Es steht hier direkt vor RatioPro und nicht nach dem Preis
    //   einsortiert, weil die beiden zusammengehören: Das Modul ist ein Teil
    //   des Rechners und wird auch nur dort verlinkt.
    slug: "metabolisches-gewicht",
    gruppe: "werkzeug",
    versteckt: true,
    name: "Metabolisches Gewicht, das Pro-Modul in RatioPro",
    kurzname: "Pro-Modul Metabolisches Gewicht",
    preis: 2900,
    mwst: 19,
    art: "kurs",
    kurz: "Der Rechenweg hinter den Bedarfswerten.",
    leistung:
      "Freischaltung des Pro-Moduls „Metabolisches Gewicht“ in RatioPro: " +
      "Vergleich der metabolischen mit der linearen Skalierung über 14 " +
      "Nährstoffe, Anleitung zum Nachrechnen von Hand und die ausführliche " +
      "Erklärung als PDF. Dauerhaft abrufbar, RatioPro-Zugang vorausgesetzt.",
    // ▸ DER NAME IST MIT ABSICHT OHNE "RatioPro" GEBAUT.
    //   In der Akademie entscheidet lib/produkt-zugang.ts über den
    //   Produktnamen, und dort gibt es die Regel /ratio\s?pro/ für den
    //   vollen Rechner (69 €). Stünde "RatioPro" hier im Namen, hinge alles
    //   daran, dass die Regel für das Modul weiter oben steht. Sie steht
    //   dort auch, aber zwei Sicherungen sind besser als eine: Wer diesen
    //   Namen ändert, darf das Wort RatioPro nicht hineinnehmen.
    //   Trifft /metabolisches gewicht/i.
    akademieName: "Metabolisches Gewicht (Pro-Modul)",
    erwarteterZugang: "ratiopro-metabolisch",
    beschreibung: [
      {
        art: "absatz",
        text: "RatioPro rechnet den Bedarf metabolisch, also über kg hoch 0,75 und nicht einfach über das Körpergewicht. Das Pro-Modul legt beide Rechenwege nebeneinander und zeigt dir, wo sie auseinanderlaufen. In der Beratung ist das der Unterschied zwischen einer Zahl, die du nennst, und einer Zahl, die du erklären kannst.",
      },
      {
        art: "liste",
        punkte: [
          "Metabolisches Gewicht und Skalierungs-Faktor für das Pferd, das gerade im Rechner steht",
          "Vergleichstabelle über 14 Nährstoffe: linear, metabolisch, Abweichung in Prozent",
          "Anleitung in sechs Schritten, mit der du jeden Bedarfswert von Hand nachrechnest",
          "Die ausführliche Erklärung als PDF, mit Beispielen und einem Beratungs-Skript für deine Kundinnen",
        ],
      },
      {
        art: "absatz",
        text: "Du brauchst dafür einen RatioPro-Zugang, das Modul sitzt im Rechner. Nach dem Kauf ist es beim nächsten Öffnen da, ohne Code und ohne zweite Anmeldung.",
        betont: true,
      },
    ],
  },
  {
    slug: "ratiopro",
    gruppe: "werkzeug",
    name: "RatioPro",
    kurzname: "RatioPro",
    // Aktionspreis seit dem 02.09.2026, regulaer 99 Euro.
    preis: 6900,
    statt: 9900,
    mwst: 19,
    art: "kurs",
    kurz: "Der Rechner, der versteht, was dein Pferd wirklich braucht.",
    leistung:
      "Digitaler Zugang zu RatioPro in der Pferdeliebehealthy Akademie, " +
      "unbegrenzte Berechnungen, dauerhaft abrufbar.",
    // Trifft /ratio\s?pro|ration\s?pro|rationsberechnung/i.
    akademieName: "RatioPro",
    erwarteterZugang: "ratiopro",
    beschreibung: [
      {
        art: "absatz",
        text: "Rationen berechnen, Nährstoffe ausgleichen und die Fütterung deines Pferdes optimieren. Der Rechner, der versteht, was dein Pferd wirklich braucht.",
      },
    ],
    bild: {
      datei: "/images/ratiopro-ansicht.webp",
      alt: "Die Bedarfsberechnung in RatioPro mit Gewicht, Alter, Pferdetyp und Nutzung",
      breite: 900,
      hoehe: 972,
    },
  },
  {
    slug: "ausbildung",
    gruppe: "begleitung",
    name: "Ausbildung Ganzheitliche Pferdefütterung",
    kurzname: "Ausbildung",
    // 899 € einmalig, so im ZFU-Antrag vom 20.08.2026 verbindlich angegeben.
    // Der Streichpreis ist belegt, es wurde nachweislich zu 1.050 und 1.100 €
    // verkauft.
    preis: 89900,
    statt: 110000,
    mwst: 19,
    // ▸ FERNUNTERRICHT, und das ändert mehr, als man denkt. Siehe oben beim
    //   Typ. Kein Verzichtshäkchen, dafür ein ehrlicher Hinweis.
    art: "fernunterricht",
    // ▸ VERTRIEBSBEGINN AUS DEM ZFU-ANTRAG. Vorher weist die Kasse jeden
    //   Kauf ab. Warum das wichtig ist, steht ausführlich in
    //   app/api/digitalkasse/route.ts.
    verkaufAb: "2026-10-01",
    kurz:
      "Zwölf Monate, acht Module, 104 Lektionen, mit Abschlussprüfung und " +
      "Zertifikat.",
    leistung:
      "Fernlehrgang Ganzheitliche Pferdefütterung über zwölf Monate, acht " +
      "Module mit 104 Lektionen, Lernerfolgskontrollen, persönliche " +
      "Betreuung, Abschlussprüfung und Zertifikat. Umfang rund 155 " +
      "Zeitstunden, etwa drei Wochenstunden.",
    // Trifft in der Akademie die Regel
    // /ausbildung (nat[üu]rliche|ganzheitliche) pferdef[üu]tterung/i.
    // Geprüft gegen die Ausschlussliste: weder /warteliste/i noch
    // /schnupperkurs/i noch /^info ausbildung/i greifen.
    akademieName: "Ausbildung Ganzheitliche Pferdefütterung",
    erwarteterZugang: "ausbildung",
    beschreibung: [
      {
        art: "absatz",
        text: "Die mehrstufige Ausbildung zur ganzheitlichen Pferdefütterung. Acht Module, die dich Schritt für Schritt vom Anatomie-Verständnis bis zur eigenständigen Rationsgestaltung führen.",
      },
      {
        art: "absatz",
        text: "Zwölf Monate Lehrgangsdauer bei etwa drei Wochenstunden, das sind rund 155 Zeitstunden. Du kannst jederzeit beginnen und in deinem Tempo arbeiten.",
      },
      {
        art: "absatz",
        text: "Am Ende steht eine Abschlussprüfung aus Fallbeispielen, einem Fragekatalog aus drei Modulen, einem Futterplan und einer Anamnese-Aufgabe. Zehn Tage Bearbeitungszeit, zu Hause, Rückfragen ausdrücklich erwünscht.",
      },
    ],
  },
  // -------------------------------------------------------------------------
  // DIE BERATUNGSTREPPE, angelegt am 03.09.2026 auf Wunsch von Yasemin.
  //
  //    69 EUR  Nachberatung          (fuer Kundinnen, deren Plan aelter ist)
  //    79 EUR  Befund-Einschaetzung  (Heuanalyse, Blutbild, Kotbefund)
  //   149 EUR  Futterplan            (einmalig, mit vier Wochen Begleitung)
  //   249 EUR  Begleitung 3 Monate
  //   599 EUR  Pferdeliebe 365       (Akte plus vier Termine uebers Jahr)
  //
  // Zum Vergleich am Markt, Stand 03.09.2026: Schuder nimmt 150 EUR fuer eine
  // Erstberatung und 80 EUR fuer die Nachkontrolle, Futterberatung mit Herz
  // 120 EUR fuer den Rationscheck, 160 EUR bei Erkrankung und 70 EUR fuer die
  // Nachkontrolle, Pferdewaage Nord 179 EUR online. Wer dort einmal beraten
  // wird und einmal nachkontrollieren laesst, zahlt rund 230 EUR fuer zwei
  // Momentaufnahmen.
  //
  // ACHTUNG: DIE BESCHREIBUNGSTEXTE UNTEN SIND EIN ENTWURF VON CLAUDE, NICHT
  // VON YASEMIN. Sie sind an ihren vorhandenen Texten ausgerichtet, aber sie
  // gehoeren gegengelesen und duerfen frei ueberschrieben werden. Beim
  // Jahresplan darunter stammt der Text woertlich von ihr, der bleibt.
  // -------------------------------------------------------------------------
  {
    slug: "nachberatung",
    gruppe: "begleitung",
    name: "Nachberatung mit Anpassplan",
    kurzname: "Nachberatung",
    // 69 EUR ist kein neuer Preis: Genau so viel hat die Nachberatung zuletzt
    // bei alfima gekostet (Stand Juli 2026), davor 49 EUR bei Tentary.
    preis: 6900,
    mwst: 19,
    art: "dienstleistung",
    kurz: "Wenn sich etwas geändert hat und der Plan mitwachsen soll.",
    leistung:
      "Überprüfung deiner aktuellen Fütterung und ein angepasster Futterplan, " +
      "dazu vier Wochen persönliche Begleitung. Für Pferde, die ich schon " +
      "einmal beraten habe. Gilt pro Pferd.",
    akademieName: "Nachberatung mit Anpassplan",
    erwarteterZugang: "futterberatung",
    beschreibung: [
      {
        art: "absatz",
        text: "Nach jeder Beratung stehe ich dir vier Wochen lang für Rückfragen zur Verfügung. Diese Zeit reicht, damit der Plan bei euch ankommt. Sie reicht nicht für das, was danach kommt: neue Blutwerte, ein anderes Heu, der Fellwechsel, eine Diagnose vom Tierarzt.",
      },
      {
        art: "absatz",
        text: "Dafür ist die Nachberatung da. Du schickst mir, was sich geändert hat, ich sehe mir die Ration daraufhin noch einmal an und passe den Plan an. Danach begleite ich dich wieder vier Wochen bei der Umsetzung.",
      },
      { art: "ueberschrift", text: "Wann sich eine Nachberatung lohnt" },
      {
        art: "liste",
        punkte: [
          "Es liegen neue Blutwerte, ein Kotbefund oder eine Heuanalyse vor",
          "Das Heu hat gewechselt und die Ration passt nicht mehr",
          "Dein Pferd hat eine neue Diagnose bekommen",
          "Die Jahreszeit hat gewechselt und die Weide kommt dazu oder fällt weg",
          "Du hast Produkte getauscht und willst wissen, ob es noch aufgeht",
        ],
      },
      { art: "ueberschrift", text: "Wichtige Hinweise" },
      {
        art: "absatz",
        text: "Die Nachberatung setzt voraus, dass ich dein Pferd schon einmal beraten habe. Wenn wir noch nie zusammengearbeitet haben, ist der Futterplan der richtige Einstieg, denn dort entsteht die Grundlage erst. Die Auswertung dauert in der Regel bis zu 14 Werktage nach vollständigem Eingang aller Unterlagen. Die Nachberatung gilt pro Pferd.",
      },
    ],
  },
  {
    slug: "befund-einschaetzung",
    gruppe: "begleitung",
    name: "Einschätzung deiner Befunde: Heuanalyse, Blutbild und Kotbefund",
    kurzname: "Befund-Einschätzung",
    preis: 7900,
    mwst: 19,
    art: "dienstleistung",
    kurz: "Du hast Werte auf dem Tisch, aber niemand erklärt dir, was sie bedeuten.",
    leistung:
      "Schriftliche fachliche Einordnung von Heuanalyse, Blutbild und " +
      "Kotbefund, einzeln oder zusammen, mit dem, was daraus für die " +
      "Fütterung folgt. Ohne Futterplan und ohne Rationsberechnung. " +
      "Gilt pro Pferd.",
    akademieName: "Einschätzung deiner Befunde: Heuanalyse, Blutbild und Kotbefund",
    erwarteterZugang: "futterberatung",
    beschreibung: [
      {
        art: "absatz",
        text: "Eine Heuanalyse kommt mit zwanzig Zahlen zurück. Ein Blutbild mit noch mehr, und die Spalte daneben sagt nur, ob ein Wert innerhalb der Referenz liegt. Was das für die Fütterung deines Pferdes bedeutet, steht auf keinem dieser Blätter.",
      },
      {
        art: "absatz",
        text: "Hier bekommst du genau das: eine schriftliche Einordnung deiner Befunde. Was steht da, was fällt auf, was davon ist für die Ration wichtig und was nicht, und woran solltest du als Nächstes denken.",
      },
      { art: "ueberschrift", text: "Was du einschicken kannst" },
      {
        art: "liste",
        punkte: [
          "Heuanalyse, auch mehrere Schnitte oder mehrere Jahre",
          "Blutbild, gern auch mit Vorbefunden zum Vergleich",
          "Kotbefund und Untersuchungen zur Darmflora",
          "Alles zusammen, wenn du das Gesamtbild willst",
        ],
      },
      { art: "ueberschrift", text: "Was hier nicht enthalten ist" },
      {
        art: "absatz",
        text: "Das ist bewusst keine Futterberatung. Du bekommst die Einordnung deiner Werte, aber keinen Futterplan und keine vollständige Rationsberechnung. Wenn du beides willst, ist der Futterplan der richtige Weg, dort sehe ich mir die Befunde ohnehin mit an. Wenn ich dein Pferd schon einmal beraten habe und nur die neuen Werte einzuordnen sind, ist die Nachberatung der günstigere Weg.",
      },
      { art: "ueberschrift", text: "Wichtige Hinweise" },
      {
        art: "absatz",
        text: "Ich stelle keine Diagnosen und ersetze keinen Tierarzt. Ich ordne Werte fachlich ein und sage dir, was daraus für die Fütterung folgt. Die Auswertung dauert in der Regel bis zu 14 Werktage nach vollständigem Eingang aller Unterlagen. Die Einschätzung gilt pro Pferd.",
      },
    ],
  },
  {
    slug: "futterplan",
    gruppe: "begleitung",
    name: "Dein individueller Futterplan",
    kurzname: "Futterplan",
    preis: 14900,
    mwst: 19,
    art: "dienstleistung",
    kurz: "Eine vollständige Rationsberechnung und ein Plan, der zu deinem Pferd passt.",
    leistung:
      "Analyse deiner aktuellen Fütterung, vollständige Rationsberechnung " +
      "und dein individueller Futterplan, dazu vier Wochen persönliche " +
      "Begleitung bei der Umsetzung. Gilt pro Pferd.",
    akademieName: "Dein individueller Futterplan",
    erwarteterZugang: "futterberatung",
    beschreibung: [
      {
        art: "absatz",
        text: "Zehn Ratschläge aus dem Stall, drei Zusatzfutter im Schrank, und du weißt immer noch nicht, ob es reicht. Der Futterplan ist der Weg da heraus: eine vollständige Berechnung dessen, was dein Pferd tatsächlich bekommt, und ein Plan, der zu ihm passt.",
      },
      {
        art: "absatz",
        text: "Ich rechne deine Ration durch, sehe mir an, wo sie zu viel und wo sie zu wenig liefert, und stelle sie neu zusammen. Was du schon im Schrank stehen hast, bleibt drin, wenn es passt. Was nicht passt, fliegt raus, und ich sage dir auch, warum.",
      },
      { art: "ueberschrift", text: "Das bekommst du" },
      {
        art: "liste",
        punkte: [
          "Eine Analyse deiner aktuellen Fütterung, mit Zahlen statt Bauchgefühl",
          "Die vollständige Rationsberechnung für dein Pferd",
          "Deinen individuellen Futterplan mit Mengen und Zeiten",
          "Eine Einordnung deiner Befunde, wenn du welche hast",
          "Vier Wochen persönliche Begleitung bei der Umsetzung",
        ],
      },
      { art: "ueberschrift", text: "Für wen der Futterplan gedacht ist" },
      {
        art: "absatz",
        text: "Für dich, wenn du einmal Klarheit willst, ob die Fütterung deines Pferdes aufgeht, und danach selbst weiterarbeiten möchtest. Wenn du dir schon jetzt sicher bist, dass du länger begleitet werden willst, sieh dir die drei Monate oder Pferdeliebe 365 an, dort ist der Plan enthalten und die Begleitung geht weiter.",
      },
      { art: "ueberschrift", text: "Wichtige Hinweise" },
      {
        art: "absatz",
        text: "Nach deiner Buchung bekommst du einen ausführlichen Fragebogen zu Haltung, Fütterung und Gesundheitszustand, dazu bitte ich dich um ein paar Fotos. Die Auswertung dauert in der Regel bis zu 14 Werktage nach vollständigem Eingang aller Unterlagen. Danach begleite ich dich vier Wochen bei der Umsetzung. Der Futterplan gilt pro Pferd.",
      },
    ],
  },
  {
    slug: "begleitung-3-monate",
    gruppe: "begleitung",
    name: "Drei Monate Begleitung",
    kurzname: "Begleitung 3 Monate",
    preis: 24900,
    mwst: 19,
    art: "dienstleistung",
    kurz: "Ein Plan, und drei Monate lang jemand, der mit draufschaut.",
    leistung:
      "Dein individueller Futterplan mit vollständiger Rationsberechnung " +
      "und drei Monate persönliche Begleitung mit Anpassungen, wenn sich " +
      "etwas ändert. Gilt pro Pferd.",
    akademieName: "Drei Monate Begleitung",
    erwarteterZugang: "futterberatung",
    beschreibung: [
      {
        art: "absatz",
        text: "Ein Futterplan ist der Anfang, nicht das Ende. Die Fragen kommen erst, wenn er im Stall ankommt: Frisst er das überhaupt? Wie schleiche ich das alte Futter aus? Der Kot ist anders, ist das normal? Und nach vier Wochen sieht man noch längst nicht alles.",
      },
      {
        art: "absatz",
        text: "Deshalb gibt es diesen Weg: Du bekommst denselben Futterplan wie bei der Einmalberatung, und danach bleibe ich drei Monate an eurer Seite. Wenn sich etwas ändert, ändern wir den Plan mit, ohne dass du etwas nachbuchen musst.",
      },
      { art: "ueberschrift", text: "Das bekommst du" },
      {
        art: "liste",
        punkte: [
          "Analyse der aktuellen Fütterung und vollständige Rationsberechnung",
          "Deinen individuellen Futterplan",
          "Drei Monate persönliche Begleitung statt vier Wochen",
          "Anpassungen des Plans, wenn sich etwas ändert, ohne Aufpreis",
          "Einordnung neuer Befunde, die in diesen drei Monaten dazukommen",
        ],
      },
      { art: "ueberschrift", text: "Für wen die drei Monate gedacht sind" },
      {
        art: "absatz",
        text: "Für dich, wenn eine Umstellung ansteht und du sie nicht allein durchziehen willst. Für Pferde, bei denen gerade etwas im Gange ist, ein Darmthema, ein Fellwechsel, eine Rekonvaleszenz, und bei denen sich in den ersten Wochen noch einiges bewegt. Wenn du übers ganze Jahr begleitet werden möchtest und eine Akte willst, die mitwächst, ist Pferdeliebe 365 der richtige Weg.",
      },
      { art: "ueberschrift", text: "Wichtige Hinweise" },
      {
        art: "absatz",
        text: "Die drei Monate laufen ab dem Tag, an dem dein Futterplan fertig ist, nicht ab dem Kauf. Die Auswertung dauert in der Regel bis zu 14 Werktage nach vollständigem Eingang aller Unterlagen. Damit jede Begleitung die Aufmerksamkeit bekommt, die sie braucht, nehme ich bewusst nur wenige Pferde gleichzeitig an. Die Begleitung gilt pro Pferd.",
      },
    ],
  },
  {
    slug: "pferdeliebe-365",
    gruppe: "begleitung",
    name: "Pferdeliebe 365 – deine 1:1 Futterberatung als Gesundheitsakte",
    kurzname: "Pferdeliebe 365",
    // 599 € seit dem 03.09.2026, und der Preis hängt unmittelbar am Umfang:
    // Bis dahin waren es 399 € fuer die Akte plus vier Wochen Begleitung. Damit
    // bot das teuerste Angebot der Treppe die *kürzeste* Betreuung, die drei
    // Monate für 249 € hatten mehr. Diesen Widerspruch hat Yasemin aufgelöst,
    // indem der Jahresplan jetzt vier feste Termine über zwölf Monate
    // enthält. Kein `statt`: Ein Streichpreis gegen den eigenen früheren,
    // schwächeren Umfang wäre eine Ersparnis, die es nie gab.
    preis: 59900,
    mwst: 19,
    // ▸ ACHTUNG, DAS EINZIGE PRODUKT MIT art: "dienstleistung".
    //   Was das für den Widerruf bedeutet, steht oben beim Typ. Kurz: Das
    //   Widerrufsrecht erlischt erst, wenn die Leistung VOLLSTÄNDIG erbracht
    //   ist. Seit dem 03.09.2026 heißt das: nach dem letzten der vier Termine,
    //   also frühestens nach zwölf Monaten. Das ist keine Kleinigkeit, denn
    //   die Kundin kann bis dahin widerrufen und bekommt anteilig Geld
    //   zurück. Bis
    //   dahin kann die Kundin widerrufen. Sie muss dann aber Wertersatz für
    //   das leisten, was bis dahin gemacht wurde -- und zwar NUR, wenn sie
    //   beim Kauf ausdrücklich zugestimmt hat, dass vor Ablauf der Frist
    //   begonnen wird. Genau dafür ist der eigene Häkchentext in der Kasse
    //   da. Ohne ihn arbeitest du bis zu vierzehn Werktage an einer Akte und
    //   bekommst bei einem Widerruf gar nichts.
    art: "dienstleistung",
    kurz:
      "Eine echte Gesundheitsakte für dein Pferd, die übers Jahr mitwächst.",
    leistung:
      "Persönliche 1:1 Futterberatung als Gesundheitsakte auf rund 18 " +
      "Seiten, mit Gesundheitsindex, individuellem Futterplan, " +
      "Rationsberechnung, Umsetzungs-, Saison- und Notfallplan, dazu vier feste Termine im Jahr: bei der Erstellung, nach vier Wochen zur ersten Kontrolle, zum Weidebeginn und zum Fellwechsel. " +
      "Gilt pro Pferd.",
    // ▸ FÜR DIESEN NAMEN GAB ES IN DER AKADEMIE NOCH KEINE REGEL.
    //   Sie ist am 01.09.2026 in lib/produkt-zugang.ts ergänzt worden.
    //   Ohne sie würde nichts freigeschaltet.
    akademieName: "Pferdeliebe 365 – deine 1:1 Futterberatung als Gesundheitsakte",
    erwarteterZugang: "futterberatung",
    // Der Text stammt wörtlich von Yasemin, 01.09.2026. Nicht kürzen und
    // nicht glätten, so wie bei den Shop-Texten auch.
    beschreibung: [
      {
        art: "absatz",
        text: "Du möchtest die Fütterung deines Pferdes nicht nur einmal überprüfen lassen, sondern dein Pferd übers ganze Jahr begleiten und gesund durch jede Jahreszeit bringen? Dann ist Pferdeliebe 365 genau das Richtige für dich.",
      },
      {
        art: "absatz",
        text: "Anders als bei einer klassischen Einmalberatung, die nach dem ersten Plan endet, bekommst du hier eine echte Gesundheitsakte für dein Pferd. Auf rund 18 Seiten entsteht ein vollständiges Bild deines Pferdes, das mit euch mitwächst und aus einer Beratung eine Begleitung durchs ganze Jahr macht.",
      },
      { art: "ueberschrift", text: "Das erwartet dich" },
      {
        art: "absatz",
        text: "Am Anfang steht ein Gesundheitsindex über zwölf Bereiche wie Verdauung, Mineralversorgung, Fell und Haut, Hufqualität, Muskulatur und Stoffwechsel, damit du auf einen Blick siehst, wo dein Pferd gerade steht. Darauf folgt eine ausführliche Analyse deiner aktuellen Fütterung und dein individueller, naturnaher Futterplan mit Rationsberechnung für eine sichere und ausgewogene Versorgung.",
      },
      {
        art: "absatz",
        text: "Damit du nicht allein mit dem Plan dastehst, bekommst du einen Umsetzungsplan Schritt für Schritt, einen 30 Tage Check zum Nachhalten der ersten Wochen und einen Saisonplan, der dich durch das ganze Jahr führt. Ein Notfallplan für Momente, in denen es schnell gehen muss, ein Symptomverlauf und ein Maßnahmenplan runden die Akte ab. Und weil das Ganze eine lebendige Akte ist, trägst du deine Beobachtungen, Fotos und Laborwerte fortlaufend ein und siehst schwarz auf weiß, wie sich dein Pferd Monat für Monat entwickelt.",
      },
      { art: "ueberschrift", text: "Für wen ist Pferdeliebe 365 geeignet?" },
      {
        art: "absatz",
        text: "Pferdeliebe 365 ist genau das Richtige für dich, wenn du dein Pferd naturnah und bedarfsgerecht versorgen und dabei langfristig begleitet werden möchtest, wenn bereits gesundheitliche Themen bestehen oder sich erste Auffälligkeiten zeigen, wenn du dir Struktur, Klarheit und Sicherheit in der Fütterung über das ganze Jahr wünschst oder wenn du bestehende Empfehlungen, z. B. aus Labor, Tierarztbefund oder Bioresonanz, fachlich einordnen und sinnvoll umsetzen möchtest.",
      },
      { art: "ueberschrift", text: "So läuft es ab" },
      {
        art: "absatz",
        text: "Nach deiner Buchung erhältst du einen ausführlichen Fragebogen zu Haltung, aktueller Fütterung und Gesundheitszustand deines Pferdes, dazu bitte ich dich um ein paar Fotos. Sobald alle Unterlagen vollständig bei mir eingegangen sind, erstelle ich eure Gesundheitsakte. Danach begleite ich dich über zwölf Monate an vier festen Terminen: bei der Erstellung, nach vier Wochen zur ersten Kontrolle, zum Weidebeginn und zum Fellwechsel. An jedem dieser Termine sehen wir uns an, wie es eurem Pferd geht, und passen den Plan an.",
      },
      { art: "ueberschrift", text: "Wichtige Hinweise" },
      {
        art: "absatz",
        text: "Damit jede Akte die Aufmerksamkeit bekommt, die sie verdient, nehme ich bewusst nur wenige Pferde gleichzeitig an. Die Auswertungsdauer beträgt in der Regel bis zu 14 Werktage nach vollständigem Eingang aller Unterlagen. Die Beratung gilt pro Pferd.",
      },
    ],
  },
  {
    slug: "equidesk",
    gruppe: "werkzeug",
    name: "EquiDesk · Kundenverwaltung für Futterberaterinnen",
    kurzname: "EquiDesk",
    preis: 2900,
    mwst: 19,
    art: "kurs",
    kurz: "Deine Kundinnen, ihre Pferde und die ganze Beratung an einer Stelle.",
    leistung:
      "Dauerhafter Zugang zu EquiDesk in der Pferdeliebehealthy Akademie, " +
      "der Kundenverwaltung für die Futterberatung.",
    // Trifft die Regel /equidesk/i in akademieapp/lib/produkt-zugang.ts.
    // Geprüft am 01.09.2026: keine der vorherigen Regeln greift auf diesen
    // Namen, und keine NIEMALS-Regel schliesst ihn aus.
    akademieName: "EquiDesk · Kundenverwaltung für Futterberaterinnen",
    erwarteterZugang: "equidesk",
    // Bewusst KEIN `statt`: EquiDesk wurde noch nie verkauft, weder für 19 €
    // im Monat noch für sonst etwas. Ein durchgestrichener Preis wäre Werbung
    // mit einer Ersparnis, die es nie gab. Dass es danach 19 € im Monat
    // kostet, steht als Satz im Text, und das ist auch die ehrliche Form.
    beschreibung: [
      {
        art: "absatz",
        text: "Du hast die Ausbildung gemacht und fängst an, eigene Kundinnen zu beraten. Und dann sitzt du da: die Anamnese liegt im Postfach, der Futterplan in Word, die Fotos auf dem Handy, die Rechnung in einer Tabelle, und wann du dich noch mal melden wolltest, weißt nur du. Genau da setzt EquiDesk an.",
      },
      { art: "ueberschrift", text: "Was drin ist" },
      {
        art: "liste",
        punkte: [
          "Kundinnen und ihre Pferde mit Haltung, Fütterung, Gesundheit und Medikamenten",
          "Beratungsverlauf auf einem Zeitstrahl: Erstberatung, Nachkontrolle, Blutbild, Heuanalyse, Telefonat",
          "Anamnesebogen zum Verschicken, deine Kundin füllt ihn am Handy aus",
          "Futterpläne mit Nährstoffrechnung nach GfE, dazu ein Blatt für die Stallwand",
          "Zehn fertige Textbausteine, mit einem Klick eingefügt",
          "Ein Glossar mit den Fachbegriffen der Futterberatung, zum Nachschlagen und Weitergeben",
          "Wiedervorlage mit Erinnerung per E-Mail",
          "Rechnungen mit fortlaufender Nummer, Kleinunternehmerregelung und eigenem Logo",
          "Nachrichten und Fotos deiner Kundin direkt am Pferd, mit Antwort per Mail",
          "Datenexport und Löschung je Kundin, dazu ein Muster für den AV-Vertrag",
        ],
      },
      { art: "ueberschrift", text: "Was es nicht kann" },
      {
        art: "liste",
        punkte: [
          "Keine App zum Herunterladen, EquiDesk läuft im Browser",
          "Kein Terminkalender mit Online-Buchung, es gibt die Wiedervorlage",
          "Keine Abrechnung nach GebüH, du schreibst deine Beträge selbst",
        ],
      },
      { art: "ueberschrift", text: "Was es kostet" },
      {
        art: "absatz",
        betont: true,
        text: "Einmalig 29 € für Testkundinnen. Danach gibt es EquiDesk nur noch als monatlichen Zugang für 19 € im Monat. Wer jetzt kauft, zahlt einmal und behält es.",
      },
      {
        art: "absatz",
        text: "Zum Vergleich: Praxissoftware für Tierheilpraxen beginnt bei 48 bis 62 € im Monat, und die Rationsberechnung fehlt dort überall.",
      },
    ],
    bild: {
      datei: "/images/equidesk-kundinnen.webp",
      alt: "Die Kundinnenliste in EquiDesk mit Filtern nach Leistung",
      breite: 1100,
      hoehe: 608,
    },
  },
];

// ---------------------------------------------------------------------------
// Die Ketten: Einstieg, Anschlussangebot, und was kommt, wenn abgelehnt wird
//
// ▸ WIE DAS GEDACHT IST
//   Nach dem Kauf kommt EIN Angebot (der Upsell). Wird es abgelehnt, kommt
//   EIN günstigeres (der Downsell). Danach ist Schluss. Drei Angebote
//   hintereinander verkaufen in Summe weniger als zwei und ärgern Leute, die
//   gerade eben erst gekauft haben.
//
// ▸ DIE KETTEN FOLGEN DEM INHALT, NICHT DEM PREIS.
//   Wer den Salzratgeber kauft, hat ein Mineralienthema, also kommt
//   Mineral-Klarheit. Wer den Magen Reset kauft, hat ein Verdauungsthema,
//   also kommt der Darmaufbau. Ein Angebot, das nur "auch teuer" ist,
//   verkauft nichts.
//
// ▸ DIE ANGEBOTSPREISE LIEGEN UNTER DEN LISTENPREISEN.
//   Das ist zulässig und kein erfundener Streichpreis: Die Produkte werden
//   tatsächlich zum vollen Preis verkauft, der Nachlass gilt nur in diesem
//   einen Moment nach dem Kauf. Genau dann darf der reguläre Preis
//   durchgestrichen danebenstehen. Ändert sich das je, muss `preis` oben mit.
//
// ▸ VORSCHLAG, STAND 01.09.2026: rund dreissig Prozent Nachlass im Angebot.
//   Yasemin kann jeden Wert hier einzeln ändern, ohne dass am Programm etwas
//   angefasst werden muss.
// ---------------------------------------------------------------------------

export type Funnel = {
  /** Der Slug des Hauptprodukts. */
  produkt: string;
  /** Der Slug des Angebots danach, oder null. */
  upsell: string | null;
  /** Der Preis des Upsells in diesem Funnel, in Cent. */
  upsellPreis: number;
  upsellTitel: string;
  /** Der Grund, warum das eine zum anderen passt. Keine Floskel. */
  upsellGrund: string;
  /** Das günstigere Angebot, wenn der Upsell abgelehnt wird. Oder null. */
  downsell?: string | null;
  downsellPreis?: number;
  downsellTitel?: string;
  downsellGrund?: string;
};

export const funnel: Funnel[] = [
  {
    produkt: "salzratgeber",
    upsell: "mineral-klarheit",
    upsellPreis: 1900,
    upsellTitel: "Salz ist ein Mineral. Wie steht es um die anderen?",
    upsellGrund:
      "Du weisst jetzt, warum Salz kein Mineralfutter ersetzt. Die " +
      "umgekehrte Frage ist die teurere: Ob das Mineralfutter, das du " +
      "fütterst, überhaupt zu deinem Pferd passt. In Mineral-Klarheit " +
      "rechnest du das mit den Daten deines Pferdes selbst durch, statt der " +
      "Empfehlung auf der Verpackung zu glauben.",
    downsell: "magen-reset",
    downsellPreis: 599,
    downsellTitel: "Dann vielleicht das hier, für den Notfall im Stall.",
    downsellGrund:
      "Der Magen Reset ist wie der Salzratgeber ein Heft für den Alltag: " +
      "Symptom-Checkliste zum Abhaken, ein Rezept, und was du tun kannst, " +
      "bevor der Tierarzt kommt.",
  },
  {
    produkt: "magen-reset",
    upsell: "darmaufbau",
    // ▸ AM 03.09.2026 VON 2700 AUF 1500 KORRIGIERT.
    //   Der Darmaufbau kostet regulaer 22 €. Das "Angebot" lag mit 27 € also
    //   FUENF EURO UEBER dem Preis, den dieselbe Kundin auf der Produktseite
    //   gesehen haette. Vermutlich ist irgendwann der Einzelpreis gesenkt und
    //   die Kette nicht mitgezogen worden. Wer ein Angebot zeigt, das teurer
    //   ist als der normale Preis, verkauft nichts und verliert Vertrauen.
    upsellPreis: 1500,
    upsellTitel: "Der Magen ist der Anfang. Der Darm entscheidet.",
    upsellGrund:
      "Ein Magenproblem kommt selten allein. Was im Magen anfängt, setzt " +
      "sich im Darm fort, und dort wird entschieden, was von der Ration " +
      "überhaupt ankommt. Der Darmaufbau zeigt dir, wie du ihn Schritt für " +
      "Schritt wieder aufbaust, statt nur zu beruhigen.",
    downsell: "salzratgeber",
    downsellPreis: 599,
    downsellTitel: "Dann nimm das kleine dazu, es passt zum selben Thema.",
    downsellGrund:
      "Salz steuert die Magensäure mit. Der Salzratgeber ist genauso " +
      "aufgebaut wie der Magen Reset: kurz, praktisch, mit Rezept.",
  },
  {
    produkt: "mineral-klarheit",
    upsell: "ratiopro",
    upsellPreis: 4900,
    upsellTitel: "Du kannst es jetzt rechnen. Soll ich es dir abnehmen?",
    upsellGrund:
      "In Mineral-Klarheit hast du gelernt, eine Deklaration zu lesen und " +
      "auf dein Pferd umzurechnen. RatioPro macht genau das für die ganze " +
      "Ration, nicht nur für das Mineralfutter, und zwar in Minuten statt " +
      "in einem Abend mit Taschenrechner.",
    downsell: "ganzjahresfutterplan",
    // Mit dem Sprung des Einzelpreises auf 59 Euro mitgezogen.
    downsellPreis: 3900,
    downsellTitel: "Dann lass dir wenigstens die Reihenfolge abnehmen.",
    downsellGrund:
      "Der Ganzjahresfutterplan sagt dir Monat für Monat, was jetzt dran " +
      "ist. Rechnen musst du dann nur noch, wenn du etwas ändern willst.",
  },
  {
    produkt: "ganzjahresfutterplan",
    upsell: "basisfutterkurs",
    // Mit dem Sprung des Einzelpreises auf 69 Euro mitgezogen. Bei 29 waere
    // der Nachlass groesser als der halbe Preis, und dann glaubt niemand mehr
    // an die 69.
    upsellPreis: 4900,
    upsellTitel: "Möchtest du auch verstehen, warum die Pläne so aussehen?",
    upsellGrund:
      "Der Ganzjahresfutterplan sagt dir, was du wann fütterst. Der " +
      "Basisfutterkurs erklärt dir, warum. Du lernst darin, Deklarationen zu " +
      "lesen und Mineralien einzuordnen, und kannst die Monatspläne danach " +
      "auf dein Pferd zuschneiden, statt sie nur abzuarbeiten.",
    downsell: "salzratgeber",
    downsellPreis: 599,
    downsellTitel: "Dann nimm zumindest das hier mit.",
    downsellGrund:
      "In jedem Monatsplan steht Salz. Warum es kein Mineralfutter ersetzt " +
      "und wie viel dein Pferd wirklich braucht, steht im Salzratgeber.",
  },
  {
    produkt: "darmaufbau",
    upsell: "symptom-navigator",
    upsellPreis: 2700,
    upsellTitel: "Und beim nächsten Symptom, das nicht der Darm ist?",
    upsellGrund:
      "Der Darmaufbau löst ein Thema. Der Symptom-Navigator ist für alle " +
      "anderen: Du schlägst nach, was hinter einer Beobachtung stecken kann, " +
      "und siehst sofort, ob du selbst handeln kannst oder ob der Tierarzt " +
      "gebraucht wird.",
    downsell: "magen-reset",
    downsellPreis: 599,
    downsellTitel: "Dann das kleine Heft für den Anfang der Kette.",
    downsellGrund:
      "Darmprobleme fangen oft im Magen an. Der Magen Reset ist die kurze " +
      "Fassung davon, mit Checkliste und Rezept.",
  },
  {
    produkt: "symptom-navigator",
    upsell: "darmaufbau",
    // ▸ AM 03.09.2026 VON 2700 AUF 1500 KORRIGIERT.
    //   Der Darmaufbau kostet regulaer 22 €. Das "Angebot" lag mit 27 € also
    //   FUENF EURO UEBER dem Preis, den dieselbe Kundin auf der Produktseite
    //   gesehen haette. Vermutlich ist irgendwann der Einzelpreis gesenkt und
    //   die Kette nicht mitgezogen worden. Wer ein Angebot zeigt, das teurer
    //   ist als der normale Preis, verkauft nichts und verliert Vertrauen.
    upsellPreis: 1500,
    upsellTitel: "Die meisten Wege im Navigator enden im Darm.",
    upsellGrund:
      "Wenn du im Symptom-Navigator nachschlägst, landest du erstaunlich " +
      "oft bei der Verdauung. Der Darmaufbau ist die ausführliche Antwort " +
      "darauf: nicht was es sein könnte, sondern was du dagegen tust.",
    downsell: "magen-reset",
    downsellPreis: 599,
    downsellTitel: "Dann für den häufigsten Fall die schnelle Hilfe.",
    downsellGrund:
      "Magenprobleme stehen im Navigator ganz oben. Der Magen Reset gibt " +
      "dir dafür die Checkliste und ein Rezept an die Hand.",
  },
  // -------------------------------------------------------------------------
  // Die Ketten der beiden versteckten Angebote, angelegt am 03.09.2026.
  //
  // ▸ DAS BÜNDEL TAUCHT IN KEINER KETTE ALS ZIEL AUF, und das ist Absicht:
  //   Es ist befristet. Ein Angebot, das nach dem Stichtag noch erscheint,
  //   führt die Kundin auf einen Knopf, den die Kasse abweist. Es hat
  //   deshalb eine eigene Kette, ist aber nirgends Upsell oder Downsell.
  // -------------------------------------------------------------------------
  {
    produkt: "metabolisches-gewicht",
    upsell: "symptom-navigator",
    upsellPreis: 2700,
    upsellTitel: "Du kannst jetzt rechnen. Und wenn etwas auffällt?",
    upsellGrund:
      "Im Pro-Modul hast du gesehen, wie ein Bedarf zustande kommt. Die " +
      "andere Hälfte der Beratung fängt an, wenn eine Kundin dir von " +
      "Kotwasser, schuppiger Haut oder einem plötzlich krüschen Pferd " +
      "erzählt. Im Symptom-Navigator schlägst du das Zeichen nach und siehst, " +
      "was dahinterstecken kann und was du zuerst fragen solltest.",
    downsell: "mineral-klarheit",
    downsellPreis: 1900,
    downsellTitel: "Dann das, was direkt an den Zahlen hängt.",
    downsellGrund:
      "Der Bedarf steht jetzt. Die nächste Frage ist, ob das Mineralfutter " +
      "im Eimer ihn überhaupt deckt. Mineral-Klarheit zeigt dir, wie du eine " +
      "Deklaration liest und auf dein Pferd umrechnest, statt der Empfehlung " +
      "auf der Verpackung zu glauben.",
  },
  {
    produkt: "ratiopro-buendel",
    upsell: "ganzjahresfutterplan",
    upsellPreis: 3900,
    upsellTitel: "Der Rechner sagt was. Der Plan sagt wann.",
    upsellGrund:
      "RatioPro rechnet dir die Ration aus, die heute passt. Im Fellwechsel " +
      "sieht sie anders aus als auf der Sommerweide. Der Ganzjahresfutterplan " +
      "nimmt dir ab, jeden Monat neu zu überlegen, was sich saisonal ändert.",
    downsell: "mineral-klarheit",
    downsellPreis: 1900,
    downsellTitel: "Oder das Wissen hinter den Zahlen.",
    downsellGrund:
      "RatioPro rechnet. Mineral-Klarheit erklärt, warum eine Zahl auf der " +
      "Verpackung noch nichts über die Versorgung deines Pferdes sagt.",
  },
  {
    produkt: "ratiopro",
    upsell: "ganzjahresfutterplan",
    // Mit dem Sprung des Einzelpreises auf 59 Euro mitgezogen.
    upsellPreis: 3900,
    upsellTitel: "Der Rechner sagt was. Der Plan sagt wann.",
    upsellGrund:
      "RatioPro rechnet dir die Ration aus, die heute passt. Im Fellwechsel " +
      "sieht sie anders aus als auf der Sommerweide. Der Ganzjahresfutterplan " +
      "nimmt dir ab, jeden Monat neu zu überlegen, was sich saisonal ändert.",
    // ▸ SEIT DEM 03.09.2026 STEHT HIER DAS PRO-MODUL statt Mineral-Klarheit.
    //   Ein Zusatz zu dem, was die Kundin gerade gekauft hat, ist der
    //   naheliegendste zweite Kauf, den es gibt: Sie hat den Rechner offen
    //   und versteht sofort, wovon die Rede ist.
    //
    //   Wenn du lieber umgekehrt willst, also das Modul als Upsell und den
    //   Ganzjahresfutterplan als Downsell: Das geht nicht ohne Weiteres, ein
    //   Downsell muss günstiger sein als der Upsell. Dann müsste der Plan
    //   ganz aus dieser Kette heraus.
    downsell: "metabolisches-gewicht",
    downsellPreis: 1900,
    downsellTitel: "Dann nimm zumindest den Rechenweg mit.",
    downsellGrund:
      "Du hast jetzt den Rechner. Das Pro-Modul zeigt dir, wie er auf seine " +
      "Zahlen kommt: metabolisch gerechnet gegen linear, der " +
      "Erhaltungsbedarf nach Pferdetyp und eine Anleitung, mit der du jeden " +
      "Wert von Hand nachrechnest. Es sitzt direkt im Rechner, du musst " +
      "nichts zusätzlich öffnen.",
  },
  {
    // Wer EquiDesk kauft, ist Beraterin und keine Pferdebesitzerin. Deshalb
    // stehen hier Werkzeuge fuer die tägliche Arbeit und keine Ratgeber.
    produkt: "equidesk",
    upsell: "ratiopro",
    upsellPreis: 4900,
    upsellTitel: "Der Plan ist gerechnet. Aber wo probierst du aus?",
    upsellGrund:
      "EquiDesk rechnet dir den Futterplan durch, den du schon zusammengestellt " +
      "hast. Die Arbeit davor ist eine andere: zwei Mineralfutter vergleichen, " +
      "sehen was passiert, wenn 200 g Cobs dazukommen, in 480 Futtermitteln " +
      "nach einer Alternative suchen. Dafür ist RatioPro da. Beide greifen auf " +
      "dieselbe Futtermitteldatenbank zu, du rechnest also nicht zweimal " +
      "unterschiedlich.",
    downsell: "symptom-navigator",
    downsellPreis: 2900,
    downsellTitel: "Dann vielleicht das, wenn eine Kundin anruft.",
    downsellGrund:
      "Eine Kundin schreibt dir von Kotwasser, schuppiger Haut oder einem " +
      "Pferd, das plötzlich krüsch ist. Im Symptom-Navigator schlägst du das " +
      "Zeichen nach und siehst, was dahinterstecken kann und was du zuerst " +
      "fragen solltest. Das ist die Vorarbeit, die in EquiDesk dann als " +
      "Beratungsverlauf landet.",
  },
  {
    produkt: "basisfutterkurs",
    upsell: "ratiopro",
    upsellPreis: 4900,
    upsellTitel: "Du weisst jetzt, worauf es ankommt. Willst du es ausrechnen?",
    upsellGrund:
      "Im Basisfutterkurs hast du gelernt, eine Deklaration zu lesen und " +
      "Mineralien einzuordnen. RatioPro rechnet dir daraus die ganze Ration " +
      "aus, mit den Daten deines Pferdes, und zeigt dir in Minuten, wo " +
      "Lücken und Überschüsse sitzen.",
    downsell: "salzratgeber",
    downsellPreis: 599,
    downsellTitel: "Dann zumindest das Thema, das in jeder Ration vorkommt.",
    downsellGrund:
      "Salz kommt im Kurs vor, aber nur kurz. Der Salzratgeber sagt dir, " +
      "wie viel dein Pferd wirklich braucht und wie du die Elektrolyte " +
      "selbst mischst, ohne Zucker und Aromen.",
  },
  {
    produkt: "ausbildung",
    upsell: "ratiopro",
    upsellPreis: 4900,
    upsellTitel: "Ein Werkzeug für die Praxis, von Anfang an.",
    upsellGrund:
      "Du wirst im Lauf der Ausbildung viele Rationen rechnen, für dein " +
      "eigenes Pferd und später in der Abschlussarbeit. RatioPro nimmt dir " +
      "die Rechenarbeit ab, damit du dich auf das Beurteilen konzentrieren " +
      "kannst.",
    // Kein Downsell: Wer sich gerade für zwölf Monate Ausbildung
    // entschieden hat, dem ein Heft für 5,99 € hinterherzuwerfen wirkt
    // kleinlich und passt nicht zum Anlass.
    downsell: null,
  },
  {
    produkt: "pferdeliebe-365",
    upsell: "ratiopro",
    upsellPreis: 4900,
    upsellTitel: "Möchtest du zwischendurch selbst nachrechnen können?",
    upsellGrund:
      "Deine Akte enthält eine fertige Rationsberechnung. Nach den vier " +
      "Wochen Begleitung ändert sich aber immer wieder etwas: anderes Heu, " +
      "ein neues Zusatzfutter, ein anderer Bedarf. Mit RatioPro rechnest du " +
      "das selbst nach, statt zu schätzen oder zu warten.",
    // Kein Downsell: Wer gerade 249 € ausgegeben hat, dem noch ein Heft für
    // 5,99 € hinterherzuwerfen wirkt kleinlich und passt nicht zum Anlass.
    downsell: null,
  },
];

// ---------------------------------------------------------------------------
// Kleine Helfer
// ---------------------------------------------------------------------------

export function digitalFinden(slug: string): DigitalProdukt | undefined {
  return digitalprodukte.find((p) => p.slug === slug);
}

export function funnelZu(slug: string): Funnel | undefined {
  return funnel.find((f) => f.produkt === slug);
}

/**
 * Wie viel ein Angebot günstiger ist als der reguläre Preis. Null, wenn es
 * keine Ersparnis gibt.
 *
 * WARUM DAS HIER SO SORGFÄLTIG GERECHNET WIRD: Ein durchgestrichener Preis
 * darf nur dort stehen, wo tatsächlich auch zu diesem höheren Preis verkauft
 * wird. Beim Basisfutterkurs ist das nicht so, er wurde nie einzeln
 * angeboten. Dort kommt deshalb null heraus und die Seite zeigt gar keinen
 * Vergleich, statt eine Ersparnis zu behaupten, die es nicht gibt. Genau
 * deshalb ist beim Moventa im Shop am 31.08.2026 der Streichpreis entfernt
 * worden.
 */
export function ersparnis(f: Funnel, stufe: "upsell" | "downsell" = "upsell"): number {
  const slug = stufe === "upsell" ? f.upsell : f.downsell;
  const angebotspreis = stufe === "upsell" ? f.upsellPreis : f.downsellPreis;

  if (!slug || angebotspreis === undefined) return 0;

  const produkt = digitalFinden(slug);
  if (!produkt) return 0;

  const differenz = produkt.preis - angebotspreis;
  return differenz > 0 ? differenz : 0;
}
