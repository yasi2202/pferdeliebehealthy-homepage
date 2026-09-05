import { preisText } from "@/lib/shop";
import type { Bestellung } from "@/lib/shop-server";
import type { DigitalBestellung } from "@/lib/digital-server";
import { auswerten } from "@/lib/auswertung";

// ---------------------------------------------------------------------------
// Die Meldung aufs Handy, über Telegram.
//
// ▸ WOZU DAS DA IST
//   Bei jedem bezahlten Kauf geht schon eine Mail an info@pferdeliebehealthy.de.
//   Eine Mail siehst du aber erst, wenn du ins Postfach schaust. Diese Datei
//   schickt dieselbe Nachricht zusätzlich als Telegram-Nachricht, die sofort
//   mit Ton auf dem Handy ankommt.
//
// ▸ EINRICHTEN, EINMALIG (dauert etwa fünf Minuten)
//   1. Telegram auf dem Handy installieren und ein Konto anlegen.
//   2. In Telegram nach @BotFather suchen (das ist der offizielle Bot von
//      Telegram, er hat einen blauen Haken) und ihn anschreiben.
//   3. /newbot schicken. Er fragt nach einem Namen (zum Beispiel
//      "Pferdeliebehealthy Kasse") und nach einem Benutzernamen, der auf
//      "bot" enden muss (zum Beispiel "pferdeliebe_kasse_bot").
//   4. Er antwortet mit einem langen Schlüssel, der so aussieht:
//      123456789:AAF-abcdefgh... Das ist der TELEGRAM_BOT_TOKEN.
//   5. Deinen neuen Bot in Telegram suchen, öffnen und ihm irgendetwas
//      schreiben, zum Beispiel "hallo". Das ist wichtig: Ein Bot darf
//      niemandem schreiben, der ihn nicht zuerst angeschrieben hat.
//   6. Am Rechner `node scripts/telegram-einrichten.mjs <schlüssel>` laufen
//      lassen. Das Skript sagt dir deine TELEGRAM_CHAT_ID und schickt dir
//      zur Probe gleich eine Nachricht aufs Handy.
//   7. Beide Werte in die Vercel-Einstellungen des Projekts eintragen,
//      als TELEGRAM_BOT_TOKEN und TELEGRAM_CHAT_ID, dann neu veröffentlichen.
//
// ▸ SOLANGE DIE BEIDEN WERTE FEHLEN, PASSIERT NICHTS.
//   Kein Fehler, kein Abbruch, nur eine Zeile im Protokoll. Ein Kauf darf
//   niemals daran scheitern, dass eine Benachrichtigung nicht rausgeht.
//
// ▸ DER SCHLÜSSEL IST EIN PASSWORT. Er heisst bewusst nicht NEXT_PUBLIC_...,
//   dadurch reicht Next.js ihn gar nicht erst an den Browser weiter. Wer ihn
//   hat, kann in deinem Namen Nachrichten schicken. Nicht weitergeben, nicht
//   in einen Screenshot, nicht ins Repo.
// ---------------------------------------------------------------------------

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

/** Sagt, ob der Bot eingerichtet ist. */
export function telegramEingerichtet(): boolean {
  return Boolean(TOKEN && CHAT_ID);
}

/** Macht Zeichen unschädlich, die Telegram sonst als Auszeichnung liest.
 *  Ohne das zerbricht eine Nachricht an einem Namen wie "Müller & Sohn". */
function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Schickt eine Nachricht aufs Handy.
 *
 *  Gibt true zurück, wenn sie angekommen ist. Wirft niemals: Der Aufrufer
 *  steckt mitten in einem bezahlten Kauf, da darf nichts hochgehen. */
