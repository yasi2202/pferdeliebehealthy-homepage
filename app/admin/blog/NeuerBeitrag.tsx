"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ---------------------------------------------------------------------------
// Einen neuen Entwurf anlegen: Titel eintippen, die Adresse entsteht daraus.
//
// Die Adresse lässt sich danach nicht mehr im Editor ändern, sie ist der
// Dateiname. Deshalb steht sie hier sichtbar da und kann vor dem Anlegen noch
// angepasst werden. Sie sollte das Wort enthalten, nach dem gesucht wird.
// ---------------------------------------------------------------------------

function adresseAus(titel: string): string {
  return titel
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

export default function NeuerBeitrag() {
  const router = useRouter();
  const [titel, setTitel] = useState("");
  const [adresse, setAdresse] = useState("");
  const [vonHand, setVonHand] = useState(false);
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  const slug = vonHand ? adresse : adresseAus(titel);

  async function anlegen() {
    setFehler(null);
    setLaeuft(true);
    try {
      const res = await fetch("/api/admin-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ was: "anlegen", slug, titel }),
      });
      const j = await res.json();
      if (!res.ok) {
        setFehler(j.fehler ?? "Das Anlegen hat nicht geklappt.");
        return;
      }
      router.push(`/admin/blog/${slug}`);
    } catch {
      setFehler("Keine Verbindung. Noch einmal versuchen.");
    } finally {
      setLaeuft(false);
    }
  }

  return (
    <div className="rounded-[18px] border border-line bg-white p-6 sm:p-7">
      <h2 className="mb-4 font-serif text-[21px]">Neuer Beitrag</h2>
      <label className="mb-1 block text-[13px] uppercase tracking-[0.1em] text-ink-soft">
        Titel
      </label>
      <input
        value={titel}
        onChange={(e) => setTitel(e.target.value)}
        placeholder="Zum Beispiel: Welche Kräuter darf mein Pferd im Winter bekommen?"
        className="mb-4 w-full rounded-[12px] border border-line px-4 py-3 text-[15px]"
      />
      <label className="mb-1 block text-[13px] uppercase tracking-[0.1em] text-ink-soft">
        Adresse
      </label>
      <div className="mb-4 flex flex-wrap items-center gap-2 text-[14.5px]">
        <span className="text-ink-soft">pferdeliebehealthy.de/blog/</span>
        <input
          value={slug}
          onChange={(e) => {
            setVonHand(true);
            setAdresse(e.target.value.toLowerCase());
          }}
          className="min-w-[240px] flex-1 rounded-[12px] border border-line px-3 py-2 text-[14.5px]"
        />
      </div>
      <p className="mb-4 text-[13px] leading-relaxed text-ink-soft">
        Die Adresse ist später nicht mehr änderbar. Sie sollte nüchtern sein und
        das Wort enthalten, nach dem gesucht wird.
      </p>
      {fehler && <p className="mb-3 text-[14px] text-rose-deep">{fehler}</p>}
      <button
        type="button"
        onClick={anlegen}
        disabled={laeuft || !titel.trim() || !slug}
        className="rounded-full bg-ink px-6 py-3 text-[15px] text-cream disabled:opacity-40"
      >
        {laeuft ? "Wird angelegt …" : "Als Entwurf anlegen"}
      </button>
    </div>
  );
}
