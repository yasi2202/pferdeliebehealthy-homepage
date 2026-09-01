import Link from "next/link";
import RabattCode from "@/components/RabattCode";
import { monatsempfehlung } from "@/lib/monatsempfehlung";
import { empfehlungen } from "@/lib/empfehlungen";
import { angebotshinweisFinden } from "@/lib/angebote";

// ---------------------------------------------------------------------------
// Der Banner oben im Insider-Bereich: eine Empfehlung pro Monat, dazu der
// Rabattcode des Partners und der Anschluss ans eigene Angebot.
//
// Der Code wird nicht hier eingetippt, sondern über den Partnernamen aus
// lib/empfehlungen.ts geholt. Damit gibt es ihn weiterhin nur einmal im
// Projekt — ändert Yasi ihn dort, ändert er sich auch hier. Zwei Stellen mit
// demselben Code wären die sicherste Art, irgendwann einen falschen
// anzuzeigen.
//
// Findet sich der Partner nicht, erscheint der Banner ohne Code statt mit
// einem leeren Feld. Ein Rabattfeld, in dem nichts steht, sieht kaputt aus.
// ---------------------------------------------------------------------------

export default function MonatsEmpfehlung() {
  if (!monatsempfehlung.aktiv) return null;

  const partner = empfehlungen.find((e) => e.partner === monatsempfehlung.partner);
  const angebot = angebotshinweisFinden(monatsempfehlung.angebot);

  return (
    <aside className="bg-white border border-line rounded-[24px] p-7 sm:p-9 mb-12">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4">
        <span className="text-[11px] tracking-[0.16em] uppercase text-rose-deep font-semibold">
          {monatsempfehlung.monat}
        </span>
        {/* Pflicht, weil für den Code eine Provision fließt. */}
        <span className="text-[10.5px] tracking-[0.14em] uppercase text-ink-soft border border-line rounded-full px-2 py-0.5">
          Werbung
        </span>
      </div>

      <h2 className="font-serif text-[22px] sm:text-[27px] leading-snug mb-3">
        {monatsempfehlung.ueberschrift}
      </h2>

      <p className="text-[15.5px] text-ink-soft leading-relaxed max-w-xl">
        {monatsempfehlung.text}
      </p>

      {partner && (
        <div className="mt-6 max-w-sm">
          <div className="text-[12.5px] text-ink-soft mb-2">
            Mein Rabattcode bei {partner.partner}
            {partner.rabatt ? `, ${partner.rabatt}` : ""}
          </div>
          <RabattCode code={partner.code} />
          {partner.url && (
            <a
              href={partner.url}
              target="_blank"
              rel="sponsored nofollow noopener"
              className="inline-block text-[13.5px] font-medium text-rose-deep hover:text-ink transition-colors mt-3"
            >
              Zum Shop →
            </a>
          )}
        </div>
      )}

      {angebot && (
        <div className="mt-7 pt-6 border-t border-line">
          <p className="text-[15px] text-ink-soft leading-relaxed max-w-xl mb-5">
            {monatsempfehlung.angebotText}
          </p>
          {/* Eigene Seiten im selben Tab, fremde in einem neuen. */}
          {angebot.url.startsWith("/") ? (
            <Link
              href={angebot.url}
              className="inline-block bg-ink text-cream px-7 py-3.5 rounded-full text-[15px] font-medium hover:bg-rose-deep transition-colors"
            >
              {angebot.knopf}
            </Link>
          ) : (
            <a
              href={angebot.url}
              target="_blank"
              rel="noopener"
              className="inline-block bg-ink text-cream px-7 py-3.5 rounded-full text-[15px] font-medium hover:bg-rose-deep transition-colors"
            >
              {angebot.knopf}
            </a>
          )}
        </div>
      )}

      <p className="text-[12.5px] text-ink-soft mt-6">
        Für den Code bekomme ich eine Provision, für dich wird es dadurch nicht
        teurer.{" "}
        <Link href="/empfehlungen" className="underline hover:no-underline">
          Alle meine Rabattcodes
        </Link>
      </p>
    </aside>
  );
}
