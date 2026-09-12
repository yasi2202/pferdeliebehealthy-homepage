"use client";

import { useState } from "react";
import { melde } from "@/lib/messung";
import { EINWILLIGUNG_HEU_MINIKURS } from "@/lib/heu-minikurs";

// ---------------------------------------------------------------------------
// Das Anmeldeformular für den Minikurs Heu 2026, gebaut wie StallAnmeldung.
//
// DIE EINWILLIGUNG IST PFLICHT, der Knopf bleibt ohne sie gesperrt. Der
// Wortlaut kommt aus lib/heu-minikurs.ts, dieselbe Konstante speichert der
// Server mit. Geschickt wird an app/api/heu-minikurs.
// ---------------------------------------------------------------------------

/** Woher die Besucherin kommt, aus `?von=` in der Adresse (Instagram,
 *  ManyChat, Newsletter). Nur aus der Adresse, nichts im Browser, siehe die
 *  Begründung in StallAnmeldung.tsx. */
function herkunft(): string | null {
  try {
    const von = new URLSearchParams(window.location.search).get("von");
    const sauber = (von || "").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 40);
    return sauber || null;
  } catch {
    return null;
  }
}

const feld: React.CSSProperties = {
  flex: "1 1 200px",
  minWidth: 0,
  border: "1px solid var(--line)",
  borderRadius: 12,
  padding: "14px 16px",
  fontSize: 16,
  fontFamily: "inherit",
  color: "var(--ink)",
  background: "var(--white)",
};

export function HeuMinikursAnmeldung() {
  const [vorname, setVorname] = useState("");
  const [email, setEmail] = useState("");
  const [ja, setJa] = useState(false);
  const [webseite, setWebseite] = useState(""); // Honigtopf
  const [laeuft, setLaeuft] = useState(false);
  const [antwort, setAntwort] = useState<{ ok: boolean; text: string } | null>(null);

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    setLaeuft(true);
    setAntwort(null);
    try {
      const res = await fetch("/api/heu-minikurs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, vorname, webseite, einwilligung: ja, quelle: herkunft() }),
      });
      const d = await res.json().catch(() => ({}));
      if (d.ok) {
        setAntwort({ ok: true, text: "" });
        melde("Lead", { content_name: "Minikurs Heu 2026" });
      } else {
        setAntwort({ ok: false, text: d.fehler || "Das hat nicht geklappt. Versuch es bitte noch einmal." });
      }
    } catch {
      setAntwort({ ok: false, text: "Keine Verbindung. Bitte prüf dein Internet." });
    } finally {
      setLaeuft(false);
    }
  }

  if (antwort?.ok) {
    return (
      <div
        role="status"
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
          Ich habe dir eine Mail geschickt. Klick darin auf „Ja, ich bin dabei“, dann geht es los.
          Nichts da? Schau im Spam- oder Werbeordner nach.
        </p>
      </div>
    );
  }

  const gesperrt = laeuft || !ja;

  return (
    <form onSubmit={absenden} style={{ position: "relative" }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <label style={{ display: "contents" }}>
          <span style={{ position: "absolute", left: "-9999px" }}>Vorname, freiwillig</span>
          <input
            id="heu-vorname"
            type="text"
            value={vorname}
            onChange={(e) => setVorname(e.target.value)}
            placeholder="Vorname (freiwillig)"
            autoComplete="given-name"
            style={feld}
          />
        </label>
        <label style={{ display: "contents" }}>
          <span style={{ position: "absolute", left: "-9999px" }}>E-Mail-Adresse</span>
          <input
            id="heu-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="deine@email.de"
            autoComplete="email"
            style={feld}
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() => setJa((j) => !j)}
        aria-pressed={ja}
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
            background: ja ? "var(--rose-deep)" : "var(--line)",
            color: "var(--white)",
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {ja ? "✓" : ""}
        </span>
        <span style={{ fontSize: 14, lineHeight: 1.55, color: "var(--ink-soft)" }}>{EINWILLIGUNG_HEU_MINIKURS}</span>
      </button>

      <button
        type="submit"
        disabled={gesperrt}
        style={{
          marginTop: 14,
          width: "100%",
          border: "none",
          borderRadius: 12,
          padding: "15px 24px",
          fontSize: 16,
          fontWeight: 700,
          fontFamily: "inherit",
          cursor: gesperrt ? "not-allowed" : "pointer",
          background: gesperrt ? "var(--line)" : "var(--rose-deep)",
          color: gesperrt ? "var(--ink-soft)" : "var(--white)",
        }}
      >
        {laeuft ? "einen Moment …" : "Minikurs kostenlos holen"}
      </button>

      {/* Honigtopf gegen automatische Ausfüller. Nicht entfernen. */}
      <input
        type="text"
        name="webseite"
        value={webseite}
        onChange={(e) => setWebseite(e.target.value)}
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

      <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--ink-soft)", marginTop: 14 }}>
        Du bekommst zuerst eine Mail mit einem Bestätigungslink. Erst nach dem Klick darin geht es los.
        Kostenlos, kein Abo. Mehr dazu in der{" "}
        <a href="/datenschutz" style={{ color: "var(--rose-deep)" }}>
          Datenschutzerklärung
        </a>
        .
      </p>
    </form>
  );
}
