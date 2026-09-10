"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PIXEL, beobachten, gewaehlt, melde, offen, pixelStarten, waehlen } from "@/lib/messung";

// ---------------------------------------------------------------------------
// Das Einwilligungsbanner für die Werbemessung.
//
// ▸ ES ERSCHEINT NUR, WENN AUCH WIRKLICH GEMESSEN WIRD. Ohne die Variable
//   NEXT_PUBLIC_META_PIXEL bleibt es weg, siehe lib/messung.ts.
//
// ▸ ABLEHNEN MUSS GENAUSO LEICHT SEIN WIE ZUSTIMMEN. Deshalb zwei gleich
//   große Knöpfe nebeneinander, keine Schaltfläche, die man erst suchen
//   muss, und kein vorangekreuztes Feld. Ein Banner, dessen "Nein" versteckt
//   ist, macht die Einwilligung unwirksam, und dann ist der ganze Pixel
//   rechtswidrig gesetzt.
//
// ▸ KEIN "SPÄTER" UND KEIN WEGKLICKEN OHNE ANTWORT. Wer nichts entscheidet,
//   wird nicht gemessen, das Banner bleibt aber stehen. Ein X in der Ecke
//   wäre bequem, wird aber als stille Ablehnung gewertet und dann müsste
//   die Frage bei jedem Besuch neu kommen.
//
// Der Baustein meldet außerdem jeden Seitenwechsel als Seitenaufruf. Next.js
// tauscht beim Klick nur den Inhalt aus, der Pixel merkt davon von sich aus
// nichts und würde sonst nur die erste Seite eines Besuchs zählen.
// ---------------------------------------------------------------------------

export default function Einwilligung() {
  const [zeigen, setZeigen] = useState(false);
  const pfad = usePathname();
  const ersterPfad = useRef(true);

  useEffect(() => {
    const pruefen = () => {
      setZeigen(offen());
      // ▸ HIER STARTET DER PIXEL BEI JEDEM BESUCH NEU. Die Einwilligung liegt
      //   im Browser, die geladene Seite weiss beim Aufruf nichts davon. Ohne
      //   diese Zeile lud der Pixel nur einmal, naemlich in dem Augenblick, in
      //   dem jemand auf "Einverstanden" klickte, und bei jedem spaeteren
      //   Besuch derselben Person gar nicht mehr. Genau die Besuche, um die es
      //   bei Werbung geht, waeren also nie gezaehlt worden.
      if (gewaehlt() === "ja") pixelStarten();
    };
    pruefen();
    // Wer im Datenschutztext widerruft, soll das Banner sofort wiedersehen.
    return beobachten(pruefen);
  }, []);

  // Beim ersten Zeichnen hat der Pixel den Seitenaufruf schon selbst gemeldet.
  useEffect(() => {
    if (ersterPfad.current) {
      ersterPfad.current = false;
      return;
    }
    if (gewaehlt() === "ja") melde("PageView");
  }, [pfad]);

  if (!PIXEL || !zeigen) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Einwilligung in die Messung der Werbung"
      style={{
        position: "fixed",
        left: 12,
        right: 12,
        bottom: 12,
        zIndex: 90,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          pointerEvents: "auto",
          width: "100%",
          maxWidth: 660,
          background: "var(--white)",
          border: "1px solid var(--line)",
          borderRadius: 18,
          padding: "20px 22px",
          boxShadow: "0 18px 46px rgba(60, 40, 40, .16)",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 19,
            lineHeight: 1.25,
            color: "var(--ink)",
            margin: "0 0 8px",
          }}
        >
          Darf ich messen, ob meine Werbung etwas bringt?
        </p>

        <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--ink-soft)", margin: "0 0 16px" }}>
          Ich schalte Anzeigen bei Instagram und Facebook. Mit deinem Einverständnis
          setze ich dafür ein Messwerkzeug von Meta ein. Es legt eine Kennung in
          deinem Browser ab und meldet an Meta Platforms Ireland, ob du dich hier
          angemeldet oder etwas gekauft hast; dabei werden Daten auch in die USA
          übertragen. Nur so sehe ich, welche Anzeige sich lohnt. Du kannst jederzeit
          im{" "}
          <Link href="/datenschutz" style={{ color: "var(--rose-deep)" }}>
            Datenschutz
          </Link>{" "}
          widerrufen. Sagst du nein, funktioniert hier alles genauso.
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => waehlen("ja")}
            style={{
              flex: "1 1 180px",
              border: "none",
              borderRadius: 12,
              padding: "13px 20px",
              fontSize: 15.5,
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: "pointer",
              background: "var(--rose-deep)",
              color: "var(--white)",
            }}
          >
            Einverstanden
          </button>
          <button
            type="button"
            onClick={() => waehlen("nein")}
            style={{
              flex: "1 1 180px",
              border: "1px solid var(--line)",
              borderRadius: 12,
              padding: "13px 20px",
              fontSize: 15.5,
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: "pointer",
              background: "var(--white)",
              color: "var(--ink)",
            }}
          >
            Nein, danke
          </button>
        </div>
      </div>
    </div>
  );
}
