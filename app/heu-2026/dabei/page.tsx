import type { Metadata } from "next";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Die Seite nach dem Klick in der Bestätigungsmail des Minikurses Heu 2026.
// Hierher leitet app/api/heu-minikurs/bestaetigen. Nicht für Google gedacht.
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "Du bist dabei",
  robots: { index: false, follow: false },
};

export default function HeuMinikursDabei() {
  return (
    <main style={{ background: "var(--cream)", padding: "clamp(56px, 10vw, 120px) 20px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
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
          Minikurs Heu 2026
        </p>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(32px, 6vw, 48px)",
            lineHeight: 1.15,
            color: "var(--ink)",
            margin: "0 0 20px",
          }}
        >
          Du bist dabei
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: "var(--ink-soft)", margin: "0 0 14px" }}>
          Die erste Mail kommt beim nächsten Versand, spätestens morgen Vormittag. Danach jeden Tag
          eine, fünf insgesamt. Absender ist „Yasi von Pferdeliebehealthy“.
        </p>
        <p style={{ fontSize: 15.5, lineHeight: 1.7, color: "var(--ink-soft)", margin: "0 0 32px" }}>
          Falls sie nicht auftaucht, schau im Spam- oder Werbeordner nach und zieh sie einmal in den
          Posteingang. Dann kommen die nächsten dort an.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="https://www.instagram.com/pferdeliebehealthy/"
            style={{
              background: "var(--rose-deep)",
              color: "var(--white)",
              borderRadius: 999,
              padding: "13px 24px",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Zu Instagram
          </a>
          <Link
            href="/blog"
            style={{
              border: "1px solid var(--rose-deep)",
              color: "var(--rose-deep)",
              borderRadius: 999,
              padding: "12px 24px",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Zum Blog
          </Link>
        </div>
      </div>
    </main>
  );
}
