import { createHmac } from "node:crypto";
import { preisText } from "@/lib/shop";
import type { Bestellung } from "@/lib/shop-server";
import type { DigitalBestellung } from "@/lib/digital-server";
import { auswerten } from "@/lib/auswertung";

// ---------------------------------------------------------------------------
// Die Meldung aufs Handy, als Meldung der Akademie-App.
//
// ▸ WOZU DAS DA IST
//   Käufe, Shop-Bestellungen, der Tagesbericht am Abend und jede Mail an
//   info@ kommen zusätzlich als Meldung aufs Handy, sofort und mit Ton. Bis
//   zum 10.09.2026 lief das über einen Telegram-Bot. Yasemin wollte dann alles
//   an einer Stelle: „ja alles über die app“. Beratung, Prüfung, RatioPro und
//   die Morgenmail melden sich ohnehin schon über die Akademie-App.
//
// ▸ WIE ES LÄUFT
//   Die Push-Schlüssel und die angemeldeten Geräte liegen in der Akademie.
//   Diese Datei schickt die Meldung deshalb an die Akademie, an
//   /api/push/an-yasemin, und die gibt sie an Yasemins Geräte weiter.
//   Unterschrieben wird mit dem Supabase-Schlüssel, den beide Projekte
//   kennen, genau wie bei der Anmeldebrücke. Es muss also kein neuer Wert in
//   die Vercel-Einstellungen.
//
// ▸ AUF DEM IPHONE kommt nur etwas an, solange die Akademie auf dem
//   Home-Bildschirm liegt und dort Meldungen erlaubt sind. Wird das Symbol
//   gelöscht, bleibt es still, ohne Fehlermeldung.
//
// ▸ WIRFT NIEMALS. Der Aufrufer steckt mitten in einem bezahlten Kauf, da
//   darf nichts hochgehen. Scheitert die Meldung, steht es im Protokoll.
// ---------------------------------------------------------------------------

const AKADEMIE = (process.env.AKADEMIE_URL || "https://akademie.pferdeliebehealthy.de").replace(/\/+$/, "");
const SCHLUESSEL = process.env.SUPABASE_SECRET_KEY || "";

export type Meldung = {
  titel: string;
  text: string;
  /** Wohin ein Tippen führt. Vorgabe: die Homepage-Werkzeuge in der Akademie-Verwaltung. */
  ziel?: string;
  /** Gleiche Kennung ersetzt die vorige Meldung. Käufe haben je eine eigene. */
  kennung?: string;
};

/** Sagt, ob Meldungen überhaupt rausgehen können. */
export function handyEingerichtet(): boolean {
  return Boolean(SCHLUESSEL);
}

/** Schickt eine Meldung aufs Handy. Gibt true zurück, wenn sie auf mindestens einem Gerät ankam. */
export async function aufsHandy(meldung: Meldung): Promise<boolean> {
  if (!SCHLUESSEL) {
    console.warn("SUPABASE_SECRET_KEY fehlt, Meldung aufs Handy entfaellt.");
    return false;
  }

  try {
    const koerper = JSON.stringify({
      titel: meldung.titel,
      text: meldung.text,
      ziel: meldung.ziel ?? "/admin/homepage",
      kennung: meldung.kennung,
    });
    const zeit = Date.now();
    const unterschrift = createHmac("sha256", SCHLUESSEL).update(`${zeit}:${koerper}`).digest("hex");

    const res = await fetch(`${AKADEMIE}/api/push/an-yasemin`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-unterschrift": `${zeit}.${unterschrift}` },
      body: koerper,
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Die Akademie hat die Meldung nicht angenommen:", res.status);
      return false;
    }
    const antwort = await res.json().catch(() => null);
    return antwort?.ok === true;
  } catch (e) {
    console.error("Die Akademie war fuer die Meldung nicht erreichbar:", e);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Die einzelnen Meldungen
// ---------------------------------------------------------------------------

/** Ein bezahlter Kauf eines digitalen Angebots: Kurs, E-Book, Ausbildung,
 *  Werkzeug, und ebenso das Angebot direkt nach dem Kauf. */
export async function kaufAufsHandy(b: DigitalBestellung): Promise<boolean> {
  const kopf = b.art === "upsell" ? "🎁 Angebot angenommen" : "💛 Neuer Kauf";
  const name = `${b.vorname} ${b.nachname}`.trim() || b.email;
  const artikel = b.artikel.map((a) => a.name).join(", ");

  return aufsHandy({
    titel: `${kopf}: ${preisText(b.gesamt)}`,
    text: `${artikel} · ${name}`,
    kennung: `kauf-${b.nummer}`,
  });
}

/** Eine bezahlte Bestellung aus dem Futtershop. Ort und Anmerkung stehen
 *  mit dabei, weil danach ein Paket gepackt werden muss. */
export async function bestellungAufsHandy(b: Bestellung): Promise<boolean> {
  const name = `${b.vorname} ${b.nachname}`.trim() || b.email;
  const artikel = b.artikel.map((a) => `${a.menge} × ${a.name}`).join(", ");

  return aufsHandy({
    titel: `📦 Neue Bestellung: ${preisText(b.gesamt)}`,
    text:
      `${artikel} · ${name}, ${b.plz} ${b.ort}` +
      (b.anmerkung ? ` · Anmerkung: ${b.anmerkung}` : ""),
    kennung: `bestellung-${b.nummer}`,
  });
}

/** Die Übersicht am Abend.
 *
 *  Sie kommt auch an einem Tag ohne Verkauf, absichtlich: Eine Meldung, die
 *  nur bei Umsatz käme, liesse dich im Zweifel rätseln, ob sie ausgeblieben
 *  ist oder ob etwas kaputt ist. */
export async function tagesberichtAufsHandy(): Promise<boolean> {
  const zahlen = await auswerten(2);

  if (!zahlen.gelesen) {
    return aufsHandy({
      titel: "📊 Tagesübersicht",
      text:
        "Die Zahlen liessen sich gerade nicht laden. Steht morgen wieder dasselbe hier, " +
        "stimmt etwas mit der Datenbank nicht.",
      kennung: "tagesbericht",
    });
  }

  const finde = (name: string) => zahlen.zeitraeume.find((z) => z.name === name);
  const heute = finde("Heute");
  const woche = finde("Diese Woche");
  const monat = finde("Dieser Monat");

  const teile = [
    heute && heute.anzahl > 0
      ? `Heute ${preisText(heute.umsatz)} aus ${heute.anzahl} ${heute.anzahl === 1 ? "Kauf" : "Käufen"}`
      : "Heute kein Verkauf",
    woche ? `Woche ${preisText(woche.umsatz)} (${woche.anzahl})` : "",
    monat ? `Monat ${preisText(monat.umsatz)} (${monat.anzahl})` : "",
    zahlen.probleme.length > 0
      ? `⚠️ ${zahlen.probleme.length} ${
          zahlen.probleme.length === 1 ? "Kauf wartet" : "Käufe warten"
        } auf die Freischaltung von Hand`
      : "",
  ];

  return aufsHandy({
    titel: "📊 Tagesübersicht",
    text: teile.filter((t) => t !== "").join(" · "),
    kennung: "tagesbericht",
  });
}
