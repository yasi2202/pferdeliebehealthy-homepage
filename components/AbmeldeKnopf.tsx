"use client";

import { useState } from "react";
import { vergissInsider } from "@/lib/insider-merker";

// ---------------------------------------------------------------------------
// Der Knopf, der die Abmeldung tatsächlich auslöst.
//
// Bewusst ein eigener Klick und kein Aufruf beim Öffnen der Seite: Manche
// Mailprogramme öffnen alle Links einer Mail von selbst, um sie zu prüfen.
// ---------------------------------------------------------------------------

export default function AbmeldeKnopf({ token }: { token: string }) {
  const [stand, setStand] = useState<"bereit" | "laeuft" | "fertig" | "fehler">("bereit");

  async function abmelden() {
    setStand("laeuft");
    try {
      const res = await fetch("/api/insider/abmelden", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const antwort = await res.json().catch(() => ({ ok: false }));
      if (antwort.ok) {
        // Damit die Seite wieder anbietet, sich einzutragen.
        vergissInsider();
        setStand("fertig");
      } else {
        setStand("fehler");
      }
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
