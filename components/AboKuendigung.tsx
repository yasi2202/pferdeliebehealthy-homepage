"use client";

// ---------------------------------------------------------------------------
// Der Kündigungsknopf nach § 312k BGB.
//
// ▸ WARUM DIESE SEITE SO AUSSIEHT, WIE SIE AUSSIEHT
//   Das Gesetz schreibt den Ablauf ziemlich genau vor, und zwar in dieser
//   Reihenfolge: eine Schaltfläche "Verträge hier kündigen", dann eine
//   Bestätigungsseite, auf der die Kundin ihre Angaben macht und sieht, was
//   sie kündigt, dann eine Schaltfläche "jetzt kündigen", und unmittelbar
//   danach eine Bestätigung in Textform, also eine Mail.
//
//   Verboten ist alles, was dazwischenkommt: keine Anmeldung, keine Suche
//   nach der Kündigungsadresse, keine Rückfrage "willst du nicht doch
//   bleiben", kein Grund, den man angeben muss. Deshalb steht hier ein
//   einziges Feld.
//
// ▸ WARUM NUR DIE E-MAIL-ADRESSE ABGEFRAGT WIRD
//   Mehr brauchen wir nicht, um den Vertrag zu finden, und mehr zu verlangen
//   wäre eine Hürde. Dass damit theoretisch jemand ein fremdes Abo kündigen
//   könnte, ist der Preis dafür. Der Schaden bliebe klein (der Zugang läuft
//   bis zum Monatsende weiter, ein neues Abo ist einen Klick entfernt), und
//   die Bestätigungsmail geht an die betroffene Adresse, es fiele also auf.
// ---------------------------------------------------------------------------

import { useState } from "react";

type Abo = {
  id: string;
  name: string;
  laeuftBis: string;
  gekuendigt: boolean;
};

type Stand =
  | { art: "formular" }
  | { art: "gefunden"; abos: Abo[] }
  | { art: "fertig"; endetAm: string; name: string };

