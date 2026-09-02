// ---------------------------------------------------------------------------
// Die Verkaufstexte der Produktseiten.
//
// ▸ WARUM SIE NICHT IN lib/digital.ts STEHEN
//   Dort steht, was ein Produkt IST: Preis, Steuersatz, Zugang, Widerruf.
//   Hier steht, wie es VERKAUFT wird. Das sind zwei verschiedene Dinge, die
//   sich unterschiedlich oft ändern: Der Preis vielleicht einmal im Jahr, ein
//   Verkaufstext jedes Mal, wenn du eine bessere Formulierung findest.
//
// ▸ WOHER DIE TEXTE STAMMEN
//   Wo es einen gab, ist der Text von der alfima-Seite übernommen, wörtlich
//   und ungekürzt, so wie es beim Shop gehalten wurde. Wo keiner da war, ist
//   er aus der Kursbeschreibung in der Akademie und dem Kursinhalt selbst
//   gebaut. Hier steht nichts, was der Kurs nicht hält.
//
// ▸ WAS EINE GUTE PRODUKTSEITE BRAUCHT, in dieser Reihenfolge:
//     1. Was ist das, in einem Satz          -> `einleitung`
//     2. Warum brauche ich das               -> `problem`
//     3. Was bekomme ich genau               -> `inhalte`
//     4. Wie sieht das aus                   -> `einblicke`
//     5. Bin ich gemeint                     -> `fuerWen`
//     6. Was kostet es, und was passiert dann -> `abschluss`
//   Punkt 5 ist der, den die meisten weglassen. Wer ehrlich sagt, für wen
//   etwas NICHT ist, verkauft mehr, nicht weniger: Es nimmt die Sorge, an
//   das Falsche zu geraten.
// ---------------------------------------------------------------------------

export type Einblick = {
  /** Dateiname unter /images/<slug>/ */
  datei: string;
  /** Beschreibung für Menschen, die das Bild nicht sehen können. */
  alt: string;
  /** Die Bildunterschrift. */
  text: string;
};

export type Verkaufstext = {
  /** Die kleine Zeile über der Überschrift. */
  augenbraue: string;
  /** Die Überschrift der Seite. Kurz, das ist der Produktname. */
  ueberschrift: string;
  /** Ein bis zwei Absätze direkt darunter. */
  einleitung: string[];
  /** Der Titel des Suchmaschinen-Eintrags. Länger als die Überschrift. */
  seitentitel: string;

  problemAugenbraue: string;
  problemTitel: string;
  problem: string[];

  inhaltAugenbraue: string;
  inhaltTitel: string;
  inhalte: { titel: string; text: string }[];
  /** Ein Satz unter den Karten, freiwillig. */
  inhaltSchluss?: string;

  /** Bildschirmfotos aus dem Produkt. Fehlen sie, entfällt der Abschnitt. */
  einblickTitel?: string;
  einblickText?: string;
  einblicke?: Einblick[];

  fuerWenTitel: string;
  fuerWen: string[];

  abschlussTitel: string;
  abschlussText: string;
};

