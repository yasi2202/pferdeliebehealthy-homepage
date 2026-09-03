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

export type BriefStatus = "entwurf" | "versendet";

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
const ROSE_TIEF = "#B87878";
const INK = "#3B2A28";
const TEXT = "#4A3636";
const LEISE = "#8a7070";
const LINIE = "#EAD8D8";

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
//     [[knopf: Ansehen | https://…]]                 ein grosser Knopf
//     [[angebot: Name | 29 € | https://… | Satz ]]   ein Angebotskasten
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

    // ---- Angebotskasten: Name | Preis | Link | Satz
    const angebot = block.match(/^\[\[angebot:\s*([^|]+)\|([^|]*)\|([^|]+)\|([\s\S]*)\]\]$/i);
    if (angebot) {
      const link = linkPruefen(angebot[3]);
      const name = sicher(angebot[1].trim());
      const preis = sicher(angebot[2].trim());
      const satz = zeileSchmuecken(sicher(angebot[4].replace(/\]\]$/, "").trim()));

      // Weisser Grund mit rosé Rand, nicht cremefarben wie der
      // Hinweiskasten: Sonst sehen der fachliche Merksatz und das Angebot
      // gleich aus, und das Auge übersieht beim Überfliegen genau das, was
      // verkaufen soll.
      teile.push(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:30px 0;background:#ffffff;border:1px solid ${ROSE};border-radius:14px;">
        <tr><td style="padding:24px 26px;">
          <p style="margin:0 0 10px;font-size:11.5px;letter-spacing:2px;text-transform:uppercase;color:${ROSE_TIEF};">Mein Angebot dazu</p>
          <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:19px;line-height:1.35;color:${INK};">${name}</p>
          ${preis ? `<p style="margin:0 0 10px;font-size:15px;color:${ROSE_TIEF};font-weight:600;">${preis}</p>` : ""}
          ${satz ? `<p style="margin:0 0 18px;font-size:15.5px;line-height:1.7;color:${TEXT};">${satz}</p>` : ""}
          ${
            link
              ? `<a href="${link}" style="background:${ROSE_TIEF};color:#ffffff;padding:12px 26px;border-radius:999px;text-decoration:none;font-size:15.5px;display:inline-block;font-weight:600;">Ansehen</a>`
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

    // ---- Bild
    const bild = block.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (bild) {
      const quelle = linkPruefen(bild[2]);
      if (quelle) {
        teile.push(`<img src="${quelle}" alt="${sicher(bild[1])}" width="100%" style="width:100%;max-width:100%;height:auto;border-radius:14px;display:block;margin:26px 0;border:0;">`);
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
        .map(
          (z) =>
            `<li style="margin:0 0 10px;">${zeileSchmuecken(
              sicher(z.trim().replace(/^[-•]\s+/, ""))
            )}</li>`
        )
        .join("");
      teile.push(
        `<ul style="font-size:16.5px;line-height:1.75;margin:0 0 20px;padding-left:22px;color:${TEXT};">${punkte}</ul>`
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
function kopf(): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:0 0 26px;">
      <p style="margin:0;font-family:Georgia,serif;font-size:17px;letter-spacing:3px;text-transform:uppercase;color:${ROSE_TIEF};">Pferdeliebehealthy</p>
      <p style="margin:6px 0 0;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:${LEISE};">Ernährungsberatung für Pferde</p>
    </td></tr></table>`;
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
  imBrowserAnsehen?: string
): string {
  const browserZeile = imBrowserAnsehen
    ? `<a href="${imBrowserAnsehen}" style="color:${LEISE};">Im Browser ansehen</a> · `
    : "";

  return `${vorschauZeile(vorschautext)}
<div style="background:${CREME};padding:36px 14px;font-family:Georgia,'Times New Roman',serif;color:${TEXT};-webkit-text-size-adjust:100%;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;">
      <tr><td style="padding:0 8px 4px;">${kopf()}</td></tr>
      <tr><td style="background:#ffffff;border-radius:18px;padding:38px 34px;">
        ${inhaltHtml}
        <p style="font-size:16.5px;line-height:1.75;margin:32px 0 0;color:${TEXT};">Alles Gute für dich und dein Pferd,<br><span style="font-family:Georgia,serif;font-size:19px;color:${ROSE_TIEF};">Yasi</span></p>
      </td></tr>
      <tr><td style="padding:22px 30px 0;font-size:13px;line-height:1.75;color:${LEISE};text-align:center;">
        <p style="margin:0 0 10px;">
          Yasemin Halac · Pferdeliebehealthy<br>
          <a href="mailto:info@pferdeliebehealthy.de" style="color:${ROSE_TIEF};">info@pferdeliebehealthy.de</a>
        </p>
        <p style="margin:0;">
          ${browserZeile}Du bekommst diese Mail, weil du dich auf pferdeliebehealthy.de
          eingetragen hast.<br><a href="${abmeldeLink}" style="color:${LEISE};">Hier abmelden</a>
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

export type GruppenSchluessel = "eingetragen" | "kundinnen" | "beratung" | "alle";

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
    schluessel: "alle",
    name: "Alle zusammen",
    grundlage: "gemischt",
    woher:
      "Die drei Gruppen von oben, ohne Doppelte. Nimm sie für fachliche Rundbriefe, nicht für reine Werbung.",
  },
];

