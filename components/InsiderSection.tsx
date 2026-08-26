import Link from "next/link";
import { insider } from "@/lib/insider";
import InsiderFormular from "@/components/InsiderFormular";

// ---------------------------------------------------------------------------
// Der Insider-Abschnitt auf der Startseite.
// Texte und Anmelde-Adresse stehen in lib/insider.ts.
// ---------------------------------------------------------------------------

export default function InsiderSection() {
  const a = insider.abschnitt;

  return (
    <section id="insider" className="py-16 sm:py-20 px-6 sm:px-8 scroll-mt-24">
      <div className="fade-in max-w-6xl mx-auto bg-white rounded-[24px] border border-line overflow-hidden">
        <div className="grid lg:grid-cols-[1fr_0.9fr]">
          {/* Text und Anmeldung */}
          <div className="p-9 sm:p-12">
            <span className="block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
              {a.augenbraue}
            </span>
            <h2 className="font-serif font-normal text-[26px] sm:text-[36px] leading-tight mb-5">
              {a.ueberschrift}
            </h2>
            <p className="text-[17px] text-ink-soft max-w-lg mb-9">{a.einleitung}</p>

            <InsiderFormular quelle="startseite" knopfText={a.button} />

            <div className="mt-6">
              <Link
                href="/insider"
                className="text-[15px] font-medium text-rose-deep hover:text-ink transition-colors"
              >
                Erst mal reinlesen →
              </Link>
            </div>

            <p className="text-[13px] text-ink-soft mt-5 max-w-md">{a.kleingedrucktes}</p>
          </div>

          {/* Was drin ist */}
          <div className="bg-cream-deep p-9 sm:p-12 border-t-4 border-pfirsich lg:border-t-0 lg:border-l-4">
            <span className="block text-[12.5px] tracking-[0.14em] uppercase text-ink-soft font-semibold mb-7">
              Das bekommst du
            </span>
            <ul className="space-y-6">
              {a.inhalte.map((i) => (
                <li key={i.titel} className="border-t border-line pt-5 first:border-t-0 first:pt-0">
                  <div className="font-serif text-[19px] mb-1.5">{i.titel}</div>
                  <p className="text-[14.5px] text-ink-soft">{i.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
