// ---------------------------------------------------------------------------
// Die bezahlten Werbekampagnen bei Meta, und wie ihre Zahlen zusammenkommen.
// Die Auswertung dazu steht unter /admin/werbung.
//
// ▸ ZWEI QUELLEN, DIE NICHTS VONEINANDER WISSEN
//   Was eine Anzeige gebracht hat, zählt die eigene Datenbank: Jede Anzeige
//   führt auf eine Seite mit ?von=meta-<name>, und dieser Name landet danach
//   in der Spalte `quelle`, bei Anmeldungen in `stall_anmeldungen`, bei
//   Käufen in `digitalbestellungen` (dorthin bringt ihn KasseLink über die
//   Kasse mit). Die Ausgaben kennt nur Meta. Sie kommen über die
//   Marketing-Schnittstelle, sobald META_ZUGRIFF gesetzt ist. Ohne den Zugang
//   zeigt die Seite die Ergebnisse trotzdem, nur eben ohne Kosten.
//
// ▸ DER TAG IST EIN META-TAG
//   Das Werbekonto 87791925 rechnet in der Zeitzone Los Angeles, ein Tag bei
//   Meta läuft deshalb von 9 bis 9 Uhr deutscher Zeit. Damit Ausgaben und
//   Ergebnisse zum selben Tag gezählt werden, sortiert diese Datei auch die
//   eigenen Zahlen nach dem Datum in Los Angeles. Wer hier auf Berliner Zeit
//   umstellt, vergleicht die Ausgaben vom Montag mit den Anmeldungen vom
//   Dienstag.
//
// ▸ EINE NEUE KAMPAGNE kommt als weiterer Eintrag unten in KAMPAGNEN dazu.
//   Die Auswertung zeigt vorne die letzte und bietet die übrigen zum Umschalten
//   an. Der Name jeder Anzeige muss genau dem Anzeigennamen im
//   Werbeanzeigenmanager entsprechen und zugleich dem Teil hinter `meta-` im
//   Link, sonst finden Ausgaben und Ergebnisse nicht zueinander.
// ---------------------------------------------------------------------------

export const WERBE_ZEITZONE = "America/Los_Angeles";

export type Kampagne = {
  /** Wie im Werbeanzeigenmanager. */
  name: string;
  /** Worauf die Kampagne zielt. Danach richtet sich, was als Ergebnis zählt:
   *  eine bestätigte Equista-Anmeldung oder ein bezahlter Kauf. */
  ziel: "anmeldungen" | "verkauf";
  /** Erster Meta-Tag, als JJJJ-MM-TT. */
  start: string;
  /** Wie viele Tage der Test laufen soll. */
  tage: number;
  budgetTag: number;
  /** Aufgeladenes Guthaben für diese Kampagne. Das Konto läuft mit
   *  Vorauszahlung, alle Kampagnen teilen sich dasselbe Guthaben. */
  guthaben: number;
  /** Kosten je Ergebnis, ab der eine Anzeige als zu teuer gilt. Eine gesetzte
   *  Grenze, kein Erfahrungswert. */
  grenze: number;
  /** Ab so vielen Ergebnissen lässt sich eine Anzeige beurteilen. Darunter
   *  ist der Preis je Ergebnis Zufall. */
  mindestens: number;
  anzeigen: { name: string; titel: string }[];
};

export const KAMPAGNEN: Kampagne[] = [
  {
    name: "Equista Leads 09/2026",
    ziel: "anmeldungen",
    start: "2026-09-10",
    tage: 14,
    budgetTag: 10,
    guthaben: 140,
    grenze: 3,
    mindestens: 10,
    anzeigen: [
      { name: "ordnung", titel: "Alles über dein Pferd an einem Ort" },
      { name: "termine", titel: "Der Termin meldet sich, nicht du" },
      { name: "futter", titel: "Reicht der Sack noch bis Freitag?" },
    ],
  },
];

