// ---------------------------------------------------------------------------
// Das Newsletter-Programm: Typen und die Umwandlung deines Textes in eine
// Mail, die man gerne liest.
//
// ▸ DIESE DATEI DARF AUCH IM BROWSER LAUFEN. Sie liest bewusst keine
//   Zugangsdaten und spricht mit keiner Datenbank — nur so kann die Vorschau
//   beim Tippen mitlaufen. Alles, was Schlüssel braucht, steht in
//   lib/newsletter-server.ts.
//
// ▸ WARUM DIE STILANGABEN DIREKT AN JEDEM ELEMENT STEHEN und nicht sauber
//   in einem <style>-Block: Postfächer werfen den Kopf einer Mail
//   regelmässig weg, Gmail zum Beispiel beim Weiterleiten. Was direkt am
//   Absatz steht, überlebt das. Es sieht im Code hässlich aus und ist in
//   der Mail das einzig Verlässliche.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Die vier Zustände eines Briefes
//
//   entwurf    Du schreibst noch. Nichts passiert von selbst.
//   geplant    Ein Zeitpunkt steht fest. Der Vercel-Cron schickt ihn dann.
//   laeuft     Der Versand ist gerade in Arbeit. Dieser Zustand hält nur
//              wenige Sekunden und verhindert, dass zwei Cron-Aufrufe
//              denselben Brief gleichzeitig verschicken.
//   versendet  Raus. Nicht mehr änderbar, nicht mehr löschbar.
//
// ▸ WO DER GEPLANTE ZEITPUNKT STEHT: in `versendet_am`, so wie später der
//   echte Versandzeitpunkt. Das ist Absicht und keine Sparsamkeit — die
//   Spalte beantwortet immer dieselbe Frage („wann geht dieser Brief raus"),
//   nur einmal in der Zukunft und einmal in der Vergangenheit. Beim Versand
//   wird sie auf den tatsächlichen Zeitpunkt gesetzt. Ob der Wert Plan oder
//   Tatsache ist, sagt der Status.
// ---------------------------------------------------------------------------

export type BriefStatus = "entwurf" | "geplant" | "laeuft" | "versendet";

export type Brief = {
  id: string;
  erstellt_am: string;
  geaendert_am: string;
  betreff: string;
  vorschautext: string;
  inhalt: string;
  status: BriefStatus;
  gruppe: string;
  versendet_am: string | null;
  empfaenger: number;
  uebersprungen: number;
};

/** Ein Empfänger, so wie ihn der Versand braucht. */
export type Empfaenger = {
  email: string;
  vorname: string | null;
};

// ---------------------------------------------------------------------------
// Die Farben der Marke, an einer Stelle.
// ---------------------------------------------------------------------------

const CREME = "#F9EDED";
const ROSE = "#DFA9A9";
const ROSE_TIEF = "#95534F";
const INK = "#3B2A28";
const TEXT = "#4A3636";
const LEISE = "#8a7070";
const LINIE = "#EAD8D8";

// ▸ WARUM HIER EINE VOLLE ADRESSE STEHT: In einer Mail gibt es keine
//   Seite, zu der ein Pfad wie „/images/…" gehören könnte. Jedes Bild
//   braucht die komplette Adresse, sonst bleibt das Feld leer.
// ▸ WARUM JPG UND NICHT WEBP: Outlook zeigt WebP nicht an. Die Bilder
//   unter /images/mail/ liegen deshalb ausdrücklich als JPG dort und
//   sind Kopien, keine Originale.
const PORTRAIT = "https://www.pferdeliebehealthy.de/images/mail/portrait.jpg";

