import type { Metadata } from "next";
import Link from "next/link";
import { adminEingerichtet, istAngemeldet } from "@/lib/admin-zugang";
import { supabaseAlle } from "@/lib/versand";
import { STICHWOERTER } from "@/lib/instagram-stichwoerter";
import { beitragsLink, holeZugang } from "@/lib/instagram-kommentare-server";

// ---------------------------------------------------------------------------
// Die Übersicht der eigenen Kommentar-Antwort (Ersatz für ManyChat).
//
// Oben der Stand der Einrichtung, damit auf einen Blick klar ist, woran es
// hakt, wenn nichts beantwortet wird. Darunter, wie oft jedes Stichwort und
// jeder Beitrag ausgelöst hat, und die letzten Kommentare mit Ergebnis.
// Die Stichwörter selbst stehen in lib/instagram-stichwoerter.ts.
// ---------------------------------------------------------------------------

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Instagram-Kommentare",
  robots: { index: false, follow: false },
};

type Eintrag = {
  erstellt_am: string;
  kommentar_id: string;
  beitrag_id: string | null;
  von_name: string | null;
  text: string | null;
  stichwort: string | null;
  nachricht_ok: boolean | null;
  antwort_ok: boolean | null;
  fehler: string | null;
};

function zeit(iso: string) {
  return new Date(iso).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  });
}

function Punkt({ ok, text }: { ok: boolean; text: string }) {
  return (
    <li className="flex items-start gap-3 text-[15px]">
      <span
        aria-hidden
        className={`mt-[3px] inline-block h-3 w-3 shrink-0 rounded-full ${ok ? "bg-[#3F6B4A]" : "bg-[#C9822E]"}`}
      />
      <span>{text}</span>
    </li>
  );
}

