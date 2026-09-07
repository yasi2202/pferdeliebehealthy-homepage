import Image from "next/image";
import Link from "next/link";
import { StallAnmeldung } from "@/components/StallAnmeldung";

// ---------------------------------------------------------------------------
// Der Stall Organizer auf der Startseite.
//
// ER STEHT FRÜH, gleich nach dem Problem und vor den Angeboten. Grund: Er ist
// das einzige, was nichts kostet. Wer zum ersten Mal hier ist, soll etwas
// mitnehmen können, bevor irgendwo ein Preis steht.
//
// Das Formular steht direkt hier, nicht nur ein Knopf zur Unterseite. Jeder
// Klick dazwischen kostet Anmeldungen, und die Seite dahinter erklärt zwar
// mehr, aber wer schon überzeugt ist, muss sie nicht erst lesen.
// ---------------------------------------------------------------------------

const punkte = [
  "Termine, die sich von selbst melden",
  "Gewicht, Futterplan und Befunde an einem Ort",
  "Erinnerung aufs Handy, auch ohne Netz nutzbar",
];

export default function StallOrganizerSection() {
  return (
    <section
      id="stall-organizer"
      style={{ background: "var(--cream-deep)", padding: "clamp(48px, 7vw, 88px) 20px" }}
    >
      <div
        style={{
          maxWidth: 1040,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "clamp(26px, 4vw, 44px)",
          alignItems: "center",
        }}
      >
        <div>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: ".18em",
              textTransform: "uppercase",
              color: "var(--rose-deep)",
              margin: "0 0 14px",
            }}
          >
            Kostenlos, ohne Abo
          </p>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(28px, 4.4vw, 42px)",
              lineHeight: 1.15,
              color: "var(--ink)",
              margin: "0 0 16px",
              letterSpacing: "-.02em",
            }}
          >
            Dein Stall Organizer
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: "var(--ink-soft)", margin: "0 0 22px" }}>
            Alles über dein Pferd an einem Ort, statt verteilt auf Zettel, Chatverläufe und
            Erinnerung. Ich habe ihn gebaut, weil in jeder Beratung dieselben Fragen offen bleiben.
          </p>

          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 26px", display: "grid", gap: 10 }}>
            {punkte.map((p) => (
              <li
                key={p}
                style={{
                  display: "flex",
                  gap: 11,
                  alignItems: "flex-start",
                  fontSize: 16,
                  lineHeight: 1.55,
                  color: "var(--ink)",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    flexShrink: 0,
                    marginTop: 1,
                    background: "var(--rose)",
                    color: "var(--white)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  ✓
                </span>
                {p}
              </li>
            ))}
          </ul>

          <Link
            href="/stall-organizer"
            style={{ fontSize: 15, fontWeight: 700, color: "var(--rose-deep)", textDecoration: "underline" }}
          >
            Alles ansehen, was er kann
          </Link>
        </div>

        {/* Eine echte Aufnahme aus der App. Sie zeigt in einem Blick, was die
            Punkte daneben beschreiben, und dass es die App wirklich gibt. */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Image
            src="/images/stall-organizer-start.webp"
            alt="Der Stall Organizer auf dem Handy: die Liste, was heute Aufmerksamkeit braucht"
            width={760}
            height={1357}
            sizes="(min-width: 900px) 260px, 240px"
            style={{
              width: "100%",
              maxWidth: 260,
              height: "auto",
              borderRadius: 20,
              border: "1px solid var(--line)",
              boxShadow: "0 18px 44px -26px rgba(59,42,40,.6)",
            }}
          />
        </div>

        <div
          style={{
            background: "var(--white)",
            border: "1px solid var(--line)",
            borderRadius: 22,
            padding: "clamp(22px, 3vw, 32px)",
            alignSelf: "center",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 22,
              color: "var(--ink)",
              margin: "0 0 6px",
              lineHeight: 1.25,
            }}
          >
            Leg einfach los
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--ink-soft)", margin: "0 0 18px" }}>
            Adresse eintragen, Zugangslink kommt per Mail. Mehr braucht es nicht.
          </p>
          <StallAnmeldung kompakt />

        </div>
      </div>
    </section>
  );
}
