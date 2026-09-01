import type { Metadata } from "next";
import { alleBlogBeitraege } from "@/lib/blog";
import { insider } from "@/lib/insider";
import InsiderFormular from "@/components/InsiderFormular";
import BeitragsListe from "@/components/BeitragsListe";
import NurFuerNichtInsider from "@/components/NurFuerNichtInsider";

// ---------------------------------------------------------------------------
// Die Blogübersicht.
//
// Anders als der Insider-Bereich steht hier alles offen: keine Anmeldung,
// keine Schranke, kein Cookie. Diese Seite hat genau eine Aufgabe, nämlich
// gefunden zu werden. Alles Weitere passiert unter den einzelnen Beiträgen.
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  alternates: { canonical: "/blog" },
  title: "Blog | Pferdefütterung verstehen",
  description:
    "Fachbeiträge zur Pferdefütterung: Kotwasser, Mauke, Hufrehe, Magen und Darm, Mineralstoffe. Verständlich erklärt von Ernährungsberaterin Yasemin Halac.",
};

export default function BlogSeite() {
  const beitraege = alleBlogBeitraege();

  return (
    <main className="py-14 sm:py-20 px-6 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <span className="block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
          Frei zu lesen
        </span>
        <h1 className="font-serif font-normal text-[32px] sm:text-[46px] leading-[1.12] tracking-tight mb-5">
          Pferdefütterung verstehen
        </h1>
        <p className="text-[17px] text-ink-soft max-w-xl">
          Hier schreibe ich auf, was mir in echten Rationen begegnet: warum
          bestimmte Beschwerden immer wieder auftauchen, was dahintersteckt und
          was du selbst prüfen kannst. Ohne Anmeldung, ohne Gegenleistung.
        </p>

        <div className="mt-12">
          {beitraege.length === 0 ? (
            <div className="border border-dashed border-line rounded-[18px] p-10 text-center">
              <p className="font-serif text-[22px] mb-3">
                Der erste Beitrag ist in Arbeit
              </p>
              <p className="text-[15px] text-ink-soft max-w-md mx-auto">
                Schau in ein paar Tagen wieder vorbei.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-8">
                Worüber möchtest du lesen?
              </h2>
              <BeitragsListe beitraege={beitraege} basis="/blog" />
            </>
          )}
        </div>

        {/* Der Anmeldekasten steht unter den Beiträgen, nicht darüber. Wer
            gerade erst hier gelandet ist, soll zuerst sehen, dass es etwas
            zu lesen gibt. Die Frage nach der Adresse kommt danach. */}
        <NurFuerNichtInsider>
          <div className="bg-ink text-cream rounded-[24px] p-8 sm:p-10 mt-16">
            <div className="text-[11px] tracking-[0.16em] uppercase text-pfirsich font-semibold mb-3">
              Kostenlos
            </div>
            <h2 className="font-serif text-[24px] sm:text-[28px] leading-snug mb-4">
              Mehr als hier steht
            </h2>
            <p className="text-[15px] text-cream/75 max-w-lg mb-7">
              {insider.abschnitt.einleitung}
            </p>
            <InsiderFormular
              quelle="blog-uebersicht"
              variante="dunkel"
              knopfText={insider.abschnitt.button}
            />
            <p className="text-[13px] text-cream/60 mt-5 max-w-md">
              {insider.abschnitt.kleingedrucktes}
            </p>
          </div>
        </NurFuerNichtInsider>
      </div>
    </main>
  );
}
