import { createHmac, timingSafeEqual } from "node:crypto";
import {
  supabase,
  supabaseAlle,
  supabaseZaehlen,
  ersteZeile,
  ANTWORT_AN,
  EMAIL_MUSTER,
} from "@/lib/versand";
import {
  textZuHtml,
  namenEinsetzen,
  newsletterRahmen,
  briefPruefen,
  herkunftFuerGruppe,
  type Brief,
  type Empfaenger,
} from "@/lib/newsletter";
import {
  buendelSenden,
  antwortEinordnen,
  type BuendelAntwort,
} from "@/lib/newsletter-buendel";
import { vorlageFinden } from "@/lib/newsletter-vorlagen";
import {
  empfaengerDerGruppe,
  type GruppenSchluessel,
} from "@/lib/newsletter-gruppen";

// ---------------------------------------------------------------------------
// Das Newsletter-Programm, Serverseite: Entwürfe, Empfänger, Versand,
// Abmeldung und Auswertung.
//
// Nur aus Route-Handlern und Server-Komponenten importieren.
// ---------------------------------------------------------------------------

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

const VON = "Yasi von Pferdeliebehealthy <info@updates.pferdeliebehealthy.de>";

/** Resend nimmt bis zu 100 Mails pro Anfrage entgegen. Einzeln verschickt
 *  liefe der Versand bei einem wachsenden Verteiler in die Zeitbegrenzung
 *  von Vercel — in Bündeln bleibt er auch bei tausend Adressen schnell. */
const BUENDEL = 100;

/** Millisekunden zwischen zwei Anfragen an Resend. Resend nimmt zwei je
 *  Sekunde an; 600 lässt Luft für den Weg hin und zurück. */
const PAUSE = 600;

/** Öffnungen und Klicks mitzählen?
 *
 *  ▸ SEIT DEM 05.09.2026 EINGESCHALTET, auf Yasemins Wunsch. Vorher stand
 *    hier `false`, weil die Datenschutzerklärung das Gegenteil zusagte.
 *
 *  ▸ WAS DAZU GEHÖRT UND NICHT AUSEINANDERFALLEN DARF:
 *    1. app/datenschutz/page.tsx, Abschnitt „Öffnungs- und Klickmessung im
 *       Newsletter": beschreibt Bildpunkt, Zählstelle, was gespeichert wird,
 *       wie lange, und den Widerruf.
 *    2. components/InsiderFormular.tsx: Der Satz im Häkchen nennt die
 *       Messung. Ohne ihn deckt die Einwilligung sie nicht.
 *    3. Dieser Schalter.
 *
 *    Wer eines davon ändert, muss die anderen mitändern. Eine
 *    Datenschutzerklärung, die etwas anderes sagt als das Programm tut, ist
 *    schlimmer als gar keine, und genau das wird abgemahnt.
 *
 *  ▸ NOCH OFFEN: Die beiden Texte gehören von der Rechtsberatung beim
 *    Händlerbund gegengelesen (in der Mitgliedschaft enthalten). Das ist der
 *    einzige Schritt der alten Anleitung, der noch aussteht.
 *
 *  ▸ ES WIRD NICHT BEI ALLEN GEMESSEN, siehe `darfGemessenWerden`. */
const MESSEN = true;

/** Wer der Messung widersprochen hat.
 *
 *  ▸ WOZU DIESE LISTE DA IST: In der Datenschutzerklärung steht, dass man
 *    der Messung formlos widersprechen kann, ohne den Newsletter zu
 *    verlieren. Ohne eine Stelle, an der so ein Widerspruch landet, wäre das
 *    ein Versprechen ins Leere.
 *
 *  ▸ SO TRÄGST DU JEMANDEN EIN: Adresse kleingeschrieben in die Liste, mit
 *    Datum als Kommentar dahinter, veröffentlichen. Sie steht hier im Code
 *    und nicht in der Datenbank, weil eine neue Spalte in Supabase nur von
 *    Hand anzulegen wäre — dasselbe Muster wie bei der festen Mailsperre in
 *    lib/newsletter-gruppen.ts. Bei mehr als einer Handvoll Einträgen wird
 *    daraus besser eine Tabelle.
 *
 *  ▸ EIN WIDERSPRUCH GEGEN DIE MESSUNG IST KEINE ABMELDUNG. Wer hier steht,
 *    bekommt den Newsletter weiter, nur ohne Bildpunkt und ohne Zählstelle. */
export const OHNE_MESSUNG = new Set<string>([
  // Noch niemand. Beispiel: "vorname.name@web.de", // widersprochen am 05.09.2026
]);

/** Darf diese Mail einen Bildpunkt und gezählte Links bekommen?
 *
 *  ▸ SEIT DEM 05.09.2026 BEI ALLEN GRUPPEN, so von Yasemin entschieden,
 *    nachdem sie auf die Rechtslage hingewiesen wurde.
 *
 *  ▸ WAS SIE DAMIT ENTSCHIEDEN HAT, damit es später nachvollziehbar ist:
 *    Bei den Eingetragenen liegt eine Einwilligung vor, die die Messung
 *    ausdrücklich nennt (das Häkchen in components/InsiderFormular.tsx).
 *    Bei den übrigen Gruppen stützt sich die Messung auf das berechtigte
 *    Interesse an der Auswertung der eigenen Mails (Art. 6 Abs. 1 lit. f
 *    DSGVO). Das ist die Konstruktion, mit der die meisten Anbieter
 *    arbeiten; sie ist rechtlich nicht unumstritten, denn § 25 Abs. 1 TDDDG
 *    lässt sich auch strenger lesen. Deshalb: keine IP, kein Gerät, kein
 *    Profil über mehrere Mails hinweg, ein Widerspruch genügt formlos, und
 *    nach zwölf Monaten wird gelöscht. Genau so steht es in der
 *    Datenschutzerklärung, und genau so muss es bleiben.
 *
 *  ▸ WER DAS ZURÜCKDREHEN WILL: hier die Gruppenbedingung wieder einbauen
 *    (`gruppe === "eingetragen"`) und den Abschnitt in der
 *    Datenschutzerklärung mitändern. Beides gehört zusammen. */
