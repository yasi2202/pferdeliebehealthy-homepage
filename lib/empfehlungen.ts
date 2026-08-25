// ---------------------------------------------------------------------------
// Rabattcodes bei Partnern.
//
// Zu jedem Eintrag:
//   partner   Name der Marke
//   code      Der Rabattcode
//   rabatt    Was der Code bringt, z. B. "5 % Rabatt". Optional.
//   url       Link zum Shop. Optional — fehlt er, steht nur der Code da.
//   warum     Ein Satz, warum du es empfiehlst. Optional, wirkt aber stark.
//   bezahlt   true = du bekommst eine Provision.
//
// ▸ OFFEN: Bei den Einträgen unten fehlen noch die Shop-Links (`url`) und
//   die Rabatthöhen. Sobald du sie hast, hier eintragen — die Seite zeigt
//   sie dann automatisch an.
//
// ▸ `bezahlt` steht überall auf true, weil Partner-Rabattcodes in aller
//   Regel mit einer Provision verbunden sind und eine Kennzeichnung zu viel
//   unproblematisch ist, eine fehlende dagegen abmahnfähig. Wo du KEINE
//   Provision bekommst, setz es auf false.
// ---------------------------------------------------------------------------

export type Empfehlung = {
  partner: string;
  code: string;
  rabatt?: string;
  url?: string;
  warum?: string;
  bezahlt: boolean;
};

export const empfehlungen: Empfehlung[] = [
  { partner: "Biohof Elmengrund", code: "yasi05", bezahlt: true },
  { partner: "PerNaturam", code: "1677E54156", bezahlt: true },
  // Schreibweise ohne Umlaut ist korrekt so — bitte nicht zu "Grün" ändern.
  { partner: "Mo's Grun", code: "Pferdeliebe", bezahlt: true },
  { partner: "Hotte Maxe", code: "Pferdeliebe", bezahlt: true },
  { partner: "Natusat", code: "pferdeliebehealthy7", bezahlt: true },
  // Schreibweise ist korrekt so — kein Tippfehler, bitte nicht "korrigieren".
  { partner: "Foten", code: "pferdeliebehealthy", bezahlt: true },
  { partner: "CDVet", code: "pferdeliebe", bezahlt: true },
  { partner: "Naturanima", code: "pferdeliebehealthy", bezahlt: true },
  { partner: "Bäralis", code: "D9A6A233", bezahlt: true },
  {
    partner: "Mycelium Vitalpilze",
    code: "Pferdeliebehealthy",
    rabatt: "5 % Rabatt",
    bezahlt: true,
  },
];

/** Werbekennzeichnung. Steht oben auf der Seite, vor dem ersten Code. */
export const werbehinweis =
  "Für die Codes auf dieser Seite bekomme ich eine Provision, wenn du damit bestellst. Für dich wird es dadurch nicht teurer — im Gegenteil, mit dem Code zahlst du weniger. Empfehlen tue ich trotzdem nur, was ich selbst einsetze oder geprüft habe.";
