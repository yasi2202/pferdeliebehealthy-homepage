import type { Metadata } from "next";
import Link from "next/link";
import LegalLayout from "@/components/LegalLayout";
import { laender, preisText } from "@/lib/shop";

export const metadata: Metadata = {
  alternates: { canonical: "/zahlung-und-versand" },
  title: "Zahlung und Versand",
  description:
    "Wie du im Shop bezahlst, was der Versand kostet, wie lange die Lieferung dauert und wie eine Rücksendung läuft.",
};

// ---------------------------------------------------------------------------
// Die Pflichtangaben rund um Bezahlung und Lieferung.
//
// Die Versandkosten stehen NICHT doppelt im Text, sondern kommen aus
// lib/shop.ts. Änderst du sie dort, ändern sie sich hier und in der Kasse
// zugleich -- so kann keine Zahl stehen bleiben, die nicht mehr stimmt.
// ---------------------------------------------------------------------------

export default function ZahlungUndVersand() {
  return (
    <LegalLayout eyebrow="Shop" title="Zahlung und Versand">
      <h2>Wie du bezahlen kannst</h2>
      <p>
        Bezahlt wird über Stripe, einen der grossen europäischen
        Zahlungsdienstleister. Welche Wege dir dort angeboten werden, hängt von
        deinem Gerät und deinem Land ab. In der Regel sind das Kreditkarte,
        PayPal, Klarna, Apple Pay und Google Pay.
      </p>
      <p>
        Deine Kartendaten sehe ich nie. Sie werden ausschliesslich bei Stripe
        eingegeben und liegen auch nur dort. Bei mir kommen dein Name, deine
        Anschrift und deine E-Mail-Adresse an, damit ich das Paket packen und
        dir schreiben kann.
      </p>
      <p>Zusätzliche Gebühren fallen für keine der Zahlungsarten an.</p>

      <h2>Was der Versand kostet</h2>
      <p>
        Versendet wird mit DHL. Die Versandkosten werden dir in der Kasse
        angezeigt, bevor du bestellst.
      </p>
      <ul>
        {laender.map((l) => (
          <li key={l.code}>
            {l.name}: {preisText(l.kosten)} je Bestellung
          </li>
        ))}
      </ul>
      <p>
        Andere Länder kann ich im Moment nicht beliefern. Wenn du ausserhalb
        davon wohnst und trotzdem gerne bestellen möchtest, schreib mir an{" "}
        <a href="mailto:info@pferdeliebehealthy.de">
          info@pferdeliebehealthy.de
        </a>
        , dann sehe ich, was sich machen lässt.
      </p>

      <h2>Wie lange es dauert</h2>
      <p>
        Die Standardlieferzeit beträgt nach dem Versand drei bis sieben
        Werktage. Je nach Versandtermin und Auslastung kann die Gesamtzeit vom
        Bestelldatum an bis zu vierzehn Tage betragen.
      </p>
      <p>
        Bei Vorbestellungen beträgt die reguläre Lieferzeit sechs Wochen. In
        Ausnahmefällen, etwa bei hoher Nachfrage oder Lieferengpässen, kann sie
        sich auf zehn bis zwölf Wochen verlängern. In diesem Fall informiere
        ich dich rechtzeitig.
      </p>
      <p>An Sonn- und Feiertagen erfolgt kein Versand.</p>

      <h2>Preise</h2>
      <p>
        Alle Preise im Shop sind Endpreise und enthalten die gesetzliche
        Mehrwertsteuer. Die Versandkosten kommen hinzu und werden in der Kasse
        gesondert ausgewiesen.
      </p>

      <h2>Wenn etwas nicht passt</h2>
      <p>
        Du hast ein vierzehntägiges Widerrufsrecht. Alles dazu, auch das
        Formular, steht in der{" "}
        <Link href="/widerrufsbelehrung">Widerrufsbelehrung</Link>. Am
        einfachsten ist es, wenn du mir vorher kurz schreibst, dann klären wir
        den Rest zusammen.
      </p>
      <p>
        Sollte einmal ein Paket beschädigt ankommen, mach bitte ein Foto und
        schick es mir. Dann kümmere ich mich darum.
      </p>

      <h2>Was Futtermittel angeht</h2>
      <p>
        Ergänzungsfuttermittel sind keine Arzneimittel. Sie ersetzen weder eine
        tierärztliche Behandlung noch eine bedarfsgerechte Grundration aus Heu
        und Weide. Wenn du dir nicht sicher bist, ob etwas zu deinem Pferd
        passt, mach gerne zuerst den{" "}
        <Link href="/futter-check">Futter-Check</Link> oder schreib mir.
      </p>

      <p>
        Weitere Einzelheiten stehen in den <Link href="/agb">AGB</Link>.
      </p>
    </LegalLayout>
  );
}