// ---------------------------------------------------------------------------
// Die Auszeichnung
//
// ▸ WAS DU BEIM SCHREIBEN BENUTZEN KANNST — das ist die ganze Liste:
//
//     Eine Leerzeile                beginnt einen neuen Absatz
//     # Grosse Überschrift          der Aufmacher, einmal ganz oben
//     ## Zwischenüberschrift        gliedert den Text
//     **fett**                      fetter Text
//     *kursiv*                      kursiver Text
//     [Text](https://…)             ein Link mitten im Satz
//     - Punkt                       eine Aufzählung
//     > Hinweis                     ein hervorgehobener Kasten in Rosé
//     " Zitat | Name                eine Kundenstimme
//     ---                           eine Trennlinie mit kleiner Zierde
//     ![Beschreibung](https://…)    ein Bild über die ganze Breite
//     [![Beschreibung](Bild)](Ziel)  dasselbe Bild, aber anklickbar
//     [[knopf: Ansehen | https://…]]                 ein grosser Knopf
//     [[angebot: Name | 29 € | https://… | Satz ]]   ein Angebotskasten
//     [[angebot: … | Satz | Knopfbeschriftung]]      derselbe Kasten mit
//                                                    eigenem Knopftext
//     PS: …                         das Nachwort, abgesetzt am Ende
//     {{vorname}}                   wird durch ihren Vornamen ersetzt
//
//   Mehr gibt es nicht, und das ist Absicht. Jede weitere Möglichkeit ist
//   eine weitere Möglichkeit, dass eine Mail bei irgendeinem Postfach
//   auseinanderfällt.
// ---------------------------------------------------------------------------

/** Macht aus Text sicheres HTML.
 *
 *  Eigene Fassung, damit diese Datei ohne lib/versand.ts auskommt — die
 *  liest beim Laden die geheimen Schlüssel und gehört deshalb nicht in den
 *  Browser. */
