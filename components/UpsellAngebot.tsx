"use client";

// ---------------------------------------------------------------------------
// Das Angebot direkt nach dem Kauf, mit einem Klick anzunehmen.
//
// ▸ AUCH DAS IST EINE BESTELLUNG. Deshalb steht auch hier die Leistung mit
//   dem Gesamtpreis unmittelbar über dem Knopf, und der Knopf heißt
//   "Zahlungspflichtig bestellen". Ein freundliches "Ja, das nehme ich dazu"
//   allein reicht nicht (§ 312j BGB). Bitte nicht umbenennen.
//
// ▸ WAS PASSIEREN KANN, WENN SIE ANNIMMT
//   1. Es läuft durch. Dann geht es weiter zur Dankeseite, und beide Zugänge
//      sind unterwegs.
//   2. Ihre Bank will eine Bestätigung, oder die Karte wird abgelehnt. Dann
//      kommt eine Adresse zurück und sie geht den normalen Bezahlweg. Das
//      ist Alltag und kein Fehler, deshalb steht dort auch keine
//      Fehlermeldung, sondern nur ein Hinweis.
//
// ▸ "Nein danke" muss genauso gut sichtbar sein wie das Angebot. Ein
//   versteckter Ausgang ärgert Leute, die gerade eben erst gekauft haben,
//   und kostet mehr, als der eine zusätzliche Verkauf einbringt.
// ---------------------------------------------------------------------------

import { useRouter } from "next/navigation";
import { useState } from "react";
import { preisText } from "@/lib/shop";
import type { DigitalProdukt } from "@/lib/digital";

export default function UpsellAngebot({
  nummer,
  token,
  produkt,
  ersparnis,
  stufe = "upsell",
  preis,
  titel,
  grund,
  ablehnenZiel,
  ablehnenText,
  kaufZiel,
}: {
  nummer: string;
  token: string;
  produkt: DigitalProdukt;
  /** In Cent. Ist sie 0, wird kein Vergleichspreis gezeigt. Warum das so
   *  sorgfältig gehandhabt wird, steht bei `ersparnis()` in lib/digital.ts. */
  ersparnis: number;
  /** Welche Stufe der Kette hier gezeigt wird. Der Server behandelt beide
   *  gleich, nur Preis und Text unterscheiden sich. */
  stufe?: "upsell" | "downsell";
  preis: number;
  titel: string;
  grund: string;
  /** Wohin es geht, wenn abgelehnt wird. Beim Upsell zum Downsell, falls es
   *  einen gibt, sonst direkt zur Dankeseite. */
  ablehnenZiel: string;
  ablehnenText: string;
  /**
   * Wohin es geht, wenn ANGENOMMEN wurde.
   *
   * ▸ DAS MUSS GETRENNT VOM ABLEHNEN-ZIEL SEIN, und genau daran hat es
   *   gefehlt: Vorher führte beides an dieselbe Stelle. Wer das Angebot
   *   annahm, landete danach beim Ersatzangebot, das nur für Ablehnende
   *   gedacht ist. Sie hatte gerade gekauft und bekam sofort das nächste
   *   Angebot vorgesetzt.
   */
  kaufZiel: string;
}) {
  const router = useRouter();
  const [laeuft, setLaeuft] = useState(false);
  const [hinweis, setHinweis] = useState<string | null>(null);

  const ablehnen = () => router.push(ablehnenZiel);

  const annehmen = async () => {
    if (laeuft) return;

    setLaeuft(true);
    setHinweis(null);

    try {
      const antwort = await fetch("/api/upsell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nummer, token, stufe }),
      });

      const daten = await antwort.json();

      // Durchgelaufen, oder sie hatte es schon. In beiden Fällen ist alles
      // in Ordnung, und es geht zur Dankeseite -- NICHT zum Ersatzangebot.
      // Das ist nur für die gedacht, die abgelehnt haben.
      if (daten.ergebnis === "bezahlt" || daten.ergebnis === "schon_gekauft") {
        router.push(kaufZiel);
        return;
      }

      // Die Bank will eine Bestätigung, oder die Karte ging nicht durch.
      if (daten.ergebnis === "bezahlseite" && daten.url) {
        window.location.href = daten.url;
        return;
      }

      setHinweis(
        daten.fehler ??
          "Das hat gerade nicht geklappt. Dein erster Kauf ist davon nicht betroffen.",
      );
      setLaeuft(false);
    } catch {
      setHinweis(
        "Die Verbindung hat nicht geklappt. Dein erster Kauf ist davon nicht betroffen.",
      );
      setLaeuft(false);
    }
  };

  return (
    <div className="rounded-[18px] border border-line bg-white p-6 sm:p-8">
      <h2 className="mb-4 font-serif text-[22px] leading-snug sm:text-[26px]">
        {titel}
      </h2>

      <p className="mb-6 text-[16.5px] leading-relaxed text-ink-soft">
        {grund}
      </p>

      {/* Leistung und Preis unmittelbar über dem Knopf. Nicht verschieben. */}
      <div className="rounded-[14px] bg-cream-deep p-5">
        <div className="text-[15.5px] leading-snug">{produkt.name}</div>

        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
          {produkt.leistung}
        </p>

        <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
          <span className="text-[15px] font-medium">Gesamt</span>

          <span className="flex items-baseline gap-3">
            {ersparnis > 0 && (
              <span className="text-[15px] text-ink-soft line-through tabular-nums">
                {preisText(produkt.preis)}
              </span>
            )}
            <span className="font-serif text-[26px] tabular-nums">
              {preisText(preis)}
            </span>
          </span>
        </div>

        <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">
          Einmalig, inklusive {produkt.mwst} % Mehrwertsteuer. Abgebucht wird
          über die Zahlungsart, die du gerade benutzt hast. Du möchtest den
          Zugang sofort und weißt, dass dein Widerrufsrecht damit erlischt.
        </p>
      </div>

      {hinweis && (
        <p
          role="alert"
          className="mt-5 rounded-[12px] bg-cream-deep p-4 text-[14px] leading-relaxed"
        >
          {hinweis}
        </p>
      )}

      <button
        type="button"
        onClick={annehmen}
        disabled={laeuft}
        className="mt-6 w-full rounded-full bg-ink px-6 py-4 text-[15px] font-medium text-cream transition-colors hover:bg-rose-deep disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-ink"
      >
        {laeuft ? "Einen Moment…" : "Zahlungspflichtig bestellen"}
      </button>

      <button
        type="button"
        onClick={ablehnen}
        disabled={laeuft}
        className="mt-3 w-full rounded-full px-6 py-3 text-[14.5px] text-ink-soft underline underline-offset-4 transition-colors hover:text-ink disabled:opacity-40"
      >
        {ablehnenText}
      </button>
    </div>
  );
}
