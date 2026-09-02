import Link from "next/link";
import { empfehlungen } from "@/lib/empfehlungen";

// ---------------------------------------------------------------------------
// Der schmale Verweis auf die Rabattcode-Seite.
//
// ▸ WARUM ES IHN GIBT
//   Die Seite /empfehlungen war bis zum 02.09.2026 ausschließlich im
//   Fußbereich verlinkt. Yasemin hat sie selbst nicht mehr gefunden, und wer
//   sie nicht kennt, findet sie erst recht nicht.
//
// ▸ WARUM ER SO KLEIN IST
//   Es sind fremde Produkte. Sie gehören auf die Startseite, weil viele
//   Kundinnen genau danach fragen, aber sie dürfen nicht mit den eigenen
//   Angeboten konkurrieren. Deshalb ein Streifen und kein Abschnitt mit
//   Bildern.
//
// ▸ „WERBUNG" STEHT DA, WEIL ES WERBUNG IST.
//   Die meisten Partner zahlen eine Provision. Das muss gekennzeichnet sein,
//   und zwar dort, wo der Link steht, nicht erst auf der Zielseite. Auf
//   /empfehlungen steht dieselbe Kennzeichnung noch einmal.
//
// ▸ DIE ZAHL KOMMT AUS DER LISTE. So steht dort nie eine Zahl, die nicht
//   mehr stimmt, wenn ein Partner dazukommt oder wegfällt.
// ---------------------------------------------------------------------------

export default function EmpfehlungenStreifen() {
  const anzahl = empfehlungen.length;

  return (
    <section className="px-6 pb-16 sm:px-8 sm:pb-20">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/empfehlungen"
          className="group flex flex-wrap items-center justify-between gap-x-8 gap-y-4 rounded-[18px] border border-line bg-white p-7 transition-colors hover:border-rose-deep sm:p-8"
        >
          <div className="max-w-2xl">
            <span className="mb-2 block text-[11.5px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
              Werbung
            </span>

            <h2 className="mb-2 font-serif text-[21px] leading-snug sm:text-[24px]">
              Was ich selbst füttere, und wo du es günstiger bekommst
            </h2>

            <p className="text-[14.5px] leading-relaxed text-ink-soft">
              {anzahl} Anbieter, bei denen ich seit Jahren bestelle, mit meinen
              Rabattcodes. Warum ich sie empfehle, steht bei jedem dabei.
            </p>
          </div>

          <span className="shrink-0 whitespace-nowrap rounded-full bg-cream-deep px-6 py-3 text-[14.5px] font-medium text-ink transition-colors group-hover:bg-rose-deep group-hover:text-cream">
            Zu den Rabattcodes
          </span>
        </Link>
      </div>
    </section>
  );
}