function sicher(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Nur http, https und mailto dürfen in einen Link. Sonst könnte über ein
 *  eingefügtes `javascript:` fremder Code in der Vorschau landen. */
function linkPruefen(ziel: string): string | null {
  const z = ziel.trim();
  return /^(https?:\/\/|mailto:)/i.test(z) ? z : null;
}

/** Fett, kursiv und Links innerhalb einer Zeile. Läuft nach `sicher()`,
 *  arbeitet also auf bereits entschärftem Text. */
function zeileSchmuecken(text: string): string {
  return text
    // [Text](Link) zuerst — sonst zerlegt ein Sternchen im Linktext die
    // Klammern, bevor der Link überhaupt erkannt wird.
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_ganz, beschriftung, ziel) => {
      const link = linkPruefen(ziel);
      if (!link) return beschriftung;
      return `<a href="${link}" style="color:${ROSE_TIEF};text-decoration:underline;">${beschriftung}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, `<strong style="font-weight:600;color:${INK};">$1</strong>`)
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
}

const ABSATZ = `style="font-size:16.5px;line-height:1.75;margin:0 0 20px;color:${TEXT};"`;

/** Wandelt deinen Text in das HTML der Mail. */
export function textZuHtml(text: string): string {
  const bloecke = text.replace(/\r\n/g, "\n").split(/\n{2,}/);
  const teile: string[] = [];

  for (const roh of bloecke) {
    const block = roh.trim();
    if (!block) continue;

    // ---- Trennlinie mit kleiner Raute in der Mitte
    if (/^-{3,}$/.test(block)) {
      teile.push(
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;"><tr>
          <td style="border-top:1px solid ${LINIE};"></td>
          <td width="40" style="text-align:center;font-size:13px;color:${ROSE};line-height:1;padding:0 6px;">&#10022;</td>
          <td style="border-top:1px solid ${LINIE};"></td>
        </tr></table>`
      );
      continue;
    }

    // ---- Angebotskasten: Name | Preis | Link | Satz [| Knopfbeschriftung]
    //
    // ▸ WARUM HIER PER HAND GETEILT WIRD und nicht mit einem längeren
    //   regulären Ausdruck: Der Satz darf selbst einen senkrechten Strich
    //   enthalten. Nur wenn es fünf Felder gibt, ist das letzte die
    //   Beschriftung des Knopfes; bei vier gehört alles ab dem vierten
    //   zum Satz. So bleiben alle älteren Briefe unverändert gültig.
    const angebot = block.match(/^\[\[angebot:\s*([\s\S]*)\]\]$/i);
    if (angebot) {
      const felder = angebot[1].split("|");
      const link = linkPruefen(felder[2] ?? "");
      const name = sicher((felder[0] ?? "").trim());
      const preis = sicher((felder[1] ?? "").trim());
      const satzRoh =
        felder.length >= 5 ? felder.slice(3, -1).join("|") : felder.slice(3).join("|");
      const satz = zeileSchmuecken(sicher(satzRoh.trim()));

      // ▸ WARUM DER KNOPF NICHT MEHR „Ansehen" HEISST: Eine Beschriftung,
      //   die das Ziel benennt, wird deutlich häufiger geklickt als ein
      //   blosses Verb. Steht kein eigener Text da, nimmt der Knopf den
      //   Namen des Angebots — ausser der ist zu lang für eine Zeile auf
      //   dem Handy, dann bleibt es beim kurzen Satz.
      const eigeneBeschriftung = felder.length >= 5 ? (felder[felder.length - 1] ?? "").trim() : "";
      const knopftext = sicher(
        eigeneBeschriftung ||
          (name.length > 0 && name.length <= 26 ? `${angebot[1].split("|")[0].trim()} ansehen` : "Jetzt ansehen")
      );

      // Weisser Grund mit rosé Rand, nicht cremefarben wie der
      // Hinweiskasten: Sonst sehen der fachliche Merksatz und das Angebot
      // gleich aus, und das Auge übersieht beim Überfliegen genau das, was
      // verkaufen soll.
      teile.push(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:30px 0;background:#ffffff;border:2px solid ${ROSE};border-radius:14px;">
        <tr><td style="padding:24px 26px;">
          <p style="margin:0 0 10px;font-size:11.5px;letter-spacing:2px;text-transform:uppercase;color:${ROSE_TIEF};">Mein Angebot dazu</p>
          <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:19px;line-height:1.35;color:${INK};">${name}</p>
          ${preis ? `<p style="margin:0 0 12px;font-family:Georgia,serif;font-size:20px;color:${ROSE_TIEF};">${preis}</p>` : ""}
          ${satz ? `<p style="margin:0 0 18px;font-size:15.5px;line-height:1.7;color:${TEXT};">${satz}</p>` : ""}
          ${
            link
              ? `<a href="${link}" style="background:${ROSE_TIEF};color:#ffffff;padding:13px 28px;border-radius:999px;text-decoration:none;font-size:15.5px;display:inline-block;font-weight:600;">${knopftext}</a>`
              : ""
          }
        </td></tr>
      </table>`);
      continue;
    }

    // ---- Knopf
    const knopf = block.match(/^\[\[knopf:\s*([^|]+)\|\s*([^\]]+)\]\]$/i);
    if (knopf) {
      const link = linkPruefen(knopf[2]);
      const beschriftung = sicher(knopf[1].trim());
      if (link) {
        teile.push(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:30px 0;"><tr><td align="center">
          <a href="${link}" style="background:${ROSE_TIEF};color:#ffffff;padding:15px 34px;border-radius:999px;text-decoration:none;font-size:16.5px;display:inline-block;font-weight:600;">${beschriftung}</a>
        </td></tr></table>`);
        continue;
      }
      // Ohne gültigen Link wäre der Knopf eine Sackgasse. Dann lieber als
      // Absatz, damit die Mail nicht kaputt aussieht.
      teile.push(`<p ${ABSATZ}>${beschriftung}</p>`);
      continue;
    }

    // ---- Bild, wahlweise mit Ziel: [![Beschreibung](Bild)](Ziel)
    //
    // ▸ WARUM EIN BILD VERLINKBAR SEIN MUSS: Wer ein Produktbild sieht,
    //   klickt darauf. Führt es nirgendwohin, ist der Klick verloren, und
    //   die Leserin hält die Mail für kaputt.
    // ▸ WARUM DER FEINE RAND: Helle Aufnahmen mit weissem Grund
    //   verschwimmen sonst mit dem weissen Briefbogen; das Bild hat dann
    //   keine Kante und sieht aus wie ein Ladefehler.
    const bildMitZiel = block.match(/^\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)$/);
    const bild = bildMitZiel ?? block.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (bild) {
      const quelle = linkPruefen(bild[2]);
      const ziel = bildMitZiel ? linkPruefen(bildMitZiel[3]) : null;
      if (quelle) {
        const markierung = `<img src="${quelle}" alt="${sicher(bild[1])}" width="100%" style="width:100%;max-width:100%;height:auto;border-radius:14px;display:block;margin:26px 0;border:1px solid ${LINIE};font-size:14px;line-height:1.6;color:${LEISE};">`;
        teile.push(ziel ? `<a href="${ziel}" style="text-decoration:none;">${markierung}</a>` : markierung);
        continue;
      }
    }

    // ---- Kundenstimme: " Zitat | Name
    if (block.startsWith('"')) {
      const ohne = block.replace(/^"\s?/, "");
      const strich = ohne.lastIndexOf("|");
      const zitat = strich > -1 ? ohne.slice(0, strich).trim() : ohne.trim();
      const wer = strich > -1 ? ohne.slice(strich + 1).trim() : "";

      teile.push(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;"><tr>
        <td style="border-left:3px solid ${ROSE};padding:2px 0 2px 20px;">
          <p style="margin:0;font-family:Georgia,serif;font-size:17.5px;line-height:1.65;font-style:italic;color:${INK};">${zeileSchmuecken(sicher(zitat))}</p>
          ${wer ? `<p style="margin:10px 0 0;font-size:14px;color:${LEISE};">${sicher(wer)}</p>` : ""}
        </td>
      </tr></table>`);
      continue;
    }

    // ---- Grosse Überschrift
    if (block.startsWith("# ")) {
      const titel = zeileSchmuecken(sicher(block.slice(2).trim()));
      teile.push(
        `<h1 style="font-family:Georgia,serif;font-size:28px;line-height:1.25;font-weight:normal;color:${INK};margin:0 0 22px;">${titel}</h1>`
      );
      continue;
    }

    // ---- Zwischenüberschrift
    if (block.startsWith("## ")) {
      const titel = zeileSchmuecken(sicher(block.slice(3).trim()));
      teile.push(
        `<h2 style="font-family:Georgia,serif;font-size:21px;line-height:1.35;font-weight:normal;color:${INK};margin:34px 0 14px;">${titel}</h2>`
      );
      continue;
    }

    // ---- Hinweiskasten
    if (block.startsWith(">")) {
      const inhalt = block
        .split("\n")
        .map((z) => zeileSchmuecken(sicher(z.replace(/^>\s?/, ""))))
        .join("<br>");
      teile.push(
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:26px 0;background:${CREME};border-radius:12px;"><tr><td style="padding:20px 22px;font-size:15.5px;line-height:1.75;color:${TEXT};">${inhalt}</td></tr></table>`
      );
      continue;
    }

    // ---- Aufzählung
    if (/^[-•]\s/.test(block)) {
      const punkte = block
        .split("\n")
        .filter((z) => /^[-•]\s/.test(z.trim()))
        // Als Tabelle statt als <ul>: Outlook rueckt Listen eigenwillig ein
        // und schluckt die Aufzaehlungszeichen ganz. Vorher standen die
        // Punkte deshalb ohne jedes Zeichen da und sahen aus wie lose
        // Absaetze. Eine Tabelle mit einer schmalen Spalte sieht ueberall
        // gleich aus.
        .map(
          (z) =>
            `<tr>
              <td width="22" valign="top" style="padding:0 0 11px;font-size:16.5px;line-height:1.75;color:${ROSE_TIEF};">&#8226;</td>
              <td style="padding:0 0 11px;font-size:16.5px;line-height:1.75;color:${TEXT};">${zeileSchmuecken(
                sicher(z.trim().replace(/^[-•]\s+/, ""))
              )}</td>
            </tr>`
        )
        .join("");
      teile.push(
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">${punkte}</table>`
      );
      continue;
    }

    // ---- Nachwort
    if (/^PS:/i.test(block)) {
      const inhalt = zeileSchmuecken(sicher(block.replace(/^PS:\s*/i, "")));
      teile.push(
        `<p style="font-size:15.5px;line-height:1.7;margin:28px 0 0;color:${LEISE};"><strong style="color:${TEXT};">PS:</strong> ${inhalt}</p>`
      );
      continue;
    }

    // ---- Gewöhnlicher Absatz. Einzelne Umbrüche darin bleiben Umbrüche.
    const zeilen = block
      .split("\n")
      .map((z) => zeileSchmuecken(sicher(z.trim())))
      .join("<br>");
    teile.push(`<p ${ABSATZ}>${zeilen}</p>`);
  }

  return teile.join("\n");
}

