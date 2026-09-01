import type { Metadata } from "next";
import KasseFormular from "@/components/KasseFormular";

export const metadata: Metadata = {
  title: "Kasse",
  description: "Deine Bestellung bei Pferdeliebehealthy abschließen.",
  // Die Kasse gehört nicht in den Suchindex. Sie ist ohne Warenkorb leer und
  // hilft niemandem, der über Google hier landet.
  robots: { index: false, follow: false },
};

export default function KasseSeite() {
  return (
    <main className="px-6 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 font-serif text-[32px] font-normal leading-[1.12] tracking-tight sm:text-[42px]">
          Zur Kasse
        </h1>

        <p className="mb-10 text-[16px] text-ink-soft">
          Noch drei Angaben, dann geht es zur Bezahlung.
        </p>

        <KasseFormular />
      </div>
    </main>
  );
}
