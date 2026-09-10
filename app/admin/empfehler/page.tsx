import type { Metadata } from "next";
import Link from "next/link";
import EmpfehlerVerwaltung, {
  type EmpfehlerZeile,
} from "@/components/EmpfehlerVerwaltung";
import { adminEingerichtet, istAngemeldet } from "@/lib/admin-zugang";
import { kontostand } from "@/lib/empfehlungsprogramm";
import {
  empfehlerAlle,
  provisionenAlle,
} from "@/lib/empfehlungsprogramm-server";
import { preisText } from "@/lib/shop";

// ---------------------------------------------------------------------------
// Der Auswertungs- und Verwaltungsbereich für das Empfehlungsprogramm.
//
// ▸ WAS DU HIER TUST, in der Reihenfolge, in der es anfällt:
//   1. Neue Bewerbungen ansehen und freischalten oder liegen lassen.
//   2. Einmal im Monat nachsehen, bei wem etwas fällig ist, überweisen und
//      auf den Knopf drücken.
//   3. Gelegentlich schauen, wer Klicks bringt, aber keine Käufe. Das ist
//      fast immer ein Hinweis darauf, dass sie das falsche Angebot bewirbt,
//      und dann hilft eine Mail von dir mehr als alles andere.
//
// ▸ Ohne Anmeldung wird hier nichts geladen. Die Liste mit Mailadressen und
//   Bankverbindungen verlässt den Server gar nicht erst.
// ---------------------------------------------------------------------------

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Empfehlungsprogramm",
  robots: { index: false, follow: false },
};

export default async function EmpfehlerSeite() {
  if (!adminEingerichtet() || !(await istAngemeldet())) {
    return (
      <main className="px-6 py-20">
        <div className="mx-auto max-w-lg text-center">
          <p className="text-[15px] text-ink-soft">
            Bitte zuerst{" "}
            <Link
              href="/admin"
              className="text-rose-deep underline underline-offset-2"
            >
              anmelden
            </Link>
            .
          </p>
        </div>
      </main>
    );
  }

  const [alle, provisionen] = await Promise.all([
    empfehlerAlle(),
    provisionenAlle(),
  ]);

  // ▸ WARUM ALLE PROVISIONEN AUF EINMAL GEHOLT WERDEN und nicht je
  //   Empfehlerin einzeln: Bei zwanzig Empfehlerinnen wären das zwanzig
  //   Abfragen nacheinander, und die Seite bräuchte spürbar länger. So ist
  //   es eine, und das Sortieren übernimmt der Rechner in einem Wimpernschlag.
  const zeilen: EmpfehlerZeile[] = alle.map((e) => ({
    ...e,
    stand: kontostand(provisionen.filter((p) => p.empfehler_id === e.id)),
  }));

  // Wer wartet, steht oben. Danach die mit dem meisten offenen Geld.
  zeilen.sort((a, b) => {
    if (a.status === "angefragt" && b.status !== "angefragt") return -1;
    if (b.status === "angefragt" && a.status !== "angefragt") return 1;
    return b.stand.offenGesamt - a.stand.offenGesamt;
  });

  const wartend = zeilen.filter((z) => z.status === "angefragt").length;
  const aktiv = zeilen.filter((z) => z.status === "aktiv").length;

  const gesamt = kontostand(provisionen);

  return (
    <main className="px-6 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="font-serif text-[32px] font-normal leading-tight tracking-tight sm:text-[40px]">
            Empfehlungsprogramm
          </h1>

          <nav className="flex flex-wrap gap-5 text-[14.5px]">
            <Link
              href="/admin"
              className="text-rose-deep underline underline-offset-2"
            >
              Auswertung
            </Link>
            <Link
              href="/admin/rabattcodes"
              className="text-rose-deep underline underline-offset-2"
            >
              Rabattcodes
            </Link>
            <Link
              href="/admin/adressen"
              className="text-rose-deep underline underline-offset-2"
            >
              Adressen
            </Link>
          </nav>
        </div>

        {/* Die vier Zahlen, die den Stand in einem Blick zeigen. */}
        <div className="mb-10 grid gap-4 sm:grid-cols-4">
          {[
            {
              titel: "Wartet auf dich",
              wert: String(wartend),
              betont: wartend > 0,
            },
            { titel: "Aktiv", wert: String(aktiv) },
            {
              titel: "Jetzt fällig",
              wert: preisText(gesamt.auszahlbar),
              betont: gesamt.auszahlbar > 0,
            },
            { titel: "Noch in der Frist", wert: preisText(gesamt.inFrist) },
          ].map((k) => (
            <div
              key={k.titel}
              className={`rounded-[16px] p-4 ${
                k.betont ? "bg-rose-deep text-cream" : "bg-cream-deep"
              }`}
            >
              <p
                className={`mb-1 text-[12.5px] uppercase tracking-[0.1em] ${
                  k.betont ? "text-cream/70" : "text-ink-soft"
                }`}
              >
                {k.titel}
              </p>
              <p
                className={`font-serif text-[24px] leading-none ${
                  k.betont ? "text-cream" : "text-ink"
                }`}
              >
                {k.wert}
              </p>
            </div>
          ))}
        </div>

        <p className="mb-8 max-w-2xl text-[14.5px] leading-relaxed text-ink-soft">
          Insgesamt ausgezahlt: {preisText(gesamt.ausgezahlt)} aus{" "}
          {gesamt.verkaeufe} vermittelten{" "}
          {gesamt.verkaeufe === 1 ? "Kauf" : "Käufen"}. Der Knopf zum Auszahlen
          bucht nur, überwiesen wird von dir. Was gilt, steht in den{" "}
          <Link
            href="/weiterempfehlen/bedingungen"
            className="text-rose-deep underline underline-offset-2"
          >
            Teilnahmebedingungen
          </Link>
          .
        </p>

        <EmpfehlerVerwaltung zeilen={zeilen} />
      </div>
    </main>
  );
}
