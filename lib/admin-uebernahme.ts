import { createHmac, timingSafeEqual } from "node:crypto";

// ---------------------------------------------------------------------------
// Die Brücke aus der Akademie in diesen Verwaltungsbereich.
//
// ▸ DAS PROBLEM
//   Die Werkzeuge der Website (Newsletter, Auswertung, Adressen, Rabattcodes,
//   Rechnungen, Stall Organizer) liegen hier, die Verwaltung der Akademie
//   liegt auf einer anderen Adresse. Zwei Adressen heißt zwei Kekse, also
//   zweimal anmelden: einmal in der Akademie, einmal hier mit dem Passwort.
//   Genau das soll wegfallen, ohne dass das Passwort schwächer wird.
//
// ▸ DIE LÖSUNG
//   Die Akademie prüft, ob wirklich ein Admin davorsteht, und stellt dann
//   einen kurzlebigen Zettel aus: Zeitstempel, Ziel und eine Unterschrift
//   darüber. Diese Seite prüft die Unterschrift und setzt daraufhin ihren
//   eigenen Keks, so als wäre das Passwort eingegeben worden.
//
// ▸ WARUM DER SUPABASE-SCHLÜSSEL ALS UNTERSCHRIFT DIENT
//   Beide Projekte hängen am selben Supabase-Projekt und kennen deshalb
//   beide SUPABASE_SECRET_KEY. Es braucht also kein neues Geheimnis, das an
//   zwei Stellen gepflegt werden müsste und beim Tauschen leicht auseinander
//   läuft. Denselben Weg geht der Abmeldelink im Newsletter schon.
//
// ▸ WARUM DER ZETTEL NUR ZWEI MINUTEN GILT
//   Er steht in der Adresszeile und landet damit im Verlauf des Browsers.
//   Zwei Minuten reichen für einen Klick und sind zu kurz, um später noch
//   etwas damit anzufangen.
// ---------------------------------------------------------------------------

const SCHLUESSEL = process.env.SUPABASE_SECRET_KEY || "";

/** Wie lange ein Zettel gilt, in Millisekunden. */
export const GUELTIG_MS = 2 * 60 * 1000;

function unterschreiben(inhalt: string): string {
  return createHmac("sha256", SCHLUESSEL).update(inhalt).digest("hex");
}

/**
 * Nur Pfade in diesem Verwaltungsbereich.
 *
 * Ohne diese Prüfung wäre der Zettel ein Werkzeug, um jemanden auf eine
 * fremde Seite zu schicken: `//fremde-seite.de` ist für den Browser keine
 * Unterseite, sondern ein anderer Server.
 */
export function sicheresZiel(roh: string | null | undefined): string {
  if (!roh) return "/admin";
  if (!roh.startsWith("/admin")) return "/admin";
  if (roh.startsWith("//") || roh.startsWith("/\\")) return "/admin";
  return roh;
}

/** Baut einen Zettel. Wird in der Akademie benutzt, hier steht er zum Nachlesen. */
export function zettelBauen(ziel: string): string {
  const zeit = Date.now();
  return `${zeit}.${unterschreiben(`${zeit}:${ziel}`)}`;
}

/**
 * Prüft einen Zettel: Unterschrift richtig und nicht zu alt?
 *
 * Gibt bewusst nur true oder false zurück und keinen Grund. Wer von außen
 * probiert, soll nicht erfahren, ob die Unterschrift falsch oder der Zettel
 * nur abgelaufen war.
 */
export function zettelStimmt(zettel: string | null | undefined, ziel: string): boolean {
  if (!SCHLUESSEL || !zettel) return false;

  const [zeitText, unterschrift] = zettel.split(".");
  if (!zeitText || !unterschrift) return false;

  const zeit = Number(zeitText);
  if (!Number.isFinite(zeit)) return false;

  // Auch in die Zukunft begrenzt: Gehen die Uhren der beiden Server
  // auseinander, soll das ein paar Sekunden ausmachen dürfen und nicht
  // beliebig viel.
  const alter = Date.now() - zeit;
  if (alter > GUELTIG_MS || alter < -GUELTIG_MS) return false;

  const erwartet = unterschreiben(`${zeit}:${ziel}`);
  const a = Buffer.from(erwartet, "utf8");
  const b = Buffer.from(unterschrift, "utf8");

  return a.length === b.length && timingSafeEqual(a, b);
}
// ENDE DER DATEI