/** Das Datum eines Zeitpunkts, gerechnet in der Zeitzone des Werbekontos. */
export function metaTag(zeitpunkt: string | Date): string {
  const d = typeof zeitpunkt === "string" ? new Date(zeitpunkt) : zeitpunkt;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: WERBE_ZEITZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** Ein Kalendertag plus n Tage, beides als JJJJ-MM-TT. Mittags gerechnet,
 *  damit die Zeitumstellung keinen Tag verschluckt. */
export function tagPlus(tag: string, n: number): string {
  const d = new Date(`${tag}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Wie viele Tage zwischen zwei JJJJ-MM-TT liegen. */
export function tageZwischen(von: string, bis: string): number {
  return Math.round(
    (new Date(`${bis}T12:00:00Z`).getTime() - new Date(`${von}T12:00:00Z`).getTime()) / 86400000,
  );
}

// ---------------------------------------------------------------------------
// Die Zahlen von Meta.
//
// ▸ DER ZUGANG steht in META_ZUGRIFF, das Werbekonto in META_WERBEKONTO
//   (ohne das „act_“ davor). Er braucht nur Leserechte (ads_read). Er liegt
//   ausschließlich auf dem Server: Die Auswertung wird dort gebaut, der
//   Browser sieht nur das fertige Ergebnis.
//
// ▸ DIE VERSION der Schnittstelle läuft bei Meta nach etwa zwei Jahren aus.
//   Meldet die Seite eines Tages „unsupported version“, reicht es, sie hier
//   hochzusetzen.
//
// ▸ WAS META ZÄHLT, steht unter `actions`. Die Pixel-Ereignisse heißen dort
//   „offsite_conversion.fb_pixel_…“, in manchen Konten nur unter einem
//   Sammelbegriff. Deshalb wird beides versucht. Meta zählt nur, wer
//   eingewilligt hat, die eigene Datenbank zählt alle.
// ---------------------------------------------------------------------------

const META_VERSION = "v23.0";

export type MetaZeile = {
  anzeige: string;
  tag: string;
  ausgabe: number;
  klicks: number;
  einblendungen: number;
  leads: number;
  kassen: number;
  kaeufe: number;
};

export type MetaErgebnis =
  | { stand: "nicht-verbunden" }
  | { stand: "fehler"; meldung: string }
  | { stand: "ok"; zeilen: MetaZeile[] };

type MetaAktion = { action_type: string; value: string };

type MetaRoh = {
  ad_name?: string;
  date_start?: string;
  spend?: string;
  impressions?: string;
  inline_link_clicks?: string;
  actions?: MetaAktion[];
};

function aktion(aktionen: MetaAktion[], pixel: string, sammel: string): number {
  const a =
    aktionen.find((x) => x.action_type === `offsite_conversion.fb_pixel_${pixel}`) ??
    aktionen.find((x) => x.action_type === sammel);
  return Number(a?.value || 0);
}

export async function metaZahlen(k: Kampagne, bis: string): Promise<MetaErgebnis> {
  const zugang = process.env.META_ZUGRIFF;
  const konto = (process.env.META_WERBEKONTO || "87791925").replace(/^act_/, "");
  if (!zugang) return { stand: "nicht-verbunden" };

  const namen = new Set(k.anzeigen.map((a) => a.name));
  const abfrage = new URLSearchParams({
    level: "ad",
    fields: "ad_name,spend,impressions,inline_link_clicks,actions",
    time_range: JSON.stringify({ since: k.start, until: bis }),
    time_increment: "1",
    limit: "500",
    access_token: zugang,
  });

  let adresse: string | null =
    `https://graph.facebook.com/${META_VERSION}/act_${konto}/insights?${abfrage}`;
  const zeilen: MetaZeile[] = [];

  try {
    // Meta liefert seitenweise. Bei drei Anzeigen und vierzehn Tagen passt
    // alles auf eine Seite, die Schleife ist für spätere, größere Runden da.
    while (adresse) {
      const res: Response = await fetch(adresse, { cache: "no-store" });
      const d = await res.json().catch(() => null);
      if (!res.ok || !d || d.error) {
        return {
          stand: "fehler",
          meldung: d?.error?.message || `Meta antwortet mit Status ${res.status}.`,
        };
      }
      for (const z of (d.data ?? []) as MetaRoh[]) {
        const name = String(z.ad_name || "").trim().toLowerCase();
        // Nur die Anzeigen dieser Kampagne. Andere Kampagnen desselben
        // Kontos tauchen im Zeitraum sonst mit auf.
        if (!namen.has(name)) continue;
        const aktionen = z.actions ?? [];
        zeilen.push({
          anzeige: name,
          tag: String(z.date_start || ""),
          ausgabe: Number(z.spend || 0),
          klicks: Number(z.inline_link_clicks || 0),
          einblendungen: Number(z.impressions || 0),
          leads: aktion(aktionen, "lead", "lead"),
          kassen: aktion(aktionen, "initiate_checkout", "initiate_checkout"),
          kaeufe: aktion(aktionen, "purchase", "purchase"),
        });
      }
      adresse = d.paging?.next ?? null;
    }
  } catch {
    return { stand: "fehler", meldung: "Meta war gerade nicht erreichbar." };
  }

  return { stand: "ok", zeilen };
}
