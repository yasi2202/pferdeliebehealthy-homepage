import { supabaseAlle, EMAIL_MUSTER } from "@/lib/versand";
import {
  GRUPPEN,
  type Empfaenger,
  type GruppenSchluessel,
} from "@/lib/newsletter";

export { GRUPPEN, type GruppenSchluessel };

// ---------------------------------------------------------------------------
// Wer bekommt den Newsletter? Die Adressen stehen in vier verschiedenen
// Tabellen, und sie stehen dort aus verschiedenen Gründen. Das ist kein
// Schönheitsfehler, sondern der Kern der Sache: Von wem du eine Adresse
// hast, entscheidet darüber, was du ihr schicken darfst.
//
// ▸ ZWEI RECHTSGRUNDLAGEN, BITTE AUSEINANDERHALTEN:
//
//   1. EINWILLIGUNG. Wer sich selbst eingetragen und auf den
//      Bestätigungslink geklickt hat, hat Ja gesagt. Diesen Menschen darfst
//      du schreiben, was du willst, auch reine Werbung.
//
//   2. BESTANDSKUNDINNEN (§ 7 Abs. 3 UWG). Wer bei dir gekauft hat, darf
//      auch ohne Einwilligung Post bekommen, aber nur unter vier
//      Bedingungen: Du hast die Adresse beim Verkauf bekommen, du wirbst
//      für **eigene ähnliche** Angebote, sie hat nicht widersprochen, und
//      sie wird bei jeder Mail deutlich auf den Widerspruch hingewiesen.
//      Der Abmeldelink in jeder Mail erfüllt die letzte Bedingung.
//
//      Für Fremdwerbung, ein Gewinnspiel oder ein Angebot aus einem ganz
//      anderen Feld trägt diese Grundlage NICHT.
//
// ▸ WER HIER NIE AUFTAUCHT, und das ist Absicht:
//   die Sperrliste (siehe unten), Abgemeldete, Testzugänge, Adminkonten,
//   stillgelegte Konten, kaputte Adressen und Yasemins eigene Konten.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Wer niemals Post bekommt
// ---------------------------------------------------------------------------

/** Yasemins eigene Konten. Sie stehen als Kundinnen in den Tabellen und
 *  würden sonst jede Rundmail mitbekommen, teils mehrfach. */
const EIGENE_KONTEN = new Set([
  "halacyasemin3@gmail.com",
  "yasii@hotmail.de",
  "info@pferdeliebehealthy.de",
  "yasemin.halac@weiss-world.com",
]);

/** Die feste Sperre: Menschen, die unter keinen Umständen Post bekommen.
 *
 *  ▸ WER DAS IST: die Gruppe, die 2025 die Ausbildung gekauft und widerrufen
 *    hat, danach kam es zum Rechtsstreit. Sie behalten ihre gekauften
 *    Produkte, bekommen aber keine Post mehr, so von Yasemin am 27.08. und
 *    03.09.2026 entschieden. Mehrere haben zwei Adressen, beide stehen hier:
 *    Eine Sperre, die nur die halbe Person trifft, ist keine.
 *
 *  ▸ WARUM ALS LISTE IM CODE UND NICHT NUR IN DER DATENBANK:
 *    Dieselbe Überlegung wie in `akademieapp/lib/mail-sperre.ts`, wo die
 *    Liste ebenfalls steht. Ein Eintrag in der Datenbank lässt sich
 *    versehentlich löschen, und wenn die Datenbank einmal nicht antwortet,
 *    wäre die Sperre stillschweigend leer. Diese Liste hier greift immer.
 *
 *  ▸ EINE NEUE ADRESSE SPERREN: hier eintragen UND in
 *    `akademieapp/lib/mail-sperre.ts`. Beide Projekte, immer. Wer nur eine
 *    Stelle pflegt, sperrt nur das halbe Haus. */
