"use client";

// ---------------------------------------------------------------------------
// Rabattcodes anlegen und abschalten.
//
// Die Liste kommt fertig von der Seite (Server-Komponente), hier passiert
// nur das Anlegen und Umschalten. Nach jeder Änderung wird die Seite neu
// geholt, damit die Liste stimmt.
// ---------------------------------------------------------------------------

import { useRouter } from "next/navigation";
import { useState } from "react";
import { preisText } from "@/lib/shop";

export type CodeZeile = {
  id: string;
  code: string;
  prozent: number | null;
  betrag_cent: number | null;
  gueltig_bis: string | null;
  max_einloesungen: number | null;
  einloesungen: number;
  nur_fuer: string[] | null;
  aktiv: boolean;
  notiz: string | null;
};

const FELD =
  "w-full rounded-[12px] border border-line bg-white px-4 py-3 text-[15px] outline-none transition-colors focus:border-rose-deep";

export default function RabattcodeVerwaltung({
  codes,
  produkte,
}: {
  codes: CodeZeile[];
  produkte: { slug: string; kurzname: string }[];
}) {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [prozent, setProzent] = useState("");
  const [euro, setEuro] = useState("");
  const [maxEinloesungen, setMax] = useState("");
  const [gueltigBis, setBis] = useState("");
  const [notiz, setNotiz] = useState("");
  const [nurFuer, setNurFuer] = useState<string[]>([]);
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const [erfolg, setErfolg] = useState<string | null>(null);

  const anlegen = async () => {
    if (!code.trim() || laeuft) return;

    setLaeuft(true);
    setFehler(null);
    setErfolg(null);

    try {
      const antwort = await fetch("/api/admin-rabattcodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          prozent: prozent ? Number(prozent) : 0,
          euro: euro ? Number(euro.replace(",", ".")) : 0,
          maxEinloesungen: maxEinloesungen ? Number(maxEinloesungen) : 0,
          gueltigBis,
          notiz,
          nurFuer,
        }),
      });

      const daten = await antwort.json();

      if (antwort.ok) {
        setErfolg(`${daten.code} ist angelegt.`);
        setCode("");
        setProzent("");
        setEuro("");
        setMax("");
        setBis("");
        setNotiz("");
        setNurFuer([]);
        router.refresh();
      } else {
        setFehler(daten.fehler ?? "Das hat nicht geklappt.");
      }
    } catch {
      setFehler("Die Verbindung hat nicht geklappt.");
    }

    setLaeuft(false);
  };

  const umschalten = async (id: string, aktiv: boolean) => {
    await fetch("/api/admin-rabattcodes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, aktiv }),
    });
    router.refresh();
  };

  return (
    <>
      {/* ----------------------------------------------------- Neu anlegen */}
      <div className="mb-10 rounded-[18px] border border-line bg-white p-6 sm:p-7">
        <h2 className="mb-5 font-serif text-[21px]">Neuen Code anlegen</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-[13.5px] text-ink-soft">
              Code
            </span>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setFehler(null);
              }}
              placeholder="FELLWECHSEL25"
              className={FELD}
            />
            <span className="mt-1.5 block text-[12.5px] text-ink-soft">
              Nur Buchstaben, Ziffern, Strich und Unterstrich. Beim Eintippen
              ist Groß- und Kleinschreibung später egal.
            </span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13.5px] text-ink-soft">
              Prozent Nachlass
            </span>
            <input
              type="number"
              min="1"
              max="100"
              value={prozent}
              onChange={(e) => {
                setProzent(e.target.value);
                if (e.target.value) setEuro("");
                setFehler(null);
              }}
              placeholder="25"
              className={FELD}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13.5px] text-ink-soft">
              oder Betrag in Euro
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={euro}
              onChange={(e) => {
                setEuro(e.target.value);
                if (e.target.value) setProzent("");
                setFehler(null);
              }}
              placeholder="10"
              className={FELD}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13.5px] text-ink-soft">
              Wie oft einlösbar? (leer = beliebig)
            </span>
            <input
              type="number"
              min="1"
              value={maxEinloesungen}
              onChange={(e) => setMax(e.target.value)}
              placeholder="50"
              className={FELD}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13.5px] text-ink-soft">
              Gültig bis (leer = unbegrenzt)
            </span>
            <input
              type="date"
              value={gueltigBis}
              onChange={(e) => setBis(e.target.value)}
              className={FELD}
            />
          </label>

          <div className="sm:col-span-2">
            <span className="mb-2 block text-[13.5px] text-ink-soft">
              Nur für bestimmte Angebote? (nichts angekreuzt = für alle)
            </span>

            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {produkte.map((p) => (
                <label
                  key={p.slug}
                  className="flex cursor-pointer items-center gap-2 text-[14px]"
                >
                  <input
                    type="checkbox"
                    checked={nurFuer.includes(p.slug)}
                    onChange={(e) =>
                      setNurFuer((alt) =>
                        e.target.checked
                          ? [...alt, p.slug]
                          : alt.filter((s) => s !== p.slug),
                      )
                    }
                    className="h-4 w-4 accent-[color:var(--rose-deep)]"
                  />
                  {p.kurzname}
                </label>
              ))}
            </div>
          </div>

          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-[13.5px] text-ink-soft">
              Notiz für dich (freiwillig)
            </span>
            <input
              type="text"
              value={notiz}
              onChange={(e) => setNotiz(e.target.value)}
              placeholder="Aktion Instagram September"
              className={FELD}
            />
          </label>
        </div>

        {fehler && (
          <p role="alert" className="mt-4 text-[14px] text-ink-soft">
            {fehler}
          </p>
        )}

        {erfolg && (
          <p className="mt-4 rounded-[12px] bg-cream-deep p-3 text-[14px]">
            {erfolg}
          </p>
        )}

        <button
          type="button"
          onClick={anlegen}
          disabled={!code.trim() || laeuft}
          className="mt-5 rounded-full bg-ink px-7 py-3.5 text-[15px] font-medium text-cream transition-colors hover:bg-rose-deep disabled:cursor-not-allowed disabled:opacity-40"
        >
          {laeuft ? "Einen Moment…" : "Code anlegen"}
        </button>
      </div>

      {/* --------------------------------------------------- Vorhandene */}
      <div className="rounded-[18px] border border-line bg-white p-6 sm:p-7">
        <h2 className="mb-5 font-serif text-[21px]">Vorhandene Codes</h2>

        {codes.length === 0 ? (
          <p className="text-[15px] text-ink-soft">Noch keine Codes angelegt.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[14.5px]">
              <thead>
                <tr className="border-b border-line text-left text-[13px] uppercase tracking-[0.08em] text-ink-soft">
                  <th className="pb-2 pr-5 font-normal">Code</th>
                  <th className="pb-2 pr-5 font-normal">Nachlass</th>
                  <th className="pb-2 pr-5 font-normal">Gilt für</th>
                  <th className="pb-2 pl-5 text-right font-normal">Eingelöst</th>
                  <th className="pb-2 pr-5 font-normal">Bis</th>
                  <th className="pb-2 pl-5 text-right font-normal"></th>
                </tr>
              </thead>
              <tbody>
                {codes.map((c) => {
                  const verbraucht =
                    c.max_einloesungen !== null &&
                    c.einloesungen >= c.max_einloesungen;

                  const abgelaufen =
                    c.gueltig_bis !== null && new Date(c.gueltig_bis) < new Date();

                  return (
                    <tr
                      key={c.id}
                      className={`border-b border-line last:border-0 ${
                        !c.aktiv || verbraucht || abgelaufen ? "opacity-50" : ""
                      }`}
                    >
                      <td className="py-2.5 pr-5 font-medium">
                        {c.code}
                        {c.notiz && (
                          <div className="text-[12.5px] font-normal text-ink-soft">
                            {c.notiz}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 pr-5">
                        {c.prozent
                          ? `${c.prozent} %`
                          : c.betrag_cent
                            ? preisText(c.betrag_cent)
                            : "–"}
                      </td>
                      <td className="py-2.5 pr-5 text-[13.5px] text-ink-soft">
                        {c.nur_fuer && c.nur_fuer.length > 0
                          ? c.nur_fuer
                              .map(
                                (s) =>
                                  produkte.find((p) => p.slug === s)?.kurzname ?? s,
                              )
                              .join(", ")
                          : "alle"}
                      </td>
                      <td className="py-2.5 pl-5 text-right tabular-nums whitespace-nowrap">
                        {c.einloesungen}
                        {c.max_einloesungen !== null && ` / ${c.max_einloesungen}`}
                      </td>
                      <td className="py-2.5 pr-5 text-[13.5px] text-ink-soft">
                        {c.gueltig_bis
                          ? new Date(c.gueltig_bis).toLocaleDateString("de-DE")
                          : "–"}
                      </td>
                      <td className="py-2.5 pl-5 text-right">
                        <button
                          type="button"
                          onClick={() => umschalten(c.id, !c.aktiv)}
                          className="text-[13.5px] text-rose-deep underline underline-offset-2"
                        >
                          {c.aktiv ? "abschalten" : "einschalten"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-[13px] leading-relaxed text-ink-soft">
          Blass dargestellte Zeilen gelten nicht mehr, weil sie abgeschaltet,
          abgelaufen oder aufgebraucht sind. Gelöscht wird nie, damit du später
          noch nachsehen kannst, welche Aktion wie gelaufen ist.
        </p>
      </div>
    </>
  );
}