export function darfGemessenWerden(gruppe?: string, email?: string): boolean {
  if (!MESSEN) return false;
  if (email && OHNE_MESSUNG.has(email.trim().toLowerCase())) return false;
  return true;
}

/** Damit die Auswertungsseite erklären kann, was die Zahlen bedeuten. */
export function messungAn(): boolean {
  return MESSEN;
}

// ---------------------------------------------------------------------------
// Der Abmeldelink
//
// ▸ WARUM KEIN GESPEICHERTER SCHLÜSSEL WIE BEIM INSIDER-KANAL:
//   Der Newsletter zieht seine Adressen aus vier Tabellen. Nur zwei davon
//   haben überhaupt einen Schlüssel, und dieselbe Person steht oft in
//   mehreren, mit verschiedenen Schlüsseln oder gar keinem. Deshalb wird
//   der Abmeldelink hier gerechnet statt nachgeschlagen: Adresse plus eine
//   Unterschrift darüber, gebildet mit dem geheimen Datenbankschlüssel.
//   Damit hat jede Adresse einen Abmeldelink, egal woher sie kommt.
//
//   Wer den Link hat, kann genau diese eine Adresse abmelden, sonst nichts.
//   Erraten lässt er sich nicht.
//
// ▸ EINE FOLGE, DIE DU KENNEN SOLLTEST: Würde der Supabase-Schlüssel
//   ausgetauscht, wären die Abmeldelinks in schon verschickten Mails
//   ungültig. Das ist kein Beinbruch — für diesen Fall gibt es im
//   Adminbereich das Feld, mit dem du eine Adresse von Hand abmeldest.
// ---------------------------------------------------------------------------

function unterschrift(wert: string): string {
  return createHmac("sha256", SUPABASE_SECRET_KEY || "kein-schluessel")
    .update(wert)
    .digest("hex")
    .slice(0, 24);
}

export function unterschriftStimmt(wert: string, gegeben: string): boolean {
  const a = Buffer.from(unterschrift(wert), "utf8");
  const b = Buffer.from(gegeben || "", "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Der Link in der Fusszeile: führt auf eine Seite mit Rückfrage. */
export function abmeldeLink(email: string, basisUrl: string): string {
  const e = encodeURIComponent(email);
  return `${basisUrl}/newsletter-abmelden?e=${e}&p=${unterschrift(email)}`;
}

/** Die Adresse für den Abmeldeknopf des Postfachs.
 *
 *  Gmail und Outlook zeigen oben in der Mail einen eigenen Knopf, wenn die
 *  Mail den Kopf `List-Unsubscribe` trägt. Dieser Knopf schickt ein POST und
 *  erwartet keine Seite, sondern nur ein „erledigt" — deshalb eine eigene
 *  Adresse und nicht die Seite von oben.
 *
 *  ▸ DIESEN KNOPF WILLST DU HABEN. Wer ihn nicht findet, drückt stattdessen
 *    auf „Spam", und das schadet dem Ruf deiner Absenderadresse bei allen
 *    anderen Empfängerinnen gleich mit. */
export function abmeldeLinkEinKlick(email: string, basisUrl: string): string {
  const e = encodeURIComponent(email);
  return `${basisUrl}/api/newsletter-abmelden?e=${e}&p=${unterschrift(email)}`;
}

// ---------------------------------------------------------------------------
// Die Entwürfe
// ---------------------------------------------------------------------------

export async function briefeHolen(): Promise<Brief[] | null> {
  return supabaseAlle<Brief>("newsletter_briefe?select=*&order=geaendert_am.desc");
}

export async function briefHolen(id: string): Promise<Brief | null> {
  return ersteZeile<Brief>(
    `newsletter_briefe?id=eq.${encodeURIComponent(id)}&select=*&limit=1`
  );
}

/** Legt einen neuen Entwurf an, wahlweise aus einer Vorlage. */
export async function briefAnlegen(vorlageSchluessel = "leer"): Promise<Brief | null> {
  const v = vorlageFinden(vorlageSchluessel);

  const res = await supabase("newsletter_briefe", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      betreff: v.betreff,
      vorschautext: v.vorschautext,
      inhalt: v.inhalt,
      status: "entwurf",
    }),
  });
  if (!res.ok) return null;
  const zeilen = await res.json();
  return Array.isArray(zeilen) && zeilen.length > 0 ? zeilen[0] : null;
}

/** Speichert einen Entwurf.
 *
 *  Ein versendeter Brief lässt sich nicht mehr ändern. Das ist keine
 *  Bevormundung, sondern die Wahrheit: Was raus ist, ist raus, und ein
 *  geänderter Text im Adminbereich würde nur vortäuschen, die Kundinnen
 *  hätten etwas anderes gelesen. */
