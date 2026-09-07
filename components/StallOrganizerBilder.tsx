import Image from "next/image";

// ---------------------------------------------------------------------------
// Vier Aufnahmen aus dem Stall Organizer.
//
// ▸ WARUM ECHTE AUFNAHMEN: Eine Aufzählung von vierzehn Möglichkeiten liest
//   niemand. Vier Bilder zeigen in zwei Sekunden, was die App ist, und dass
//   sie fertig ist und nicht nur angekündigt.
//
// ▸ Sie sind in Handybreite aufgenommen, weil der Organizer im Stall benutzt
//   wird. Der Beispielstall darin ist erfunden, die Rechnungen sind es nicht:
//   Vorratsreichweite, Monatskosten und die Terminfristen stammen aus der App.
//
// ▸ Auf schmalen Bildschirmen wischt man das Band seitlich durch, so wie man
//   es von App-Seiten kennt. Passt alles nebeneinander, steht es mittig.
// ---------------------------------------------------------------------------

const bilder = [
  {
    datei: "/images/stall-organizer-start.webp",
    hoehe: 1357,
    titel: "Was heute dran ist",
    text: "Überfällige Termine, Futter das zur Neige geht, alles zuerst.",
    alt: "Startseite des Stall Organizers mit der Liste, was Aufmerksamkeit braucht",
  },
  {
    datei: "/images/stall-organizer-termine.webp",
    hoehe: 1349,
    titel: "Erst anrufen, dann hingehen",
    text: "Termine in zwei Stufen: ausmachen und wahrnehmen.",
    alt: "Terminliste mit den Abschnitten Noch auszumachen und Steht fest",
  },
  {
    datei: "/images/stall-organizer-futter.webp",
    hoehe: 1749,
    titel: "Futterplan mit Vorrat",
    text: "Wie lange der Sack noch reicht, und was er im Monat kostet.",
    alt: "Futterplan mit Mengen, Monatskosten und der Restreichweite je Futtermittel",
  },
  {
    datei: "/images/stall-organizer-symptome.webp",
    hoehe: 1560,
    titel: "Ob es besser wird",
    text: "Von Tag zu Tag merkt man nichts. Über acht Wochen schon.",
    alt: "Symptomtagebuch mit dem Verlauf von Kotwasser über acht Wochen",
  },
];

export default function StallOrganizerBilder({
  hintergrund = "var(--white)",
}: {
  hintergrund?: string;
}) {
  return (
    <section style={{ background: hintergrund, padding: "clamp(36px, 5vw, 68px) 20px" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(26px, 4vw, 38px)",
            color: "var(--ink)",
            textAlign: "center",
            margin: "0 0 12px",
          }}
        >
          So sieht das aus
        </h2>
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.6,
            color: "var(--ink-soft)",
            textAlign: "center",
            margin: "0 auto 34px",
            maxWidth: 540,
          }}
        >
          Vier Ansichten aus der App. Der Stall darin ist ein Beispiel, gerechnet wird richtig.
        </p>

        {/* Das Band. Der negative Rand lässt die Bilder am Rand vorbeiziehen,
            statt sie in einen Kasten zu sperren. */}
        <div style={{ overflowX: "auto", margin: "0 -20px", padding: "4px 20px 10px" }}>
          <div style={{ display: "flex", gap: 18, width: "max-content", margin: "0 auto" }}>
            {bilder.map((b) => (
              <figure key={b.datei} style={{ margin: 0, width: 230, flex: "0 0 230px" }}>
                <div style={{ position: "relative" }}>
                <Image
                  src={b.datei}
                  alt={b.alt}
                  width={760}
                  height={b.hoehe}
                  sizes="230px"
                  style={{
                    width: "100%",
                    // Alle vier gleich hoch, oben ausgerichtet. Ohne das
                    // stünden die Unterschriften auf vier verschiedenen
                    // Höhen, weil die Ansichten unterschiedlich lang sind.
                    height: 420,
                    objectFit: "cover",
                    objectPosition: "top",
                    borderRadius: 18,
                    border: "1px solid var(--line)",
                    boxShadow: "0 14px 34px -22px rgba(59,42,40,.55)",
                    display: "block",
                  }}
                />
                {/* Die Ansichten sind länger als der Ausschnitt. Statt einer
                    harten Kante läuft das Bild unten in den Hintergrund aus,
                    dann liest es sich als Ausschnitt und nicht als Fehler. */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: 1,
                    right: 1,
                    bottom: 1,
                    height: 58,
                    borderRadius: "0 0 17px 17px",
                    background: `linear-gradient(to bottom, transparent, ${hintergrund})`,
                    pointerEvents: "none",
                  }}
                />
                </div>
                <figcaption style={{ marginTop: 14 }}>
                  <p
                    style={{
                      fontSize: 15.5,
                      fontWeight: 700,
                      color: "var(--ink)",
                      margin: "0 0 3px",
                      lineHeight: 1.3,
                    }}
                  >
                    {b.titel}
                  </p>
                  <p style={{ fontSize: 13.5, lineHeight: 1.5, color: "var(--ink-soft)", margin: 0 }}>
                    {b.text}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
