import type { Metadata } from "next";
import { redirect } from "next/navigation";
import UpsellAngebot from "@/components/UpsellAngebot";
import { digitalFinden, ersparnis, funnelZu } from "@/lib/digital";
import { digitalLaden, hatZugangSchon } from "@/lib/digital-server";

// ---------------------------------------------------------------------------
// Das zweite und letzte Angebot: Es erscheint nur, wenn das erste abgelehnt
// wurde, und ist günstiger.
//
// ▸ WARUM ÜBERHAUPT EIN ZWEITES ANGEBOT
//   "Nein danke" heisst selten "ich will nichts mehr", meistens heisst es
//   "nicht zu dem Preis" oder "nicht dieses Thema". Ein kleineres Angebot
//   fängt genau die auf. Wer auch das ablehnt, ist fertig -- danach kommt
//   nichts mehr, und das ist Absicht.
//
// ▸ HIER IST SCHLUSS. Es gibt bewusst keine dritte Stufe. Drei Angebote
//   hintereinander verkaufen in Summe weniger als zwei, weil die Freude über
//   den Kauf vorher kippt.
//
// ▸ Wie bei der Angebotsseite gilt: Diese Adresse beweist keine Zahlung. Sie
//   zeigt nur dann etwas, wenn der Schlüssel zur Bestellung passt.
// ---------------------------------------------------------------------------

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Noch ein Angebot für dich",
  robots: { index: false, follow: false },
};

type Eigenschaften = {
  params: Promise<{ nummer: string }>;
  searchParams: Promise<{ t?: string }>;
};

export default async function DownsellSeite({
  params,
  searchParams,
}: Eigenschaften) {
  const { nummer } = await params;
  const { t } = await searchParams;

  const kauf = await digitalLaden(nummer);

  if (!kauf || !t || t !== kauf.zugriff_token) {
    redirect(`/danke/${nummer}${t ? `?t=${t}` : ""}`);
  }

  const anschluss = funnelZu(kauf.artikel[0]?.slug ?? "");

  const produkt =
    anschluss?.downsell && anschluss.downsellPreis !== undefined
      ? digitalFinden(anschluss.downsell)
      : undefined;

  if (!anschluss || !produkt || anschluss.downsellPreis === undefined) {
    redirect(`/danke/${nummer}?t=${t}`);
  }

  // Auch hier: Was sie schon hat, wird nicht angeboten. Danach kommt nichts
  // mehr, also geht es direkt zur Dankeseite.
  if (await hatZugangSchon(kauf.email, produkt.erwarteterZugang)) {
    redirect(`/danke/${nummer}?t=${t}`);
  }

  return (
    <main className="px-6 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <span className="mb-4 block text-[13px] font-semibold uppercase tracking-[0.14em] text-rose-deep">
          Kein Problem
        </span>

        <h1 className="mb-3 font-serif text-[32px] font-normal leading-[1.12] tracking-tight sm:text-[40px]">
          Dann etwas Kleineres.
        </h1>

        <p className="mb-10 text-[16.5px] leading-relaxed text-ink-soft">
          Das war vielleicht eine Nummer zu gross für den Moment. Das hier ist
          schnell gelesen und kostet wenig. Danach lasse ich dich in Ruhe, das
          ist mein letztes Angebot.
        </p>

        <UpsellAngebot
          nummer={nummer}
          token={t}
          produkt={produkt}
          preis={anschluss.downsellPreis}
          titel={anschluss.downsellTitel ?? "Vielleicht passt das besser."}
          grund={anschluss.downsellGrund ?? ""}
          ersparnis={ersparnis(anschluss, "downsell")}
          stufe="downsell"
          ablehnenZiel={`/danke/${nummer}?t=${t}`}
          ablehnenText="Nein danke, weiter zu meinem Zugang"
        />
      </div>
    </main>
  );
}
