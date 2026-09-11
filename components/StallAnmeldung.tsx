"use client";

import { useState } from "react";
import { melde } from "@/lib/messung";

// ---------------------------------------------------------------------------
// Das Anmeldeformular für den Stall Organizer, auf der Website.
//
// DIE EINWILLIGUNG IST PFLICHT und der Knopf bleibt ohne sie gesperrt. Der
// Wortlaut steht als Konstante hier und wandert mit in die Datenbank: Wer je
// nachweisen muss, worauf sie sich bezog, soll ihn dort finden und nicht
// raten, wie die Seite damals aussah. Wer ihn ändert, ändert eine rechtliche
// Zusage.
//
// Geschickt wird an die eigene Route nebenan, die reicht an die Akademie
// weiter. Siehe app/api/stall-organizer/route.ts.
// ---------------------------------------------------------------------------

export const EINWILLIGUNG =
  "Ja, schick mir kostenlose Tipps rund um Fütterung und Pferdegesundheit per E-Mail. " +
  "Ich kann mich jederzeit mit einem Klick wieder abmelden.";

/** Woher die Besucherin kommt, aus `?von=` in der Adresse.
 *
 *  WOZU: Der Link zum Organizer wird an mehreren Stellen geteilt, in der
 *  Instagram-Bio, in einer Story, im Newsletter, in Anzeigen. Ohne
 *  Kennzeichnung steht bei jeder Anmeldung nur "website", und man weiss
 *  hinterher nicht, was etwas gebracht hat.
 *
 *  40 Zeichen, weil bei bezahlter Werbung nicht nur der Kanal darin steht,
 *  sondern auch die Anzeige: `?von=meta-futter` sagt hinterher, welche
 *  Anzeige die Anmeldung gebracht hat. Die Spalte `quelle` in der Akademie
 *  nimmt genau 40 Zeichen. Erlaubt sind nur Kleinbuchstaben, Ziffern,
 *  Bindestrich und Unterstrich.
 *
 *  ▸ SEIT DEM 11.09.2026 NUR NOCH AUS DER ADRESSE, NICHTS IM BROWSER. Vorher
 *    wurde die Angabe für die Sitzung im Browser gemerkt, damit sie einen
 *    Seitenwechsel überlebt. Etwas im Browser abzulegen, das nicht unbedingt
 *    nötig ist, verlangt nach § 25 TDDDG aber eine Einwilligung, und die gab
 *    es dafür nicht. Gelesen wird deshalb erst beim Absenden, wie in der
 *    Kasse. Verloren geht dadurch nur, wer mit `?von=` ankommt und vor dem
 *    Anmelden noch auf eine andere Seite wechselt. Anzeigen und Links führen
 *    direkt auf eine Seite mit dem Formular, dort bleibt die Angabe stehen.
 */
function herkunft(): string | null {
  try {
    const von = new URLSearchParams(window.location.search).get("von");
    const sauber = (von || "").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 40);
    return sauber || null;
  } catch {
    return null;
  }
}