const FESTE_SPERRE = new Set([
  "schillingalina@web.de",
  "alinaschilling2@web.de", // Alina Schilling, zweite Adresse
  "linda.zimmermann1@gmx.de",
  "verena.vitek@t-online.de",
  "tinawegerhoff9@gmail.com",
  "melanie.wendland@gmx.net",
  "kristin.rieger@outlook.de",
  "krissi-r98@web.de", // Kristin Rieger, zweite Adresse
  "unitedpgc@gmx.de", // Jenny Kreis
  "janina-funk@gmx.de", // Janina Funk
  "ninahafner@gmx.de", // Nina Hafner
  "caly20032002@aol.com", // Melse
  // Patricia Kunz und Bernhard Lechenbauer standen hier bis zum 04.09.2026.
  // Yasemin hat sie von der Mailsperre genommen: Sie bekommen wieder Post,
  // behalten aber keinen Produktzugang.
]);

/** Die Sperrliste aus der Datenbank, ergänzt um die feste Liste von oben.
 *
 *  ▸ GIBT `null` ZURÜCK, WENN DIE DATENBANK NICHT ANTWORTET, und der
 *    Versand bricht dann ab. Das sieht übervorsichtig aus, ist aber der
 *    einzig richtige Weg: Eine leere Sperrliste unterscheidet sich technisch
 *    nicht von „niemand hat sich abgemeldet". Würde hier im Fehlerfall eine
 *    leere Menge herauskommen, ginge der nächste Newsletter an jeden, der
 *    sich je abgemeldet hat. */
async function gesperrteAdressen(): Promise<Set<string> | null> {
  const zeilen = await supabaseAlle<{ email: string }>(
    "newsletter_abmeldungen?select=email"
  );
  if (!zeilen) return null;

  return new Set([...FESTE_SPERRE, ...zeilen.map((z) => z.email.toLowerCase())]);
}

// ---------------------------------------------------------------------------
// Die einzelnen Quellen
// ---------------------------------------------------------------------------

type Kursteilnehmerin = {
  email: string;
  aktiv: boolean | null;
  bereich: string | null;
  zugaenge: string[] | null;
  notiz: string | null;
  mails_abgemeldet: boolean | null;
};

/** Die Filter der Akademie, hier nachgebaut.
 *
 *  Sie stehen in `akademieapp/lib/benachrichtigungen.ts` und sind dort über
 *  Monate gewachsen. Jeder einzelne hat einen Grund:
 *
 *  - `aktiv = false` sind stillgelegte Konten, etwa nach einem Widerruf.
 *  - Adminkonten sind Yasemins eigene.
 *  - Testzugänge sind Konten, die sie sich selbst angelegt hat. Geprüft
 *    wird auf eine Notiz, die MIT „Test" beginnt, nicht auf das Wort
 *    irgendwo im Text: Sonst fällt jede Kundin heraus, in deren Notiz
 *    „getestet" vorkommt.
 *  - `mails_abgemeldet` ist der Widerspruch. Er wiegt am schwersten. */
function bekommtPost(k: Kursteilnehmerin): boolean {
  if (k.aktiv === false) return false;
  if (k.bereich === "admin") return false;
  if (Array.isArray(k.zugaenge) && k.zugaenge.includes("admin")) return false;
  if (k.bereich === "testkunde") return false;
  if (/^\s*test/i.test(k.notiz ?? "")) return false;
  if (k.mails_abgemeldet === true) return false;
  return true;
}

// ▸ JEDE DIESER DREI GIBT `null` ZURÜCK, WENN DIE ABFRAGE SCHEITERT, und
//   nicht etwa eine leere Liste. Der Unterschied hat am 03.09.2026 fast
//   einen halben Verteiler gekostet: In der Abfrage stand `vorname`, eine
//   Spalte, die es in `kursteilnehmer` gar nicht gibt. Supabase antwortete
//   mit 400, die Liste war leer, und die Oberfläche zeigte seelenruhig
//   „0 Empfänger". Bei der Gruppe „alle zusammen" wäre das nicht einmal
//   aufgefallen: Der Newsletter wäre an die Übrigen rausgegangen, hätte
//   1320 Menschen ausgelassen und stünde danach als versendet da.
//
//   Ein Fehler muss deshalb bis nach oben durchschlagen und den Versand
//   anhalten. Eine leere Liste ist eine Aussage, ein Fehler ist keine.

