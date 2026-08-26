import type { Metadata } from "next";
import { alleBeitraege } from "@/lib/beitraege";
import { insider } from "@/lib/insider";
import InsiderFormular from "@/components/InsiderFormular";
import BeitragsListe from "@/components/BeitragsListe";
import MonatsEmpfehlung from "@/components/MonatsEmpfehlung";
import InsiderMerken from "@/components/InsiderMerken";
import { aktuellerInsider } from "@/lib/insider-zugang";
import NurFuerNichtInsider from "@/components/NurFuerNichtInsider";

export const metadata: Metadata = {
  alternates: { canonical: "/insider" },
  title: "Pferdeliebe Insider | Kostenloses Futterwissen",
  description:
    "Kostenloses Wissen zur Pferdefütterung: was in Rationen wirklich schiefgeht, Zusatzfutter ehrlich eingeordnet und wie du Laborwerte liest.",
};

export default async function InsiderSeite() {
  const beitraege = alleBeitraege();

  // Auf dem Server gefragt, nicht im Browser geraten: Wer angemeldet ist,
  // bekommt die Einladung gar nicht erst geschickt. Der Merker im Browser
  // allein reichte nicht — er fehlt zum Beispiel, wenn jemand den
  // Anmeldelink auf einem anderen Geraet geoeffnet hat.
  const angemeldet = await aktuellerInsider();

  return (
    <main className="py-14 sm:py-20 px-6 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <span className="block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
          Kostenlos
        </span>
        <h1 className="font-serif font-normal text-[32px] sm:text-[46px] leading-[1.12] tracking-tight mb-5">
          {insider.name}
        </h1>
        <p className="text-[17px] text-ink-soft max-w-xl">
          {angemeldet
            ? `Schön, dass du da bist, ${angemeldet.vorname}. Alle Beiträge stehen dir offen.`
            : insider.abschnitt.einleitung}
        </p>

        {angemeldet ? (
          /* Gleicht den Merker im Browser ab, damit auch die Startseite und
             der Balken unten wissen, dass hier jemand dabei ist. */
          <InsiderMerken />
        ) : (
          /* Der Merker im Browser bleibt als zweites Netz: Wer sich gerade
             eingetragen, aber noch nicht bestaetigt hat, hat noch keinen
             Zugang — soll aber auch nicht sofort wieder gefragt werden. */
          <NurFuerNichtInsider>
            <div className="bg-ink text-cream rounded-[24px] p-8 sm:p-10 mt-10">
              <div className="text-[11px] tracking-[0.16em] uppercase text-pfirsich font-semibold mb-3">
                Nichts verpassen
              </div>
              <h2 className="font-serif text-[24px] sm:text-[28px] leading-snug mb-4">
                Neue Beiträge direkt ins Postfach
              </h2>
              <p className="text-[15px] text-cream/75 max-w-lg mb-7">
                Die Beiträge sind für Insider. Trag dich ein, dann kannst du
                alle lesen — auch die älteren — und ich schreibe dir, sobald es
                etwas Neues gibt. Kostet nichts.
              </p>
              <InsiderFormular
                quelle="insider-uebersicht"
                variante="dunkel"
                knopfText={insider.abschnitt.button}
              />
              <p className="text-[13px] text-cream/60 mt-5 max-w-md">
                {insider.abschnitt.kleingedrucktes}
              </p>
            </div>
          </NurFuerNichtInsider>
        )}

        {/* Empfehlung des Monats. Steht nach dem Anmeldekasten: Wer noch
            nicht dabei ist, soll zuerst die Anmeldung sehen. Fuer alle, die
            schon dabei sind, ist der Kasten ausgeblendet — dann steht der
            Banner ganz oben, und genau dort gehoert er hin. */}
        <div className="mt-12">
          <MonatsEmpfehlung />
        </div>

        {/* Die Beiträge */}
        <div className="mt-4">
          {beitraege.length === 0 ? (
            <div className="border border-dashed border-line rounded-[18px] p-10 text-center">
              <p className="font-serif text-[22px] mb-3">
                Der erste Beitrag ist in Arbeit
              </p>
              <p className="text-[15px] text-ink-soft max-w-md mx-auto">
                Trag dich oben ein, dann bekommst du ihn, sobald er da ist.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-8">
                Worüber möchtest du lesen?
              </h2>
              <BeitragsListe beitraege={beitraege} />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
