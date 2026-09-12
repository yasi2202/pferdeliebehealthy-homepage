import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { businessFarben as F, businessKurse, businessLinks } from "@/lib/business";

// ---------------------------------------------------------------------------
// Pferdebusinessmitherz: die Seite hinter dem Bio-Link von
// @pferdebusinessmitherz. Inhalt, Farben und die Regeln, was hier nie stehen
// darf, stehen in lib/business.ts.
//
// Eigenes Aussehen in den Farben des Logos (Salbei auf hellem Grau), damit
// man merkt, dass das nicht die Fütterungsseite ist. Kopf- und Fußzeile der
// Website bleiben: Impressum, Datenschutz und Kasse gelten auch hier.
// ---------------------------------------------------------------------------

const TITEL = "Pferdebusiness mit Herz: Onlinebusiness für Pferdemenschen";
const BESCHREIBUNG =
  "Mach aus deinem Pferdewissen ein Onlinebusiness: Onlinekurs, Instagram, eigene Verkaufsseite. Selbstlernkurse von Yasi, ehrlich erklärt und ohne Umsatzversprechen.";

export const metadata: Metadata = {
  alternates: { canonical: "/business" },
  title: TITEL,
  description: BESCHREIBUNG,
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Pferdebusiness mit Herz",
    title: TITEL,
    description: BESCHREIBUNG,
    url: "/business",
    images: [{ url: "/images/yasi-helena.jpg", alt: "Yasemin Halac mit ihrer Stute Helena" }],
  },
};

const ueberschrift = {
  fontFamily: "var(--font-serif)",
  color: F.tinte,
  letterSpacing: "-.015em",
} as const;

const augenbraue = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: ".18em",
  textTransform: "uppercase" as const,
  color: F.tief,
  margin: "0 0 14px",
};

function Knopf({ href, children, voll = false }: { href: string; children: React.ReactNode; voll?: boolean }) {
  const extern = href.startsWith("http") || href.startsWith("mailto:");
  const stil = {
    display: "inline-block",
    padding: "14px 26px",
    borderRadius: 999,
    fontWeight: 600,
    fontSize: 15.5,
    textDecoration: "none",
    textAlign: "center" as const,
    background: voll ? F.tief : F.weiss,
    color: voll ? F.weiss : F.tief,
    border: `1.5px solid ${F.tief}`,
  };
  return extern ? (
    <a href={href} style={stil} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {children}
    </a>
  ) : (
    <Link href={href} style={stil}>
      {children}
    </Link>
  );
}

