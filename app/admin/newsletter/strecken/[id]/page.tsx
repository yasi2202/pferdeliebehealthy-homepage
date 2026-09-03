import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { adminEingerichtet, istAngemeldet } from "@/lib/admin-zugang";
import { streckeHolen, streckenMailsHolen } from "@/lib/newsletter-strecken";
import StreckenEditor from "./StreckenEditor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mailstrecke",
  robots: { index: false, follow: false },
};

export default async function StreckeSeite({
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
            <Link href="/admin" className="text-rose-deep underline underline-offset-2">
              anmelden
            </Link>
            .
          </p>
        </div>
      </main>
    );
  }

  const { id } = await params;
  const strecke = await streckeHolen(id);
  if (!strecke) notFound();

  const mails = await streckenMailsHolen(strecke.id);

  return <StreckenEditor strecke={strecke} mails={mails} />;
}
