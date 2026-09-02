// ---------------------------------------------------------------------------
// Kundenstimmen und die Google-Bewertung.
//
// ▸ WOHER DIE STIMMEN KOMMEN
//   Aus dem Google-Unternehmensprofil, abgeschrieben am 02.09.2026. Sie sind
//   dort öffentlich, dürfen also zitiert werden, solange sie WÖRTLICH und
//   UNVERÄNDERT bleiben. Auch Tippfehler und Eigenheiten stehen deshalb so
//   da, wie die Kundinnen sie geschrieben haben. Kürzen ist erlaubt, aber nur
//   mit „…" und ohne den Sinn zu drehen.
//
// ▸ NUR VORNAMEN. So von Yasemin gewünscht. Bei Google stehen die vollen
//   Namen, hier bewusst nicht: Wer eine Bewertung schreibt, rechnet nicht
//   damit, mit Nachnamen auf einer Verkaufsseite zu stehen.
//
// ▸ DIE GESAMTNOTE WIRD ZURZEIT NICHT ANGEZEIGT, und Sterne auch nicht.
//   Beides stand kurz auf den Seiten und ist am 02.09.2026 wieder
//   verschwunden, siehe components/Stimmen.tsx. Gezeigt werden nur die
//   Zitate.
//
// ▸ EINZELNE STERNE JE STIMME STEHEN AUCH NICHT DRAN. Sie müssten gepflegt
//   werden und sagen weniger als der Satz, den die Kundin geschrieben hat.
//
// ▸ ES IST EINE AUSWAHL, KEINE VOLLSTÄNDIGE LISTE. Der Abschnitt sagt das
//   auch und verweist aufs Google-Profil. Wer eine Auswahl zeigt und dabei
//   den Eindruck erweckt, das seien alle, wirbt irreführend. Unter den
//   zwanzig Bewertungen ist auch eine mit drei Sternen; sie steht hier nicht,
//   aber der Verweis auf das Profil daneben macht sie auffindbar.
//
// ▸ NICHT ÜBERNOMMEN wurden Stimmen, die bei Google nur angerissen sind
//   („… Mehr"). Ein halber Satz ist als Zitat wertlos und als gekürztes
//   Zitat angreifbar. Wenn die vollen Texte vorliegen, können sie hier
//   dazukommen: Pia, SaSa und Koray.
// ---------------------------------------------------------------------------

export type Stimme = {
  zitat: string;
  name: string;
  /** Worauf sie sich bezieht. Kurz halten, steht klein unter dem Namen. */
  rolle: string;
  /**
   * Zu welchen Produkten die Stimme passt. Fehlt die Angabe, passt sie
   * überall. Die Slugs sind die aus lib/digital.ts.
   */
  produkte?: string[];
};

/**
 * Die Gesamtbewertung im Google-Unternehmensprofil, Stand 02.09.2026.
 *
 * ▸ WIRD ZURZEIT NICHT ANGEZEIGT. Am 02.09.2026 auf Yasemins Wunsch aus dem
 *   Stimmen-Abschnitt genommen: Zwanzig Bewertungen sehen nach wenig aus,
 *   auch wenn die Note hervorragend ist. Die Werte bleiben hier stehen,
 *   damit die Zeile zurückkann, sobald mehr Bewertungen da sind; dann bitte
 *   beide Zahlen prüfen, bevor sie wieder auf elf Seiten stehen.
 */
export const googleBewertung = {
  note: "4,9",
  anzahl: 20,
  // ▸ HIER DIE ADRESSE DES EIGENEN GOOGLE-PROFILS EINTRAGEN, dann wird aus
  //   der Zahl ein anklickbarer Beleg. Solange sie fehlt, steht die Note
  //   ohne Link da; das ist zulässig, aber schwächer.
  url: "",
};