export default function AboKuendigung() {
  const [email, setEmail] = useState("");
  const [stand, setStand] = useState<Stand>({ art: "formular" });
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  async function suchen(e: React.FormEvent) {
    e.preventDefault();
    setLaeuft(true);
    setFehler(null);

    try {
      const res = await fetch("/api/abo-kuendigen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const daten = await res.json();

      if (!res.ok) {
        setFehler(daten.fehler ?? "Das hat gerade nicht geklappt.");
        return;
      }

      setStand({ art: "gefunden", abos: daten.abos ?? [] });
    } catch {
      setFehler("Die Verbindung hat nicht geklappt. Versuch es bitte noch einmal.");
    } finally {
      setLaeuft(false);
    }
  }

  async function kuendigen(abo: Abo) {
    setLaeuft(true);
    setFehler(null);

    try {
      const res = await fetch("/api/abo-kuendigen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, aboId: abo.id, bestaetigt: true }),
      });

      const daten = await res.json();

      if (!res.ok) {
        setFehler(daten.fehler ?? "Die Kündigung hat gerade nicht geklappt.");
        return;
      }

      setStand({ art: "fertig", endetAm: daten.endetAm, name: abo.name });
    } catch {
      setFehler("Die Verbindung hat nicht geklappt. Versuch es bitte noch einmal.");
    } finally {
      setLaeuft(false);
    }
  }

  // ------------------------------------------------------------------ fertig
  if (stand.art === "fertig") {
    return (
      <div className="rounded-[20px] bg-cream-deep p-7 sm:p-9">
        <h2 className="mb-4 font-serif text-[24px] leading-snug">
          Deine Kündigung ist angekommen
        </h2>
        <p className="mb-4 text-[16.5px] leading-relaxed text-ink-soft">
          {stand.name} endet am{" "}
          <strong className="text-ink">{stand.endetAm}</strong>. Bis dahin
          kannst du weiterarbeiten wie bisher, danach wird nichts mehr
          abgebucht.
        </p>
        <p className="text-[16.5px] leading-relaxed text-ink-soft">
          Die Bestätigung habe ich dir eben an {email} geschickt. Wenn du deine
          Daten noch brauchst, lade sie dir vorher herunter oder schreib mir,
          dann schicke ich sie dir.
        </p>
      </div>
    );
  }

  // -------------------------------------------------- Bestätigung (Schritt 2)
  if (stand.art === "gefunden") {
    if (stand.abos.length === 0) {
      return (
        <div className="rounded-[20px] bg-cream-deep p-7 sm:p-9">
          <h2 className="mb-4 font-serif text-[24px] leading-snug">
            Zu dieser Adresse läuft kein Vertrag
          </h2>
          <p className="mb-5 text-[16.5px] leading-relaxed text-ink-soft">
            Unter {email} finde ich nichts, was gerade läuft. Vielleicht hast du
            mit einer anderen Adresse bezahlt, oder es ist schon gekündigt.
          </p>
          <button
            type="button"
            onClick={() => setStand({ art: "formular" })}
            className="text-[15px] text-rose-deep underline underline-offset-2"
          >
            Andere Adresse versuchen
          </button>
          <p className="mt-6 text-[15px] leading-relaxed text-ink-soft">
            Kommst du nicht weiter, schreib mir an{" "}
            <a
              href="mailto:info@pferdeliebehealthy.de"
              className="text-rose-deep underline underline-offset-2"
            >
              info@pferdeliebehealthy.de
            </a>
            , dann kündige ich für dich.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        {stand.abos.map((abo) => (
          <div key={abo.id} className="rounded-[20px] bg-cream-deep p-7 sm:p-9">
            <h2 className="mb-4 font-serif text-[24px] leading-snug">
              {abo.name}
            </h2>

            <dl className="mb-6 space-y-2 text-[16px] text-ink-soft">
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium text-ink">Vertrag von:</dt>
                <dd>{email}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium text-ink">Art der Kündigung:</dt>
                <dd>ordentliche Kündigung zum nächstmöglichen Zeitpunkt</dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium text-ink">Wirksam zum:</dt>
                <dd>{abo.laeuftBis}</dd>
              </div>
            </dl>

            {abo.gekuendigt ? (
              <p className="text-[16px] leading-relaxed text-ink-soft">
                Dieser Vertrag ist bereits gekündigt und endet am{" "}
                {abo.laeuftBis}. Du musst nichts weiter tun.
              </p>
            ) : (
              <button
                type="button"
                disabled={laeuft}
                onClick={() => kuendigen(abo)}
                className="inline-block rounded-full bg-ink px-8 py-4 text-[15px] font-medium text-cream transition-colors hover:bg-rose-deep disabled:opacity-60"
              >
                {laeuft ? "Einen Moment ..." : "Jetzt kündigen"}
              </button>
            )}
          </div>
        ))}

        {fehler && <p className="text-[15px] text-rose-deep">{fehler}</p>}
      </div>
    );
  }

  // ---------------------------------------------------- Formular (Schritt 1)
  return (
    <form onSubmit={suchen} className="rounded-[20px] bg-cream-deep p-7 sm:p-9">
      <label
        htmlFor="abo-email"
        className="mb-3 block text-[16px] font-medium text-ink"
      >
        Mit welcher E-Mail-Adresse hast du bezahlt?
      </label>

      <input
        id="abo-email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="deine@adresse.de"
        className="mb-5 w-full rounded-[12px] border border-line bg-white px-4 py-3.5 text-[16px] outline-none focus:border-rose-deep"
      />

      <button
        type="submit"
        disabled={laeuft}
        className="inline-block rounded-full bg-ink px-8 py-4 text-[15px] font-medium text-cream transition-colors hover:bg-rose-deep disabled:opacity-60"
      >
        {laeuft ? "Ich sehe nach ..." : "Verträge hier kündigen"}
      </button>

      {fehler && <p className="mt-5 text-[15px] text-rose-deep">{fehler}</p>}
    </form>
  );
}