// ▸ MENGENANGABEN GEHÖREN IN DIE EINLEITUNG, und zwar geprüfte.
//   „Elf Seiten", „zwanzig Seiten", „58 Zeichen aus elf Körperbereichen":
//   Wer 22 Euro für ein PDF ausgibt, will vorher wissen, ob es zehn Seiten
//   sind oder hundert. Fehlt die Angabe, denkt man sich das Schlechtere.
//
//   Die Zahlen sind am 02.09.2026 an den Dateien selbst nachgezählt worden,
//   nicht geschätzt. Wenn ein Heft neu gebaut wird, gehört die Zahl hier
//   nachgezogen; eine falsche Angabe ist schlimmer als keine.
export const verkaufstexte: Record<string, Verkaufstext> = {
  // -------------------------------------------------------------------------
  // Salzratgeber, seit 02.09.2026 12,99 € (vorher 7,99 €)
  // Text von der alfima-Seite, wörtlich übernommen. Er sprach von Anfang an
  // von zwei Heften. Ausgeliefert wurde bis zum 02.09.2026 nur das erste,
  // seitdem stimmt der Text: das Rezeptheft liegt in der Akademie.
  // -------------------------------------------------------------------------
  salzratgeber: {
    augenbraue: "Der kleine Anfang",
    ueberschrift: "Natürliche Salzversorgung",
    seitentitel:
      "Salzratgeber für Pferde: wie viel Salz dein Pferd wirklich braucht",
    einleitung: [
      "Der ehrliche Leitfaden plus das Rezept zum Selbermischen.",
      "Dein Pferd schwitzt, du fragst dich, was es jetzt braucht. Der Leckstein im Stall reicht nicht, die Fertigprodukte sind voll Aromen und Zucker. Dabei reicht für die meisten Pferde gutes Salz und ein klarer Plan.",
    ],

    problemAugenbraue: "Warum das nötig ist",
    problemTitel: "Ein Leckstein ist keine Versorgung.",
    problem: [
      "Ein Pferd, das im Sommer arbeitet, verliert über den Schweiß mehrere Gramm Natrium am Tag. Am Leckstein holt es sich davon einen Bruchteil, weil Lecken mühsam ist und die meisten Pferde aufhören, lange bevor der Bedarf gedeckt ist.",
      "Die Alternative im Regal sind Elektrolytpulver, und dort steht dann Traubenzucker an erster Stelle der Zusammensetzung, dazu Aromen, damit es überhaupt gefressen wird.",
      "Dabei ist die Sache im Kern einfach: Du musst wissen, wie viel dein Pferd braucht, welches Salz dafür taugt und wann eine Mischung sinnvoll ist. Genau das steht hier drin.",
    ],

    inhaltAugenbraue: "Im Bundle enthalten",
    inhaltTitel: "Zwei Hefte, direkt umsetzbar.",
    inhalte: [
      {
        titel: "Salz in der Pferdefütterung, 14 Seiten",
        text: "Mengen, Salzarten im Vergleich, Risikopferde, Sommer und Winter, Bezugsquellen. Mit klickbarem Inhaltsverzeichnis.",
      },
      {
        titel: "Natürliche Elektrolytmischung, 7 Seiten",
        text: "Das Rezept zum Selbermischen mit Grammangaben, dazu die Dosierung nach Schweißverlust. Ohne Aromen, ohne Zucker.",
      },
    ],

    fuerWenTitel: "Für wen das gemacht ist",
    fuerWen: [
      "Für dich, wenn dein Pferd im Sommer oder bei der Arbeit deutlich schwitzt und du dir nicht sicher bist, ob der Leckstein reicht.",
      "Für dich, wenn du beim Elektrolytpulver auf die Zusammensetzung geschaut hast und dich gefragt hast, warum dort Zucker an erster Stelle steht.",
      "Nicht für dich, wenn du eine vollständige Rationsberechnung suchst. Salz ist ein Baustein, nicht die ganze Fütterung. Dafür gibt es Mineral-Klarheit und RatioPro.",
    ],

    abschlussTitel: "Zwei Hefte, ein Rezept.",
    abschlussText:
      "Weniger als ein Eimer Elektrolytpulver, den du danach vielleicht gar nicht mehr kaufst. Der Zugang bleibt dir dauerhaft.",
  },

  // -------------------------------------------------------------------------
  // Magen Reset, 7,99 €
  // Text von der alfima-Seite, wörtlich übernommen.
  // -------------------------------------------------------------------------
  "magen-reset": {
    augenbraue: "Schnelle Hilfe",
    ueberschrift: "Magen Reset",
    seitentitel:
      "Magen Reset für Pferde: Praxiswissen, Rezept und schnelle Hilfe",
    einleitung: [
      "Dieser Mini-Guide zeigt dir auf elf Seiten, wie du den Magen deines Pferdes gezielt unterstützen kannst.",
      "Du bekommst leicht umsetzbares Wissen, klare Fütterungsempfehlungen und ein bewährtes Magenrezept, das die Schleimhäute schützt und beruhigt.",
    ],

    problemAugenbraue: "Warum das nötig ist",
    problemTitel: "Magenprobleme zeigen sich selten als Magenproblem.",
    problem: [
      "Ein Pferd mit gereiztem Magen kolikt nicht unbedingt. Es wird mäkelig, es lässt sich schlechter gurten, es gähnt auffällig oft, es legt beim Putzen die Ohren an. Lauter Kleinigkeiten, die man leicht dem Charakter zuschreibt.",
      "Bis dann irgendwann doch der Tierarzt kommt und man erfährt, dass es seit Monaten so ging.",
      "Der Guide zeigt dir die frühen Zeichen und was du sofort ändern kannst, ohne auf einen Termin zu warten.",
    ],

    inhaltAugenbraue: "Das steht drin",
    inhaltTitel: "Vier Fragen, klar beantwortet.",
    inhalte: [
      {
        titel: "Wie der Pferdemagen arbeitet",
        text: "Wie er aufgebaut ist und warum er anders funktioniert als deiner. Ohne das versteht man keine einzige Fütterungsempfehlung.",
      },
      {
        titel: "Woran du Probleme früh erkennst",
        text: "Die Zeichen im Alltag, bevor es eine Diagnose gibt. Mit Symptom-Checkliste zum Abhaken.",
      },
      {
        titel: "Was du fütterst und was nicht",
        text: "Klare Do's und Don'ts für die Praxis, ohne Umwege.",
      },
      {
        titel: "Das Magenrezept",
        text: "Zum direkten Umsetzen, für eine ruhige und magenfreundliche Fütterung.",
      },
    ],
    inhaltSchluss:
      "Für Pferde mit Magenproblemen, empfindlicher Verdauung, Stressanfälligkeit oder wiederkehrenden Beschwerden. Kompakt, verständlich und direkt umsetzbar.",

    fuerWenTitel: "Für wen das gemacht ist",
    fuerWen: [
      "Für dich, wenn dein Pferd Anzeichen zeigt, die du nicht recht einordnen kannst, und du etwas tun willst, bevor daraus eine Diagnose wird.",
      "Für dich, wenn eine Magendiagnose schon vorliegt und du wissen willst, wie du die Fütterung darauf einstellst.",
      "Nicht für dich, wenn dein Pferd akut kolikt. Dann ruf den Tierarzt an, nicht mich.",
    ],

    abschlussTitel: "Ein Heft, ein Rezept, sofort umsetzbar.",
    abschlussText:
      "Der Guide bleibt dir dauerhaft, auch für das nächste Mal, wenn es wieder eng wird.",
  },

  // -------------------------------------------------------------------------
  // Basisfutterkurs, 69 €
  // Aus der Kursbeschreibung und dem Kursinhalt gebaut, es gab keine
  // alfima-Seite: Der Kurs wurde bisher nie einzeln verkauft.
  // -------------------------------------------------------------------------
  basisfutterkurs: {
    augenbraue: "Die Grundlagen",
    ueberschrift: "Basisfutterkurs",
    seitentitel:
      "Basisfutterkurs: die Grundlagen der ganzheitlichen Pferdefütterung",
    einleitung: [
      "Zwanzig Lektionen, nach denen du eine Futterdeklaration liest wie einen Text und nicht wie eine Zahlenkolonne.",
      "In deinem Tempo, mit dauerhaftem Zugang. Du kannst jederzeit zurückblättern, wenn bei deinem Pferd etwas Neues auftaucht.",
    ],

    problemAugenbraue: "Warum das nötig ist",
    problemTitel: "Du fütterst jeden Tag. Zweimal.",
    problem: [
      "Kaum eine andere Entscheidung triffst du so oft wie die, was in den Trog kommt. Und kaum eine wird so oft anderen überlassen: dem Hersteller, der Stallbesitzerin, dem Ratschlag von der Nachbarbox.",
      "Das Problem an fremden Empfehlungen ist nicht, dass sie falsch wären. Es ist, dass du nicht beurteilen kannst, ob sie zu deinem Pferd passen. Und dass du bei der nächsten Änderung wieder von vorn fragen musst.",
      "Dieser Kurs bringt dir die Grundlagen bei, auf denen alle weiteren Entscheidungen stehen. Danach fragst du nicht mehr, was du füttern sollst, sondern prüfst selbst, ob etwas passt.",
    ],

    inhaltAugenbraue: "Das lernst du",
    inhaltTitel: "Von der Deklaration bis zur Umstellung.",
    inhalte: [
      {
        titel: "Futterdeklarationen lesen",
        text: "Was auf der Verpackung steht, was es bedeutet, und was bewusst nicht draufsteht.",
      },
      {
        titel: "Mineralien verstehen",
        text: "Welcher Nährstoff wofür gebraucht wird und woran du eine Über- oder Unterversorgung erkennst.",
      },
      {
        titel: "Darm, Leber und Niere",
        text: "Wie du den Darm sanierst und was Leber und Niere im Alltag entlastet.",
      },
      {
        titel: "Ekzem, Umstellung, Entwurmung",
        text: "Die Themen, die im Stalljahr regelmäßig wiederkommen, mit einem klaren Vorgehen für jedes.",
      },
    ],

    einblickTitel: "Zwanzig Lektionen, in deiner Reihenfolge.",
    einblickText:
      "Links siehst du immer, wo du stehst. Du kannst der Reihe nach durchgehen oder direkt zu dem springen, was dich gerade beschäftigt.",
    einblicke: [
      {
        datei: "lektionen.webp",
        alt: "Der Basisfutterkurs mit der Lektionsliste links und dem Willkommenstext rechts",
        text: "Von der Futtererkennung über Mineralien und Darmsanierung bis zu Leber und Niere. Jede Lektion lässt sich abhaken, der Fortschritt bleibt gespeichert.",
      },
    ],

    fuerWenTitel: "Für wen der Kurs gemacht ist",
    fuerWen: [
      "Für dich, wenn du am Anfang stehst und ein Fundament willst, statt dir Halbwissen aus Foren zusammenzusuchen.",
      "Für dich, wenn du schon länger fütterst, aber merkst, dass du vieles tust, ohne genau zu wissen warum.",
      "Nicht für dich, wenn du eine fertige Ration für ein konkretes Pferd brauchst. Der Kurs bringt dir das Denken bei, nicht das Ergebnis. Dafür gibt es Pferdeliebe 365.",
    ],

    abschlussTitel: "Zwanzig Lektionen, dauerhafter Zugang.",
    abschlussText:
      "Einmalig, kein Abo. Du kannst jederzeit anfangen und jederzeit zurückkommen.",
  },

  // -------------------------------------------------------------------------
  // Darmaufbau, 39 €
  // -------------------------------------------------------------------------
  darmaufbau: {
    augenbraue: "Das E-Book",
    ueberschrift: "Darmaufbau beim Pferd",
    seitentitel:
      "Darmaufbau beim Pferd: das E-Book für eine gesunde Verdauung",
    einleitung: [
      "Auf zwanzig Seiten: wie ein widerstandsfähiger Darm aufgebaut wird und welche Bausteine dein Pferd dafür wirklich braucht.",
      "Kein Kurprogramm von der Stange, sondern das Verständnis dahinter, damit du selbst entscheiden kannst, was dein Pferd braucht.",
    ],

    problemAugenbraue: "Warum das nötig ist",
    problemTitel: "Im Darm entscheidet sich, was von der Ration ankommt.",
    problem: [
      "Du kannst die beste Ration rechnen, das teuerste Mineralfutter kaufen und die schönsten Kräuter mischen. Wenn der Darm nicht mitspielt, kommt davon nur ein Teil im Pferd an.",
      "Deshalb bringen viele Umstellungen weniger, als sie sollten, und deshalb wirkt bei manchen Pferden scheinbar nichts.",
      "Ein Darmaufbau ist kein Produkt, das man kauft, sondern ein Vorgehen über Wochen. Dieses E-Book zeigt dir, wie es geht und woran du erkennst, dass es wirkt.",
    ],

    inhaltAugenbraue: "Das steht drin",
    inhaltTitel: "Vom Verständnis zum Vorgehen.",
    inhalte: [
      {
        titel: "Wie der Pferdedarm arbeitet",
        text: "Was wo verdaut wird und warum die Reihenfolge im Verdauungstrakt so wichtig ist.",
      },
      {
        titel: "Was einen Darm aus dem Gleichgewicht bringt",
        text: "Futterwechsel, Stress, Medikamente, Wurmkuren. Und was davon sich vermeiden lässt.",
      },
      {
        titel: "Die Bausteine für den Aufbau",
        text: "Welche wirklich etwas bringen, in welcher Reihenfolge und wie lange.",
      },
      {
        titel: "Woran du Fortschritt erkennst",
        text: "Was sich zuerst ändert und was Geduld braucht.",
      },
    ],

    fuerWenTitel: "Für wen das gemacht ist",
    fuerWen: [
      "Für dich, wenn dein Pferd nach Kotwasser, einer Wurmkur oder einer Antibiotikagabe wieder auf die Beine kommen soll.",
      "Für dich, wenn du bei Fütterungsumstellungen jedes Mal Probleme bekommst und wissen willst, woran das liegt.",
      "Nicht für dich, wenn du ein fertiges Produkt suchst, das du kaufst und einfach fütterst. Hier lernst du, warum welcher Baustein wann sinnvoll ist.",
    ],

    abschlussTitel: "Das E-Book, dauerhaft verfügbar.",
    abschlussText:
      "Du liest es in der Akademie und kannst jederzeit darauf zurückgreifen, auch beim nächsten Pferd.",
  },

  // -------------------------------------------------------------------------
  // Symptom-Navigator, 39 €
  // -------------------------------------------------------------------------
  "symptom-navigator": {
    augenbraue: "Das Nachschlagewerk",
    ueberschrift: "Symptom-Navigator",
    seitentitel:
      "Symptom-Navigator für Pferde: Beobachtungen richtig einordnen",
    einleitung: [
      "Erkenne Symptome bei deinem Pferd und ordne sie richtig ein: 58 Zeichen aus elf Körperbereichen, nachschlagbar wie in einem Register.",
      "Das Nachschlagewerk für den Alltag, mit klaren Hinweisen, wann du selbst handeln kannst und wann ein Tierarzt gebraucht wird.",
    ],

    problemAugenbraue: "Warum das nötig ist",
    // Die Anführungszeichen hier sind typografische („…“), keine geraden.
    // Ein gerades Zeichen würde die Zeichenkette mittendrin beenden.
    problemTitel: "Zwischen „das ist nichts“ und „ruf sofort an“ liegt viel.",
    problem: [
      "Dein Pferd hat stumpfes Fell, brüchige Hufe, es ist träger als sonst. Nichts davon ist ein Notfall, und nichts davon ist normal.",
      "Also fragst du im Stall herum und bekommst fünf Meinungen. Oder du suchst im Internet und findest zwischen Panikmache und Verharmlosung nichts, was dir weiterhilft.",
      "Der Symptom-Navigator ist für genau diese Zwischenzone gemacht: Du schlägst nach, was du beobachtest, und bekommst eine Einordnung, samt der klaren Ansage, wann Selbermachen aufhört.",
    ],

    inhaltAugenbraue: "So arbeitest du damit",
    inhaltTitel: "Nachschlagen statt raten.",
    inhalte: [
      {
        titel: "Vom Symptom zur Ursache",
        text: "Du gehst von dem aus, was du siehst, nicht von einer Diagnose, die du noch gar nicht hast.",
      },
      {
        titel: "Was dahinterstecken kann",
        text: "Die möglichen Ursachen, nach Wahrscheinlichkeit geordnet, nicht nach Dramatik.",
      },
      {
        titel: "Was du selbst tun kannst",
        text: "Konkrete Schritte für die Fütterung und die Haltung, bevor etwas Größeres nötig wird.",
      },
      {
        titel: "Wann der Tierarzt gebraucht wird",
        text: "Klar benannt. Ein Nachschlagewerk, das diese Grenze verschweigt, ist gefährlich.",
      },
    ],

    einblickTitel: "Elf Bereiche, achtundfünfzig Themen.",
    einblickText:
      "Du tippst ein, was du beobachtest, oder blätterst durchs Register. Die Suche kennt auch die Fachbegriffe: „Dysbiose“ führt zur Darmflora, „Laminitis“ zur Hufrehe.",
    einblicke: [
      {
        datei: "uebersicht.webp",
        alt: "Die Startseite des Symptom-Navigators mit Suchfeld und den Bereichen Darm, Magen, Stoffwechsel und Gelenkgesundheit",
        text: "Vom Suchfeld oder über das Register nach Körperbereich. Zu jedem Thema findest du Fütterung, Anwendung, natürliche Begleitung und den Punkt, ab dem der Tierarzt dran ist.",
      },
    ],

    fuerWenTitel: "Für wen das gemacht ist",
    fuerWen: [
      "Für dich, wenn du Dinge an deinem Pferd bemerkst und sie einordnen können willst, ohne bei jeder Kleinigkeit anzurufen.",
      "Für dich, wenn du im Stall diejenige bist, die gefragt wird, und gern etwas Belastbares zur Hand hättest.",
      "Nicht für dich, wenn du eine Diagnose erwartest. Das kann und darf kein Nachschlagewerk leisten, dafür gibt es Tierärztinnen.",
    ],

    abschlussTitel: "Dauerhafter Zugang, immer griffbereit.",
    abschlussText:
      "Du schlägst darin nach, wenn du es brauchst, auch in zwei Jahren noch, auch beim nächsten Pferd.",
  },

  // -------------------------------------------------------------------------
  // RatioPro, 69 €
  // -------------------------------------------------------------------------
  ratiopro: {
    augenbraue: "Das Werkzeug",
    ueberschrift: "RatioPro",
    seitentitel:
      "RatioPro: Rationen für dein Pferd berechnen und Nährstoffe ausgleichen",
    einleitung: [
      "Rationen berechnen, Nährstoffe ausgleichen und die Fütterung deines Pferdes optimieren.",
      "Der Rechner, der versteht, was dein Pferd wirklich braucht. Unbegrenzt viele Berechnungen, dauerhafter Zugang.",
    ],

    problemAugenbraue: "Warum das nötig ist",
    problemTitel: "Rechnen kann man das. Nur macht es niemand.",
    problem: [
      "Eine Ration von Hand durchzurechnen ist keine Hexerei, aber es ist ein Abend mit Taschenrechner, Herstellertabellen und der Frage, welche Bedarfswerte denn nun gelten.",
      "Deshalb bleibt es bei den meisten beim Gefühl und bei der Empfehlung auf der Verpackung. Und deshalb fällt niemandem auf, wenn ein Nährstoff seit Monaten fehlt oder deutlich zu hoch liegt.",
      "RatioPro nimmt dir das Rechnen ab, nicht das Entscheiden. Du siehst in Minuten, wo deine Ration steht, und kannst ausprobieren, was eine Änderung bewirkt.",
    ],

    inhaltAugenbraue: "Was es kann",
    inhaltTitel: "Deine echte Ration, nicht die von der Verpackung.",
    inhalte: [
      {
        titel: "Mit den Daten deines Pferdes",
        text: "Gewicht, Alter, Arbeit, Besonderheiten. Nicht mit einer Faustregel für ein Durchschnittspferd.",
      },
      {
        titel: "Mehrere Futtermittel kombinieren",
        text: "Heu, Kraftfutter, Mineralfutter und Zusätze zusammen gerechnet, so wie du wirklich fütterst.",
      },
      {
        titel: "Lücken und Überschüsse sehen",
        text: "Nicht nur, was fehlt. Auch, was zu viel ist, und das ist oft die teurere Erkenntnis.",
      },
      {
        titel: "Unbegrenzt neu rechnen",
        text: "Beim nächsten Futterwechsel, beim nächsten Pferd, bei jeder gesundheitlichen Veränderung.",
      },
    ],

    einblickTitel: "Drei Schritte, ein Ergebnis.",
    einblickText:
      "Pferd beschreiben, Futter auswählen, Versorgung ablesen. Die Balken zeigen dir, was gedeckt ist und was fehlt.",
    einblicke: [
      {
        datei: "rechner.webp",
        alt: "RatioPro mit Bedarfsberechnung links und der Futtermittelliste rechts",
        text: "Links die Angaben zu deinem Pferd, rechts die Futtermittel zum Anklicken. Eigene Futtermittel kannst du ergänzen, wenn deins nicht in der Liste steht.",
      },
    ],

    fuerWenTitel: "Für wen das gemacht ist",
    fuerWen: [
      "Für dich, wenn du deine Fütterung ernsthaft prüfen und nicht bei jeder Frage jemanden bezahlen willst.",
      "Für dich, wenn du mehrere Pferde hast oder für andere berätst und regelmäßig rechnen musst.",
      "Nicht für dich, wenn du gar nicht rechnen, sondern ein fertiges Ergebnis willst. Dann ist Pferdeliebe 365 der bessere Weg.",
    ],

    abschlussTitel: "Einmalig zahlen, unbegrenzt rechnen.",
    abschlussText:
      "Kein Abo, keine Begrenzung der Berechnungen. Nach einer einzigen vermiedenen Fehlkauf-Entscheidung hat es sich getragen.",
  },
};

