import type { Metadata } from "next";
import Link from "next/link";
import { adminEingerichtet, istAngemeldet } from "@/lib/admin-zugang";
import { streckenHolen, streckenMailsHolen } from "@/lib/newsletter-strecken";
import NeueStrecke from "./NeueStrecke";

// ---------------------------------------------------------------------------
// Die Mailstrecken: Serien, die nach der Anmeldung von selbst loslaufen.
// ---------------------------------------------------------------------------

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mailstrecken",
  robots: { index: false, follow: false },
};

const AUSLOESER_TEXT: Record<string, string> = {
  insider: "wer sich für den Insider-Kanal einträgt",
  "futter-check": "wer den Futter-Check macht",
  alle: "jede neue Anmeldung",
};

export default async function StreckenSeite() {
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

  const strecken = await streckenHolen();

  const schritte = new Map<string, number>();
  for (const s of strecken ?? []) {
    schritte.set(s.id, (await streckenMailsHolen(s.id)).length);
  }

  return (
    <main className="px-6 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin/newsletter"
          className="mb-6 inline-block text-[14.5px] text-rose-deep underline underline-offset-2"
        >
          ← Alle Newsletter
        </Link>

        <h1 className="font-serif text-[32px] font-normal leading-tight tracking-tight sm:text-[40px]">
          Mailstrecken
        </h1>

        <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">
          Eine Strecke ist eine Kette von Mails, die nach der Anmeldung von
          selbst losläuft. Mail 1 am ersten Tag, Mail 2 nach drei Tagen, Mail
          3 nach sieben. So lernt jemand dich kennen, ohne dass du daran
          denken musst.
        </p>

        <div className="mt-5 rounded-[16px] border border-line bg-white p-5">
          <p className="text-[15px] leading-relaxed text-ink-soft">
            <strong className="text-ink">Zwei Dinge vorweg.</strong> Erstens:
            In eine Strecke läuft nur hinein, wer sich{" "}
            <em>nach</em> dem Einschalten anmeldet. Deine Bestandsadressen
            bekommen also nichts — sonst wäre der erste Klick ein
            Willkommensgruss an tausend Menschen, die seit Jahren dabei sind.
            Zweitens: Die Mails gehen einmal täglich raus, nicht auf die
            Minute genau. Für eine Willkommensserie reicht das völlig.
          </p>
        </div>

        {strecken === null ? (
          <p className="mt-8 rounded-[16px] border border-line bg-white p-5 text-[15px] leading-relaxed text-ink-soft">
            Die Tabellen fehlen noch. Trag zuerst{" "}
            <code className="rounded bg-cream-deep px-1.5 py-0.5 text-[13.5px]">
              datenbank/newsletter.sql
            </code>{" "}
            in Supabase ein.
          </p>
        ) : (
          <>
            <div className="mt-8">
              <NeueStrecke />
            </div>

            {strecken.length > 0 && (
              <div className="mt-8 space-y-3">
                {strecken.map((s) => (
                  <Link
                    key={s.id}
                    href={`/admin/newsletter/strecken/${s.id}`}
                    className="block rounded-[16px] border border-line bg-white p-5 transition-colors hover:border-rose-deep"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <p className="font-serif text-[19px] text-ink">{s.name}</p>
                      <span
                        className={`rounded-full px-3 py-1 text-[12.5px] ${
                          s.aktiv
                            ? "bg-rose-deep text-white"
                            : "bg-cream-deep text-ink-soft"
                        }`}
                      >
                        {s.aktiv ? "läuft" : "aus"}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[14px] text-ink-soft">
                      Läuft los für {AUSLOESER_TEXT[s.ausloeser] ?? s.ausloeser} ·{" "}
                      {schritte.get(s.id) ?? 0}{" "}
                      {schritte.get(s.id) === 1 ? "Mail" : "Mails"}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
