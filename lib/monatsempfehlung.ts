// ---------------------------------------------------------------------------
// Die Empfehlung des Monats — der Banner oben im Insider-Bereich.
//
// ▸ HIER MUSST DU JEDEN MONAT RAN:
//   Ändere `monat`, `ueberschrift` und `text`. Der Rabattcode kommt
//   automatisch aus lib/empfehlungen.ts, du trägst unter `partner` nur den
//   Namen ein, der dort steht — dann kann der Code nie auseinanderlaufen.
//
//   Willst du gerade keinen Banner zeigen, setz `aktiv` auf false. Dann
//   verschwindet er, ohne dass etwas gelöscht werden muss.
//
// ▸ Der Banner ist als Werbung gekennzeichnet, weil du für den Code eine
//   Provision bekommst. Das muss so — eine Kennzeichnung zu viel ist
//   unproblematisch, eine fehlende ist abmahnfähig.
// ---------------------------------------------------------------------------

export const monatsempfehlung = {
  aktiv: true,

  /** Steht klein über der Überschrift. */
  monat: "Diesen Monat",

  ueberschrift: "Amara Bitterkräuter von PerNaturam",

  /** Muss genau so heißen wie der `partner` in lib/empfehlungen.ts —
   *  darüber wird der Rabattcode geholt. */
  partner: "PerNaturam",

  text:
    "Der Übergang von der Weide zurück aufs Heu ist für den Verdauungstrakt eine " +
    "größere Umstellung, als er von außen aussieht. Die Amara Bitterkräuter " +
    "unterstützen genau in dieser Phase, deshalb sind sie mein Tipp für diesen " +
    "Monat.",

  /** Der Anschluss ans eigene Angebot. Schlüssel aus lib/angebote.ts. */
  angebot: "ganzjahresfutterplan",
  angebotText:
    "Und wenn du genau wissen willst, wie du dein Pferd in jedem Monat fütterst, statt es jedes Mal neu zu erraten:",
};