/** Setzt den Vornamen ein, überall wo {{vorname}} steht.
 *
 *  Ohne Vornamen bleibt nichts Peinliches stehen: Aus „Hallo {{vorname}},"
 *  wird dann „Hallo," und nicht „Hallo ,". Bei den übernommenen Adressen
 *  steht teilweise das Wort „du" im Namensfeld — das gilt hier als kein
 *  Name, sonst stünde dort „Hallo du,". */
export function namenEinsetzen(text: string, vorname: string | null): string {
  const v = (vorname ?? "").trim();
  const echt = v && v.toLowerCase() !== "du" ? v : "";

  if (echt) return text.replace(/\{\{\s*vorname\s*\}\}/gi, echt);

  return text.replace(/\s*\{\{\s*vorname\s*\}\}/gi, "");
}

/** Der Text, den viele Postfächer hinter dem Betreff anzeigen.
 *
 *  Er steht als unsichtbare erste Zeile in der Mail. Die Kette aus
 *  Nullbreiten-Zeichen danach schiebt den echten Text weg — sonst hängt das
 *  Postfach an den Vorschautext noch den Anfang des Briefes an, und in der
 *  Übersicht steht „Der Fellwechsel steht an Hallo Anna, es ist wieder…". */
export function vorschauZeile(text: string): string {
  if (!text.trim()) return "";
  return `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${sicher(
    text.trim()
  )}${"&#8204;&nbsp;".repeat(60)}</div>`;
}