/** Alle Kurse und Hefte, für die eine allgemeine Kursstimme passt. */
const ALLE_KURSE = [
  "salzratgeber",
  "magen-reset",
  "darmaufbau",
  "mineral-klarheit",
  "ganzjahresfutterplan",
  "basisfutterkurs",
];

// ▸ WER EIN PRODUKT BEIM NAMEN NENNT, GEHÖRT NUR AUF DESSEN SEITE.
//   Am 02.09.2026 stand Carolins Satz über den Ganzjahresfutterplan auch
//   beim Salzratgeber und beim Magen Reset, und Viviens Satz über den
//   Darmaufbau beim Basisfutterkurs. Das fällt sofort auf und macht aus
//   einer echten Stimme eine, die hingebogen wirkt.
//
//   Also: Nennt eine Stimme ein Produkt, steht sie nur dort. Nur Stimmen,
//   die von Yasemin allgemein sprechen (Erreichbarkeit, Wissen, „ihre
//   Kurse"), dürfen bei mehreren stehen.
//
// ▸ DIE REIHENFOLGE ENTSCHEIDET, WAS ZU SEHEN IST.
//   `stimmenZu` nimmt die ersten beiden, die zum Produkt passen. Deshalb
//   stehen die Stimmen mit einem konkreten Ergebnis oben und die allgemeinen
//   darunter: „meine Stute war das erste Mal seit Jahren trocken" trägt
//   weiter als „tolle Kurse".
//
// ▸ DIE ERSTEN SECHS STAMMEN AUS MAILS, NICHT AUS GOOGLE.
//   Sie haben Yasemin privat geschrieben. Alle sechs wurden am 02.09.2026
//   gefragt und haben zugestimmt, dass ihr Satz mit Vornamen auf der Seite
//   stehen darf. Ohne diese Zusage darf hier nichts hinein: Lob aus einer
//   privaten Mail ist keine Veröffentlichung.
export const stimmen: Stimme[] = [
  {
    // Die stärkste Stimme überhaupt: ein Ergebnis, das man nachfühlen kann.
    // Wer Kotwasser kennt, weiß, was „konstant trocken" heißt.
    zitat:
      "Letztes Jahr gab es einen großen Darmaufbau von Dir. Damit war meine " +
      "Stute das erste Mal seit Jahren konstant trocken ❤️ Generell fressen " +
      "sie langsamer, äppeln weniger und verwerten besser.",
    name: "Vivien",
    rolle: "über den Darmaufbau",
    produkte: ["darmaufbau"],
  },
  {
    // Der Vergleich mit einem Mitbewerber. So etwas kann man selbst nicht
    // schreiben, und es beantwortet die Frage „warum bei ihr und nicht
    // woanders" besser als jeder eigene Satz.
    // ▸ ZWEI KORREKTUREN AM WORTLAUT, und nur diese zwei:
    //   Im Original steht „Ich liebe des Ganzjahresfutterplaner … gekauft
    //   habe sehr". Das ist ein Vertipper und ein nachgestelltes „sehr" aus
    //   einer schnell geschriebenen Mail. Auf einer Verkaufsseite liest sich
    //   das nicht wie ein Zitat, sondern wie ein Fehler auf der Seite selbst,
    //   und es lenkt vom Inhalt ab.
    //
    //   Geändert sind deshalb „des" zu „den" und das hängende „sehr" ist
    //   weg. Kein Wort dazu, keine Aussage gedreht. Alles andere steht
    //   wörtlich so da, wie Carolin es geschrieben hat, auch
    //   „Ganzjahresfutterplaner" mit -er am Ende.
    zitat:
      "Ich liebe den Ganzjahresfutterplaner und auch die anderen Ratgeber, " +
      "die ich bisher bei dir gekauft habe. Sie bieten sowohl " +
      "Hintergrundwissen wie auch konkrete Anleitung, was mir sehr gut " +
      "gefällt. Ich habe auch einen Ganzjahresplaner einer anderen Dame " +
      "gekauft und muss sagen, dass er nicht mal im Ansatz an deinen " +
      "herankommt.",
    name: "Carolin",
    rolle: "über den Ganzjahresfutterplan",
    produkte: ["ganzjahresfutterplan"],
  },
  {
    // Für RatioPro gab es vorher keine einzige Stimme.
    zitat:
      "Deine Tools entwickeln sich richtig super. Es macht richtig Spaß " +
      "damit zu arbeiten. Für meine vier Seniorenponys ein wirklich schönes " +
      "Helferlein!",
    name: "Stefanie",
    rolle: "über den Rationsrechner",
    produkte: ["ratiopro"],
  },
  {
    // ▸ DIESE STIMME IST MIT ABSICHT NICHT GLATT.
    //   „Man muss sich Zeit nehmen und selber denken" klingt erst wie ein
    //   Einwand, ist aber der Grund, warum man ihr glaubt. Und es stimmt:
    //   Ein Rechner, der einem das Denken abnimmt, wäre gelogen.
    zitat:
      "Man muss sich schon viel Zeit nehmen und selber denken, trotzdem bin " +
      "ich echt begeistert 😃",
    name: "Anna",
    rolle: "über den Rationsrechner",
    produkte: ["ratiopro"],
  },
  {
    zitat:
      "Ich freue mich richtig, wenn ich an dem Kurs arbeiten kann. Das ist " +
      "so viel Wissen, verständlich zusammengefasst. Ich bin total begeistert " +
      "und würde den Kurs uneingeschränkt weiterempfehlen. Richtig top!",
    name: "Juliane",
    rolle: "Teilnehmerin der Ausbildung",
    produkte: ["ausbildung"],
  },
  {
    zitat:
      "Ich bin super begeistert von dem ganzen Layout. Der Inhalt war davor " +
      "ja schon mega, aber so sieht alles super hochwertig und toll aus. Auch " +
      "die ganzen Reflexionsfragen sind richtig gut.",
    name: "Hanna",
    rolle: "über die Akademie",
    produkte: ["ausbildung", "basisfutterkurs", "mineral-klarheit"],
  },
  {
    // Die stärkste Stimme im Bestand: nennt ein konkretes Ergebnis, und
    // Kotwasser ist genau das Thema vom Darmaufbau.
    zitat:
      "Ich kann Yasi wärmstens empfehlen. Sie hat ein Riesen Wissen und gibt " +
      "dieses weiter um einen zu helfen. Dank ihr sind wir die Kotwasser " +
      "Problematik los und die Kacki hat endlich Form 😍 sie nimmt sich die " +
      "Zeit für alle Fragen, auch wenn man sie mehrmals stellen muss weil man " +
      "schwer von Begriff ist. 🙈😁 danke für deinen Einsatz den du wirklich " +
      "mit Herzblut machst ❤️",
    name: "Emmi",
    rolle: "über die Beratung",
    produkte: [
      "darmaufbau",
      "pferdeliebe-365",
      "basisfutterkurs",
      "magen-reset",
      // Kotwasser ist genau eines der Zeichen, die man im Navigator
      // nachschlägt. Die Stimme passt dort also inhaltlich, auch wenn sie
      // nicht vom Werkzeug selbst spricht.
      "symptom-navigator",
    ],
  },
  {
    zitat:
      "In letzter Zeit habe ich mich viel mit dem Thema Pferdefütterung " +
      "beschäftigt und bin zufällig auf „pferdeliebehealthy\" bei Instagram " +
      "gestoßen. Schnell merkte ich, dass sie ein riesen Wissen hat und ihr " +
      "Wissen auch für Menschen rüber bringt, die vielleicht gerne mal etwas " +
      "Begriffstutzig sind. Mittlerweile habe ich diverse von ihren Kursen und " +
      "eBooks gekauft und kann euch nur an Herz legen, es selber mal probieren.",
    name: "Nui",
    rolle: "über Kurse und E-Books",
    produkte: ALLE_KURSE,
  },
  {
    zitat:
      "Auf Instagram bin ich auf die Produkte gestoßen und habe mir ein paar " +
      "Online Kurse und auch Futtermittel bestellt. Die Onlinekurse sind sehr " +
      "übersichtlich aufgebaut und gut zu verstehen.",
    name: "Alina",
    rolle: "über die Onlinekurse",
    produkte: ALLE_KURSE,
  },
  {
    zitat:
      "Yasi hat immer ein offenes Ohr für sämtliche Fragen und Probleme! Ich " +
      "hab viel von ihr und ihren Kursen gelernt und fühle mich auf jeden Fall " +
      "bestens betreut! 🫶🏻",
    name: "Anja",
    rolle: "über die Betreuung",
    // Sie spricht über Erreichbarkeit und Betreuung, nicht über ein
    // bestimmtes Produkt. Deshalb steht sie auch bei den Werkzeugen: Wer
    // 69 Euro für einen Rechner ausgibt, will wissen, ob jemand antwortet,
    // wenn etwas klemmt.
    produkte: [
      ...ALLE_KURSE,
      "pferdeliebe-365",
      "symptom-navigator",
      "ratiopro",
      "equidesk",
    ],
  },
  {
    zitat:
      "Ich habe schon so viel bei Yasmine gekauft und bin immer wieder von den " +
      "Produkten überzeugt. Egal ob es die Bücher, Kräuter oder das neue tolle " +
      "Mineralfutter ist. Wenn ich etwas für meine Pferde brauche, schaue ich " +
      "als erstes hier im Shop.",
    name: "Simone",
    rolle: "über die Hefte",
    produkte: ["salzratgeber", "magen-reset", "darmaufbau", "mineral-klarheit"],
  },
  {
    zitat: "Tolle kurse nur weiterzuempfehlen 🤗",
    name: "Merima",
    rolle: "über die Kurse",
    produkte: ALLE_KURSE,
  },
  {
    // Steht seit jeher auf der Startseite, siehe components/TestimonialSection.
    zitat:
      "Ich habe meine Ausbildung bei euch gemacht und dabei unglaublich viel " +
      "gelernt. So viel, dass ich mich mittlerweile sogar noch zur " +
      "Aromatherapeutin bei euch ausbilden lasse.",
    name: "Marion",
    rolle: "Teilnehmerin der Ausbildung",
    // Auch bei EquiDesk: Das ist das Werkzeug für Beraterinnen, und wer es
    // kauft, hat meist genau diesen Weg vor sich.
    produkte: ["ausbildung", "equidesk"],
  },
];

