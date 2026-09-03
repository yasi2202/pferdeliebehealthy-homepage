"use client";

import { useState } from "react";

// ---------------------------------------------------------------------------
// Der Knopf, der die Abmeldung vom Newsletter tatsächlich auslöst.
//
// Bewusst ein eigener Klick und kein Aufruf beim Öffnen der Seite: Manche
// Mailprogramme und Virenscanner öffnen alle Links einer Mail von selbst, um
// sie zu prüfen. Würde schon das Öffnen abmelden, verschwände nach und nach
// ein Teil des Verteilers, ohne dass jemals jemand geklickt hätte.
// ---------------------------------------------------------------------------

export default function NewsletterAbmeldeKnopf({
  email,
  p,
}: {
  email: string;
  p: string;
}) {
  const [stand, setStand] = useState<"bereit" | "laeuft" | "fertig" | "fehler">(
    "bereit"
  );

  async function abmelden() {
    setStand("laeuft");
    try {
      const adresse =
        `/api/newsletter-abmelden?e=${encodeURIComponent(email)}` +
        `&p=${encodeURIComponent(p)}`;

      const res = await fetch(adresse, { method: "POST" });
      setStand(res.ok ? "fertig" : "fehler");
    } catch {
      setStand("fehler");
    }
  }

  if (stand === "fertig") {
    return (
      <div className="bg-cream-deep rounded-[18px] p-6 sm:p-7">
        <p className="text-[15px] font-semibold mb-2">Du bist abgemeldet.</p>
        <p className="text-[14.5px] text-ink-soft leading-relaxed">
          Deine Adresse ist gelöscht, du bekommst nichts mehr von mir. Falls du
          es dir anders überlegst, trag dich einfach wieder ein, ich freue mich.
        </p>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={abmelden}
        disabled={stand === "laeuft"}
        className="bg-ink text-cream px-7 py-3.5 rounded-full text-[15px] font-medium hover:bg-rose-deep transition-colors disabled:opacity-50"
      >
        {stand === "laeuft" ? "Einen Moment …" : "Ja, bitte abmelden"}
      </button>

      {stand === "fehler" && (
        <p className="text-[13.5px] text-rose-deep mt-4">
          Das hat gerade nicht geklappt. Versuch es bitte noch einmal oder
          schreib mir an info@pferdeliebehealthy.de, dann mache ich es von Hand.
        </p>
      )}
    </div>
  );
}
