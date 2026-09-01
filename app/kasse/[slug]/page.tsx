import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DigitalKasse from "@/components/DigitalKasse";
import { digitalFinden, digitalprodukte, funnelZu } from "@/lib/digital";

// ---------------------------------------------------------------------------
// Die Kasse für ein einzelnes digitales Produkt, zum Beispiel
// /kasse/ganzjahresfutterplan
//
// Sie liegt bewusst neben der Warenkasse unter /kasse und nicht in ihr: Der
// Warenkorb des Shops spielt hier keine Rolle, gekauft wird genau ein
// Zugang. Wer einen Kurs und einen Eimer Futter zusammen möchte, macht zwei
// Bestellungen. Das ist selten und dafür ist der Ablauf für beide Sorten
// einfach und nachvollziehbar.
// ---------------------------------------------------------------------------

type Eigenschaften = { params: Promise<{ slug: string }> };

/** Damit Next.js die Seiten schon beim Veröffentlichen anlegt. */
export function generateStaticParams() {
  return digitalprodukte.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: Eigenschaften): Promise<Metadata> {
  const { slug } = await params;
  const produkt = digitalFinden(slug);

  return {
    title: produkt ? `Kasse: ${produkt.kurzname}` : "Kasse",
    description: "Deinen Zugang bei Pferdeliebehealthy abschließen.",
    // Die Kasse gehört nicht in den Suchindex. Wer über Google hier landet,
    // hat die Verkaufsseite nie gesehen und weiß nicht, was er kauft.
    robots: { index: false, follow: false },
  };
}

export default async function DigitalKasseSeite({ params }: Eigenschaften) {
  const { slug } = await params;
  const produkt = digitalFinden(slug);

  if (!produkt) {
    notFound();
  }

  const anschluss = funnelZu(produkt.slug);

  return (
    <main className="px-6 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 font-serif text-[32px] font-normal leading-[1.12] tracking-tight sm:text-[42px]">
          Zur Kasse
        </h1>

        {/* Bei einer Beratung wäre "Zugang direkt danach" falsch: Dort kommt
            zuerst ein Fragebogen, und die Akte entsteht erst danach. Wer
            etwas anderes erwartet, schreibt dir am nächsten Tag. */}
        <p className="mb-10 text-[16px] text-ink-soft">
          {produkt.art === "dienstleistung"
            ? "Kurz deine Angaben für die Rechnung, dann geht es zur Bezahlung. Den Fragebogen schicke ich dir direkt danach per Mail."
            : "Kurz deine Angaben für die Rechnung, dann geht es zur Bezahlung. Deinen Zugang bekommst du direkt danach per Mail."}
        </p>

        <DigitalKasse
          produkt={produkt}
          mitAngebot={Boolean(anschluss?.upsell)}
        />
      </div>
    </main>
  );
}