export async function briefSpeichern(
  id: string,
  felder: {
    betreff?: string;
    vorschautext?: string;
    inhalt?: string;
    gruppe?: GruppenSchluessel;
  }
): Promise<boolean> {
  const brief = await briefHolen(id);
  if (!brief || brief.status === "versendet" || brief.status === "laeuft") return false;

  const res = await supabase(`newsletter_briefe?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ ...felder, geaendert_am: new Date().toISOString() }),
  });
  return res.ok;
}

// ---------------------------------------------------------------------------
// Der Terminversand
//
// ▸ WOZU ER DA IST: Eine Mail um 8 Uhr morgens wird gelesen, eine um 23 Uhr
//   nicht. Ohne Termin müsste Yasemin selbst am Rechner sitzen und drücken.
//
// ▸ WIE ER LÄUFT: `terminSetzen` legt Zeitpunkt und Status fest,
//   /api/newsletter-termin ruft alle fünf Minuten `terminLauf` auf, und der
//   verschickt, was fällig ist. Fällt ein Lauf aus, wird beim nächsten
//   nachgeholt — ein geplanter Brief bleibt fällig, bis er raus ist.
//
// ▸ DIE FÜNF MINUTEN sind die Genauigkeit. „18 Uhr" heisst also irgendwann
//   zwischen 18:00 und 18:05. Genauer geht es mit einem Cron nicht, und für
//   einen Newsletter ist es genau genug.
// ---------------------------------------------------------------------------

/** Setzt einen Versandtermin, oder nimmt ihn zurück (`null`).
 *
 *  Gibt es einen Termin, steht er in `versendet_am` und der Status ist
 *  `geplant`. Ohne Termin ist der Brief wieder ein ganz normaler Entwurf. */
export async function terminSetzen(
  id: string,
  zeitpunkt: string | null
): Promise<{ ok: boolean; text: string }> {
  const brief = await briefHolen(id);
  if (!brief) return { ok: false, text: "Entwurf nicht gefunden." };

  if (brief.status === "versendet")
    return { ok: false, text: "Dieser Newsletter ist schon raus." };

  if (brief.status === "laeuft")
    return {
      ok: false,
      text: "Der Versand läuft gerade. Warte einen Augenblick und lade die Seite neu.",
    };

  if (zeitpunkt === null) {
    const res = await supabase(`newsletter_briefe?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: "entwurf",
        versendet_am: null,
        geaendert_am: new Date().toISOString(),
      }),
    });
    return res.ok
      ? { ok: true, text: "Der Zeitplan ist aufgehoben. Es geht nichts von selbst raus." }
      : { ok: false, text: "Der Zeitplan liess sich nicht aufheben." };
  }

  const wann = new Date(zeitpunkt);
  if (Number.isNaN(wann.getTime()))
    return { ok: false, text: "Dieser Zeitpunkt ist keiner." };

  // Ein Termin in der Vergangenheit ginge beim nächsten Lauf sofort raus.
  // Das ist fast nie gemeint und wäre der teuerste aller Vertipper.
  if (wann.getTime() < Date.now() - 60_000)
    return {
      ok: false,
      text: "Dieser Zeitpunkt liegt in der Vergangenheit. Der Newsletter würde sofort rausgehen.",
    };

  const fehlt = briefPruefen(brief);
  if (fehlt.length > 0) return { ok: false, text: fehlt.join(" ") };

  const res = await supabase(`newsletter_briefe?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({
      status: "geplant",
      versendet_am: wann.toISOString(),
      geaendert_am: new Date().toISOString(),
    }),
  });

  return res.ok
    ? { ok: true, text: "Der Termin steht." }
    : { ok: false, text: "Der Termin liess sich nicht speichern." };
}

/** Holt Briefe zurück, die beim Versand steckengeblieben sind.
 *
 *  ▸ WOZU: Bricht der Versand mitten im Lauf ab, weil Vercel die Zeit
 *    abschneidet oder der Server neu startet, bleibt der Brief auf `laeuft`
 *    stehen. Er wäre damit für immer aus dem Rennen: nicht versendet, aber
 *    auch nicht mehr fällig. Niemand würde es merken, bis jemand die
 *    Übersicht anschaut.
 *
 *  ▸ WARUM ZWANZIG MINUTEN: Der Versand darf höchstens fünf Minuten dauern
 *    (`maxDuration = 300`). Was zwanzig Minuten auf `laeuft` steht, läuft
 *    also mit Sicherheit nicht mehr. Die Spanne ist bewusst großzügig — ein
 *    zu früher Rückholer würde einen noch laufenden Versand ein zweites Mal
 *    starten, und dann bekäme der halbe Verteiler alles doppelt. */
async function haengerFreigeben(): Promise<void> {
  const grenze = new Date(Date.now() - 20 * 60_000).toISOString();

  const res = await supabase(
    `newsletter_briefe?status=eq.laeuft&geaendert_am=lt.${encodeURIComponent(grenze)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ status: "geplant" }),
    }
  );

  if (!res.ok) return;
  const zeilen = await res.json().catch(() => null);
  if (Array.isArray(zeilen) && zeilen.length > 0) {
    console.error(
      "Terminlauf: steckengebliebene Briefe zurückgeholt:",
      zeilen.map((z: Brief) => z.betreff).join(", ")
    );
  }
}

