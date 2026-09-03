import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { adminEingerichtet, istAngemeldet } from "@/lib/admin-zugang";
import {
  briefHolen,
  empfaengerZaehlen,
  auswertungHolen,
  messungAn,
} from "@/lib/newsletter-server";
import Editor from "./Editor";
import Auswertung from "./Auswertung";

// ---------------------------------------------------------------------------
// Ein einzelner Newsletter.
//
// Solange er Entwurf ist, steht hier der Editor. Ist er raus, steht hier,
// was daraus geworden ist — und der Text als Ansicht, damit du in einem
// halben Jahr noch nachlesen kannst, was du geschrieben hast.
// ---------------------------------------------------------------------------

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Newsletter schreiben",
  robots: { index: false, follow: false },
};

export default async function NewsletterSeite({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  const { id } = await params;
  const brief = await briefHolen(id);
  if (!brief) notFound();

  // Die Zahl steht im Sendeknopf: „an 1023 Adressen". Wer beim Drücken
  // sieht, wie viele Menschen das sind, drückt aufmerksamer.
  const erreichbar = await empfaengerZaehlen();

  if (brief.status === "versendet") {
    const zahlen = await auswertungHolen(brief.id);
    return <Auswertung brief={brief} zahlen={zahlen} misst={messungAn()} />;
  }

  return <Editor brief={brief} erreichbar={erreichbar} />;
}
