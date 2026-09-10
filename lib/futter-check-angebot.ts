import { digitalprodukte } from "@/lib/digital";
import { FUTTER_CHECK_TYPEN, type FutterCheckTyp } from "@/lib/strecken-ausloeser";

// ---------------------------------------------------------------------------
// Was der Futter-Check am Ende empfiehlt.
//
// ▸ ZWEI DINGE ENTSCHEIDEN: der Typ und das gewünschte Vorgehen, die sechste
//   Frage seit 10.09.2026. Wer selbst lernen will, bekommt ein kleines
//   Produkt. Wer einen fertigen Plan will, den Futterplan. Wer Begleitung
//   will, die drei Monate. So verkauft der Check jede Stufe der Treppe und
//   nicht nur die unterste.
//
// ▸ DIE WARUM-SÄTZE SIND ENTWÜRFE VON CLAUDE (10.09.2026), nicht Yasemins
//   Worte, und gehören gegengelesen. Die Ergebnistexte selbst stehen
//   unverändert in public/futter-check.html.
//
// ▸ Ältere Anmeldungen haben keine sechste Antwort. Sie zählen als „selbst".
//
// Gebraucht von der Ergebnisseite (/futter-check-bestaetigt) und der
// Ergebnismail (lib/futter-check-server.ts). Beide zeigen dasselbe.
// ---------------------------------------------------------------------------

export type Vorgehen = "selbst" | "plan" | "begleitung";

export type Empfehlung = {
  slug: string;
  /** Der Kurzname aus lib/digital.ts. */
  name: string;
  /** In Cent, aus lib/digital.ts. */
  preis: number;
  warum: string;
};

export type Angebot = {
  haupt: Empfehlung;
  /** Eine zweite Möglichkeit, kleiner oder größer, mit eigener Überschrift. */
  neben: (Empfehlung & { titel: string }) | null;
};

export const VORGEHEN_TEXT: Record<Vorgehen, string> = {
  selbst: "selbst verstehen und umsetzen",
  plan: "einen fertigen Plan",
  begleitung: "Begleitung über längere Zeit",
};

function empfehlung(slug: string, warum: string): Empfehlung | null {
  const p = digitalprodukte.find((x) => x.slug === slug);
  return p ? { slug, name: p.kurzname, preis: p.preis, warum } : null;
}

export function typAusTitel(titel: string | null | undefined): FutterCheckTyp | null {
  const treffer = (Object.entries(FUTTER_CHECK_TYPEN) as [FutterCheckTyp, string][]).find(
    ([, t]) => t === titel
  );
  return treffer ? treffer[0] : null;
}

/**
 * Liest die gespeicherten Antworten.
 *
 * Der Schlüssel der Auffälligkeiten enthält im Fragebogen ein kaputtes
 * Zeichen (U+FFAE, siehe public/futter-check.html). Er wird deshalb über
 * seinen Inhalt gefunden: Er ist die einzige Liste unter den Antworten.
 */
export function antwortenLesen(antworten: unknown): {
  vorgehen: Vorgehen;
  vorgehenAngegeben: boolean;
  symptome: string[];
  mineralstatus: string | null;
} {
  const a =
    antworten && typeof antworten === "object" ? (antworten as Record<string, unknown>) : {};
  const liste = Object.values(a).find((w) => Array.isArray(w));
  const symptome = Array.isArray(liste)
    ? liste.filter((s): s is string => typeof s === "string" && s !== "keine")
    : [];
  const v = a.vorgehen;
  const angegeben = v === "selbst" || v === "plan" || v === "begleitung";
  return {
    vorgehen: angegeben ? (v as Vorgehen) : "selbst",
    vorgehenAngegeben: angegeben,
    symptome,
    mineralstatus: typeof a.mineralstatus === "string" ? a.mineralstatus : null,
  };
}

const SALZ =
  "Im Salzratgeber steht, wie viel Salz dein Pferd braucht und welches dafür taugt, dazu das Rezept für die Elektrolytmischung zum Selbermischen.";

