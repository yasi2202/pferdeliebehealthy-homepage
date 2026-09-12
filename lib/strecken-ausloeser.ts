import { digitalprodukte } from "@/lib/digital";

// ---------------------------------------------------------------------------
// Wer in eine Mailstrecke hineinläuft.
//
// ▸ DER AUSLÖSER IST EIN TEXT, KEINE LISTE IN DER DATENBANK.
//   Die Spalte `ausloeser` in newsletter_strecken ist ein freier Text ohne
//   Prüfregel. Ein neuer Auslöser braucht deshalb keine Änderung an der
//   Datenbank, nur einen Eintrag hier:
//     insider, futter-check, stall-organizer, alle   nach einer Anmeldung
//     futter-check:<typ>                             nur ein Futter-Check-Typ
//     kauf:<slug>                                    nach dem Kauf eines Produkts
//
// ▸ GEPRÜFT WIRD BEIM ANLEGEN, NICHT ERST BEIM VERSAND.
//   Ein Tippfehler hieße sonst: Die Strecke steht auf „läuft" und schickt nie
//   etwas. Bis 10.09.2026 wurde ein unbekannter Auslöser still zu „insider",
//   und genau so wurde aus einer neuen Stall-Organizer-Strecke eine
//   Insider-Strecke, weil „stall-organizer" in der Liste der Route fehlte.
//
// Die Datei läuft auch im Browser (Editor), deshalb nichts vom Server hier.
// ---------------------------------------------------------------------------

/** Die vier Typen des Futter-Checks, mit dem Titel, der in
 *  futter_check_anmeldungen.ergebnis_titel steht. Die Titel stammen aus
 *  public/futter-check.html (TYPES) und müssen dort genauso heißen, sonst
 *  findet eine Typ-Strecke niemanden mehr. */
export const FUTTER_CHECK_TYPEN = {
  durcheinander: "Durcheinander-Fütterer",
  mineral_blindflug: "Mineral-Blindflug",
  symptom_feuerwehr: "Symptom-Feuerwehr",
  auf_gutem_weg: "Auf gutem Weg",
} as const;

export type FutterCheckTyp = keyof typeof FUTTER_CHECK_TYPEN;

const ANMELDUNG: Record<string, string> = {
  insider: "wer sich für den Insider-Kanal einträgt",
  "futter-check": "wer den Futter-Check macht, egal mit welchem Ergebnis",
  "stall-organizer": "wer sich den Stall Organizer holt",
  // Seit 12.09.2026, Anmeldung auf /heu-2026, Tabelle heu_minikurs_anmeldungen.
  "heu-minikurs": "wer sich für den Minikurs Heu 2026 einträgt",
  alle: "jede neue Anmeldung, egal woher",
};

/** Die Produkte, nach deren Kauf eine Strecke starten kann.
 *
 *  Die Abos fehlen bewusst: Wer monatlich zahlt, soll nicht jeden Monat als
 *  „neuer Kauf" behandelt werden. */
export function kaufProdukte() {
  return digitalprodukte.filter((p) => !p.abo);
}

export function ausloeserTyp(a: string): FutterCheckTyp | null {
  if (!a.startsWith("futter-check:")) return null;
  const typ = a.slice("futter-check:".length);
  return (Object.keys(FUTTER_CHECK_TYPEN) as FutterCheckTyp[]).includes(typ as FutterCheckTyp)
    ? (typ as FutterCheckTyp)
    : null;
}

/** Der Slug des Produkts bei einer Kaufstrecke, sonst null. */
export function ausloeserKauf(a: string): string | null {
  if (!a.startsWith("kauf:")) return null;
  const slug = a.slice("kauf:".length);
  return kaufProdukte().some((p) => p.slug === slug) ? slug : null;
}

/** Gibt den Auslöser zurück, wenn es ihn gibt, sonst null. */
export function ausloeserPruefen(roh: string): string | null {
  const a = roh.trim();
  if (Object.keys(ANMELDUNG).includes(a)) return a;
  if (ausloeserTyp(a) || ausloeserKauf(a)) return a;
  return null;
}

/** Der Satz hinter „Läuft los für …". */
export function ausloeserText(a: string): string {
  if (Object.keys(ANMELDUNG).includes(a)) return ANMELDUNG[a];

  const typ = ausloeserTyp(a);
  if (typ) return `wer im Futter-Check „${FUTTER_CHECK_TYPEN[typ]}“ herausbekommt`;

  const slug = ausloeserKauf(a);
  if (slug) {
    const produkt = digitalprodukte.find((p) => p.slug === slug);
    return `wer ${produkt?.kurzname ?? slug} kauft und Post von dir bekommen möchte`;
  }

  return a;
}

/** Die Auswahl beim Anlegen, in Gruppen. */
export function ausloeserWahl(): { gruppe: string; optionen: { wert: string; text: string }[] }[] {
  return [
    {
      gruppe: "Nach einer Anmeldung",
      optionen: [
        { wert: "futter-check", text: "Futter-Check, alle Ergebnisse" },
        ...(Object.keys(FUTTER_CHECK_TYPEN) as FutterCheckTyp[]).map((typ) => ({
          wert: `futter-check:${typ}`,
          text: `Futter-Check, nur „${FUTTER_CHECK_TYPEN[typ]}“`,
        })),
        { wert: "stall-organizer", text: "Stall Organizer" },
        { wert: "heu-minikurs", text: "Minikurs Heu 2026" },
        { wert: "insider", text: "Insider-Kanal" },
        { wert: "alle", text: "Jede neue Anmeldung, egal woher" },
      ],
    },
    {
      gruppe: "Nach einem Kauf",
      optionen: [...kaufProdukte()]
        .sort((x, y) => x.preis - y.preis)
        .map((p) => ({ wert: `kauf:${p.slug}`, text: `Kauf: ${p.kurzname}` })),
    },
  ];
}

/** Die Zugangsschlüssel für „Nicht senden, wer das hier schon hat". */
export function zugangsWahl(): { wert: string; text: string }[] {
  const gesehen = new Set<string>();
  const liste: { wert: string; text: string }[] = [];
  for (const p of kaufProdukte()) {
    if (gesehen.has(p.erwarteterZugang)) continue;
    gesehen.add(p.erwarteterZugang);
    liste.push({ wert: p.erwarteterZugang, text: p.kurzname });
  }
  return liste;
}
