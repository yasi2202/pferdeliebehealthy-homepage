import LegalLayout from "@/components/LegalLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/impressum" }, title: "Impressum | Pferdeliebehealthy" };

export default function Impressum() {
  return (
    <LegalLayout eyebrow="Rechtliches" title="Impressum">
      <h3>Gesetzliche Anbieterkennung</h3>
      <p>
        Yasemin Halac
        <br />
        Pferdeliebehealthy
        <br />
        Steigeweg 7
        <br />
        74722 Buchen
        <br />
        Deutschland
      </p>
      {/* ▸ DIE TELEFONNUMMER FEHLTE HIER als einziger der vier Rechtstexte.
          In den AGB, in der Widerrufsbelehrung und in der
          Datenschutzerklärung stand sie längst. In der Widerrufsbelehrung ist
          sie ohnehin Pflicht, also gab es nichts zu schützen, nur eine
          Lücke. */}
      <p>
        Telefon: <a href="tel:+4915164655430">+49 151 64655430</a>
        <br />
        E-Mail: <a href="mailto:info@pferdeliebehealthy.de">info@pferdeliebehealthy.de</a>
      </p>

      <h3>Inhaltlich Verantwortlicher gemäß § 18 Abs. 2 MStV</h3>
      <p>
        Frau Yasemin Halac
        <br />
        Steigeweg 7
        <br />
        74722 Buchen
        <br />
        Deutschland
      </p>

      <p>
        Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren
        vor Verbraucherschlichtungsstellen teilzunehmen.
      </p>
      <p>
        Wir sind seit dem 29.07.2025 Mitglied der Initiative „FairCommerce&quot;.
        Nähere Informationen hierzu finden Sie unter{" "}
        <a
          href="https://www.haendlerbund.de/faircommerce"
          target="_blank"
          rel="noopener"
        >
          www.haendlerbund.de/faircommerce
        </a>
        .
      </p>

      {/* ▸ DIE UMSATZSTEUER-ID STEHT HIER BEWUSST NICHT MEHR.
          Bis zum 01.09.2026 stand dort "folgt in Kürze", und zwar seit
          Monaten. Anzugeben ist sie nur, wenn es sie gibt; eine Ankündigung
          ist keine Angabe und weckt die Erwartung, es gäbe eine.

          Wenn du eine beantragst -- kostenlos beim Bundeszentralamt für
          Steuern -- kommt hier eine Überschrift "Umsatzsteuer-ID" mit der
          Nummer hin. Nötig wird sie, sobald du Leistungen an Unternehmen im
          EU-Ausland abrechnest oder am OSS-Verfahren teilnimmst. */}
      {/* ▸ DIE STEUERNUMMER IST AM 02.09.2026 ENTFALLEN, so von Yasemin
          entschieden. Sie stand hier freiwillig: § 5 DDG verlangt nur die
          Umsatzsteuer-Identifikationsnummer, und die gibt es nicht. Eine
          Steuernummer zusammen mit Name und Anschrift ist ein Stück
          Angriffsfläche ohne Gegenwert. Nicht wieder eintragen. */}
      <h2>Angaben zur Berufshaftpflichtversicherung</h2>
      <p>
        <strong>Name und Sitz des Versicherers:</strong>
        <br />
        VHV Allgemeine Versicherung AG
        <br />
        VHV-Platz 1
        <br />
        30177 Hannover
      </p>
      <p>
        <strong>Geltungsraum der Versicherung:</strong> Deutschland
      </p>
    </LegalLayout>
  );
}