async function eingetragene(): Promise<Empfaenger[] | null> {
  const zeilen = await supabaseAlle<{ email: string; vorname: string | null }>(
    "alle_anmeldungen?bestaetigt=is.true&select=email,vorname"
  );
  if (!zeilen) return null;
  return zeilen.map((z) => ({ email: z.email, vorname: z.vorname }));
}

/** ▸ `kursteilnehmer` HAT KEINE SPALTE `vorname`. Dort steht nur die
 *  Adresse. Den Namen holt `namenNachschlagen()` weiter unten aus den
 *  anderen Tabellen, soweit die Person dort auch steht. */
async function kundinnen(): Promise<Empfaenger[] | null> {
  const zeilen = await supabaseAlle<Kursteilnehmerin>(
    "kursteilnehmer?select=email,aktiv,bereich,zugaenge,notiz,mails_abgemeldet"
  );
  if (!zeilen) return null;
  return zeilen.filter(bekommtPost).map((k) => ({ email: k.email, vorname: null }));
}

async function beratungskundinnen(): Promise<Empfaenger[] | null> {
  const zeilen = await supabaseAlle<{ email: string | null; vorname: string | null }>(
    "ed_kunden?select=email,vorname"
  );
  if (!zeilen) return null;
  return zeilen
    .filter((z) => z.email)
    .map((z) => ({ email: z.email as string, vorname: z.vorname }));
}

/** Sucht zu Adressen ohne Namen einen Vornamen in den anderen Tabellen.
 *
 *  ▸ WOZU: Die grösste Gruppe sind die Kursteilnehmerinnen, und dort steht
 *    kein Name. Ohne diesen Umweg begänne jede Mail an über tausend
 *    Menschen mit „Hallo," statt mit ihrem Namen. Viele von ihnen stehen
 *    aber in EquiDesk oder in den Anmeldungen, und dort steht er.
 *
 *  Scheitert eine der beiden Abfragen, ist das kein Grund abzubrechen: Dann
 *  fehlt eben der Name, und die Anrede lautet „Hallo,". Das ist ein
 *  Schönheitsfehler, kein Schaden. */
async function namenNachschlagen(): Promise<Map<string, string>> {
  const namen = new Map<string, string>();

  const [ed, anmeldungen] = await Promise.all([
    supabaseAlle<{ email: string | null; vorname: string | null }>(
      "ed_kunden?select=email,vorname"
    ),
    supabaseAlle<{ email: string; vorname: string | null }>(
      "alle_anmeldungen?select=email,vorname"
    ),
  ]);

  // Die Anmeldungen zuletzt, damit sie gewinnen: Dort hat die Person ihren
  // Vornamen selbst eingetippt.
  for (const quelle of [ed, anmeldungen]) {
    for (const z of quelle ?? []) {
      const e = (z.email ?? "").trim().toLowerCase();
      const v = (z.vorname ?? "").trim();
      if (e && v && v.toLowerCase() !== "du") namen.set(e, v);
    }
  }

  return namen;
}

// ---------------------------------------------------------------------------
// Die fertige Empfängerliste
// ---------------------------------------------------------------------------

export type Empfaengerliste = {
  liste: Empfaenger[];
  aussortiert: string[];
  gesperrt: number;
};