/** Alle Briefe, deren Termin erreicht ist. */
async function faelligeBriefe(): Promise<Brief[] | null> {
  const jetzt = encodeURIComponent(new Date().toISOString());
  return supabaseAlle<Brief>(
    `newsletter_briefe?status=eq.geplant&versendet_am=lte.${jetzt}&select=*&order=versendet_am.asc`
  );
}

/** Nimmt einen fälligen Brief in Arbeit — aber nur, wenn ihn nicht schon ein
 *  anderer Lauf genommen hat.
 *
 *  ▸ WARUM DAS SEIN MUSS: Der Cron läuft alle fünf Minuten, ein Versand an
 *    2.300 Adressen dauert eine gute halbe Minute. Hakt Resend, überholen
 *    sich zwei Läufe — und der ganze Verteiler bekäme dieselbe Mail zweimal.
 *    Die Bedingung `status=eq.geplant` steht deshalb in der Änderung selbst:
 *    Die Datenbank entscheidet, wer ihn bekommt, nicht der schnellere Server.
 *    Wer nichts zurückbekommt, war der Zweite und lässt die Finger davon. */
async function briefBeanspruchen(id: string): Promise<boolean> {
  const res = await supabase(
    `newsletter_briefe?id=eq.${encodeURIComponent(id)}&status=eq.geplant`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      // `geaendert_am` ist hier die Startuhr des Versands:
      // `haengerFreigeben` liest daran ab, ob dieser Lauf noch leben kann.
      body: JSON.stringify({ status: "laeuft", geaendert_am: new Date().toISOString() }),
    }
  );
  if (!res.ok) return false;

  const zeilen = await res.json().catch(() => null);
  return Array.isArray(zeilen) && zeilen.length === 1;
}

/** Gibt einen Brief wieder frei, wenn der Versand nicht geklappt hat.
 *
 *  Der Termin bleibt stehen, er ist ja weiterhin fällig — beim nächsten Lauf
 *  wird es noch einmal versucht. Bliebe der Brief auf `laeuft` stehen, ginge
 *  er nie wieder raus und niemand wüsste warum. */
async function briefFreigeben(brief: Brief): Promise<void> {
  await supabase(`newsletter_briefe?id=eq.${encodeURIComponent(brief.id)}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "geplant", versendet_am: brief.versendet_am }),
  });
}

export type TerminErgebnis = {
  id: string;
  betreff: string;
  ok: boolean;
  text: string;
};

/** Der Lauf, den der Cron aufruft: verschickt alles, was fällig ist. */
export async function terminLauf(basisUrl: string): Promise<TerminErgebnis[]> {
  // Zuerst aufräumen: Was beim letzten Mal steckengeblieben ist, kommt
  // zurück ins Rennen, bevor geschaut wird, was ansteht.
  await haengerFreigeben();

  const faellig = await faelligeBriefe();

  // Keine leere Liste bei einem Fehler: Ein nicht erreichbares Supabase sieht
  // sonst aus wie „heute steht nichts an", und der Brief ginge stillschweigend
  // nie raus. Siehe dieselbe Regel bei den Empfängern.
  if (faellig === null) {
    console.error("Terminlauf: Die Briefe waren nicht erreichbar.");
    return [];
  }

  const ergebnisse: TerminErgebnis[] = [];

  for (const brief of faellig) {
    if (!(await briefBeanspruchen(brief.id))) continue;

    const ergebnis = await briefVersenden({ ...brief, status: "laeuft" }, basisUrl, true);

    if (ergebnis.ok) {
      ergebnisse.push({
        id: brief.id,
        betreff: brief.betreff,
        ok: true,
        text: `an ${ergebnis.empfaenger} Adressen`,
      });
    } else {
      await briefFreigeben(brief);
      console.error(`Terminlauf: "${brief.betreff}" ging nicht raus. ${ergebnis.text}`);
      ergebnisse.push({
        id: brief.id,
        betreff: brief.betreff,
        ok: false,
        text: ergebnis.text,
      });
    }
  }

  return ergebnisse;
}

export async function briefLoeschen(id: string): Promise<boolean> {
  const brief = await briefHolen(id);
  if (!brief || brief.status === "versendet" || brief.status === "laeuft") return false;

  const res = await supabase(`newsletter_briefe?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  return res.ok;
}

// ---------------------------------------------------------------------------
// Die Empfänger
// ---------------------------------------------------------------------------

/** Die Empfänger einer Gruppe. Die Filter und die Begründung, warum es
 *  überhaupt mehrere Gruppen gibt, stehen in lib/newsletter-gruppen.ts. */
export async function empfaengerHolen(
  gruppe: GruppenSchluessel = "eingetragen"
) {
  return empfaengerDerGruppe(gruppe);
}

/** Wie viele Menschen diese Gruppe erreicht.
 *
 *  Gezählt wird über die fertige Liste, nicht über die Tabellenzeilen: Nur
 *  so stimmt die Zahl im Sendeknopf mit dem überein, was der Versand
 *  wirklich tut. Bei einem Fehler kommt -1, damit sich das von „wirklich
 *  keine" unterscheiden lässt. */
export async function empfaengerZaehlen(
  gruppe: GruppenSchluessel = "eingetragen"
): Promise<number> {
  const geholt = await empfaengerDerGruppe(gruppe);
  return geholt ? geholt.liste.length : -1;
}


// ---------------------------------------------------------------------------
// Messen: Zählpixel und Klicks
// ---------------------------------------------------------------------------

/** Die Unterschrift für einen einzelnen Klicklink.
 *
 *  ▸ WARUM SIE DAS ZIEL MIT EINSCHLIESST, und warum das wichtig ist:
 *    Die Zählstelle leitet auf die Adresse weiter, die im Link steht. Wäre
 *    nur die Empfängeradresse unterschrieben, könnte jemand mit einem
 *    einzigen abgefangenen Link beliebige Ziele anhängen — und hätte damit
 *    eine Weiterleitung auf pferdeliebehealthy.de, die überall hinführt.
 *    Genau so werden Newsletter-Domains für Betrugsmails missbraucht.
 *
 *    Weil das Ziel mitunterschrieben ist, lässt sich der Link nicht
 *    umbiegen: Jede Änderung daran macht die Unterschrift ungültig. */
export function klickUnterschrift(email: string, ziel: string): string {
  return unterschrift(`${email}|${ziel}`);
}

/** Schreibt jeden Link im fertigen HTML auf die eigene Zählstelle um.
 *
 *  Ausgenommen bleiben der Abmeldelink und mailto-Links. Der Abmeldelink
 *  muss auch dann funktionieren, wenn an der Zählung etwas klemmt — sonst
 *  käme jemand nicht mehr aus dem Verteiler heraus, und das ist der eine
 *  Fehler, den man sich nicht leisten kann. */
function klicksZaehlen(
  html: string,
  briefId: string,
  email: string,
  basisUrl: string
): string {
  if (!MESSEN) return html;

  return html.replace(/href="(https?:\/\/[^"]+)"/g, (ganz, ziel: string) => {
    if (ziel.includes("/newsletter-abmelden")) return ganz;

    const link =
      `${basisUrl}/api/nl?b=${encodeURIComponent(briefId)}` +
      `&e=${encodeURIComponent(email)}&s=${klickUnterschrift(email, ziel)}` +
      `&z=${encodeURIComponent(ziel)}`;
    return `href="${link}"`;
  });
}