/** Der Kopf jeder Mail: die Wortmarke, schlicht. Kein Bild, weil viele
 *  Postfächer Bilder erst nach einem Klick laden — dann stünde oben ein
 *  leeres Kästchen statt eines Namens. */
/**
 * Der Kopf über dem Brief.
 *
 * AM 07.09.2026 VON TEXT AUF EIN FARBIGES BAND UMGESTELLT. Vorher stand der
 * Name klein und rosé auf dem cremefarbenen Grund, und darunter begann direkt
 * die weisse Fläche. Im Postfach, zwischen zwanzig anderen Mails, fiel davon
 * nichts auf. Jetzt sitzt der Name in Creme auf einem rosé Band, und das Band
 * bildet mit dem weissen Kasten darunter eine geschlossene Karte.
 *
 * BEWUSST OHNE BILD: Viele Postfächer laden Bilder erst nach einem Klick.
 * Ein Logo als Grafik wäre bei jeder zweiten Empfängerin ein leerer Kasten.
 * Farbe und Schrift kommen immer an.
 */
function kopf(): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${ROSE_TIEF};border-radius:18px 18px 0 0;">
      <tr><td align="center" style="padding:30px 24px 26px;">
        <p style="margin:0;font-family:Georgia,serif;font-size:20px;letter-spacing:3.5px;text-transform:uppercase;color:${CREME};">Pferdeliebehealthy</p>
        <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:12px auto 10px;"><tr><td width="46" style="border-top:1px solid ${CREME};opacity:0.45;font-size:0;line-height:0;">&nbsp;</td></tr></table>
        <p style="margin:0;font-size:11.5px;letter-spacing:1.8px;text-transform:uppercase;color:${CREME};opacity:0.78;">Ernährungsberatung für Pferde</p>
      </td></tr>
    </table>`;
}

/** Der Satz in der Fusszeile, der sagt, woher du die Adresse hast.
 *
 *  Für die Eingetragenen ist es die Einwilligung, für alle anderen der Kauf.
 *  Bei „alle" gilt beides nebeneinander, deshalb nennt der Satz dort beide
 *  Wege — er muss für jede einzelne Empfängerin zutreffen, und ohne eine
 *  Spalte „woher kam diese Adresse" ist das die einzige ehrliche Fassung. */
export function herkunftFuerGruppe(gruppe?: string): string {
  if (!gruppe || gruppe === "eingetragen")
    return "Du bekommst diese Mail, weil du dich auf pferdeliebehealthy.de eingetragen hast.";

  // Bei der Warteliste stimmt weder „eingetragen" noch „gekauft": Die
  // meisten haben sich in eine Liste bei Tentary, alfima oder ThriveCart
  // gesetzt, nicht auf der Website, und gekauft haben sie gerade nicht.
  // Der Satz muss aber für jede einzelne Empfängerin zutreffen.
  if (gruppe === "warteliste")
    return "Du bekommst diese Mail, weil du dich in die Warteliste für die Ausbildung Ganzheitliche Pferdefütterung eingetragen hast.";

  if (gruppe === "equidesk")
    return "Du bekommst diese Mail, weil du EquiDesk nutzt.";

  if (gruppe === "equidesk-angebot")
    return "Du bekommst diese Mail, weil du dich auf pferdeliebehealthy.de eingetragen hast oder an meiner Ausbildung teilnimmst.";

  return "Du bekommst diese Mail, weil du dich auf pferdeliebehealthy.de eingetragen oder bei mir gekauft hast.";
}

/** Der Rahmen um jede Newsletter-Mail.
 *
 *  Eigener Rahmen statt dem aus lib/versand.ts, weil hier drei Dinge
 *  dazugehören, die eine Bestätigungsmail nicht braucht: der Vorschautext
 *  ganz oben, der Kopf mit der Wortmarke, und die Fusszeile mit dem
 *  Abmeldelink. Ohne Abmeldelink darf ein Newsletter nicht raus. */
export function newsletterRahmen(
  inhaltHtml: string,
  vorschautext: string,
  abmeldeLink: string,
  imBrowserAnsehen?: string,
  herkunft?: string
): string {
  // ▸ WARUM DIESER SATZ NICHT FESTSTEHT: Er muss stimmen. Bei den
  //   Eingetragenen stimmt „du hast dich eingetragen"; bei den
  //   Bestandskundinnen stimmt er nicht, die haben gekauft und nie ein
  //   Häkchen gesetzt. Eine falsche Herkunftsangabe in einer Werbemail ist
  //   genau das, was eine Abmahnung teuer macht. Den Satz setzt deshalb
  //   `mailBauen` anhand der Gruppe, an die der Brief geht.
  const herkunftSatz =
    herkunft ??
    "Du bekommst diese Mail, weil du dich auf pferdeliebehealthy.de eingetragen hast.";

  const browserZeile = imBrowserAnsehen
    ? `<a href="${imBrowserAnsehen}" style="color:${LEISE};">Im Browser ansehen</a> · `
    : "";

  return `${vorschauZeile(vorschautext)}
