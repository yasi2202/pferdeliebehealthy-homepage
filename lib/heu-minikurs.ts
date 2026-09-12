// ---------------------------------------------------------------------------
// Der Minikurs „Heu 2026“: was Formular und Server gemeinsam brauchen.
//
// Eine eigene kleine Datei, weil das Formular im Browser läuft und
// lib/heu-minikurs-server.ts dort nicht hin darf (Schlüssel). So steht der
// Wortlaut des Häkchens trotzdem nur an einer Stelle.
// ---------------------------------------------------------------------------

/**
 * Der Wortlaut des Häkchens, so wie er angezeigt UND gespeichert wird. Wer ihn
 * ändert, ändert eine rechtliche Zusage: Er deckt ausdrücklich auch die Tipps
 * nach dem Minikurs ab, deshalb stehen diese Adressen in `alle_anmeldungen`.
 */
export const EINWILLIGUNG_HEU_MINIKURS =
  "Ja, schick mir den kostenlosen Minikurs Heu 2026 und danach Tipps rund um Fütterung und " +
  "Pferdegesundheit per E-Mail. Ich kann mich jederzeit mit einem Klick wieder abmelden.";

/** Die fünf Mails, so wie sie die Anmeldeseite ankündigt. Die Betreffzeilen
 *  stehen genauso in der Strecke „Minikurs Heu 2026“ unter /admin/newsletter. */
export const HEU_MINIKURS_MAILS = [
  { titel: "Den Zucker siehst du deinem Heu nicht an", text: "Was mir in den Heuanalysen dieses Jahres als Erstes aufgefallen ist." },
  { titel: "Die fünf Werte, auf die ich zuerst schaue", text: "Zucker und Fruktan, Eiweiß, Natrium, Kupfer und Zink, Calcium zu Phosphor. Und die Werte, die gar nicht draufstehen." },
  { titel: "Keine Heuanalyse? Das kannst du trotzdem tun", text: "Wiegen, mit zwei Heus rechnen statt mit einem Durchschnitt, und was ein Refraktometer leisten kann." },
  { titel: "So lässt du dein Heu untersuchen", text: "Wann, wie viel, in welche Tüte, und welche Pakete du beim Labor ankreuzt." },
  { titel: "Wie es für dich weitergeht", text: "Zwei Wege, je nachdem, ob bei dir eine Analyse auf dem Tisch liegt oder nicht." },
];
