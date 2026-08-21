import LegalLayout from "@/components/LegalLayout";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Impressum | Pferdeliebehealthy" };

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
      <p>
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

      <h2>Umsatzsteuer-ID</h2>
      <p>
        Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz: folgt
        in Kürze.
      </p>
      <p>Steuernummer: 46138/44524</p>

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
