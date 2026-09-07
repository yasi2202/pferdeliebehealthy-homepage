"use client";

import { useState } from "react";

// ---------------------------------------------------------------------------
// Das Anmeldeformular fuers Webinar.
//
// Die Termine kommen fertig formatiert vom Server: Sie in Berliner Zeit
// auszurechnen ist heikel genug, das soll nicht auch noch im Browser
// passieren, wo die Uhr der Besucherin ganz woanders stehen kann.
// ---------------------------------------------------------------------------

export type TerminAngebot = {
  /** Der Zeitpunkt in Weltzeit, so wie er zurueckgeschickt wird. */
  wert: string;
  /** "Sonntag, 13. September, 10:00 Uhr" */
  text: string;
  /** "heute", "morgen" oder der Wochentag. */
  naehe: string;
};

export default function WebinarFormular({ termine }: { termine: TerminAngebot[] }) {
  const [gewaehlt, setGewaehlt] = useState(termine[0]?.wert ?? "");
  const [vorname, setVorname] = useState("");
  const [email, setEmail] = useState("");
  const [webseite, setWebseite] = useState(""); // Honigtopf
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const [fertig, setFertig] = useState<{ token: string; text: string } | null>(null);

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    setFehler(null);
    setLaeuft(true);
    try {
      const antwort = await fetch("/api/webinar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vorname, email, termin: gewaehlt, webseite, quelle: "website" }),
      });
      const ergebnis = await antwort.json();
      if (!ergebnis.ok) {
        setFehler(ergebnis.fehler || "Das hat gerade nicht geklappt.");
      } else {
        setFertig({
          token: ergebnis.token,
          text: termine.find((t) => t.wert === gewaehlt)?.text ?? "",
        });
      }
    } catch {
      setFehler("Keine Verbindung. Bitte versuch es gleich noch einmal.");
    } finally {
      setLaeuft(false);
    }
  }

  if (fertig) {
    return (
      <div className="rounded-2xl bg-cream p-6 sm:p-8">
        <h2 className="font-serif text-[24px] mb-3">Dein Platz ist reserviert</h2>
        <p className="text-[17px] leading-relaxed mb-4">
          <strong>{fertig.text}</strong>
          <br />
          Die Mail mit dem Zugangslink ist unterwegs.
        </p>
        <p className="text-[15px] text-ink-soft leading-relaxed mb-5">
          Falls sie nicht ankommt, schau bitte im Spam nach. Und leg dir am
          besten gleich diesen Link ab, er führt dich zum Termin in den Raum:
        </p>
        <a
          href={`/webinar/raum/${fertig.token}`}
          className="inline-block rounded-full bg-rose-deep px-7 py-3.5 text-white text-[16px]"
        >
          Zum Warteraum
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={absenden} className="rounded-2xl bg-cream p-6 sm:p-8">
      <fieldset className="mb-6">
        <legend className="text-[13px] tracking-[0.12em] uppercase text-rose-deep font-semibold mb-3">
          Wann passt es dir?
        </legend>
        <div className="grid gap-2">
          {termine.map((t) => (
            <label
              key={t.wert}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition ${
                gewaehlt === t.wert
                  ? "border-rose-deep bg-white"
                  : "border-cream-deep bg-white/50 hover:bg-white"
              }`}
            >
              <input
                type="radio"
                name="termin"
                value={t.wert}
                checked={gewaehlt === t.wert}
                onChange={() => setGewaehlt(t.wert)}
                className="accent-rose-deep"
              />
              <span className="text-[16px]">
                {t.text}
                <span className="text-ink-soft text-[14px]"> · {t.naehe}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2 mb-4">
        <label className="block">
          <span className="block text-[14px] text-ink-soft mb-1">Vorname</span>
          <input
            type="text"
            value={vorname}
            onChange={(e) => setVorname(e.target.value)}
            required
            minLength={2}
            maxLength={60}
            autoComplete="given-name"
            className="w-full rounded-xl border border-cream-deep bg-white px-4 py-3 text-[16px]"
          />
        </label>
        <label className="block">
          <span className="block text-[14px] text-ink-soft mb-1">E-Mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={200}
            autoComplete="email"
            className="w-full rounded-xl border border-cream-deep bg-white px-4 py-3 text-[16px]"
          />
        </label>
      </div>

      {/* Honigtopf: fuer Menschen unsichtbar, Spam-Skripte fuellen ihn aus. */}
      <input
        type="text"
        name="webseite"
        value={webseite}
        onChange={(e) => setWebseite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] w-px h-px opacity-0"
      />

      <p className="text-[13px] text-ink-soft leading-relaxed mb-4">
        Mit der Anmeldung bekommst du den Zugangslink und eine Erinnerung vor
        dem Termin. Danach schreibe ich dir gelegentlich, was es Neues zur
        Fütterung gibt. Abmelden kannst du dich jederzeit mit einem Klick.
      </p>

      {fehler && <p className="text-[15px] text-[#a5504a] mb-3">{fehler}</p>}

      <button
        type="submit"
        disabled={laeuft || !gewaehlt}
        className="rounded-full bg-rose-deep px-7 py-3.5 text-white text-[16px] disabled:opacity-60"
      >
        {laeuft ? "Einen Moment..." : "Platz sichern, kostenlos"}
      </button>
    </form>
  );
}
