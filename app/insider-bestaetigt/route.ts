import { NextResponse } from "next/server";
import {
  bestaetigeInsider,
  sendeInsiderWillkommen,
  sendeInsiderBenachrichtigung,
} from "@/lib/insider-server";
import { KEKS_NAME, KEKS_OPTIONEN } from "@/lib/insider-zugang";
import { seitenUrl } from "@/lib/seo";

// ---------------------------------------------------------------------------
// Das Ziel jedes persönlichen Links aus einer Insider-Mail.
//
// Diese Adresse macht zweierlei, je nachdem, wer sie öffnet:
//
//   Beim ersten Mal — der Link aus der Bestätigungsmail — wird die Anmeldung
//   bestätigt, und erst danach gehen die beiden Mails raus, die etwas
//   Werbliches enthalten: das Willkommen an sie und die Benachrichtigung an
//   Yasi. Vorher darf nichts davon verschickt werden.
//
//   Bei jedem weiteren Mal — der Link "Ich bin schon dabei" für ein neues
//   Gerät — meldet er sie einfach an.
//
// In beiden Fällen wird derselbe Keks gesetzt. Deshalb ist das hier ein
// Route-Handler und keine Seite: Kekse lassen sich nur beim Ausliefern einer
// Antwort setzen, nicht beim Bauen einer Seite.
// ---------------------------------------------------------------------------

/** Verhindert, dass jemand über ?weiter= auf eine fremde Seite umgeleitet
 *  wird. Erlaubt sind nur eigene Pfade, und "//" ist keiner — das wäre schon
 *  wieder eine fremde Adresse. */
function sicheresZiel(weiter: string | null): string {
  if (!weiter) return "/insider-willkommen";
  if (!weiter.startsWith("/") || weiter.startsWith("//")) return "/insider-willkommen";
  return weiter;
}

export async function GET(request: Request) {
  const adresse = new URL(request.url);
  const token = adresse.searchParams.get("token");
  const ziel = sicheresZiel(adresse.searchParams.get("weiter"));

  if (!token) {
    return NextResponse.redirect(new URL("/insider-willkommen?fehler=1", adresse.origin));
  }

  const ergebnis = await bestaetigeInsider(token);

  if (!ergebnis) {
    return NextResponse.redirect(new URL("/insider-willkommen?fehler=1", adresse.origin));
  }

  // Nur beim ersten Klick verschicken. Wer den Link ein zweites Mal öffnet,
  // soll nicht alles doppelt bekommen, und Yasi auch nicht.
  if (ergebnis.frisch) {
    await sendeInsiderWillkommen(ergebnis.anmeldung, seitenUrl);
    await sendeInsiderBenachrichtigung(ergebnis.anmeldung);
  }

  const antwort = NextResponse.redirect(new URL(ziel, adresse.origin));
  antwort.cookies.set(KEKS_NAME, ergebnis.anmeldung.token, KEKS_OPTIONEN);
  return antwort;
}
