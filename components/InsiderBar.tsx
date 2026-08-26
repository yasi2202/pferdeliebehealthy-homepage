"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { insider } from "@/lib/insider";

// ---------------------------------------------------------------------------
// Der Balken am unteren Bildschirmrand.
//
// Er erscheint erst, wenn jemand ein gutes Stück gelesen hat — nicht sofort
// beim Öffnen. Wer ihn schließt, sieht ihn nicht wieder.
//
// Zum Merken des Schließens liegt ein einzelner Schalter im Browser
// (localStorage), keine Kennung und kein Cookie. Es wird also niemand
// wiedererkannt, und es bleibt bei "keine Einwilligung nötig".
//
// Auf der Futter-Check-Seite bleibt der Balken aus, damit er dort nicht mit
// dem Formular konkurriert.
// ---------------------------------------------------------------------------

const SCHALTER = "insider-balken-geschlossen";

export default function InsiderBar() {
  const pfad = usePathname();
  const [sichtbar, setSichtbar] = useState(false);
  const [geschlossen, setGeschlossen] = useState(true); // bis geprüft: nicht zeigen

  useEffect(() => {
    let schonGeschlossen = false;
    try {
      schonGeschlossen = window.localStorage.getItem(SCHALTER) === "ja";
    } catch {
      // Privater Modus oder Speicher gesperrt: dann eben ohne Merken.
    }
    setGeschlossen(schonGeschlossen);
    if (schonGeschlossen) return;

    function pruefen() {
      const hoehe = document.body.scrollHeight - window.innerHeight;
      const anteil = hoehe > 0 ? window.scrollY / hoehe : 0;
      setSichtbar(anteil > 0.35);
    }

    pruefen();
    window.addEventListener("scroll", pruefen, { passive: true });
    return () => window.removeEventListener("scroll", pruefen);
  }, []);

  function schliessen() {
    setGeschlossen(true);
    try {
      window.localStorage.setItem(SCHALTER, "ja");
    } catch {
      // nicht schlimm, dann erscheint er beim nächsten Besuch wieder
    }
  }

  // Auf dem Fragebogen und auf der Dankesseite bleibt der Balken weg: dort
  // hat die Besucherin genau eine Aufgabe, und die soll nichts ueberlagern.
  // Auf der Infoseite /futter-check darf er stehen — das ist eine normale
  // Seite, auf der auch der Insider-Kanal passt.
  if (
    geschlossen ||
    pfad === "/futter-check-start" ||
    pfad === "/danke-futter-check"
  )
    return null;

  return (
    <div
      role="complementary"
      aria-label="Hinweis auf den kostenlosen Insider-Kanal"
      className={`fixed inset-x-0 bottom-0 z-50 px-4 pb-4 transition-all duration-500 motion-reduce:transition-none ${
        sichtbar ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0 pointer-events-none"
      }`}
    >
      <div className="max-w-3xl mx-auto bg-ink text-cream rounded-[18px] shadow-[0_20px_50px_-20px_rgba(59,42,40,0.6)] px-5 sm:px-7 py-4 flex items-center gap-4 sm:gap-6">
        <p className="text-[14.5px] leading-snug flex-grow">
          <span className="font-medium">{insider.name}</span>
          <span className="hidden sm:inline"> · </span>
          <span className="block sm:inline text-cream/75">{insider.balken.text}</span>
        </p>

        <a
          href={insider.anmeldeUrl}
          target="_blank"
          rel="noopener"
          className="shrink-0 bg-pfirsich text-ink px-5 py-2.5 rounded-full text-[14px] font-medium hover:bg-cream transition-colors"
        >
          {insider.balken.button}
        </a>

        <button
          type="button"
          onClick={schliessen}
          aria-label="Hinweis schließen"
          className="shrink-0 w-8 h-8 rounded-full text-cream/60 hover:text-cream hover:bg-cream/10 transition-colors text-[18px] leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}
