"use client";

import { useState } from "react";
import { merkeInsider } from "@/lib/insider-merker";

// ---------------------------------------------------------------------------
// Das Anmeldeformular für den Insider-Kanal.
//
// Steht an mehreren Stellen der Seite, deshalb zwei Farbvarianten: "hell" auf
// weissem Grund, "dunkel" in den Ink-Kaesten. Und `quelle` sagt, von welcher
// Stelle jemand kam — damit spaeter sichtbar wird, welcher Platz auf der
// Seite tatsaechlich etwas bringt.
//
// Das Formular schickt an app/api/insider. Danach kommt eine
// Bestaetigungsmail; erst der Klick darin macht die Adresse verwendbar.
// ---------------------------------------------------------------------------

type Props = {
  /** Von welcher Stelle der Seite die Anmeldung kommt, z. B. "startseite". */
  quelle: string;
  variante?: "hell" | "dunkel";
  knopfText?: string;
};

export default function InsiderFormular({
  quelle,
  variante = "hell",
  knopfText = "Insider werden",
}: Props) {
  const [vorname, setVorname] = useState("");
  const [email, setEmail] = useState("");
  const [einwilligung, setEinwilligung] = useState(false);
  const [webseite, setWebseite] = useState(""); // Honigtopf gegen Spam
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState("");
  const [fertig, setFertig] = useState(false);

  const dunkel = variante === "dunkel";

  const feldKlassen = dunkel
    ? "w-full px-4 py-3.5 rounded-[10px] bg-cream/10 border border-cream/25 text-cream placeholder:text-cream/45 text-[15px] focus:outline-none focus:border-pfirsich"
    : "w-full px-4 py-3.5 rounded-[10px] bg-white border border-line text-ink placeholder:text-ink-soft/60 text-[15px] focus:outline-none focus:border-rose-deep";

  const knopfKlassen = dunkel
    ? "w-full sm:w-auto bg-pfirsich text-ink px-8 py-4 rounded-full text-[15px] font-medium hover:bg-cream transition-colors disabled:opacity-50"
    : "w-full sm:w-auto bg-rose-deep text-cream px-8 py-4 rounded-full text-[15px] font-medium hover:bg-ink transition-colors disabled:opacity-50";

  const leiseText = dunkel ? "text-cream/70" : "text-ink-soft";

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    if (laeuft) return;

    if (vorname.trim().length < 2) {
      setFehler("Bitte trag deinen Vornamen ein.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setFehler("Diese E-Mail-Adresse sieht nicht vollständig aus.");
      return;
    }
    if (!einwilligung) {
      setFehler("Ohne dein Häkchen darf ich dir leider nichts schicken.");
      return;
    }

    setFehler("");
    setLaeuft(true);

    try {
      const res = await fetch("/api/insider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vorname: vorname.trim(),
          email: email.trim(),
          webseite,
          quelle,
        }),
      });
      const antwort = await res.json().catch(() => ({ ok: false }));
      if (antwort.ok) {
        // Ab jetzt verschwinden die Anmelde-Aufforderungen in diesem Browser.
        merkeInsider();
        setFertig(true);
      } else {
        setFehler(
          antwort.fehler ??
            "Das hat gerade nicht geklappt. Versuch es bitte noch einmal."
        );
      }
    } catch {
      setFehler(
        "Ich konnte dich gerade nicht erreichen. Prüf kurz deine Verbindung und versuch es noch einmal."
      );
    } finally {
      setLaeuft(false);
    }
  }

  if (fertig) {
    return (
      <div
        className={`rounded-[18px] p-6 ${
          dunkel ? "bg-cream/10 border border-cream/20" : "bg-cream-deep"
        }`}
      >
        <p className={`text-[15px] font-semibold mb-2 ${dunkel ? "text-cream" : "text-ink"}`}>
          Fast geschafft — schau in dein Postfach.
        </p>
        <p className={`text-[14px] leading-relaxed ${leiseText}`}>
          Ich habe dir eine Mail geschickt, in der du mit einem Klick
          bestätigst, dass du das bist. Erst danach darf ich dir schreiben.
          Falls sie nicht auftaucht, schau kurz im Spam-Ordner nach.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={absenden} className="max-w-md">
      <div className="flex flex-col gap-3">
        <input
          type="text"
          value={vorname}
          onChange={(e) => setVorname(e.target.value)}
          placeholder="Dein Vorname"
          autoComplete="given-name"
          aria-label="Dein Vorname"
          className={feldKlassen}
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Deine E-Mail-Adresse"
          autoComplete="email"
          inputMode="email"
          aria-label="Deine E-Mail-Adresse"
          className={feldKlassen}
        />

        {/* Honigtopf: fuer Menschen unsichtbar, fuer Spam-Skripte nicht. */}
        <div className="absolute -left-[9999px] w-px h-px overflow-hidden" aria-hidden="true">
          <label htmlFor={`webseite-${quelle}`}>Website</label>
          <input
            id={`webseite-${quelle}`}
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={webseite}
            onChange={(e) => setWebseite(e.target.value)}
          />
        </div>

        <label className={`flex gap-3 items-start text-[13.5px] leading-relaxed cursor-pointer ${leiseText}`}>
          <input
            type="checkbox"
            checked={einwilligung}
            onChange={(e) => setEinwilligung(e.target.checked)}
            className="mt-1 w-[18px] h-[18px] shrink-0 cursor-pointer accent-rose-deep"
          />
          <span>
            Ja, schick mir Fütterungswissen per Mail. Ich kann mich jederzeit
            wieder abmelden.{" "}
            <a
              href="/datenschutz"
              target="_blank"
              rel="noopener"
              className="underline hover:no-underline"
            >
              Datenschutz
            </a>
          </span>
        </label>

        {fehler && (
          <p className={`text-[13.5px] ${dunkel ? "text-pfirsich" : "text-rose-deep"}`}>
            {fehler}
          </p>
        )}

        <button type="submit" disabled={laeuft} className={`${knopfKlassen} mt-1`}>
          {laeuft ? "Einen Moment …" : knopfText}
        </button>
      </div>
    </form>
  );
}