/** Das Zählpixel für die Öffnungen: ein einzelner Bildpunkt am Ende der
 *  Mail. Lädt das Postfach ihn, war die Mail offen. */
function zaehlpixel(briefId: string, email: string, basisUrl: string): string {
  if (!MESSEN) return "";

  const link =
    `${basisUrl}/api/nl?b=${encodeURIComponent(briefId)}` +
    `&e=${encodeURIComponent(email)}&p=${unterschrift(email)}`;

  return `<img src="${link}" alt="" width="1" height="1" style="display:block;width:1px;height:1px;border:0;">`;
}

/** Hält ein Ereignis fest. Doppelte fängt ein Index in der Datenbank ab —
 *  wer eine Mail zehnmal öffnet, zählt trotzdem als eine Öffnung. */
export async function ereignisSpeichern(
  briefId: string,
  email: string,
  art: "geoeffnet" | "geklickt",
  ziel?: string
): Promise<void> {
  await supabase("newsletter_ereignisse", {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates" },
    body: JSON.stringify({
      brief_id: briefId,
      email: email.toLowerCase(),
      art,
      ziel: ziel ?? null,
    }),
  });
}

/** Löscht Öffnungen und Klicks, die älter als ein Jahr sind.
 *
 *  ▸ DAS IST KEINE AUFRÄUMARBEIT, SONDERN EINE ZUSAGE. In der
 *    Datenschutzerklärung steht unter „Öffnungs- und Klickmessung im
 *    Newsletter" wörtlich: „Wir löschen diese Daten spätestens zwölf Monate
 *    nach dem Versand." Ohne diese Funktion wäre das eine Behauptung, die
 *    niemand einlöst — und damit derselbe Widerspruch, wegen dem die Messung
 *    vorher ganz abgeschaltet war.
 *
 *  ▸ Läuft im täglichen Streckenlauf mit. Ein Tag Verzug schadet nicht, die
 *    Zusage sagt „spätestens zwölf Monate", nicht „auf die Stunde genau". */
export async function alteEreignisseLoeschen(): Promise<number> {
  const grenze = new Date(Date.now() - 365 * 24 * 60 * 60_000).toISOString();

  const res = await supabase(
    `newsletter_ereignisse?zeitpunkt=lt.${encodeURIComponent(grenze)}`,
    { method: "DELETE", headers: { Prefer: "return=representation" } }
  );
  if (!res.ok) {
    console.error("Alte Messwerte liessen sich nicht löschen:", res.status);
    return 0;
  }

  const zeilen = await res.json().catch(() => null);
  const anzahl = Array.isArray(zeilen) ? zeilen.length : 0;
  if (anzahl > 0) console.log(`${anzahl} Messwerte älter als ein Jahr gelöscht.`);
  return anzahl;
}

export type Auswertung = {
  geoeffnet: number;
  geklickt: number;
  ziele: { ziel: string; anzahl: number }[];
};

/** Nur die zwei Zahlen für die Übersichtsliste.
 *
 *  Zählt über den Kopf der Antwort, statt alle Ereignisse zu holen. Bei
 *  tausend Empfängerinnen und einem Jahr Newsletter stünden hier sonst
 *  zwanzigtausend Zeilen im Speicher, nur um zwei Zahlen anzuzeigen.
 *
 *  Dass jede Person je Brief nur einmal zählt, sichert der eindeutige Index
 *  in der Datenbank — die Zahl hier ist also die Zahl der Menschen, nicht
 *  die der Klicks. */