export default function BusinessSeite() {
  return (
    <main style={{ background: F.grund, color: F.tinte }}>
      {/* Kopf */}
      <section style={{ padding: "clamp(40px, 8vw, 88px) 20px clamp(32px, 5vw, 56px)" }}>
        <div
          style={{
            maxWidth: 1040,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "clamp(28px, 5vw, 56px)",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
              <Image src="/images/pferdebusinessmitherz-zeichen.png" alt="" width={48} height={48} style={{ borderRadius: 24 }} />
              <span style={{ fontFamily: "var(--font-serif)", fontSize: 19, color: F.tinte }}>
                pferdebusiness<span style={{ color: F.tief, fontStyle: "italic" }}>mitherz</span>
              </span>
            </div>
            <h1 style={{ ...ueberschrift, fontSize: "clamp(34px, 5.6vw, 54px)", lineHeight: 1.1, margin: "0 0 20px" }}>
              Mach aus deinem Pferdewissen ein Onlinebusiness.
            </h1>
            <p style={{ fontSize: "clamp(17px, 2.1vw, 19px)", lineHeight: 1.65, color: F.weich, margin: "0 0 28px", maxWidth: 560 }}>
              Onlinekurs, Instagram, eigene Verkaufsseite. Gelernt an meinem eigenen Business mit
              Pferdeliebehealthy, erklärt ohne Versprechen, die niemand halten kann.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Knopf href={businessLinks.warteliste} voll>
                Auf die Warteliste
              </Knopf>
              <Knopf href={businessLinks.instagram}>Instagram ansehen</Knopf>
            </div>
          </div>
          <div style={{ position: "relative", maxWidth: 440, width: "100%", justifySelf: "center" }}>
            <Image
              src="/images/yasi-helena.jpg"
              alt="Yasemin Halac mit ihrer Stute Helena"
              width={1122}
              height={1402}
              priority
              sizes="(max-width: 700px) 90vw, 440px"
              style={{ width: "100%", height: "auto", borderRadius: 28, display: "block" }}
            />
          </div>
        </div>
      </section>

      {/* Was hier entsteht */}
      <section style={{ padding: "clamp(32px, 5vw, 64px) 20px", background: F.flaeche }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <p style={{ ...augenbraue, textAlign: "center" }}>Was hier entsteht</p>
          <h2 style={{ ...ueberschrift, fontSize: "clamp(26px, 4vw, 38px)", textAlign: "center", margin: "0 0 12px" }}>
            Drei Kurse zum Selbstlernen
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: F.weich, textAlign: "center", margin: "0 auto 36px", maxWidth: 600 }}>
            Du arbeitest in deinem Tempo, ohne Zeitplan und ohne Abgabe. Die Kurse sind noch in Arbeit.
            Wer auf der Warteliste steht, erfährt als Erste, wann es losgeht.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
            {businessKurse.map((k) => (
              <div key={k.titel} style={{ background: F.weiss, borderRadius: 22, padding: "26px 24px" }}>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: 12,
                    fontWeight: 700,
                    color: F.tief,
                    background: F.flaeche,
                    borderRadius: 999,
                    padding: "3px 10px",
                    marginBottom: 12,
                  }}
                >
                  In Arbeit
                </span>
                <h3 style={{ ...ueberschrift, fontSize: 22, lineHeight: 1.25, margin: "0 0 10px" }}>{k.titel}</h3>
                <p style={{ fontSize: 15.5, lineHeight: 1.65, color: F.weich, margin: 0 }}>{k.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ehrlich vorweg */}
      <section style={{ padding: "clamp(32px, 5vw, 64px) 20px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <p style={augenbraue}>Ehrlich vorweg</p>
          <h2 style={{ ...ueberschrift, fontSize: "clamp(24px, 3.4vw, 32px)", margin: "0 0 16px" }}>
            Ich verspreche dir keine Umsätze.
          </h2>
          <p style={{ fontSize: 16.5, lineHeight: 1.75, color: F.weich, margin: "0 0 14px" }}>
            Wie viel du mit deinem Wissen verdienst, hängt von deinem Thema ab, von deiner Zeit und davon,
            wie viele Menschen genau das suchen. Wer dir dafür eine Zahl nennt, kennt dein Business nicht.
          </p>
          <p style={{ fontSize: 16.5, lineHeight: 1.75, color: F.weich, margin: 0 }}>
            Was ich dir zeigen kann, ist der Weg, den ich selbst gegangen bin: welche Plattformen ich
            ausprobiert und wieder verlassen habe, was an Instagram wirklich zählt und warum ich heute über
            meine eigene Seite verkaufe.
          </p>
        </div>
      </section>

      {/* Wer hier schreibt */}
      <section style={{ padding: "clamp(32px, 5vw, 64px) 20px", background: F.weiss }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <p style={augenbraue}>Wer hier schreibt</p>
          <h2 style={{ ...ueberschrift, fontSize: "clamp(24px, 3.4vw, 32px)", margin: "0 0 16px" }}>Ich bin Yasi.</h2>
          <p style={{ fontSize: 16.5, lineHeight: 1.75, color: F.weich, margin: "0 0 14px" }}>
            Seit 2022 baue ich mit Pferdeliebehealthy ein Onlinebusiness rund um Pferdefütterung auf: eine
            eigene Akademie mit über 1.300 Kursteilnehmenden, ein Instagram-Konto mit 12.000 Followern und
            eine eigene Kasse statt einer Verkaufsplattform.
          </p>
          <p style={{ fontSize: 16.5, lineHeight: 1.75, color: F.weich, margin: 0 }}>
            Auf dem Weg dahin habe ich Plattformen gewechselt, Preise angepasst und vieles zweimal gebaut. Was
            davon funktioniert hat, gebe ich hier weiter.
          </p>
        </div>
      </section>

      {/* Was es heute schon gibt */}
      <section style={{ padding: "clamp(32px, 5vw, 64px) 20px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <h2 style={{ ...ueberschrift, fontSize: "clamp(24px, 3.4vw, 32px)", textAlign: "center", margin: "0 0 28px" }}>
            Was es heute schon gibt
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
            <div style={{ background: F.weiss, borderRadius: 22, padding: "26px 24px" }}>
              <h3 style={{ ...ueberschrift, fontSize: 21, margin: "0 0 10px" }}>Du willst Futterberaterin werden?</h3>
              <p style={{ fontSize: 15.5, lineHeight: 1.65, color: F.weich, margin: "0 0 18px" }}>
                Die Ausbildung Ganzheitliche Pferdefütterung in acht Modulen, für alle, die selbst beraten wollen.
              </p>
              <Knopf href="/ausbildung">Zur Ausbildung</Knopf>
            </div>
            <div style={{ background: F.weiss, borderRadius: 22, padding: "26px 24px" }}>
              <h3 style={{ ...ueberschrift, fontSize: 21, margin: "0 0 10px" }}>Du berätst schon?</h3>
              <p style={{ fontSize: 15.5, lineHeight: 1.65, color: F.weich, margin: "0 0 18px" }}>
                EquiDesk, die Kundenverwaltung für Beraterinnen: Kundinnen, Pferde, Befunde und Pläne an einem Ort.
              </p>
              <Knopf href="/equidesk">EquiDesk ansehen</Knopf>
            </div>
          </div>
        </div>
      </section>

      {/* Abschluss */}
      <section style={{ padding: "clamp(40px, 6vw, 80px) 20px", background: F.flaeche }}>
        <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ ...ueberschrift, fontSize: "clamp(24px, 3.4vw, 34px)", margin: "0 0 14px" }}>
            Sei dabei, wenn es losgeht.
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.65, color: F.weich, margin: "0 0 24px" }}>
            Schreib mir kurz, welches Thema dich am meisten interessiert. Du bekommst Bescheid, sobald der
            erste Kurs fertig ist, und sonst keine Post.
          </p>
          <Knopf href={businessLinks.warteliste} voll>
            Auf die Warteliste
          </Knopf>
        </div>
      </section>
    </main>
  );
}
// ENDE DER DATEI
