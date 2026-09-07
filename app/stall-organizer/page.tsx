import type { Metadata } from "next";
import { StallAnmeldung } from "@/components/StallAnmeldung";
import StallOrganizerBilder from "@/components/StallOrganizerBilder";

// ---------------------------------------------------------------------------
// Die Seite zum Stall Organizer.
//
// SIE IST DER EINSTIEG, nicht die App selbst. Die läuft in der Akademie und
// braucht ein Konto; hier wird erklärt, wofür das gut ist, und die Adresse
// eingesammelt. Das Konto legt die Akademie an (siehe app/api/stall-organizer).
//
// WARUM SIE HIER LIEGT UND NICHT DORT: Google findet die Website, nicht die
// Akademie hinter der Anmeldung. Und wer über eine Anzeige oder aus dem
// Newsletter kommt, landet auf einer Seite mit Bildern und Erklärung statt
// auf einem Formular.
//
// DAS HÄKCHEN IST PFLICHT, so von Yasemin am 07.09.2026 entschieden. Ohne
// Einwilligung kein Zugang. Der Wortlaut steht in StallAnmeldung.tsx.
// ---------------------------------------------------------------------------

const TITEL = "Der kostenlose Stall Organizer für dein Pferd";
const BESCHREIBUNG =
  "Termine, Gewicht, Futterplan, Befunde und Kosten deines Pferdes an einem Ort. " +
  "Mit Erinnerungen aufs Handy, wenn Hufschmied oder Wurmkur fällig werden. Kostenlos, ohne Abo.";

export const metadata: Metadata = {
  alternates: { canonical: "/stall-organizer" },
  title: TITEL,
  description: BESCHREIBUNG,
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Pferdeliebehealthy",
    title: `${TITEL} | Pferdeliebehealthy`,
    description: BESCHREIBUNG,
    url: "/stall-organizer",
    images: [{ url: "/images/vorschau.jpg", width: 1200, height: 630 }],
  },
};

/* Bewusst die Sachen, die man wirklich vermisst, nicht die vollständige
   Liste. Eine Aufzählung mit vierzehn Punkten liest niemand. */
const kann = [
  {
    titel: "Termine, die dich erinnern",
    text: "Hufschmied, Wurmkur, Impfung, Zahnarzt. Und zwar zweistufig: erst wenn du anrufen musst, dann vor dem Termin selbst. Die Erinnerung kommt per Mail oder aufs Handy, du entscheidest.",
  },
  {
    titel: "Gewicht mit Verlauf",
    text: "Ein paar Zahlen über Monate sagen mehr als jeder Blick in die Box. Du siehst die Kurve, nicht nur den letzten Wert.",
  },
  {
    titel: "Futterplan und Vorrat",
    text: "Was wann in welcher Menge gefüttert wird. Trägst du den Vorrat ein, rechnet der Organizer aus, wie lange er reicht und was es im Monat kostet, und meldet sich vor dem Nachbestellen.",
  },
  {
    titel: "Befunde an einem Ort",
    text: "Blutbild, Kotprobe, Heuanalyse, Zahnarztbericht. Als PDF oder abfotografiert. Beim nächsten Tierarztwechsel hast du alles beisammen.",
  },
  {
    titel: "Symptome über Wochen",
    text: "Ob Kotwasser besser wird, merkt niemand von Tag zu Tag. Über acht Wochen mit einer Kurve daneben siehst du es sofort.",
  },
  {
    titel: "Weide und Fruktan",
    text: "Anweideplan, der die Minuten für dich hochzählt. Dazu die Wetterlage: Nach kalten Nächten mit Sonne steigt der Fruktangehalt im Gras, und dann sagt der Organizer Bescheid.",
  },
  {
    titel: "Teilen, ohne Konto",
    text: "Einen Pferdepass für Tierarzt oder Vertretung, befristet und jederzeit zurückziehbar. Und einen Stalldienstplan, in den sich alle im Stall selbst eintragen.",
  },
  {
    titel: "Auch ohne Netz",
    text: "In der Halle ist oft kein Empfang. Der Organizer bleibt trotzdem lesbar, und was du einträgst, geht raus, sobald du wieder Netz hast.",
  },
];