export async function kurzauswertung(
  briefId: string
): Promise<{ geoeffnet: number; geklickt: number }> {
  const id = encodeURIComponent(briefId);

  const [geoeffnet, geklickt] = await Promise.all([
    supabaseZaehlen(`newsletter_ereignisse?brief_id=eq.${id}&art=eq.geoeffnet`),
    supabaseZaehlen(`newsletter_ereignisse?brief_id=eq.${id}&art=eq.geklickt`),
  ]);

  return { geoeffnet: Math.max(0, geoeffnet), geklickt: Math.max(0, geklickt) };
}

export async function auswertungHolen(briefId: string): Promise<Auswertung> {
  const zeilen = await supabaseAlle<{ art: string; email: string; ziel: string | null }>(
    `newsletter_ereignisse?brief_id=eq.${encodeURIComponent(briefId)}&select=art,email,ziel`
  );
  if (!zeilen) return { geoeffnet: 0, geklickt: 0, ziele: [] };

  const offen = new Set<string>();
  const klicker = new Set<string>();
  const proZiel = new Map<string, number>();

  for (const z of zeilen) {
    if (z.art === "geoeffnet") offen.add(z.email);
    if (z.art === "geklickt") {
      klicker.add(z.email);
      if (z.ziel) proZiel.set(z.ziel, (proZiel.get(z.ziel) ?? 0) + 1);
    }
  }

  return {
    geoeffnet: offen.size,
    geklickt: klicker.size,
    ziele: [...proZiel.entries()]
      .map(([ziel, anzahl]) => ({ ziel, anzahl }))
      .sort((a, b) => b.anzahl - a.anzahl),
  };
}

// ---------------------------------------------------------------------------
// Die fertige Mail
// ---------------------------------------------------------------------------

/** Baut die Mail für eine einzelne Empfängerin. */
export function mailBauen(
  brief: Pick<Brief, "id" | "betreff" | "vorschautext" | "inhalt"> & {
    gruppe?: string;
  },
  empfaenger: Empfaenger,
  basisUrl: string,
  optionen: { messen?: boolean } = {}
): { betreff: string; html: string; abmelden: string; abmeldenEinKlick: string } {
  const abmelden = abmeldeLink(empfaenger.email, basisUrl);
  const abmeldenEinKlick = abmeldeLinkEinKlick(empfaenger.email, basisUrl);

  const inhalt = textZuHtml(namenEinsetzen(brief.inhalt, empfaenger.vorname));
  const betreff = namenEinsetzen(brief.betreff, empfaenger.vorname);

  let html = newsletterRahmen(
    inhalt,
    namenEinsetzen(brief.vorschautext, empfaenger.vorname),
    abmelden,
    undefined,
    herkunftFuerGruppe(brief.gruppe)
  );

  // Wer der Messung widersprochen hat, bekommt die Mail ohne Bildpunkt und
  // ohne gezählte Links. Siehe `darfGemessenWerden`.
  const messen =
    optionen.messen ?? darfGemessenWerden(brief.gruppe, empfaenger.email);

  if (messen) {
    html = klicksZaehlen(html, brief.id, empfaenger.email, basisUrl);
    html += zaehlpixel(brief.id, empfaenger.email, basisUrl);
  }

  return { betreff, html, abmelden, abmeldenEinKlick };
}

// ---------------------------------------------------------------------------
// Der Versand
// ---------------------------------------------------------------------------

function warte(ms: number): Promise<void> {
  return new Promise((fertig) => setTimeout(fertig, ms));
}

export type VersandErgebnis =
  | {
      ok: true;
      empfaenger: number;
      uebersprungen: number;
      /** Adressen, die Resend nicht angenommen hat. Die gehören korrigiert. */
      abgelehnt?: string[];
    }
  | {
      ok: false;
      grund: "schon-versendet" | "keine-empfaenger" | "unvollstaendig" | "fehler";
      text: string;
    };

/** Die Testmail an eine einzige Adresse. Ohne Zählung, sonst verfälscht
 *  jeder Test die Auswertung des Briefes. */
export async function testmailSenden(
  brief: Brief,
  an: string,
  basisUrl: string
): Promise<{ ok: boolean; text: string }> {
  if (!RESEND_API_KEY) {
    return { ok: false, text: "Es ist kein Resend-Schlüssel hinterlegt." };
  }
  if (!EMAIL_MUSTER.test(an.trim())) {
    return { ok: false, text: "Diese Adresse sieht nicht richtig aus." };
  }

  const gebaut = mailBauen(
    brief,
    { email: an.trim(), vorname: "Yasi" },
    basisUrl,
    { messen: false }
  );

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: VON,
      to: [an.trim()],
      reply_to: ANTWORT_AN,
      subject: `[Test] ${gebaut.betreff}`,
      html: gebaut.html,
    }),
  });

  if (!res.ok) {
    // Der Fehler muss im Browser ankommen, nicht nur in den Vercel-Logs.
    // Ohne Statuscode ist so etwas für Yasi nicht auffindbar.
    const text = (await res.text()).slice(0, 300);
    console.error("Newsletter-Testmail fehlgeschlagen:", res.status, text);
    return { ok: false, text: `Die Testmail ging nicht raus. ${res.status} — ${text}` };
  }

  return { ok: true, text: `Die Testmail ist an ${an.trim()} unterwegs.` };
}

