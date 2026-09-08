// ---------------------------------------------------------------------------
// Die Warteliste für die Ausbildung Ganzheitliche Pferdefütterung.
//
// ▸ WOZU DIESE DATEI:
//   Diese Menschen haben sich selbst in eine Warteliste für die Ausbildung
//   eingetragen, teils Jahre bevor es sie gab. Sie stehen in keiner Tabelle
//   in Supabase, denn die drei Systeme, die die Listen führten, gibt es
//   nicht mehr: Tentary, alfima und ThriveCart. Die Adressen liegen nur noch
//   in den Ausfuhrdateien in "08 Kundendaten und Exporte".
//
// ▸ WARUM ALS LISTE IM CODE UND NICHT ALS TABELLE:
//   Dieselbe Überlegung wie bei der Mailsperre weiter unten in
//   lib/newsletter-gruppen.ts. Eine neue Tabelle müsste Yasemin von Hand im
//   SQL Editor anlegen, und diese Liste kann ohnehin nicht mehr wachsen:
//   Alle drei Quellsysteme sind abgeschaltet. Sie ist abgeschlossen, nicht
//   laufend. Kommt später ein eigenes Wartelistenformular dazu, gehört das
//   in eine Tabelle, und diese Datei wird dann der Altbestand daneben.
//
// ▸ WER HIER NICHT STEHT, und das ist der Sinn der Sache:
//   Wer die Ausbildung inzwischen gekauft hat. Am 08.09.2026 waren das 28
//   der ursprünglich 95 Adressen. Eine Angebotsmail an eine Kundin, die das
//   Angebot längst gekauft hat, ist der peinlichste aller Fehler.
//   Ebenfalls nicht dabei: eine abgemeldete Adresse, und die zweite Adresse
//   von Lena Busse (piriapollo23@gmail.com neben bu.lena2002@gmail.com),
//   die am 21.08.2026 dieselbe Mail zweimal bekommen hat.
//
// ▸ DIE PRÜFUNG GEGEN DIE AUSBILDUNG PASSIERT TROTZDEM BEI JEDEM VERSAND,
//   nicht nur hier beim Zusammenstellen. Wer zwischendurch bucht, fällt
//   automatisch heraus. Siehe wartelisteAusbildung() in
//   lib/newsletter-gruppen.ts.
//
// ▸ RECHTSGRUNDLAGE: Die Eintragung in die Warteliste ist eine Bitte um
//   Nachricht zu genau diesem Angebot. 39 der 66 sind zusätzlich
//   Bestandskundinnen mit einem Kurskonto. Für die übrigen trägt allein die
//   Wartelisteneintragung, deshalb darf diese Gruppe auch nur Post zur
//   Ausbildung bekommen, nicht zu beliebigen anderen Angeboten.
// ---------------------------------------------------------------------------

/** Alle Adressen der Warteliste, kleingeschrieben, ohne Doppelte.
 *  Stand 08.09.2026: 66 Adressen. */
export const WARTELISTE_AUSBILDUNG: string[] = [
  // Aus ThriveCart, Produkt "Warteliste - Ausbildung Natürliche
  // Pferdefütterung" (Ausfuhr vom 16.03.2026).
  "aldaum75@gmail.com",
  "barbto@posteo.de",
  "boeselkristina@gmail.com",
  "clsudia80@icloud.com",
  "crazy-house@gmx.de",
  "denise.gessner310@gmail.com",
  "franziska.menzel@yahoo.de",
  "hamprecht-sophia@t-online.de",
  "holtmannchristina26@gmail.com",
  "info@reitunterricht-laubner.de",
  "jana.scondo@gmail.com",
  "justine230397@gmail.com",
  "konopkanadine1708@gmail.com",
  "laura.rm16@icloud.com",
  "natasa.curkovic@puma.com",
  "paula.gerstung@icloud.com",
  "rebeccaliebermann@mail.de",
  "sophia.huebl@gmail.com",
  "sophieschreiber25@gmail.com",
  "sylvia.schwarz.gz@gmail.com",
  "thp.schich@googlemail.com",
  "tierphysio.jost-baruth@gmx.de",
  "vsiragusano@googlemail.com",
  "vwaehler@googlemail.com",

  // Aus Tentary, Produkt "Warteliste Masterclass Ganzheitliche
  // Pferdefütterung" (Ausfuhren bis 27.08.2026).
  "annina.chapalay@bluewin.ch",
  "bonny.wuethrich@gmx.ch",
  "bu.lena2002@gmail.com",
  "emma.gnauck@gmx.de",
  "iris.thiemann@freenet.de",
  "katharina.kuehl25@gmail.com",
  "mederalexa13@gmail.com",
  "monique.leffin@gmx.net",
  "s4hh@gmx.de",
  "sabinerieder.mail@gmail.com",
  "silvia.bartz2@freenet.de",
  "sirikit2@gmx.at",
  "susanne.larsen@gmx.net",
  "yj.mueller@protonmail.com",
  "ziehausstefanie@gmail.com",

  // Aus alfima, Produkt "Warteliste Ausbildung Ganzheitliche
  // Ernährungsberaterin für Pferde" (Ausfuhr vom 31.08.2026).
  "lara-ka@web.de",
  "vanessa.sellin@gmx.de",

  // ▸ DIESE 25 STEHEN IN KEINER AUSFUHRDATEI ALS WARTELISTE.
  //   Sie stammen aus Yasemins eigenem Bcc-Verteiler der Mail "Deine Chance
  //   als Testkundin" vom 21.08.2026, die genau an die Warteliste ging. Sie
  //   hat sie dort selbst zusammengestellt, vermutlich aus Anfragen per Mail
  //   und Instagram. Die Mail haben sie bereits bekommen.
  //
  //   Acht von ihnen haben weder ein Kurskonto noch eine bestätigte
  //   Anmeldung: franziska.gerstenkorn@gmx.de, jessica.zeller1@gmx.de,
  //   juliajill98@gmail.com, mueller_rosemarie@gmx.at,
  //   natascha.mohns@epd-bau.de, saholetti@gmail.com,
  //   sandra.reinhalter@gmail.com, traumfaengerin45@yahoo.de.
  //   Für sie gibt es also keinen Beleg ausser dem Verteiler selbst. Wenn du
  //   sie nicht mehr anschreiben willst, streich sie hier heraus.
  "akrahforst@googlemail.com",
  "anjkunz@googlemail.com",
  "celine-markmann@gmx.de",
  "dusty5@gmx.de",
  "franziska.gerstenkorn@gmx.de",
  "fzj1985@web.de",
  "jenniferluebeck@gmx.de",
  "jessica.zeller1@gmx.de",
  "juliajill98@gmail.com",
  "kappasche@aol.com",
  "knoedler-daniela@gmx.de",
  "maren.schmid@gmx.at",
  "melanie.dannenberg@t-online.de",
  "melli261282@web.de",
  "mr_stromer@web.de",
  "mueller_rosemarie@gmx.at",
  "natascha.mohns@epd-bau.de",
  "sabrinatiedtke@aol.com",
  "saholetti@gmail.com",
  "sandra.reinhalter@gmail.com",
  "sarah1209@gmx.net",
  "sina2509@live.de",
  "sofie.lehmann2006@gmx.de",
  "tabea@schuckeria.de",
  "traumfaengerin45@yahoo.de",
];
