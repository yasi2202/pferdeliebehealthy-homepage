"use client";

import { useState } from "react";

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
        body: JSON.stringify({ email, hofname, tipps, einwilligung: EINWILLIGUNG }),
      });
      const d = await res.json();
      setAntwort({ ok: !!d.ok, text: d.meldung || "Unbekannte Antwort." });
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
          Schau in dein Postfach
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

      {!kompakt && (
        <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--ink-soft)", marginTop: 14, opacity: 0.85 }}>
          Du bekommst eine Mail mit deinem persönlichen Zugangslink. Kein Abo, keine Kosten, keine
          Kündigung nötig. Mehr dazu in der{" "}
          <a href="/datenschutz" style={{ color: "var(--rose-deep)" }}>
            Datenschutzerklärung
          </a>
          .
        </p>
      )}
    </form>
  );
}