/** Verschickt den Newsletter an alle bestätigten Adressen.
 *
 *  Geht ein Bündel schief, macht der Versand mit dem nächsten weiter statt
 *  alles abzubrechen — ein Problem bei hundert Adressen soll nicht
 *  neunhundert andere aufhalten. Erst wenn zweimal hintereinander nichts
 *  durchgeht, ist offenbar etwas Grundsätzliches kaputt. */
export async function briefVersenden(
  brief: Brief,
  basisUrl: string,
  erlaubeLaufenden = false
): Promise<VersandErgebnis> {
  if (brief.status === "versendet") {
    return {
      ok: false,
      grund: "schon-versendet",
      text: "Dieser Newsletter ist schon raus. Er lässt sich kein zweites Mal verschicken.",
    };
  }

  // Der Terminversand hat ihn gerade in Arbeit. Ein Klick auf „jetzt
  // schicken" würde denselben Brief ein zweites Mal in den Verteiler geben.
  // Der Lauf selbst kommt hier mit `laeuft` an und übergeht die Sperre, weil
  // er den Brief davor beansprucht hat — das ist der Unterschied.
  if (brief.status === "laeuft" && !erlaubeLaufenden) {
    return {
      ok: false,
      grund: "schon-versendet",
      text: "Dieser Newsletter geht gerade raus. Lade die Seite in einer Minute neu.",
    };
  }

  const fehlt = briefPruefen(brief);
  if (fehlt.length > 0) {
    return { ok: false, grund: "unvollstaendig", text: fehlt.join(" ") };
  }

  if (!RESEND_API_KEY) {
    return { ok: false, grund: "fehler", text: "Es ist kein Resend-Schlüssel hinterlegt." };
  }

  // Die Gruppe steht am Brief. Sie wurde beim Schreiben gewählt und darf
  // hier nicht neu geraten werden.
  const geholt = await empfaengerHolen(brief.gruppe as GruppenSchluessel);
  if (!geholt) {
    return { ok: false, grund: "fehler", text: "Die Adressliste war nicht erreichbar." };
  }
  if (geholt.liste.length === 0) {
    return {
      ok: false,
      grund: "keine-empfaenger",
      text: "Es gibt keine bestätigte Adresse, an die der Newsletter gehen könnte.",
    };
  }

  /** Schickt einen Teil des Verteilers wirklich los.
   *
   *  Gibt keinen Erfolg und keinen Fehler zurück, sondern eine der drei
   *  Antworten aus lib/newsletter-buendel.ts. Nur so kann die Aufteilung
   *  darüber entscheiden, ob Halbieren hilft oder schadet. */
  async function anResend(teil: Empfaenger[]): Promise<BuendelAntwort> {
    let antwort: Response;
    try {
      antwort = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          teil.map((e) => {
            const gebaut = mailBauen(brief, e, basisUrl);
            return {
              from: VON,
              to: [e.email],
              reply_to: ANTWORT_AN,
              subject: gebaut.betreff,
              // Sagt dem Postfach, wo man sich abmeldet. Manche zeigen dafür
              // einen eigenen Knopf — das ist deutlich besser, als wenn
              // jemand stattdessen auf „Spam" drückt.
              headers: {
                "List-Unsubscribe": `<${gebaut.abmeldenEinKlick}>`,
                "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
              },
              html: gebaut.html,
            };
          })
        ),
      });
    } catch (e) {
      // Netzwerk weg. Das ist kein Adressproblem, also später noch einmal.
      return { art: "spaeter", text: `Keine Verbindung zu Resend. ${e}` };
    }

    if (antwort.ok) return { art: "ok" };
    return antwortEinordnen(antwort.status, (await antwort.text()).slice(0, 200));
  }

  let verschickt = 0;
  let fehler: string | null = null;
  let hintereinander = 0;
  const abgelehnt: string[] = [];

  for (let i = 0; i < geholt.liste.length; i += BUENDEL) {
    // Resend nimmt zwei Anfragen pro Sekunde entgegen. Ohne Pause laufen
    // wir bei elf Bündeln in die Bremse.
    if (i > 0) await warte(PAUSE);

    const buendel = geholt.liste.slice(i, i + BUENDEL);

    // ▸ HIER STECKT DIE RETTUNG FÜR HUNDERT FRAUEN AUF EINMAL. Weist Resend
    //   das Bündel wegen einer einzigen faulen Adresse zurück, teilt
    //   `buendelSenden` es auf und schickt den heilen Teil trotzdem. Vorher
    //   fielen an dieser Stelle alle hundert aus, siehe den Kopf von
    //   lib/newsletter-buendel.ts.
    const ergebnis = await buendelSenden(
      buendel,
      (e) => e.email,
      anResend,
      warte,
      PAUSE
    );

    verschickt += ergebnis.verschickt;
    abgelehnt.push(...ergebnis.abgelehnt);
    if (ergebnis.fehler) fehler ??= ergebnis.fehler;

    if (ergebnis.abgelehnt.length > 0) {
      console.error(
        "Newsletter: Resend nimmt diese Adressen nicht an:",
        ergebnis.abgelehnt.join(", ")
      );
    }

    // Geht aus einem Bündel gar nichts raus, ist womöglich etwas
    // Grundsätzliches kaputt. Zweimal hintereinander, dann ist Schluss.
    if (ergebnis.verschickt === 0) {
      if (++hintereinander >= 2) break;
    } else {
      hintereinander = 0;
    }
  }

  if (verschickt === 0) {
    // Kein Vermerk: Es ist nichts rausgegangen, der Brief muss sich erneut
    // verschicken lassen. Ein Vermerk hier wäre eine Sackgasse, aus der nur
    // ein Eingriff in der Datenbank wieder herausführt.
    return {
      ok: false,
      grund: "fehler",
      text: `Es ist keine Mail rausgegangen. ${fehler ?? ""}`.trim(),
    };
  }

  // Ab hier ist etwas raus, und das lässt sich nicht zurücknehmen. Der
  // Vermerk muss deshalb auch dann stehen, wenn nur ein Teil durchging —
  // sonst bekämen beim nächsten Klick alle die Mail ein zweites Mal.
  await supabase(`newsletter_briefe?id=eq.${encodeURIComponent(brief.id)}`, {
    method: "PATCH",
    body: JSON.stringify({
      status: "versendet",
      versendet_am: new Date().toISOString(),
      empfaenger: verschickt,
      // Die von Resend abgelehnten zählen mit: Für Yasemin ist es dasselbe,
      // ob eine Adresse vorher aussortiert oder nachher zurückgewiesen
      // wurde. Beide haben die Mail nicht bekommen.
      uebersprungen: geholt.aussortiert.length + abgelehnt.length,
    }),
  });

  return {
    ok: true,
    empfaenger: verschickt,
    uebersprungen: geholt.aussortiert.length + abgelehnt.length,
    abgelehnt,
  };
}