<div style="background:${CREME};padding:36px 14px;font-family:Georgia,'Times New Roman',serif;color:${TEXT};-webkit-text-size-adjust:100%;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;">
      <tr><td>${kopf()}</td></tr>
      <tr><td style="background:#ffffff;border-radius:0 0 18px 18px;padding:36px 34px 38px;">
        ${inhaltHtml}
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:34px 0 0;"><tr>
          <td width="64" valign="top" style="padding:0 16px 0 0;">
            <!-- ▸ WARUM DAS PORTRAIT KEINEN ALTERNATIVTEXT HAT: Outlook und
                 Gmail laden fremde Bilder erst nach einem Klick. Steht dann
                 ein Name im Bild, quetscht er sich in diese 64 Pixel breite
                 Spalte und bricht mitten im Wort um. Das Bild schmueckt nur,
                 der Name steht daneben im Text — ein leerer Alternativtext
                 ist hier also auch fuer Vorleseprogramme richtig. -->
            <img src="${PORTRAIT}" alt="" width="64" height="64" style="width:64px;height:64px;border-radius:50%;display:block;border:0;font-size:0;line-height:0;">
          </td>
          <td valign="middle">
            <p style="font-size:16.5px;line-height:1.6;margin:0;color:${TEXT};">Alles Gute für dich und dein Pferd,<br><span style="font-family:Georgia,serif;font-size:19px;color:${ROSE_TIEF};">Yasi</span></p>
          </td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:22px 30px 0;font-size:13px;line-height:1.75;color:${LEISE};text-align:center;">
        <p style="margin:0 0 10px;">
          Yasemin Halac · Pferdeliebehealthy<br>
          <a href="mailto:info@pferdeliebehealthy.de" style="color:${ROSE_TIEF};">info@pferdeliebehealthy.de</a>
        </p>
        <p style="margin:0;">
          ${browserZeile}${herkunftSatz}<br><a href="${abmeldeLink}" style="color:${LEISE};">Hier abmelden</a>
        </p>
      </td></tr>
    </table>
  </td></tr></table>
