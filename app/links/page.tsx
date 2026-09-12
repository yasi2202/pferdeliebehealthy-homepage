import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { futterCheck, mitgliederbereich } from "@/lib/seite";

// ---------------------------------------------------------------------------
// Die Seite hinter dem Link in der Instagram-Bio von @pferdeliebehealthy.
//
// Bis zum 12.09.2026 zeigte die Bio direkt auf /shop. Jetzt zeigt sie
// hierher, und hier stehen die Wege, die jemand von Instagram aus sucht. Ändert
// sich ein Angebot, ändert sich nur diese Liste, die Bio bleibt gleich.
//
// ?von=instagram-bio an Futter-Check und Stall Organizer: So steht in der
// Datenbank, wer über die Bio kam, und nicht über ein Reel mit CHECK
// (?von=instagram) oder eine Anzeige.
//
// noindex: Eine reine Linkliste ist für Google eine dünne Seite. Sie steht
// deshalb auch nicht in der Sitemap.
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "Links",
  description: "Futter-Check, Stall Organizer, Kurse, Beratung und Ausbildung von Yasi.",
  alternates: { canonical: "/links" },
  robots: { index: false, follow: true },
};

const eintraege: { titel: string; text: string; href: string; hervor?: boolean }[] = [
  {
    titel: "Der Futter-Check",
    text: "Sechs Fragen, und du weißt, wo deine Fütterung steht",
    href: `${futterCheck.fragebogen}?von=instagram-bio`,
    hervor: true,
  },
  { titel: "Der Stall Organizer", text: "Termine, Gewicht und Befunde deines Pferdes an einem Ort", href: "/stall-organizer?von=instagram-bio" },
  { titel: "Kurse und Werkzeuge", text: "Mineral-Klarheit, Ganzjahresfutterplan, RatioPro und mehr", href: "/shop" },
  { titel: "Futterberatung", text: "Dein persönlicher Futterplan", href: "/futterplan" },
  { titel: "Ausbildung Ganzheitliche Pferdefütterung", text: "Werde selbst Futterberaterin", href: "/ausbildung" },
  { titel: "Blog", text: "Fütterungswissen zum Nachlesen", href: "/blog" },
];

export default function LinkSeite() {
  return (
    <main style={{ background: "var(--cream)", padding: "clamp(36px, 7vw, 64px) 20px 72px" }}>
      <div style={{ maxWidth: 460, margin: "0 auto", textAlign: "center" }}>
        <Image
          src="/images/yasi-portrait.jpg"
          alt="Yasemin Halac"
          width={112}
          height={112}
          priority
          style={{ width: 112, height: 112, borderRadius: 56, objectFit: "cover", border: "4px solid var(--white)", margin: "0 auto", display: "block" }}
        />
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 30, color: "var(--ink)", margin: "18px 0 6px" }}>Yasi</h1>
        <p style={{ fontSize: 15.5, lineHeight: 1.6, color: "var(--ink-soft)", margin: "0 0 28px" }}>
          Ernährungsberaterin für Pferde.
          <br />
          Ganzheitliche Pferdefütterung mit Fachwissen.
        </p>

        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 12, textAlign: "left" }}>
          {eintraege.map((e) => (
            <li key={e.titel}>
              <Link
                href={e.href}
                style={{
                  display: "block",
                  padding: "16px 20px",
                  borderRadius: 18,
                  textDecoration: "none",
                  background: e.hervor ? "var(--rose-deep)" : "var(--white)",
                  border: e.hervor ? "1px solid var(--rose-deep)" : "1px solid var(--line)",
                  color: e.hervor ? "var(--cream)" : "var(--ink)",
                }}
              >
                <span style={{ display: "block", fontWeight: 600, fontSize: 16 }}>{e.titel}</span>
                <span style={{ display: "block", fontSize: 14, lineHeight: 1.45, color: e.hervor ? "var(--cream)" : "var(--ink-soft)", opacity: e.hervor ? 0.9 : 1 }}>
                  {e.text}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <p style={{ fontSize: 14, color: "var(--ink-soft)", margin: "28px 0 0" }}>
          Schon Kundin?{" "}
          <a href={mitgliederbereich.url} style={{ color: "var(--rose-deep)", fontWeight: 600 }}>
            Zum Mitgliederbereich
          </a>
        </p>
      </div>
    </main>
  );
}
// ENDE DER DATEI