const fragen = [
  {
    frage: "Was kostet das?",
    antwort:
      "Nichts. Kein Abo, keine Testphase, die ausläuft, keine Kündigung nötig. Ich verdiene mein Geld mit Beratung und Kursen, nicht mit dieser App.",
  },
  {
    frage: "Muss ich etwas installieren?",
    antwort:
      "Nein. Der Organizer läuft im Browser. Auf dem Handy kannst du ihn über das Teilen-Menü auf den Startbildschirm legen, dann öffnet er sich wie eine App und kann dir Meldungen schicken.",
  },
  {
    frage: "Für wie viele Pferde?",
    antwort: "So viele du willst. Jedes bekommt seine eigene Akte.",
  },
  {
    frage: "Was passiert mit meinen Daten?",
    antwort:
      "Sie liegen auf einem Server in der EU und gehören dir. Niemand außer dir sieht sie, außer du teilst ausdrücklich einen Pferdepass. Deine Adresse nutze ich für den Zugang, die Erinnerungen und die Tipps, für die du dich anmeldest. Abmelden geht mit einem Klick in jeder Mail.",
  },
  {
    frage: "Warum ist das kostenlos?",
    antwort:
      "Weil ich möchte, dass du deine Fütterung im Griff hast, und weil die meisten Fragen, die mich erreichen, mit besseren Aufzeichnungen gar nicht erst entstehen. Wer irgendwann mehr will, findet bei mir Kurse und Beratung. Wer nicht, behält den Organizer trotzdem.",
  },
];

export default function StallOrganizerSeite() {
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
            Kostenlos für dich
          </p>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(34px, 6vw, 54px)",
              lineHeight: 1.12,
              color: "var(--ink)",
              margin: "0 0 20px",
              letterSpacing: "-.02em",
            }}
          >
            Alles über dein Pferd an einem Ort
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
            Termine, Gewicht, Futterplan, Befunde und Kosten. Und wenn der Hufschmied fällig wird,
            meldet sich dein Handy, statt dass du es im Kopf behalten musst.
          </p>

          <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "left" }}>
            <StallAnmeldung />
          </div>
        </div>
      </section>

      <StallOrganizerBilder />

      {/* Was er kann */}
      <section style={{ padding: "clamp(32px, 5vw, 64px) 20px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(26px, 4vw, 38px)",
              color: "var(--ink)",
              textAlign: "center",
              margin: "0 0 12px",
            }}
          >
            Was du damit machst
          </h2>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: "var(--ink-soft)",
              textAlign: "center",
              margin: "0 auto 40px",
              maxWidth: 560,
            }}
          >
            Nicht alles auf einmal. Fang mit dem an, was dich gerade am meisten beschäftigt.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 22,
            }}
          >
            {kann.map((k) => (
              <div key={k.titel}>
                <h3
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 21,
                    color: "var(--ink)",
                    margin: "0 0 8px",
                    lineHeight: 1.25,
                  }}
                >
                  {k.titel}
                </h3>
                <p style={{ fontSize: 15.5, lineHeight: 1.65, color: "var(--ink-soft)", margin: 0 }}>
                  {k.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wer dahintersteht */}
      <section style={{ padding: "clamp(32px, 5vw, 64px) 20px", background: "var(--white)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(24px, 3.4vw, 32px)",
              color: "var(--ink)",
              margin: "0 0 16px",
            }}
          >
            Warum ich das gebaut habe
          </h2>
          <p style={{ fontSize: 16.5, lineHeight: 1.75, color: "var(--ink-soft)", margin: "0 0 16px" }}>
            In meiner Futterberatung frage ich immer dasselbe: Wie viel wiegt dein Pferd, was
            bekommt es genau, wann war die letzte Wurmkur, was stand im Blutbild. Und fast immer
            liegt die Antwort verteilt auf Zettel, Chatverläufe und Erinnerung.
          </p>
          <p style={{ fontSize: 16.5, lineHeight: 1.75, color: "var(--ink-soft)", margin: 0 }}>
            Der Stall Organizer sammelt das an einer Stelle. Nicht für mich, sondern für dich. Dass
            eine Beratung damit leichter wird, ist ein angenehmer Nebeneffekt.
          </p>
        </div>
      </section>

      {/* Fragen */}
      <section style={{ padding: "clamp(32px, 5vw, 64px) 20px", background: "var(--white)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(24px, 3.4vw, 32px)",
              color: "var(--ink)",
              margin: "0 0 28px",
              textAlign: "center",
            }}
          >
            Was oft gefragt wird
          </h2>
          <div style={{ display: "grid", gap: 22 }}>
            {fragen.map((f) => (
              <div key={f.frage}>
                <h3 style={{ fontSize: 17.5, fontWeight: 700, color: "var(--ink)", margin: "0 0 6px" }}>
                  {f.frage}
                </h3>
                <p style={{ fontSize: 15.5, lineHeight: 1.65, color: "var(--ink-soft)", margin: 0 }}>
                  {f.antwort}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Abschluss */}
      <section style={{ padding: "clamp(40px, 6vw, 80px) 20px" }}>
        <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(24px, 3.4vw, 34px)",
              color: "var(--ink)",
              margin: "0 0 20px",
            }}
          >
            Leg einfach los
          </h2>
          <div style={{ textAlign: "left" }}>
            <StallAnmeldung />
          </div>
        </div>
      </section>
    </main>
  );
}
