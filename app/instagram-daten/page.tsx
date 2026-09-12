import type { Metadata } from "next";

// ---------------------------------------------------------------------------
// Was mit Instagram-Kommentaren passiert, und wie man die Daten löschen
// lässt. Meta verlangt für die App eine solche Seite („Anleitung zur
// Datenlöschung“), deshalb liegt sie öffentlich unter einer festen Adresse:
// https://www.pferdeliebehealthy.de/instagram-daten
//
// Was hier steht, muss zu lib/instagram-kommentare-server.ts passen:
// dieselben Daten, dieselben zwölf Monate.
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  alternates: { canonical: "/instagram-daten" },
  title: "Instagram-Kommentare und deine Daten",
  description:
    "Was passiert, wenn du unter einem Beitrag von Pferdeliebehealthy ein Stichwort kommentierst, und wie du deine Daten löschen lässt.",
};

const absatz: React.CSSProperties = { fontSize: 16.5, lineHeight: 1.75, color: "var(--ink-soft)", margin: "0 0 16px" };
const h2: React.CSSProperties = { fontFamily: "var(--font-serif)", fontSize: 24, color: "var(--ink)", margin: "36px 0 12px" };

export default function InstagramDaten() {
  return (
    <main style={{ background: "var(--cream)", padding: "clamp(48px, 8vw, 96px) 20px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(30px, 5vw, 44px)",
            lineHeight: 1.15,
            color: "var(--ink)",
            margin: "0 0 20px",
          }}
        >
          Instagram-Kommentare und deine Daten
        </h1>
        <p style={absatz}>
          Wenn du unter einem Beitrag von @pferdeliebehealthy ein Stichwort kommentierst, zum Beispiel
          HEU, schicke ich dir automatisch eine Direktnachricht mit dem Link, um den es geht, und
          antworte kurz unter deinem Kommentar.
        </p>

        <h2 style={h2}>Welche Daten dabei verarbeitet werden</h2>
        <p style={absatz}>
          Instagram übermittelt mir über die Schnittstelle von Meta deinen Instagram-Nutzernamen, die
          Kennung deines Kontos, den Text deines Kommentars, den Beitrag, unter dem er steht, und den
          Zeitpunkt. Ich speichere diese Angaben, damit du auf einen Kommentar nicht zweimal eine
          Nachricht bekommst und damit ich sehe, welche Beiträge Anfragen auslösen. Weitere Daten aus
          deinem Konto erhalte ich nicht.
        </p>
        <p style={absatz}>
          Gespeichert wird auf Servern in der EU. Nach zwölf Monaten werden die Angaben automatisch
          gelöscht. Weitergegeben werden sie nicht.
        </p>

        <h2 style={h2}>So lässt du deine Daten löschen</h2>
        <p style={absatz}>
          Schreib mir eine Mail an{" "}
          <a href="mailto:info@pferdeliebehealthy.de" style={{ color: "var(--rose-deep)" }}>
            info@pferdeliebehealthy.de
          </a>{" "}
          mit deinem Instagram-Nutzernamen und dem Betreff „Instagram-Daten löschen“. Ich lösche alle
          gespeicherten Angaben zu deinem Konto innerhalb von 30 Tagen und bestätige dir das per Mail.
          Deinen Kommentar selbst kannst du jederzeit auf Instagram löschen.
        </p>

        <h2 style={h2}>Mehr dazu</h2>
        <p style={absatz}>
          Alles Weitere, auch zu deinen Rechten, steht in der{" "}
          <a href="/datenschutz" style={{ color: "var(--rose-deep)" }}>
            Datenschutzerklärung
          </a>
          .
        </p>
      </div>
    </main>
  );
}