/** Holt die Empfänger einer Gruppe, entdoppelt und gefiltert.
 *
 *  ▸ DREI FALLEN STECKEN HIER DRIN, alle schon einmal aufgetreten:
 *
 *    1. Supabase liefert höchstens tausend Zeilen pro Anfrage, ohne
 *       Fehlermeldung. Deshalb `supabaseAlle`. Bei 1364 Kundinnen wären
 *       sonst die ältesten 364 stillschweigend verschwunden.
 *    2. Eine einzige kaputte Adresse lässt Resend das ganze Bündel von
 *       hundert Mails zurückweisen. Am 27.08.2026 stand irgendwo
 *       „belinda. knott@web.de" mit einem Leerzeichen, und es ging keine
 *       einzige Mail raus. Deshalb wird aussortiert statt mitgeschickt.
 *    3. Dieselbe Person steht oft in mehreren Tabellen. Ohne Entdoppelung
 *       bekäme sie die Mail dreimal.
 *
 *  Zurück kommt `null`, wenn die Datenbank nicht erreichbar war. Das ist
 *  etwas anderes als eine leere Liste und muss anders gemeldet werden. */
export async function empfaengerDerGruppe(
  gruppe: GruppenSchluessel
): Promise<Empfaengerliste | null> {
  let roh: Empfaenger[];

  try {
    if (gruppe === "eingetragen") {
      const a = await eingetragene();
      if (!a) return null;
      roh = a;
    } else if (gruppe === "kundinnen") {
      const a = await kundinnen();
      if (!a) return null;
      roh = a;
    } else if (gruppe === "beratung") {
      const a = await beratungskundinnen();
      if (!a) return null;
      roh = a;
    } else {
      const [a, b, c] = await Promise.all([
        eingetragene(),
        kundinnen(),
        beratungskundinnen(),
      ]);
      // Alle drei müssen geklappt haben. Fehlt eine, wäre der Versand
      // unvollständig, ohne dass es jemand merkt.
      if (!a || !b || !c) return null;
      roh = [...a, ...b, ...c];
    }
  } catch (fehler) {
    console.error("Empfängerliste nicht ladbar:", fehler);
    return null;
  }

  // Ohne Sperrliste wird nicht verschickt. Siehe die Begründung dort.
  const sperre = await gesperrteAdressen();
  if (!sperre) {
    console.error("Newsletter: Sperrliste nicht ladbar, Versand abgebrochen.");
    return null;
  }

  const namen = await namenNachschlagen();

  const liste: Empfaenger[] = [];
  const aussortiert: string[] = [];
  const gesehen = new Set<string>();
  let gesperrt = 0;

  for (const e of roh) {
    const adresse = (e.email ?? "").trim();
    const klein = adresse.toLowerCase();

    if (!EMAIL_MUSTER.test(adresse)) {
      aussortiert.push(e.email);
      continue;
    }
    if (sperre.has(klein) || EIGENE_KONTEN.has(klein)) {
      gesperrt++;
      continue;
    }
    if (gesehen.has(klein)) continue;

    gesehen.add(klein);
    // Der erste Fund gewinnt. Die Reihenfolge oben ist deshalb kein Zufall:
    // Bei den Eingetragenen hat die Person ihren Vornamen selbst getippt.
    // Fehlt er, wird er in den anderen Tabellen nachgeschlagen.
    liste.push({ email: adresse, vorname: e.vorname ?? namen.get(klein) ?? null });
  }

  if (aussortiert.length > 0) {
    console.warn(
      `Newsletter (${gruppe}): ${aussortiert.length} unbrauchbare Adressen uebersprungen:`,
      aussortiert.join(", ")
    );
  }

  return { liste, aussortiert, gesperrt };
}

/** Wie viele Menschen jede Gruppe erreicht.
 *
 *  Gezählt wird über die fertigen Listen, nicht über die Tabellenzeilen —
 *  nur so stimmen die Zahlen mit dem überein, was der Versand wirklich tut. */
export async function gruppenZaehlen(): Promise<Record<GruppenSchluessel, number>> {
  const zahlen = {} as Record<GruppenSchluessel, number>;

  for (const g of GRUPPEN) {
    const geholt = await empfaengerDerGruppe(g.schluessel);
    zahlen[g.schluessel] = geholt ? geholt.liste.length : -1;
  }

  return zahlen;
}
