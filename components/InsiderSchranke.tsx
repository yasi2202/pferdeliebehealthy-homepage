"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import InsiderFormular from "@/components/InsiderFormular";
import { insider } from "@/lib/insider";

// ---------------------------------------------------------------------------
// Die Schranke unter einem angerissenen Beitrag.
//
// Zwei Wege, weil es zwei Sorten Besucherinnen gibt:
//
//   Neu hier  → eintragen. Danach kommt die Bestätigungsmail, und der Klick
//               darin meldet sie gleich an.
//   Schon dabei → Adresse eingeben, Anmeldelink kommt per Mail. Das ist der
//               Fall "ich habe mich am Handy eingetragen und sitze jetzt am
//               Laptop".
//
// Der zweite Weg steht bewusst klein darunter und nicht gleichberechtigt
// daneben: Die meisten, die hier landen, sind neu, und zwei gleich grosse
// Formulare nebeneinander zwingen alle zu einer Entscheidung, die für die
// Mehrheit gar keine ist.
// ---------------------------------------------------------------------------

export default function InsiderSchranke() {
  const pfad = usePathname();
  const [zeigeAnmeldung, setZeigeAnmeldung] = useState(false);
  const [email, setEmail] = useState("");
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState("");
  const [verschickt, setVerschickt] = useState(false);

  async function linkAnfordern(e: React.FormEvent) {
    e.preventDefault();
    if (laeuft) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setFehler("Diese E-Mail-Adresse sieht nicht vollständig aus.");
      return;
    }

    setFehler("");
    setLaeuft(true);
    try {
      const res = await fetch("/api/insider/zugang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), weiter: pfad }),
      });
      const antwort = await res.json().catch(() => ({ ok: false }));
      if (antwort.ok) setVerschickt(true);
      else setFehler(antwort.fehler ?? "Das hat gerade nicht geklappt.");
    } catch {
      setFehler("Ich konnte dich gerade nicht erreichen. Versuch es noch einmal.");
    } finally {
      setLaeuft(false);
    }
  }

  return (
    <div className="bg-ink text-cream rounded-[24px] p-8 sm:p-10 mt-10">
      <div className="text-[11px] tracking-[0.16em] uppercase text-pfirsich font-semibold mb-3">
        Weiterlesen
      </div>
      <h2 className="font-serif text-[24px] sm:text-[30px] leading-snug mb-4">
        Dieser Beitrag ist für Insider
      </h2>
      <p className="text-[15px] text-cream/75 max-w-lg mb-7">
        Der ganze Text steht dir offen, sobald du dabei bist. Das kostet
        nichts. Ich schicke dir dafür regelmäßig mein Wissen aus der Praxis ins
        Postfach, und du kannst dich jederzeit wieder abmelden.
      </p>

      <InsiderFormular
        quelle={`schranke${pfad}`}
        variante="dunkel"
        knopfText={insider.abschnitt.button}
      />

      {/* Der zweite Weg, klein darunter */}
      <div className="mt-7 pt-6 border-t border-cream/15">
        {verschickt ? (
          <p className="text-[14px] text-cream/80 leading-relaxed max-w-md">
            Wenn diese Adresse bei mir eingetragen ist, liegt jetzt eine Mail
            mit deinem Anmeldelink in deinem Postfach. Ein Klick darauf, und du
            bist wieder hier, angemeldet.
          </p>
        ) : !zeigeAnmeldung ? (
          <button
            type="button"
            onClick={() => setZeigeAnmeldung(true)}
            className="text-[14px] text-cream/70 underline hover:text-cream transition-colors"
          >
            Ich bin schon dabei, aber auf diesem Gerät nicht angemeldet
          </button>
        ) : (
          <form onSubmit={linkAnfordern} className="max-w-md">
            <p className="text-[14px] text-cream/75 mb-3 leading-relaxed">
              Trag deine Adresse ein, dann schicke ich dir einen Anmeldelink.
              Ein Passwort brauchst du nicht.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Deine E-Mail-Adresse"
                autoComplete="email"
                inputMode="email"
                aria-label="Deine E-Mail-Adresse"
                className="flex-grow px-4 py-3.5 rounded-[10px] bg-cream/10 border border-cream/25 text-cream placeholder:text-cream/45 text-[15px] focus:outline-none focus:border-pfirsich"
              />
              <button
                type="submit"
                disabled={laeuft}
                className="shrink-0 bg-cream/15 border border-cream/25 text-cream px-6 py-3.5 rounded-[10px] text-[15px] font-medium hover:bg-cream/25 transition-colors disabled:opacity-50"
              >
                {laeuft ? "Einen Moment …" : "Link schicken"}
              </button>
            </div>
            {fehler && <p className="text-[13.5px] text-pfirsich mt-3">{fehler}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
