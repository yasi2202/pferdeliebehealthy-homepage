import type { Metadata } from "next";
import { HeuMinikursAnmeldung } from "@/components/HeuMinikursAnmeldung";
import { HEU_MINIKURS_MAILS } from "@/lib/heu-minikurs";

// ---------------------------------------------------------------------------
// Die Anmeldeseite zum kostenlosen Minikurs „Heu 2026“, seit 12.09.2026.
//
// Aufbau wie /stall-organizer: Kopf mit Formular, was drin ist, wer
// dahintersteht, Fragen, Formular noch einmal. Hierher führt das
// Kommentarwort HEU auf Instagram (ManyChat), am besten mit ?von=instagram.
// Ablauf nach dem Absenden: lib/heu-minikurs-server.ts.
// ---------------------------------------------------------------------------

const TITEL = "Kostenloser Minikurs Heu 2026";
const BESCHREIBUNG =
  "Fünf kurze Mails in fünf Tagen: was die Heuanalysen 2026 zeigen, auf welche Werte ich zuerst " +
  "schaue und was du auch ohne Analyse tun kannst. Kostenlos.";

export const metadata: Metadata = {
  alternates: { canonical: "/heu-2026" },
  title: TITEL,
  description: BESCHREIBUNG,
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Pferdeliebehealthy",
    title: `${TITEL} | Pferdeliebehealthy`,
    description: BESCHREIBUNG,
    url: "/heu-2026",
    images: [{ url: "/images/vorschau.jpg", width: 1200, height: 630 }],
  },
};

const fragen = [
  {
    frage: "Was kostet das?",
    antwort: "Nichts. Keine Testphase, kein Abo, keine Kündigung nötig.",
  },
  {
    frage: "Brauche ich eine Heuanalyse?",
    antwort:
      "Nein. Die dritte Mail ist genau für alle, deren Heu nicht untersucht ist. Und wenn du eine hast, weißt du nach der zweiten, welche Zeilen du zuerst anschaust.",
  },
  {
    frage: "Wie viele Mails bekomme ich?",
    antwort:
      "Fünf, eine pro Tag. Danach schicke ich dir ab und zu Tipps rund um Fütterung und Pferdegesundheit. Abmelden geht mit einem Klick in jeder Mail.",
  },
  {
    frage: "Was passiert mit meiner Adresse?",
    antwort:
      "Ich nutze sie für den Minikurs und die Tipps, für die du dich einträgst, sonst für nichts. Sie liegt auf einem Server in der EU. Mehr steht in der Datenschutzerklärung.",
  },
];

const h2: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: "clamp(26px, 4vw, 36px)",
  color: "var(--ink)",
  margin: "0 0 12px",
  lineHeight: 1.2,
  textWrap: "balance",
};

export default function HeuMinikursSeite() {
  return (
    <main style={{ background: "var(--cream)" }}>
      {/* Kopf */}
      <section style={{ padding: "clamp(48px, 9vw, 96px) 20px clamp(32px, 5vw, 56px)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: ".18em",
              textTransform: "uppercase",
              color: "var(--rose-deep)",
              margin: "0 0 16px",
            }}
          >
            Kostenloser Minikurs
          </p>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(34px, 6vw, 54px)",
              lineHeight: 1.12,
              color: "var(--ink)",
              margin: "0 0 20px",
              letterSpacing: "-.02em",
              textWrap: "balance",
            }}
          >
            Heu 2026 in fünf Mails
          </h1>
          <p
            style={{
              fontSize: "clamp(17px, 2.2vw, 20px)",
              lineHeight: 1.65,
              color: "var(--ink-soft)",
              margin: "0 auto 32px",
              maxWidth: 600,
            }}
          >
            Was die Heuanalysen dieses Jahres zeigen, auf welche Werte ich zuerst schaue und was du
            tun kannst, auch wenn du gar keine Analyse hast. Eine kurze Mail pro Tag.
          </p>

          <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "left" }}>
            <HeuMinikursAnmeldung />
          </div>
        </div>
      </section>

      {/* Die fünf Mails */}
      <section style={{ padding: "clamp(32px, 5vw, 64px) 20px", background: "var(--white)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2 style={{ ...h2, textAlign: "center" }}>Das bekommst du</h2>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: "var(--ink-soft)",
              textAlign: "center",
              margin: "0 auto 32px",
              maxWidth: 520,
            }}
          >
            Jeden Tag eine Mail, zum Lesen in fünf Minuten. Jede Zahl darin hat eine Quelle.
          </p>
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 20 }}>
            {HEU_MINIKURS_MAILS.map((m, i) => (
              <li key={m.titel} style={{ display: "grid", gridTemplateColumns: "56px 1fr", gap: 14, alignItems: "baseline" }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: "var(--rose-deep)",
                  }}
                >
                  Tag {i + 1}
                </span>
                <div>
                  <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--ink)", margin: "0 0 4px", lineHeight: 1.3 }}>
                    {m.titel}
                  </h3>
                  <p style={{ fontSize: 15.5, lineHeight: 1.6, color: "var(--ink-soft)", margin: 0 }}>{m.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Wer dahintersteht */}
      <section style={{ padding: "clamp(32px, 5vw, 64px) 20px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <h2 style={h2}>Warum ich das schreibe</h2>
          <p style={{ fontSize: 16.5, lineHeight: 1.75, color: "var(--ink-soft)", margin: "0 0 16px" }}>
            Ich bin Yasi, Ernährungsberaterin für Pferde. Gerade werte ich Heuanalysen der Ernte 2026
            aus vielen Regionen aus, und manches davon hat mich selbst überrascht.
          </p>
          <p style={{ fontSize: 16.5, lineHeight: 1.75, color: "var(--ink-soft)", margin: 0 }}>
            Was mir dabei auffällt, steckt in diesen fünf Mails. Ohne Fachchinesisch und ohne
            Versprechen, die kein Futter halten kann.
          </p>
        </div>
      </section>

      {/* Fragen */}
      <section style={{ padding: "clamp(32px, 5vw, 64px) 20px", background: "var(--white)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2 style={{ ...h2, textAlign: "center", margin: "0 0 28px" }}>Was oft gefragt wird</h2>
          <div style={{ display: "grid", gap: 22 }}>
            {fragen.map((f) => (
              <div key={f.frage}>
                <h3 style={{ fontSize: 17.5, fontWeight: 700, color: "var(--ink)", margin: "0 0 6px" }}>{f.frage}</h3>
                <p style={{ fontSize: 15.5, lineHeight: 1.65, color: "var(--ink-soft)", margin: 0 }}>{f.antwort}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Abschluss */}
      <section style={{ padding: "clamp(40px, 6vw, 80px) 20px" }}>
        <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ ...h2, margin: "0 0 20px" }}>Hol dir den Minikurs</h2>
          <div style={{ textAlign: "left" }}>
            <HeuMinikursAnmeldung />
          </div>
        </div>
      </section>
    </main>
  );
}