</div>`;
}

/** Was an dem Brief noch fehlt, bevor er rausgehen darf.
 *
 *  Wird an zwei Stellen gebraucht: im Editor, damit der Sendeknopf grau
 *  bleibt, und noch einmal auf dem Server, weil ein grauer Knopf im Browser
 *  keine Sperre ist. */
export function briefPruefen(brief: { betreff: string; inhalt: string }): string[] {
  const fehlt: string[] = [];

  if (!brief.betreff.trim()) fehlt.push("Es fehlt die Betreffzeile.");
  else if (brief.betreff.trim().length > 120)
    fehlt.push(
      "Die Betreffzeile ist länger als 120 Zeichen. Die Postfächer schneiden sie dann ab."
    );

  if (!brief.inhalt.trim()) fehlt.push("Der Newsletter hat noch keinen Text.");

  return fehlt;
}

/** Hinweise, die den Versand nicht aufhalten, aber die Mail besser machen. */
export function briefRatschlaege(brief: {
  betreff: string;
  vorschautext: string;
  inhalt: string;
}): string[] {
  const rat: string[] = [];

  if (brief.betreff.trim().length > 55)
    rat.push(
      "Die Betreffzeile ist recht lang. Auf dem Handy sind etwa 40 Zeichen zu sehen — das Wichtigste gehört nach vorn."
    );

  if (!brief.vorschautext.trim())
    rat.push(
      "Der Vorschautext ist leer. Dann zeigt das Postfach den Anfang deines Textes, also meist die Anrede. Ein eigener Satz macht hier viel aus."
    );

  if (!/\{\{\s*vorname\s*\}\}/i.test(brief.inhalt))
    rat.push("Du sprichst niemanden mit Namen an. {{vorname}} setzt ihn ein.");

  if (!/\[\[knopf:|\[\[angebot:/i.test(brief.inhalt) && !/\]\(https?:/i.test(brief.inhalt))
    rat.push(
      "Es gibt keinen einzigen Link. Eine Mail ohne Ziel liest sich nett, führt aber nirgendwohin."
    );

  const woerter = brief.inhalt.trim().split(/\s+/).filter(Boolean).length;
  if (woerter > 600)
    rat.push(
      `Mit ${woerter} Wörtern ist der Newsletter lang. Unter 400 wird deutlich häufiger zu Ende gelesen.`
    );

  return rat;
}

/** Eine ungefähre Lesezeit, als Gefühl dafür, ob die Mail zu lang wird. */
export function lesezeit(text: string): number {
  const woerter = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(woerter / 200));
}

// ---------------------------------------------------------------------------
// Die Empfaengergruppen
//
// Nur die Beschreibung, ohne Datenbank: Diese Datei darf im Browser laufen,
// damit der Editor die Auswahl anzeigen kann. Das Holen der Adressen steht
// in lib/newsletter-gruppen.ts und bleibt auf dem Server.
// ---------------------------------------------------------------------------

export type GruppenSchluessel =
  | "eingetragen"
  | "kundinnen"
  | "beratung"
  | "fruehere"
  | "warteliste"
  | "equidesk-angebot"
  | "equidesk"
  | "alle";

export const GRUPPEN: {
  schluessel: GruppenSchluessel;
  name: string;
  grundlage: string;
  woher: string;
}[] = [
  {
    schluessel: "eingetragen",
    name: "Eingetragene",
    grundlage: "Einwilligung",
    woher:
      "Wer sich selbst für den Insider-Kanal oder den Futter-Check eingetragen und bestätigt hat. Diesen Menschen darfst du alles schicken.",
  },
  {
    schluessel: "kundinnen",
    name: "Kundinnen der Akademie",
    grundlage: "Bestandskundinnen",
    woher:
      "Wer einen Kurs oder ein E-Book gekauft hat. Ohne Einwilligung, aber als Bestandskundin: Es muss um deine eigenen, ähnlichen Angebote gehen, also um Fütterung und Pferdegesundheit.",
  },
  {
    schluessel: "beratung",
    name: "Beratungskundinnen",
    grundlage: "Bestandskundinnen",
    woher:
      "Deine Kundinnen aus EquiDesk, Futterberatung und Ausbildung. Gleiche Regel wie oben.",
  },
  {
    schluessel: "fruehere",
    name: "Frühere Käuferinnen",
    grundlage: "Bestandskundinnen",
    woher:
      "Wer früher über Tentary bei dir gekauft hat, E-Books, Ratgeber, Fütterungskalender. Sie haben nie auf einen Bestätigungslink geklickt, aber sie haben bezahlt: In der Kundenliste vom 27.08.2026 steht zu 856 von ihnen mindestens eine Bestellung. Gleiche Regel wie oben, eigene ähnliche Angebote.",
  },
  {
    schluessel: "warteliste",
    name: "Warteliste Ausbildung",
    grundlage: "Warteliste",
    woher:
      "Wer sich für die Ausbildung in eine Warteliste eingetragen hat, bei Tentary, alfima oder ThriveCart, und sie bis heute nicht gekauft hat. Wer inzwischen bucht, fällt automatisch heraus. Nur für Post zur Ausbildung: Die Eintragung ist eine Bitte um Nachricht zu diesem einen Angebot, nicht zu allen.",
  },
  {
    schluessel: "equidesk",
    name: "EquiDesk-Kundinnen",
    grundlage: "Bestandskundinnen",
    woher:
      "Wer EquiDesk hat, im Abo oder einmalig gekauft. Für Neuigkeiten zu EquiDesk selbst, etwa eine neue Funktion. Kein Angebot für EquiDesk an diese Gruppe, sie hat es ja schon.",
  },
  {
    schluessel: "equidesk-angebot",
    name: "EquiDesk-Angebot",
    grundlage: "gemischt",
    woher:
      "Für das EquiDesk-Angebot im September 2026: die Eingetragenen und die Teilnehmerinnen der Ausbildung, ohne alle, die EquiDesk schon haben. Wer es inzwischen hat, fällt beim nächsten Versand von selbst heraus. Bei den Eingetragenen trägt die Einwilligung, bei der Ausbildung die Regel für Bestandskundinnen, weil EquiDesk das Werkzeug für die Beratung ist, auf die die Ausbildung vorbereitet.",
  },
  {
    schluessel: "alle",
    name: "Alle zusammen",
    grundlage: "gemischt",
    woher:
      "Die vier Gruppen von oben, ohne Doppelte. Die Warteliste ist NICHT dabei: Ein Teil von ihr hat nie gekauft und sich nie eingetragen, dort trägt nur die Warteliste selbst, und die gilt allein für die Ausbildung. Nimm „alle“ für fachliche Rundbriefe, nicht für reine Werbung.",
  },
];