export default async function InstagramAuswertung() {
  if (!adminEingerichtet() || !(await istAngemeldet())) {
    return (
      <main className="px-6 py-20">
        <div className="mx-auto max-w-lg text-center">
          <p className="text-[15px] text-ink-soft">
            Bitte zuerst{" "}
            <Link href="/admin" className="text-rose-deep underline underline-offset-2">
              anmelden
            </Link>
            .
          </p>
        </div>
      </main>
    );
  }

  const zugang = await holeZugang();
  const alle = await supabaseAlle<Eintrag>(
    "instagram_kommentar_antworten?select=erstellt_am,kommentar_id,beitrag_id,von_name,text,stichwort,nachricht_ok,antwort_ok,fehler&order=erstellt_am.desc",
  );
  const tabelleDa = alle !== null;
  const eintraege = alle ?? [];

  const seit30 = Date.now() - 30 * 86400000;
  const letzte30 = eintraege.filter((e) => new Date(e.erstellt_am).getTime() >= seit30);

  const jeWort = STICHWOERTER.map((s) => ({
    wort: s.wort,
    aus: !!s.aus,
    gesamt: eintraege.filter((e) => e.stichwort === s.wort).length,
    monat: letzte30.filter((e) => e.stichwort === s.wort).length,
  }));

  const jeBeitrag = new Map<string, number>();
  for (const e of eintraege) {
    if (e.beitrag_id) jeBeitrag.set(e.beitrag_id, (jeBeitrag.get(e.beitrag_id) ?? 0) + 1);
  }
  const topBeitraege = [...jeBeitrag.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  const links = zugang
    ? await Promise.all(topBeitraege.map(([id]) => beitragsLink(zugang.token, id)))
    : topBeitraege.map(() => null);

  const fehler = eintraege.filter((e) => e.nachricht_ok === false).length;

  return (
    <main className="px-6 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="font-serif text-[32px] font-normal leading-tight tracking-tight sm:text-[40px]">
            Instagram-Kommentare
          </h1>
          <Link href="/admin" className="text-[14.5px] text-rose-deep underline underline-offset-2">
            Zur Auswertung
          </Link>
        </div>

        <section className="mb-10 rounded-[16px] border border-line bg-white p-6">
          <h2 className="mb-4 font-serif text-[20px]">Einrichtung</h2>
          <ul className="grid gap-2">
            <Punkt ok={!!zugang} text={zugang ? `Instagram-Schlüssel vorhanden (${zugang.woher === "tabelle" ? "erneuert" : "aus Vercel"}${zugang.gueltigBis ? `, gültig bis ${new Date(zugang.gueltigBis).toLocaleDateString("de-DE")}` : ""})` : "Kein Instagram-Schlüssel: INSTAGRAM_ZUGANG bei Vercel eintragen"} />
            <Punkt ok={!!process.env.INSTAGRAM_APP_GEHEIMNIS} text={process.env.INSTAGRAM_APP_GEHEIMNIS ? "App-Geheimnis gesetzt, Meldungen von Meta werden geprüft" : "INSTAGRAM_APP_GEHEIMNIS fehlt: ohne es wird jede Meldung abgelehnt"} />
            <Punkt ok={!!process.env.INSTAGRAM_WEBHOOK_TOKEN} text={process.env.INSTAGRAM_WEBHOOK_TOKEN ? `Webhook-Wort gesetzt (${(process.env.INSTAGRAM_WEBHOOK_TOKEN || "").trim().length} Zeichen, beginnt mit „${(process.env.INSTAGRAM_WEBHOOK_TOKEN || "").trim().slice(0, 4)}“)` : "INSTAGRAM_WEBHOOK_TOKEN fehlt: Meta kann den Webhook nicht einrichten"} />
            <Punkt ok={tabelleDa} text={tabelleDa ? "Tabelle vorhanden" : "Tabelle fehlt: datenbank/instagram-kommentare.sql im SQL Editor ausführen"} />
          </ul>
          <p className="mt-4 text-[13.5px] text-ink-soft">
            Webhook-Adresse für Meta: https://www.pferdeliebehealthy.de/api/instagram/webhook · Feld „comments“ ·
            Seite zur Datenlöschung: https://www.pferdeliebehealthy.de/instagram-daten
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-serif text-[22px]">Stichwörter</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-[15px]">
              <thead>
                <tr className="border-b border-line text-left text-[13px] text-ink-soft">
                  <th className="py-2 pr-4 font-semibold">Wort</th>
                  <th className="py-2 pr-4 text-right font-semibold">Letzte 30 Tage</th>
                  <th className="py-2 text-right font-semibold">Insgesamt</th>
                </tr>
              </thead>
              <tbody>
                {jeWort.map((w) => (
                  <tr key={w.wort} className="border-b border-line">
                    <td className="py-2 pr-4 font-semibold">
                      {w.wort} {w.aus && <span className="text-[13px] font-normal text-ink-soft">(aus)</span>}
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums">{w.monat}</td>
                    <td className="py-2 text-right tabular-nums">{w.gesamt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {fehler > 0 && (
            <p className="mt-3 text-[14px] text-[#A8442E]">
              {fehler} Nachrichten gingen nicht raus. Der Grund steht unten in der Liste.
            </p>
          )}
        </section>

        {topBeitraege.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 font-serif text-[22px]">Welche Beiträge Kommentare bringen</h2>
            <ul className="grid gap-2 text-[15px]">
              {topBeitraege.map(([id, zahl], i) => (
                <li key={id} className="flex flex-wrap justify-between gap-3 border-b border-line py-2">
                  {links[i] ? (
                    <a href={links[i]!} target="_blank" rel="noopener noreferrer" className="text-rose-deep underline underline-offset-2">
                      {links[i]!.replace("https://www.instagram.com", "")}
                    </a>
                  ) : (
                    <span className="text-ink-soft">Beitrag {id}</span>
                  )}
                  <span className="tabular-nums">{zahl}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h2 className="mb-4 font-serif text-[22px]">Die letzten Kommentare</h2>
          {eintraege.length === 0 ? (
            <p className="text-[15px] text-ink-soft">Noch keine. Sobald jemand ein Stichwort kommentiert, steht es hier.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-[14.5px]">
                <thead>
                  <tr className="border-b border-line text-left text-[13px] text-ink-soft">
                    <th className="py-2 pr-3 font-semibold">Wann</th>
                    <th className="py-2 pr-3 font-semibold">Wer</th>
                    <th className="py-2 pr-3 font-semibold">Kommentar</th>
                    <th className="py-2 pr-3 font-semibold">Wort</th>
                    <th className="py-2 font-semibold">Ergebnis</th>
                  </tr>
                </thead>
                <tbody>
                  {eintraege.slice(0, 60).map((e) => (
                    <tr key={e.kommentar_id} className="border-b border-line align-top">
                      <td className="py-2 pr-3 whitespace-nowrap tabular-nums">{zeit(e.erstellt_am)}</td>
                      <td className="py-2 pr-3">{e.von_name ? `@${e.von_name}` : "unbekannt"}</td>
                      <td className="py-2 pr-3">{e.text}</td>
                      <td className="py-2 pr-3 font-semibold">{e.stichwort}</td>
                      <td className="py-2">
                        {e.nachricht_ok === null
                          ? "läuft"
                          : e.nachricht_ok
                            ? e.antwort_ok
                              ? "Nachricht und Antwort raus"
                              : "Nachricht raus, Antwort nicht"
                            : `Nicht raus: ${e.fehler ?? "unbekannt"}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