/** Die Empfehlung zu einem Ergebnis. */
export function angebotFuer(titel: string | null | undefined, antworten: unknown): Angebot {
  const typ = typAusTitel(titel);
  const { vorgehen, symptome, mineralstatus } = antwortenLesen(antworten);

  let haupt: Empfehlung | null;
  let neben: [string, Empfehlung | null] | null = null;

  if (vorgehen === "plan") {
    haupt = empfehlung(
      "futterplan",
      "Du möchtest nicht selbst rechnen, sondern einen fertigen Plan für dein Pferd. Genau den bekommst du: Ich werte deine Angaben aus, rechne die Ration vollständig durch und begleite dich vier Wochen lang bei der Umstellung."
    );
    neben =
      symptome.length > 0
        ? [
            "Wenn du schon Befunde hast",
            empfehlung(
              "befund-einschaetzung",
              "Liegen eine Heuanalyse, ein Blutbild oder ein Kotbefund schon auf dem Tisch, ordne ich dir zuerst diese Werte ein, noch ohne fertigen Plan."
            ),
          ]
        : [
            "Lieber erst selbst verstehen",
            empfehlung(
              "mineral-klarheit",
              "Wenn du zuerst selbst durchblicken möchtest, rechnest du in Mineral-Klarheit einmal nach, was deinem Pferd wirklich fehlt."
            ),
          ];
  } else if (vorgehen === "begleitung") {
    haupt = empfehlung(
      "begleitung-3-monate",
      "Du möchtest die Umstellung nicht allein machen. In den drei Monaten bekommst du deinen Plan, und ich schaue mit drauf, bis er sitzt. Anpassungen kosten in dieser Zeit nichts extra."
    );
    neben = [
      "Für das ganze Jahr",
      empfehlung(
        "pferdeliebe-365",
        "Mit Gesundheitsakte, Saisonplan und vier festen Terminen über zwölf Monate, auch zum Weidebeginn und zum Fellwechsel."
      ),
    ];
  } else if (typ === "symptom_feuerwehr" && symptome.includes("kotwasser")) {
    haupt = empfehlung(
      "darmaufbau",
      "Du hast Kotwasser angegeben. Im E-Book Darmaufbau zeige ich dir, welche Bausteine eine stabile Verdauung über die Fütterung braucht und in welcher Reihenfolge du sie angehst."
    );
    neben = [
      "Zum Nachschlagen",
      empfehlung(
        "symptom-navigator",
        "Für die übrigen Anzeichen: Im Symptom-Navigator schlägst du nach, welche Fütterungsfragen dahinterstecken können."
      ),
    ];
  } else if (typ === "symptom_feuerwehr") {
    haupt = empfehlung(
      "symptom-navigator",
      "Im Symptom-Navigator schlägst du nach, welche Fütterungsfragen hinter den Anzeichen stecken können, die du bei deinem Pferd siehst, und wo du ansetzen kannst."
    );
    neben = [
      "Kleiner anfangen",
      empfehlung(
        "mineral-klarheit",
        "Hinter vielen Anzeichen steckt die Mineralversorgung. In Mineral-Klarheit rechnest du sie einmal selbst durch."
      ),
    ];
  } else if (typ === "auf_gutem_weg") {
    haupt = empfehlung(
      "salzratgeber",
      `Deine Grundstruktur steht. Ein Feinschliff, den du sofort angehen kannst, ist Salz. ${SALZ}`
    );
    neben = [
      "Für das ganze Jahr",
      empfehlung(
        "ganzjahresfutterplan",
        "Wenn du deine Fütterung durch die Jahreszeiten führen willst, vom Fellwechsel bis zum Winter, ist der Ganzjahresfutterplan der nächste Schritt."
      ),
    ];
  } else if (typ === "mineral_blindflug") {
    const lage =
      mineralstatus === "unregelmaessig"
        ? "Dein Pferd bekommt sein Mineralfutter im Moment nur unregelmäßig."
        : "Dein Pferd bekommt im Moment kein Mineralfutter.";
    haupt = empfehlung(
      "mineral-klarheit",
      `${lage} In Mineral-Klarheit findest du heraus, welches Mineralfutter zu deinem Heu und deinem Pferd passt, statt nach Gefühl zu kaufen.`
    );
    neben = ["Kleiner anfangen", empfehlung("salzratgeber", SALZ)];
  } else {
    // Durcheinander, und alles, dessen Typ sich nicht lesen lässt.
    haupt = empfehlung(
      "mineral-klarheit",
      "In Mineral-Klarheit rechnest du einmal durch, was dein Pferd über Heu und Futter schon bekommt und was wirklich fehlt. Danach weißt du, welche Zusätze bleiben dürfen und welche du dir sparen kannst."
    );
    neben = ["Kleiner anfangen", empfehlung("salzratgeber", SALZ)];
  }

  // Wird ein Produkt umbenannt oder entfernt, soll die Ergebnismail nicht
  // scheitern. Dann steht dort eben Mineral-Klarheit.
  const sicher =
    haupt ??
    empfehlung("mineral-klarheit", "Mineralfutter selbst durchrechnen statt raten.") ?? {
      slug: "shop",
      name: "Alle Angebote",
      preis: 0,
      warum: "",
    };

  return {
    haupt: sicher,
    neben: neben && neben[1] && neben[1].slug !== sicher.slug ? { ...neben[1], titel: neben[0] } : null,
  };
}