// ---------------------------------------------------------------------------
// Abmelden
// ---------------------------------------------------------------------------

/** Meldet eine Adresse ab, und zwar überall.
 *
 *  ▸ DAS IST DER WICHTIGSTE TEIL DES GANZEN PROGRAMMS. Eine Abmeldung, die
 *    nur eine von vier Tabellen trifft, ist keine Abmeldung — die Person
 *    bekäme beim nächsten Rundbrief wieder Post, hätte zu Recht den
 *    Eindruck, ignoriert worden zu sein, und drückt beim zweiten Mal auf
 *    „Spam". Das schadet dann allen anderen Empfängerinnen gleich mit.
 *
 *  Vier Schritte, alle nötig:
 *
 *    1. Die Adresse kommt auf die Sperrliste. Sie ist der Nachweis, dass du
 *       den Widerspruch beachtest, und sie hält die Adresse auch dann
 *       draussen, wenn ein späterer Import sie wieder einspielt. Weil jede
 *       Empfängerliste gegen diese Liste gefiltert wird, wirkt sie in allen
 *       Quellen auf einmal, auch in `ed_kunden`.
 *
 *    2. In `kursteilnehmer` wird `mails_abgemeldet = true` gesetzt. Damit
 *       greift der Widerspruch auch für die Rundmails der **Akademie**, die
 *       ein ganz eigenes Programm sind. Ohne diesen Schritt hätte sich die
 *       Person nur vom halben Haus abgemeldet.
 *
 *       ▸ Die Zeile wird NICHT gelöscht. Daran hängt ihr Kurszugang, und
 *         den hat sie bezahlt. Sie will keine Werbung mehr, nicht ihre
 *         gekauften Produkte verlieren.
 *
 *    3. Die Zeilen in den beiden Anmeldetabellen werden gelöscht. So steht
 *       es in der Datenschutzerklärung, und dort hängt nichts Bezahltes
 *       dran.
 *
 *    4. Ihre Öffnungen und Klicks verschwinden mit. Wer weg ist, ist weg. */
export async function newsletterAbmelden(
  email: string,
  quelle: "link" | "hand" = "link"
): Promise<boolean> {
  const klein = email.trim().toLowerCase();
  if (!EMAIL_MUSTER.test(klein)) return false;

  // on_conflict=email: Meldet sich jemand zweimal ab — etwa über zwei alte
  // Mails —, ist das kein Fehler, sondern derselbe Wunsch. Ohne diese
  // Angabe käme beim zweiten Mal eine Fehlermeldung zurück, und die
  // Abmeldeseite zeigte „hat nicht geklappt", obwohl alles in Ordnung ist.
  const eingetragen = await supabase("newsletter_abmeldungen?on_conflict=email", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({ email: klein, quelle }),
  });

  const filter = `email=ilike.${encodeURIComponent(klein)}`;

  // Die Akademie mit abmelden. Nur das Häkchen, die Zeile bleibt stehen.
  await supabase(`kursteilnehmer?${filter}`, {
    method: "PATCH",
    body: JSON.stringify({
      mails_abgemeldet: true,
      abgemeldet_am: new Date().toISOString(),
    }),
  });

  await supabase(`insider_anmeldungen?${filter}`, { method: "DELETE" });
  await supabase(`futter_check_anmeldungen?${filter}`, { method: "DELETE" });
  await supabase(`newsletter_ereignisse?${filter}`, { method: "DELETE" });

  return eingetragen.ok;
}

export async function istAbgemeldet(email: string): Promise<boolean> {
  const zeile = await ersteZeile<{ email: string }>(
    `newsletter_abmeldungen?email=eq.${encodeURIComponent(
      email.trim().toLowerCase()
    )}&select=email&limit=1`
  );
  return Boolean(zeile);
}

export async function abmeldungenHolen(): Promise<
  { email: string; abgemeldet_am: string; quelle: string }[]
> {
  const zeilen = await supabaseAlle<{
    email: string;
    abgemeldet_am: string;
    quelle: string;
  }>("newsletter_abmeldungen?select=*&order=abgemeldet_am.desc");
  return zeilen ?? [];
}
