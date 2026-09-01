import type { Metadata } from "next";
import Link from "next/link";
import RabattcodeVerwaltung, {
  type CodeZeile,
} from "@/components/RabattcodeVerwaltung";
import { adminEingerichtet, istAngemeldet } from "@/lib/admin-zugang";
import { digitalprodukte } from "@/lib/digital";
import { supabaseAlle } from "@/lib/versand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rabattcodes",
  robots: { index: false, follow: false },
};

export default async function RabattcodeSeite() {
  // Ohne Anmeldung wird gar nichts geladen. Die Liste der Codes verlässt den
  // Server nicht, wenn niemand angemeldet ist.
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

  const codes =
    (await supabaseAlle<CodeZeile>(
      "rabattcodes?select=*&order=angelegt_am.desc",
    )) ?? [];

  return (
    <main className="px-6 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="font-serif text-[32px] font-normal leading-tight tracking-tight sm:text-[40px]">
            Rabattcodes
          </h1>

          <nav className="flex flex-wrap gap-5 text-[14.5px]">
            <Link
              href="/admin"
              className="text-rose-deep underline underline-offset-2"
            >
              Auswertung
            </Link>
            <Link
              href="/admin/adressen"
              className="text-rose-deep underline underline-offset-2"
            >
              Adressen
            </Link>
          </nav>
        </div>

        <RabattcodeVerwaltung
          codes={codes}
          produkte={digitalprodukte.map((p) => ({
            slug: p.slug,
            kurzname: p.kurzname,
          }))}
        />
      </div>
    </main>
  );
}
