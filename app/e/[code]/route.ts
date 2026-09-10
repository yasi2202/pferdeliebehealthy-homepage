import { NextResponse } from "next/server";
import { digitalFinden } from "@/lib/digital";
import { KEKS_DAUER, KEKS_NAME, zielseite } from "@/lib/empfehlungsprogramm";
import {
  empfehlerZuCode,
  klickZaehlen,
} from "@/lib/empfehlungsprogramm-server";

// ---------------------------------------------------------------------------
// Der persönliche Empfehlungslink, zum Beispiel
//     https://www.pferdeliebehealthy.de/e/MARIE
//     https://www.pferdeliebehealthy.de/e/MARIE?zu=ratiopro
//
// Was hier passiert, in drei Schritten:
//   1. Der Klick wird gezählt, damit die Empfehlerin sieht, ob ihr Link
//      überhaupt benutzt wird.
//   2. Ein Keks wird im Browser abgelegt, 30 Tage lang. Darin steht nur der
//      Code, sonst nichts.
//   3. Die Besucherin wird auf die Zielseite weitergeleitet und merkt von
//      alldem nichts. Sie zahlt den normalen Preis.
//
// ▸ WARUM EINE EIGENE ADRESSE UND NICHT ?ref=MARIE AN JEDER SEITE
//   Weil der Link kurz und lesbar sein muss. Er wird in eine Instagram-Bio
//   getippt, in eine Sprachnachricht diktiert und auf einen Flyer gedruckt.
//   /e/MARIE schafft das, ein angehängter Parameter nicht. Nebenbei muss so
//   nicht jede einzelne Seite der Website etwas vom Programm wissen: Der
//   ganze Ablauf sitzt in dieser einen Datei.
//
// ▸ WAS DER KEKS FÜR DEN DATENSCHUTZ BEDEUTET
//   Er wird nur gesetzt, wenn jemand tatsächlich einen Empfehlungslink
//   anklickt, nie beim normalen Besuch der Website. Er enthält keinen Namen
//   und keine Kennung der Besucherin, nur den Code der Empfehlerin. Er dient
//   allein dazu, eine Provision zuzuordnen.
//
//   Trotzdem ist er kein technisch notwendiger Keks im Sinne des § 25 TDDDG.
//   Er gehört deshalb in die Datenschutzerklärung, und ob zusätzlich eine
//   Einwilligung nötig ist, gehört einmal an den Händlerbund. Siehe den
//   Abschnitt im Datenschutz, der dazu angelegt wurde.
// ---------------------------------------------------------------------------

export const runtime = "nodejs";

/** Wohin es geht, wenn nichts anderes gewünscht ist. */
const STARTSEITE = "/";

/**
 * Macht aus dem Wunsch `zu` einen sicheren Pfad auf der eigenen Website.
 *
 * ▸ WARUM DAS GEPRÜFT WERDEN MUSS: Ohne Prüfung könnte jemand den Link
 *   /e/MARIE?zu=https://boese-seite.de bauen und verschicken. Er sähe aus
 *   wie deiner, führte aber woandershin. Das nennt sich offene Weiterleitung
 *   und ist ein klassischer Weg, das Vertrauen in eine bekannte Adresse zu
 *   missbrauchen. Deshalb kommt hier nur heraus, was auf dieser Website
 *   liegt.
 */
function zielPfad(zu: string | null): string {
  if (!zu) return STARTSEITE;

  const wunsch = zu.trim();

  // Ein reiner Name ohne Schrägstrich: als Angebot deuten, aber nur, wenn es
  // das Angebot wirklich gibt. Sonst landet sie auf einer Fehlerseite, und
  // das ausgerechnet nach einem Klick auf eine persönliche Empfehlung.
  //
  // `zielseite` fängt dabei die Fälle ab, in denen die Verkaufsseite anders
  // heisst als das Angebot. Das betrifft auch alte Links, die noch mit dem
  // Namen des Angebots unterwegs sind.
  if (/^[a-z0-9-]+$/i.test(wunsch)) {
    return digitalFinden(wunsch) ? `/${zielseite(wunsch)}` : STARTSEITE;
  }

  // Ein Pfad mit Schrägstrich: nur, wenn er auf dieser Website bleibt.
  // "//fremde-seite.de" wäre für den Browser eine fremde Adresse, deshalb
  // ist der doppelte Schrägstrich am Anfang ausgeschlossen.
  if (wunsch.startsWith("/") && !wunsch.startsWith("//")) {
    return wunsch;
  }

  return STARTSEITE;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const adresse = new URL(request.url);
  const ziel = new URL(zielPfad(adresse.searchParams.get("zu")), adresse.origin);

  const antwort = NextResponse.redirect(ziel);

  const empfehler = await empfehlerZuCode(code);

  // ▸ EIN UNBEKANNTER ODER STILLGELEGTER CODE FÜHRT TROTZDEM AUF DIE SEITE.
  //   Die Besucherin kann nichts dafür, dass der Link nicht mehr gilt. Sie
  //   sieht die Website, nur eben ohne dass jemand daran verdient. Eine
  //   Fehlerseite wäre hier das Schlechteste von allem.
  if (!empfehler || empfehler.status !== "aktiv") {
    return antwort;
  }

  await klickZaehlen(empfehler);

  // ▸ DER ZULETZT GEKLICKTE LINK GEWINNT.
  //   Klickt jemand erst den Link von Marie und drei Wochen später den von
  //   Sabine, bekommt Sabine die Provision. Das ist im Handel die übliche
  //   Regel, und sie ist die einzige, die sich einer Empfehlerin erklären
  //   lässt: Wer zuletzt überzeugt hat, hat den Kauf ausgelöst.
  antwort.cookies.set(KEKS_NAME, empfehler.code, {
    httpOnly: true, // Kein JavaScript kommt heran, auch kein fremdes.
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: KEKS_DAUER,
  });

  return antwort;
}
