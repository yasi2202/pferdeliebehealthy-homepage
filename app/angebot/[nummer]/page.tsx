import type { Metadata } from "next";
import { redirect } from "next/navigation";
import UpsellAngebot from "@/components/UpsellAngebot";
import { digitalFinden, ersparnis, funnelZu } from "@/lib/digital";
import { digitalLaden } from "@/lib/digital-server";

// ---------------------------------------------------------------------------
// Die Seite, auf der die Kundin direkt nach der Zahlung landet, wenn es zu
// ihrem Kauf ein Angebot gibt.
//
// ▸ SIE BEWEIST NICHT, DASS BEZAHLT WURDE. Diese Adresse kann jede Person
//   aufrufen. Deshalb gehört hierher nichts, was nur Käuferinnen sehen
//   dürfen, und deshalb wird der Zugang auch nicht hier freigeschaltet,
//   sondern in app/api/stripe-webhook. Was hier geprüft wird, ist nur, ob
//   der Schlüssel aus der Adresszeile zur Bestellung passt. Ohne ihn gibt es
//   kein Angebot zu sehen.
//
// ▸ WARUM DIE SEITE NICHT WARTET, BIS DIE ZAHLUNG BESTÄTIGT IST
//   Die Kundin ist meist schneller hier als die Rückmeldung von Stripe. Sie
//   vor einen Ladebalken zu setzen, wäre der sicherste Weg, das Angebot zu
//   verlieren. Geprüft wird deshalb erst dann, wenn sie tatsächlich auf den
//   Knopf drückt, und zwar in app/api/upsell.
// ---------------------------------------------------------------------------

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ein Angebot für dich",
  robots: { index: false, follow: false },
};

type Eigenschaften = {
  params: Promise<{ nummer: string }>;
  searchParams: Promise<{ t?: string }>;
};

export default async function AngebotSeite({
  params,
  searchParams,
}: Eigenschaften) {
  const { nummer } = await params;
  const { t } = await searchParams;

  const kauf = await digitalLaden(nummer);

  // Kein passender Schlüssel? Dann still weiter zur Dankeseite. Eine
  // Fehlermeldung wäre hier unfreundlich: Wer gerade bezahlt hat, soll nicht
  // vor einer roten Meldung stehen.
  if (!kauf || !t || t !== kauf.zugriff_token) {
    redirect(`/danke/${nummer}${t ? `?t=${t}` : ""}`);
  }

  const anschluss = funnelZu(kauf.artikel[0]?.slug ?? "");
  const produkt = anschluss?.upsell ? digitalFinden(anschluss.upsell) : undefined;

  if (!anschluss || !produkt) {
    redirect(`/danke/${nummer}?t=${t}`);
  }

  return (
    <main className="px-6 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <span className="mb-4 block text-[13px] font-semibold uppercase tracking-[0.14em] text-rose-deep">
          Deine Zahlung ist angekommen
        </span>

        <h1 className="mb-3 font-serif text-[32px] font-normal leading-[1.12] tracking-tight sm:text-[40px]">
          Danke, {kauf.vorname}.
        </h1>

        <p className="mb-10 text-[16.5px] leading-relaxed text-ink-soft">
          Dein Zugang zum {kauf.artikel[0]?.name} ist unterwegs. Bevor du
          loslegst, habe ich noch etwas für dich, das gut dazu passt.
        </p>

        <UpsellAngebot
          nummer={nummer}
          token={t}
          produkt={produkt}
          anschluss={anschluss}
          ersparnis={ersparnis(anschluss)}
        />
      </div>
    </main>
  );
}