// -------------------------------------------------------------------------
// Pferdeliebe 365, 249 € statt 399 €
// Der Text stammt wörtlich von Yasemin, 01.09.2026. Nur die Gliederung ist
// an die Vorlage angepasst, kein Satz umformuliert.
//
// ▸ ACHTUNG, DAS IST EINE DIENSTLEISTUNG, kein Kurs. Was das für den
//   Widerruf bedeutet, steht bei `art` in lib/digital.ts. Der Abschlusstext
//   sagt deshalb ausdrücklich, dass zuerst ein Fragebogen kommt und nicht
//   sofort ein Zugang.
// -------------------------------------------------------------------------
verkaufstexte["pferdeliebe-365"] = {
  augenbraue: "Die persönliche Begleitung",
  ueberschrift: "Pferdeliebe 365",
  seitentitel:
    "Pferdeliebe 365: deine 1:1 Futterberatung als Gesundheitsakte",
  einleitung: [
    "Du möchtest die Fütterung deines Pferdes nicht nur einmal überprüfen lassen, sondern dein Pferd übers ganze Jahr begleiten und gesund durch jede Jahreszeit bringen?",
    "Anders als bei einer klassischen Einmalberatung, die nach dem ersten Plan endet, bekommst du hier eine echte Gesundheitsakte für dein Pferd. Auf rund 18 Seiten entsteht ein vollständiges Bild deines Pferdes, mit einem Saisonplan, der dich durch alle zwölf Monate führt, und Vorlagen, in denen du selbst weiterschreibst.",
    "Persönlich begleite ich dich in den vier Wochen nach der Erstellung, in denen der Plan bei euch ankommt und angepasst wird. Danach arbeitest du mit der Akte weiter, und wenn du wieder Unterstützung brauchst, etwa weil neue Blutwerte vorliegen, kannst du eine Nachberatung dazubuchen.",
  ],

  problemAugenbraue: "Warum eine Akte",
  problemTitel: "Ein Futterplan ist eine Momentaufnahme.",
  problem: [
    "Eine klassische Beratung endet mit einem Plan. Der passt genau so lange, wie sich nichts ändert. Dann kommt der Fellwechsel, ein neues Heu, eine Verletzung, und du stehst wieder da, wo du vorher warst.",
    "Deshalb entsteht hier keine einmalige Empfehlung, sondern eine Akte, in der du fortlaufend weiterschreibst: deine Beobachtungen, Fotos, Laborwerte. Du siehst schwarz auf weiß, wie sich dein Pferd Monat für Monat entwickelt. Die Akte gehört dir und läuft nicht ab.",
    "Damit jede Akte die Aufmerksamkeit bekommt, die sie verdient, nehme ich bewusst nur wenige Pferde gleichzeitig an.",
  ],

  inhaltAugenbraue: "Das erwartet dich",
  inhaltTitel: "Von der Bestandsaufnahme bis durchs Jahr.",
  inhalte: [
    {
      titel: "Gesundheitsindex über zwölf Bereiche",
      text: "Verdauung, Mineralversorgung, Fell und Haut, Hufqualität, Muskulatur, Stoffwechsel und mehr. Damit du auf einen Blick siehst, wo dein Pferd gerade steht.",
    },
    {
      titel: "Analyse und individueller Futterplan",
      text: "Eine ausführliche Analyse deiner aktuellen Fütterung und dein naturnaher Plan mit Rationsberechnung für eine sichere und ausgewogene Versorgung.",
    },
    {
      titel: "Umsetzungsplan, 30-Tage-Check und Saisonplan",
      text: "Schritt für Schritt, mit einem Check zum Nachhalten der ersten Wochen und einem Saisonplan, der dich durch alle zwölf Monate führt. Den Saisonplan arbeitest du selbst ab, er ist Teil der Akte.",
    },
    {
      titel: "Notfallplan, Symptomverlauf, Maßnahmenplan",
      text: "Für die Momente, in denen es schnell gehen muss, und um Veränderungen über die Zeit festzuhalten.",
    },
  ],
  // ▸ HIER STEHT SEIT DEM 02.09.2026 AUSDRÜCKLICH, WAS 365 BEDEUTET.
  //   Der Name und die Werbetexte lasen sich vorher wie ein Jahr persönliche
  //   Betreuung. Persönlich sind es vier Wochen; durchs Jahr führen die Akte
  //   und der Saisonplan. Beides steht jetzt nebeneinander, damit niemand
  //   etwas anderes erwartet, als er bekommt.
  //
  //   ▸ WENN SICH DER UMFANG ÄNDERT, ÄNDERT SICH AUCH DIESER TEXT. Sollte
  //     Yasemin später feste Termine übers Jahr zusagen (Heuanalyse,
  //     Blutbild, Jahresbilanz), gehört das hier hinein -- und dann darf auch
  //     der Preis steigen. Am 02.09.2026 hat sie sich ausdrücklich dagegen
  //     entschieden.
  inhaltSchluss:
    "Nach deiner Buchung erhältst du einen ausführlichen Fragebogen zu Haltung, aktueller Fütterung und Gesundheitszustand deines Pferdes, dazu bitte ich dich um ein paar Fotos. Sobald alle Unterlagen vollständig bei mir eingegangen sind, erstelle ich eure Gesundheitsakte. Danach begleite ich dich vier Wochen persönlich bei der Umsetzung und passe den Plan an, wenn es nötig wird. Was 365 bedeutet: Die Akte und der Saisonplan sind auf zwölf Monate angelegt, du arbeitest damit das ganze Jahr weiter. Meine persönliche Begleitung sind die vier Wochen; danach kannst du jederzeit eine Nachberatung dazubuchen.",

  fuerWenTitel: "Für wen Pferdeliebe 365 geeignet ist",
  fuerWen: [
    "Für dich, wenn du dein Pferd naturnah und bedarfsgerecht versorgen und dabei langfristig begleitet werden möchtest.",
    "Für dich, wenn bereits gesundheitliche Themen bestehen oder sich erste Auffälligkeiten zeigen, oder wenn du dir Struktur, Klarheit und Sicherheit in der Fütterung über das ganze Jahr wünschst.",
    "Für dich, wenn du bestehende Empfehlungen, etwa aus Labor, Tierarztbefund oder Bioresonanz, fachlich einordnen und sinnvoll umsetzen möchtest.",
    "Nicht für dich, wenn du das ganze Jahr über durchgehend Rückfragen stellen möchtest. Meine persönliche Begleitung sind die vier Wochen nach der Erstellung, danach führen dich die Unterlagen. Und nicht für dich, wenn du nur schnell eine Antwort auf eine einzelne Frage brauchst, dafür ist der Aufwand auf beiden Seiten zu groß.",
  ],

  abschlussTitel: "Eine Akte, die mitwächst.",
  abschlussText:
    "Die Auswertungsdauer beträgt in der Regel bis zu 14 Werktage nach vollständigem Eingang aller Unterlagen. Die Beratung gilt pro Pferd. Nach der Buchung bekommst du zuerst den Fragebogen, nicht sofort einen Zugang.",
};

/** Den Verkaufstext zu einem Produkt holen, oder undefined. */
export function verkaufstextZu(slug: string): Verkaufstext | undefined {
  return verkaufstexte[slug];
}