export function StallAnmeldung({ kompakt = false }: { kompakt?: boolean }) {
  const [email, setEmail] = useState("");
  const [tipps, setTipps] = useState(false);
  const [hofname, setHofname] = useState(""); // Honigtopf
  const [laeuft, setLaeuft] = useState(false);
  const [antwort, setAntwort] = useState<{ ok: boolean; text: string } | null>(null);


  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    setLaeuft(true);
    setAntwort(null);
    try {
      const res = await fetch("/api/stall-organizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, hofname, tipps, einwilligung: EINWILLIGUNG, von: herkunft() }),
      });
      const d = await res.json();
      setAntwort({ ok: !!d.ok, text: d.meldung || "Unbekannte Antwort." });
      // Fuer die Werbemessung. Gemeldet wird das Absenden, nicht die
      // Bestaetigung per Mail: Der Klick auf den Link in der Mail passiert
      // oft auf einem anderen Geraet, und dort wuesste der Pixel nichts mehr
      // von der Anzeige. Die verlaesslichere Zahl steht ohnehin in der
      // eigenen Auswertung unter /admin/stall-organizer, dort getrennt nach
      // bestaetigt und offen.
      if (d.ok) melde("Lead", { content_name: "Equista" });
    } catch {
      setAntwort({ ok: false, text: "Keine Verbindung. Bitte prüf dein Internet." });
    } finally {
      setLaeuft(false);
    }
  }

  if (antwort?.ok) {
    return (
      <div
        style={{
          background: "var(--white)",
          border: "1px solid var(--line)",
          borderRadius: 18,
          padding: "26px 24px",
          textAlign: "center",
        }}
      >
        <p style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--ink)", margin: "0 0 8px" }}>
          Ein Klick fehlt noch
        </p>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--ink-soft)", margin: 0 }}>
          {antwort.text}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={absenden} style={{ position: "relative" }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="deine@email.de"
          autoComplete="email"
          style={{
            flex: "1 1 220px",
            minWidth: 0,
            border: "1px solid var(--line)",
            borderRadius: 12,
            padding: "14px 16px",
            fontSize: 16,
            fontFamily: "inherit",
            color: "var(--ink)",
            background: "var(--white)",
          }}
        />
        <button
          type="submit"
          disabled={laeuft || !tipps}
          style={{
            border: "none",
            borderRadius: 12,
            padding: "14px 24px",
            fontSize: 16,
            fontWeight: 700,
            fontFamily: "inherit",
            cursor: laeuft || !tipps ? "not-allowed" : "pointer",
            background: laeuft || !tipps ? "var(--line)" : "var(--rose-deep)",
            color: laeuft || !tipps ? "var(--ink-soft)" : "var(--white)",
            flex: "0 0 auto",
          }}
        >
          {laeuft ? "einen Moment …" : "Kostenlos holen"}
        </button>
      </div>

      <button
        type="button"
        onClick={() => setTipps((t) => !t)}
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 11,
          width: "100%",
          border: "none",
          background: "transparent",
          padding: "12px 0 0",
          cursor: "pointer",
          textAlign: "left",
          fontFamily: "inherit",
        }}
      >
        <span
          aria-hidden
          style={{
            width: 22,
            height: 22,
            borderRadius: 7,
            flexShrink: 0,
            marginTop: 1,
            display: "grid",
            placeItems: "center",
            background: tipps ? "var(--rose-deep)" : "var(--line)",
            color: "var(--white)",
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {tipps ? "✓" : ""}
        </span>
        <span style={{ fontSize: 14, lineHeight: 1.55, color: "var(--ink-soft)" }}>{EINWILLIGUNG}</span>
      </button>

      {/* Honigtopf gegen automatische Ausfüller. Nicht entfernen. */}
      <input
        type="text"
        name="hofname"
        value={hofname}
        onChange={(e) => setHofname(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />

      {antwort && !antwort.ok && (
        <p role="alert" style={{ marginTop: 10, color: "#B84444", fontSize: 14, lineHeight: 1.5 }}>
          {antwort.text}
        </p>
      )}

      {/* Dass der Zugang über die Mail läuft, muss vor dem Absenden dastehen
          und nicht erst danach: Wer es nicht weiß, wartet auf der Seite und
          hält den Organizer für kaputt. In der kompakten Fassung als
          Einzeiler, sonst wird der Kasten auf der Startseite zur Textwand.

          Beide Absätze standen bis zum 09.09.2026 auf opacity 0.85. Das ist
          der Unterschied zwischen 6,1 und 4,35 an Kontrast, also zwischen
          lesbar und knapp unter der Anforderung, und es hat den Link zur
          Datenschutzerklärung gleich mitgezogen. Die Zurückhaltung machen
          hier Schriftgrösse und die weichere Textfarbe, dafür braucht es
          keine Deckkraft. */}
      {kompakt ? (
        <p style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--ink-soft)", marginTop: 12 }}>
          Der Zugang kommt per Mail. Ohne den Klick darin bleibt der Organizer zu.
        </p>
      ) : (
        <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--ink-soft)", marginTop: 14 }}>
          Du bekommst eine Mail mit deinem persönlichen Zugangslink. Solange du ihn nicht
          angeklickt hast, ist der Organizer nicht offen. Kein Abo, keine Kosten, keine Kündigung
          nötig. Mehr dazu in der{" "}
          <a href="/datenschutz" style={{ color: "var(--rose-deep)" }}>
            Datenschutzerklärung
          </a>
          .
        </p>
      )}
    </form>
  );
}
