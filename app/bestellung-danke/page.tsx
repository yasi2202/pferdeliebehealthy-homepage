import type { Metadata } from "next";
import Link from "next/link";
import KorbLeeren from "@/components/KorbLeeren";

export const metadata: Metadata = {
  title: "Danke für deine Bestellung",
  robots: { index: false, follow: false },
};

// ---------------------------------------------------------------------------
// Die Seite, auf der Stripe die Kundin nach der Bezahlung ablädt.
//
// ▸ Sie steht hier nur für die Kundin. Ob wirklich bezahlt wurde, erfahren
//   wir NICHT hier -- diese Adresse kann jede Person auch von Hand aufrufen.
//   Verlässlich ist allein die unterschriebene Rückmeldung in
//   app/api/stripe-webhook. Deshalb steht hier auch nirgends „Zahlung
//   erfolgreich", sondern nur, dass die Bestellung da ist.
// ---------------------------------------------------------------------------

export default async function DankeSeite({
  searchParams,
}: {
  searchParams: Promise<{ nummer?: string }>;
}) {
  const { nummer } = await searchParams;

  // Nur anzeigen, was auch nach einer Bestellnummer aussieht. So kann über
  // die Adresszeile kein fremder Text auf die Seite geschrieben werden.
  const saubereNummer = /^PFH-\d{8}-\d{4}$/.test(nummer ?? "") ? nummer : null;

  return (
    <main className="px-6 py-20 sm:px-8 sm:py-28">
      <KorbLeeren />

      <div className="mx-auto max-w-xl text-center">
        <span className="mb-5 block text-[13px] font-semibold uppercase tracking-[0.14em] text-rose-deep">
          Bestellung eingegangen
        </span>

        <h1 className="mb-6 font-serif text-[32px] font-normal leading-[1.14] tracking-tight sm:text-[42px]">
          Danke, das freut mich sehr
        </h1>

        <p className="text-[17px] leading-relaxed text-ink-soft">
          Deine Bestellung ist bei mir angekommen. Die Bestätigung mit allen
          Angaben schicke ich dir gleich per E-Mail. Falls sie nicht auftaucht,
          schau bitte kurz im Spam-Ordner nach.
        </p>

        {saubereNummer && (
          <p className="mt-7 inline-block rounded-full bg-cream-deep px-6 py-3 text-[15px]">
            Deine Bestellnummer:{" "}
            <strong className="font-medium">{saubereNummer}</strong>
          </p>
        )}

        <p className="mt-8 text-[15px] leading-relaxed text-ink-soft">
          Ich packe alles zusammen und melde mich noch einmal, sobald das Paket
          unterwegs ist. Wenn du eine Frage hast, schreib mir einfach an{" "}
          <a
            href="mailto:info@pferdeliebehealthy.de"
            className="text-rose-deep underline underline-offset-4 hover:text-ink"
          >
            info@pferdeliebehealthy.de
          </a>
          .
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/shop"
            className="rounded-full bg-ink px-7 py-3.5 text-[15px] font-medium text-cream transition-colors hover:bg-rose-deep"
          >
            Zurück zum Shop
          </Link>

          <Link
            href="/"
            className="rounded-full border border-line px-7 py-3.5 text-[15px] font-medium transition-colors hover:bg-cream-deep"
          >
            Zur Startseite
          </Link>
        </div>
      </div>
    </main>
  );
}
