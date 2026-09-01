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
};

// ---------------------------------------------------------------------------
// Die Produkte, aufsteigend nach Preis
// ---------------------------------------------------------------------------

export const digitalprodukte: DigitalProdukt[] = [
  {
    slug: "salzratgeber",
    name: "Natürliche Salzversorgung für dein Pferd",
    kurzname: "Salzratgeber",
    preis: 799,
    mwst: 19,
    art: "kurs",
    kurz: "Wissen, Praxis und Rezept in einem.",
    leistung:
      "Digitaler Zugang zum Salzratgeber in der Pferdeliebehealthy Akademie, " +
      "dauerhaft abrufbar.",
    // Trifft die Regel /nat[üu]rliche salzversorgung/i.
    // Geprüft: keine der NIEMALS-Regeln greift, insbesondere nicht
    // /salz versorgt\. aber wie steht es/i oder /versorgt mit salz/i.
    akademieName: "Natürliche Salzversorgung für dein Pferd",
    erwarteterZugang: "salzratgeber",
    beschreibung: [
      {
        art: "absatz",
        text: "Natürliche Salzversorgung für dein Pferd: Wissen, Praxis und Rezept in einem.",
      },
    ],
  },
  {
    slug: "magen-reset",
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
    name: "Mineral-Klarheit",
    kurzname: "Mineral-Klarheit",
    preis: 2700,
    mwst: 19,
    art: "kurs",
    kurz: "Mineralfutter selbst durchrechnen statt raten.",
    leistung:
      "Digitaler Zugang zu Mineral-Klarheit in der Pferdeliebehealthy " +
      "Akademie, mit eingebautem Rechner, dauerhaft abrufbar.",
    // Trifft /mineral-klarheit|mineral mastery/i.
    akademieName: "Mineral-Klarheit",
    erwarteterZugang: "mineral-klarheit",
    beschreibung: [
      {
        art: "absatz",
        text: "Mineralfutter selbst durchrechnen statt raten. Bedarf verstehen, Etiketten wirklich lesen, und mit dem eingebauten Rechner jedes Produkt direkt auf dein Pferd prüfen.",
      },
    ],
  },
  {
    slug: "ganzjahresfutterplan",
    name: "Ganzjahresfutterplan für Pferde, natürlich durchs Jahr",
    kurzname: "Ganzjahresfutterplan",
    preis: 2900,
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
    name: "Basisfutterkurs",
    kurzname: "Basisfutterkurs",
    // Regulärer Einzelpreis 39 €, von Yasemin am 01.09.2026 festgelegt.
    // Im Anschlussangebot zum Ganzjahresfutterplan kostet er 29 €, die
    // Angebotsseite zeigt dort also 10 € Ersparnis, siehe `ersparnis()`
    // weiter unten. Damit der Vergleich zulässig bleibt, muss er hier auch
    // wirklich einzeln für 39 € angeboten werden.
    preis: 3900,
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
    name: "Darmaufbau beim Pferd",
    kurzname: "Darmaufbau",
    preis: 3900,
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
  },
  {
    slug: "ratiopro",
    name: "RatioPro",
    kurzname: "RatioPro",
    preis: 6900,
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
  },
  {
    slug: "ausbildung",
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
  {
    slug: "pferdeliebe-365",
    name: "Pferdeliebe 365 – deine 1:1 Futterberatung als Gesundheitsakte",
    kurzname: "Pferdeliebe 365",
    // 249 € statt 399 €, von Yasemin am 01.09.2026 so festgelegt. Der
    // Streichpreis ist hier zulässig, weil es eine echte Aktion auf den
    // regulären Preis ist.
    preis: 24900,
    statt: 39900,
    mwst: 19,
    // ▸ ACHTUNG, DAS EINZIGE PRODUKT MIT art: "dienstleistung".
    //   Was das für den Widerruf bedeutet, steht oben beim Typ. Kurz: Das
    //   Widerrufsrecht erlischt erst, wenn die Leistung VOLLSTÄNDIG erbracht
    //   ist, also wenn Akte und die vier Wochen Begleitung durch sind. Bis
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
      "Rationsberechnung, Umsetzungs-, Saison- und Notfallplan, dazu vier " +
      "Wochen persönliche Begleitung bei der Umsetzung. Gilt pro Pferd.",
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
        text: "Nach deiner Buchung erhältst du einen ausführlichen Fragebogen zu Haltung, aktueller Fütterung und Gesundheitszustand deines Pferdes, dazu bitte ich dich um ein paar Fotos. Sobald alle Unterlagen vollständig bei mir eingegangen sind, erstelle ich eure Gesundheitsakte. Danach begleite ich dich 4 Wochen persönlich bei der Umsetzung und passe den Plan an, wenn es nötig wird.",
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
    upsellPreis: 2700,
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
    downsellPreis: 1900,
    downsellTitel: "Dann lass dir wenigstens die Reihenfolge abnehmen.",
    downsellGrund:
      "Der Ganzjahresfutterplan sagt dir Monat für Monat, was jetzt dran " +
      "ist. Rechnen musst du dann nur noch, wenn du etwas ändern willst.",
  },
  {
    produkt: "ganzjahresfutterplan",
    upsell: "basisfutterkurs",
    upsellPreis: 2900,
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
    upsellPreis: 2700,
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
  {
    produkt: "ratiopro",
    upsell: "ganzjahresfutterplan",
    upsellPreis: 1900,
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
