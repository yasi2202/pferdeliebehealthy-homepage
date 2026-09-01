import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminEingerichtet, istAngemeldet } from "@/lib/admin-zugang";
import { digitalLaden } from "@/lib/digital-server";
import { preisText } from "@/lib/shop";

// ---------------------------------------------------------------------------
// Eine einzelne Rechnung zum Ansehen und Ausdrucken.
//
// ▸ WOZU, WO DIE ANGABEN DOCH SCHON IN DER MAIL STEHEN
//   Die Mail geht an die Kundin. Du brauchst dieselbe Rechnung aber auch für
//   deine Unterlagen, und zwar als Dokument, das du ablegen kannst. Diese
//   Seite druckst du im Browser mit Strg+P als PDF.
//
// ▸ WAS DRAUFSTEHT, UND WARUM GENAU DAS
//   Eine Rechnung nach § 14 UStG braucht: deinen vollen Namen und deine
//   Anschrift, Name und Anschrift der Kundin, deine Steuernummer, das
//   Ausstellungsdatum, eine fortlaufende Rechnungsnummer, Art und Menge der
//   Leistung, das Entgelt netto, den Steuersatz und den Steuerbetrag. Alles
//   davon steht hier.
//
// ▸ Die Beträge werden genauso gerundet wie in der Mail an die Kundin, damit
//   beide Papiere übereinstimmen. Siehe lib/digital-server.ts.
// ---------------------------------------------------------------------------

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rechnung",
  robots: { index: false, follow: false },
};

const ABSENDER = {
  name: "Yasemin Halac",
  zusatz: "Pferdeliebehealthy",
  strasse: "Steigeweg 7",
  ort: "74722 Buchen",
  land: "Deutschland",
  steuernummer: "46138/44524",
  mail: "info@pferdeliebehealthy.de",
};

const LAENDERNAMEN: Record<string, string> = {
  DE: "Deutschland",
  AT: "Österreich",
  CH: "Schweiz",
};

type Eigenschaften = { params: Promise<{ nummer: string }> };

export default async function RechnungSeite({ params }: Eigenschaften) {
  const { nummer } = await params;

  if (!adminEingerichtet() || !(await istAngemeldet())) {
    notFound();
  }

  const b = await digitalLaden(nummer);

  if (!b || b.status !== "bezahlt") {
    notFound();
  }

  const artikel = Array.isArray(b.artikel) ? b.artikel : [];
  const satz = artikel[0]?.mwst ?? 19;
  const steuer = Math.round((b.gesamt * satz) / (100 + satz));
  const netto = b.gesamt - steuer;

  // Fehlt beides, steht das heutige Datum da. Eine Rechnung ohne Datum wäre
  // ungültig, und der Fall kann nur bei einer von Hand angelegten Zeile
  // eintreten.
  const roh = b.bezahlt_am ?? b.angelegt_am;

  const datum = (roh ? new Date(roh) : new Date()).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <main className="bg-white px-6 py-10 text-ink sm:px-8">
      {/* Beim Drucken stört diese Zeile, deshalb wird sie ausgeblendet. */}
      <div className="mx-auto mb-8 max-w-[700px] print:hidden">
        <p className="rounded-[12px] bg-cream-deep p-4 text-[14px] leading-relaxed">
          Mit <strong>Strg und P</strong> druckst du diese Rechnung, im
          Druckfenster kannst du „Als PDF speichern" wählen. Dieser Hinweis
          erscheint auf dem Ausdruck nicht.
        </p>
      </div>

      <div className="mx-auto max-w-[700px]">
        {/* -------------------------------------------------------- Absender */}
        <div className="mb-12 flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="font-serif text-[22px]">
              {ABSENDER.zusatz}
            </div>
            <div className="mt-1 text-[14px] leading-relaxed text-ink-soft">
              {ABSENDER.name}
              <br />
              {ABSENDER.strasse}
              <br />
              {ABSENDER.ort}
              <br />
              {ABSENDER.land}
            </div>
          </div>

          <div className="text-right text-[14px] leading-relaxed text-ink-soft">
            {ABSENDER.mail}
            <br />
            Steuernummer {ABSENDER.steuernummer}
          </div>
        </div>

        {/* ------------------------------------------------------ Empfängerin */}
        <div className="mb-10 text-[15px] leading-relaxed">
          {b.vorname} {b.nachname}
          <br />
          {b.strasse}
          <br />
          {b.plz} {b.ort}
          <br />
          {LAENDERNAMEN[b.land] ?? b.land}
        </div>

        {/* ------------------------------------------------------- Kopfdaten */}
        <h1 className="mb-2 font-serif text-[26px]">
          Rechnung {b.rechnungsnummer ?? b.nummer}
        </h1>

        <p className="mb-10 text-[14px] text-ink-soft">
          Rechnungs- und Leistungsdatum: {datum}
          <br />
          Bestellnummer: {b.nummer}
        </p>

        {/* --------------------------------------------------------- Posten */}
        <table className="w-full border-collapse text-[15px]">
          <thead>
            <tr className="border-b border-ink text-left">
              <th className="pb-2 pr-4 font-medium">Leistung</th>
              <th className="pb-2 pl-4 text-right font-medium">Betrag</th>
            </tr>
          </thead>
          <tbody>
            {artikel.map((a) => (
              <tr key={a.slug} className="border-b border-line">
                <td className="py-3 pr-4">
                  {a.name}
                  <div className="mt-1 text-[13px] text-ink-soft">
                    Digitale Leistung, 1 Stück
                  </div>
                </td>
                <td className="py-3 pl-4 text-right tabular-nums">
                  {preisText(a.preis)}
                </td>
              </tr>
            ))}

            {b.rabatt_cent && b.rabatt_cent > 0 ? (
              <tr className="border-b border-line">
                <td className="py-3 pr-4 text-ink-soft">
                  Rabatt{b.rabattcode ? ` (${b.rabattcode})` : ""}
                </td>
                <td className="py-3 pl-4 text-right tabular-nums text-ink-soft">
                  &minus;{preisText(b.rabatt_cent)}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>

        {/* --------------------------------------------------------- Summen */}
        <div className="mt-6 ml-auto w-full max-w-[300px] text-[15px]">
          <div className="flex justify-between py-1.5">
            <span className="text-ink-soft">Nettobetrag</span>
            <span className="tabular-nums">{preisText(netto)}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-ink-soft">
              zzgl. {satz} % Umsatzsteuer
            </span>
            <span className="tabular-nums">{preisText(steuer)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-ink pt-2.5 font-medium">
            <span>Gesamtbetrag</span>
            <span className="tabular-nums">{preisText(b.gesamt)}</span>
          </div>
        </div>

        {/* -------------------------------------------------------- Schluss */}
        <p className="mt-12 text-[14px] leading-relaxed text-ink-soft">
          Der Betrag wurde bereits bezahlt. Vielen Dank.
        </p>

        <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
          {b.widerruf_verzicht
            ? "Sie haben beim Kauf ausdrücklich zugestimmt, dass mit der Ausführung vor Ablauf der Widerrufsfrist begonnen wird, und zur Kenntnis genommen, dass Ihr Widerrufsrecht damit erlischt."
            : "Ihr Widerrufsrecht von vierzehn Tagen bleibt unberührt."}
        </p>
      </div>
    </main>
  );
}