/**
 * Die Stimmen zu einem Produkt, höchstens `wieviele`.
 *
 * Gibt es keine passende, kommt eine leere Liste zurück und der Abschnitt
 * zeigt sich gar nicht. Lieber keine Stimme als eine, die nicht zum Angebot
 * gehört: Wer beim Rechenwerkzeug etwas über Kräuter liest, glaubt ihr nicht.
 */
export function stimmenZu(slug: string, wieviele = 2): Stimme[] {
  return stimmen
    .filter((s) => !s.produkte || s.produkte.includes(slug))
    .slice(0, wieviele);
}

/**
 * Die Stimmen für die Startseite.
 *
 * ▸ HANDVERLESEN, NICHT DIE ERSTEN VIER.
 *   Auf einer Produktseite zählt, dass die Stimme zum Produkt passt. Auf der
 *   Startseite zählt die Mischung: ein Ergebnis, ein Vergleich, jemand aus
 *   der Ausbildung, jemand über die Betreuung. Nähme man einfach die ersten
 *   vier der Liste, stünden dort zweimal hintereinander Stimmen über den
 *   Rationsrechner.
 */
export function stimmenStartseite(): Stimme[] {
  const wunsch = ["Vivien", "Carolin", "Juliane", "Emmi"];
  return wunsch
    .map((n) => stimmen.find((s) => s.name === n))
    .filter((s): s is Stimme => Boolean(s));
}