export async function aufsHandy(text: string): Promise<boolean> {
  if (!TOKEN || !CHAT_ID) {
    console.warn("Telegram ist nicht eingerichtet, Meldung entfaellt.");
    return false;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: "HTML",
        // Sonst baut Telegram unter jede Adresse eine grosse Vorschaukarte.
        link_preview_options: { is_disabled: true },
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Telegram meldet einen Fehler:", await res.text());
      return false;
    }

    return true;
  } catch (e) {
    console.error("Telegram war nicht erreichbar:", e);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Die einzelnen Meldungen
// ---------------------------------------------------------------------------

/** Ein bezahlter Kauf eines digitalen Angebots: Kurs, E-Book, Ausbildung,
 *  Werkzeug, und ebenso das Angebot direkt nach dem Kauf. */
export async function kaufAufsHandy(b: DigitalBestellung): Promise<boolean> {
  const angebot = b.art === "upsell";
  const kopf = angebot ? "🎁 Angebot angenommen" : "💛 Neuer Kauf";
  const name = `${b.vorname} ${b.nachname}`.trim() || b.email;
  const artikel = b.artikel.map((a) => a.name).join(", ");

  return aufsHandy(
    `${kopf}\n\n` +
      `<b>${esc(artikel)}</b>\n` +
      `${esc(preisText(b.gesamt))}\n\n` +
      `${esc(name)}\n` +
      `${esc(b.email)}\n\n` +
      `<i>${esc(b.nummer)}</i>`,
  );
}

/** Eine bezahlte Bestellung aus dem Futtershop. Hier steht die Anschrift mit
 *  dabei, weil danach ein Paket gepackt werden muss. */
export async function bestellungAufsHandy(b: Bestellung): Promise<boolean> {
  const name = `${b.vorname} ${b.nachname}`.trim() || b.email;
  const artikel = b.artikel
    .map((a) => `${a.menge} × ${a.name}`)
    .join("\n");

  return aufsHandy(
    `📦 Neue Bestellung\n\n` +
      `${esc(artikel)}\n\n` +
      `<b>${esc(preisText(b.gesamt))}</b> (davon ${esc(preisText(b.versand))} Versand)\n\n` +
      `${esc(name)}\n` +
      `${esc(b.strasse)}, ${esc(b.plz)} ${esc(b.ort)}\n` +
      `${esc(b.email)}\n\n` +
      (b.anmerkung ? `Anmerkung: ${esc(b.anmerkung)}\n\n` : "") +
      `<i>${esc(b.nummer)}</i>`,
  );
}

/** Die Übersicht am Abend.
 *
 *  Sie kommt auch an einem Tag ohne Verkauf, absichtlich: Eine Nachricht,
 *  die nur bei Umsatz käme, liesse dich im Zweifel rätseln, ob sie
 *  ausgeblieben ist oder ob der Bot kaputt ist. */
export async function tagesberichtAufsHandy(): Promise<boolean> {
  const zahlen = await auswerten(2);

  if (!zahlen.gelesen) {
    return aufsHandy(
      "📊 Tagesübersicht\n\nDie Zahlen liessen sich gerade nicht laden. " +
        "Steht morgen wieder dasselbe hier, stimmt etwas mit der Datenbank nicht.",
    );
  }

  const finde = (name: string) => zahlen.zeitraeume.find((z) => z.name === name);
  const heute = finde("Heute");
  const woche = finde("Diese Woche");
  const monat = finde("Dieser Monat");

  const heuteText =
    heute && heute.anzahl > 0
      ? `<b>${esc(preisText(heute.umsatz))}</b> aus ${heute.anzahl} ${
          heute.anzahl === 1 ? "Kauf" : "Käufen"
        }`
      : "Heute kein Verkauf.";

  // Was heute verkauft wurde, steht im Verlauf nicht nach Produkt getrennt.
  // Für die Übersicht reichen die Summen, die Einzelheiten stehen ohnehin
  // schon in den Meldungen, die den Tag über gekommen sind.
  const zeilen = [
    "📊 Tagesübersicht",
    "",
    heuteText,
    "",
    woche ? `Diese Woche: ${esc(preisText(woche.umsatz))} (${woche.anzahl})` : "",
    monat ? `Dieser Monat: ${esc(preisText(monat.umsatz))} (${monat.anzahl})` : "",
  ];

  if (zahlen.probleme.length > 0) {
    zeilen.push(
      "",
      `⚠️ ${zahlen.probleme.length} ${
        zahlen.probleme.length === 1 ? "Kauf wartet" : "Käufe warten"
      } auf die Freischaltung von Hand.`,
    );
  }

  return aufsHandy(zeilen.filter((z) => z !== "").join("\n"));
}
