import LegalLayout from "@/components/LegalLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/agb" }, title: "AGB | Pferdeliebehealthy" };

export default function Agb() {
  return (
    <LegalLayout
      eyebrow="Rechtliches"
      title="Allgemeine Geschäftsbedingungen und Kundeninformationen"
    >
      <h2>I. Allgemeine Geschäftsbedingungen</h2>

      <h3>§ 1 Grundlegende Bestimmungen</h3>
      <p>
        Die nachstehenden Geschäftsbedingungen gelten für alle Verträge, die
        Sie mit uns als Anbieter, Yasemin Halac, über die Internetseite
        www.pferdeliebehealthy.de schließen. Verbraucher im Sinne dieser AGB
        ist jede natürliche Person, die ein Rechtsgeschäft zu privaten
        Zwecken abschließt. Unternehmer ist jede natürliche oder juristische
        Person, die in Ausübung ihrer gewerblichen oder selbständigen
        Tätigkeit handelt.
      </p>

      <h3>§ 2 Zustandekommen des Vertrages</h3>
      <p>
        Gegenstand des Vertrages ist der Verkauf von Waren, digitalen
        Inhalten sowie Dienstleistungen, insbesondere Futterberatungen und
        Kurse. Mit Einstellung eines Angebots auf unserer Website geben wir
        ein verbindliches Angebot ab. Der Vertrag kommt über das
        Warenkorbsystem zustande, durch Auswahl der Produkte, Eingabe der
        Daten und Bestätigung über „zahlungspflichtig bestellen&quot;. Die
        Abwicklung erfolgt per E-Mail, der Kunde stellt sicher, dass die
        E-Mail-Adresse korrekt ist.
      </p>

      <h3>§ 3 Digitale Inhalte und Nutzungslizenz</h3>
      <p>
        Digitale Inhalte sind urheberrechtlich geschützt. Der Kunde erhält
        eine einfache, nicht übertragbare Nutzungslizenz für den privaten
        Gebrauch. Eine Weitergabe, Vervielfältigung oder öffentliche Nutzung
        ist untersagt.
      </p>

      <h3>§ 4 Kurse</h3>
      <p>
        Gegenstand ist die Durchführung von Online- oder Präsenzkursen. Der
        Vertrag kommt wie in § 2 beschrieben zustande. Eine
        Mindestteilnehmerzahl kann Voraussetzung sein. Bei Ausfall werden
        bereits gezahlte Beträge erstattet.
      </p>

      <h3>§ 5 Leistungserbringung</h3>
      <p>
        Leistungen erfolgen gemäß Angebotsbeschreibung, Termine sind
        verbindlich. Der Kunde hat Mitwirkungspflichten, etwa die
        Bereitstellung korrekter Informationen.
      </p>

      <h3>§ 6 Besondere Bestimmungen für Futterberatungen</h3>
      <p>
        Futterberatungen sind individuell erstellte Dienstleistungen und
        werden auf Grundlage der vom Kunden bereitgestellten Informationen
        speziell für ein einzelnes Pferd ausgearbeitet. Die Qualität der
        Beratung hängt maßgeblich von der Richtigkeit und Vollständigkeit
        der Angaben des Kunden ab, für fehlerhafte oder unvollständige
        Angaben wird keine Haftung übernommen.
      </p>
      <p>
        Ein Widerrufsrecht kann gemäß § 356 Abs. 4 BGB vorzeitig erlöschen,
        wenn der Kunde ausdrücklich zustimmt, dass mit der Ausführung der
        Dienstleistung vor Ablauf der Widerrufsfrist begonnen wird, und
        bestätigt, dass er sein Widerrufsrecht mit vollständiger
        Vertragserfüllung verliert. Ein Rücktritt vom Vertrag ist
        grundsätzlich nur vor Beginn der Bearbeitung möglich.
      </p>
      <p>
        Die Beratung ist innerhalb von zwölf Monaten ab Vertragsschluss in
        Anspruch zu nehmen, die Frist beginnt mit dem Kauf. Wird sie
        innerhalb dieser Frist nicht in Anspruch genommen, besteht kein
        Anspruch mehr auf Rückzahlung des Honorars in Geld. Der gezahlte
        Betrag bleibt jedoch in voller Höhe als Guthaben erhalten und kann
        bis zum Ablauf der gesetzlichen Verjährungsfrist für eine Beratung
        eines anderen Pferdes, für digitale Produkte oder für Kurse der
        Pferdeliebehealthy Academy eingesetzt oder an Dritte übertragen
        werden.
      </p>
      <p>
        Entfällt der Zweck der Beratung nach Vertragsschluss, etwa durch den
        Tod des Pferdes, erfolgt eine Rückerstattung ausschließlich auf
        Kulanzbasis, ein Anspruch auf vollständige Rückzahlung besteht
        nicht. Erfolgt nach einer angebotenen Stornierung eine erneute
        Bestätigung der Leistung, etwa für ein anderes Pferd, gilt der
        Vertrag als fortgeführt, ein späterer Rücktritt begründet keinen
        Anspruch auf vollständige Rückerstattung.
      </p>
      <p>
        Im Falle einer Stornierung vor Beginn der Bearbeitung wird eine
        Bearbeitungs- und Ausfallpauschale in Höhe von 30 Prozent des
        vereinbarten Honorars einbehalten. Dem Kunden bleibt der Nachweis
        gestattet, dass kein oder ein wesentlich geringerer Aufwand oder
        Ausfall entstanden ist, in diesem Fall reduziert sich die Pauschale
        entsprechend. Rückerstattungen erfolgen grundsätzlich über den
        ursprünglich genutzten Zahlungsweg.
      </p>

      {/* ▸ HIER STANDEN BIS ZUM 02.09.2026 PayPal, Klarna, Ratepay und
          Überweisung. Ratepay und Überweisung gab es nie, die Kreditkarte
          fehlte. Bezahlt wird ausschliesslich über Stripe, und welche Wege
          dort erscheinen, steuert die Zahlarten-Konfiguration im
          Stripe-Konto (STRIPE_ZAHLARTEN, siehe lib/shop-server.ts).

          ▸ WER DORT EINE ZAHLART EIN- ODER AUSSCHALTET, muss diesen Absatz
          und die Seite /zahlung-und-versand mitändern. Deshalb steht die
          Aufzählung hier bewusst mit „in der Regel": Was Stripe anzeigt,
          hängt auch vom Gerät und vom Land der Kundin ab. */}
      <h3>§ 7 Zahlungsbedingungen</h3>
      <p>
        Alle Preise sind Endpreise inklusive gesetzlicher Steuern. Die Zahlung
        wird über den Zahlungsdienstleister Stripe abgewickelt. Zur Verfügung
        stehen dort in der Regel Kreditkarte, PayPal, Klarna, Apple Pay und
        Google Pay; welche Wege im Einzelfall angeboten werden, hängt von Ihrem
        Gerät und Ihrem Land ab. Zusätzliche Gebühren fallen für keine der
        Zahlungsarten an. Die Zahlung ist sofort fällig, sofern nichts anderes
        vereinbart wurde.
      </p>

      <h3>§ 8 Lieferung</h3>
      <p>
        Digitale Inhalte werden per E-Mail bereitgestellt, physische Waren
        werden versendet. Das Versandrisiko trägt bei Verbrauchern der
        Anbieter bis zur Übergabe.
      </p>

      <h3>§ 9 Gewährleistung</h3>
      <p>
        Es gelten die gesetzlichen Gewährleistungsrechte. Bei
        Dienstleistungen besteht kein Erfolgsgarantieanspruch, da Ergebnisse
        individuell abhängig sind.
      </p>

      {/* ▸ DIE ALTE FASSUNG WAR UNWIRKSAM und lautete: „Haftung besteht nur
          bei Vorsatz und grober Fahrlässigkeit." So pauschal geht das
          gegenüber Verbraucherinnen nicht (§ 309 Nr. 7 BGB): Die Haftung für
          Leben, Körper und Gesundheit und die für wesentliche
          Vertragspflichten lässt sich in AGB nicht ausschliessen. Eine
          unwirksame Klausel nützt nichts, sie schadet -- es haftet dann die
          gesetzliche Regelung in voller Härte, und abmahnfähig ist sie
          obendrein.

          ▸ Der zweite Absatz ist der, auf den es fachlich ankommt, und er
          bleibt wirksam: Er schliesst nicht die Haftung aus, sondern
          beschreibt, wofür es von vornherein keine Ursächlichkeit gibt.

          ▸ Diese Fassung ist ein Vorschlag. Der Händlerbund setzt hier im
          Zweifel seinen eigenen Wortlaut ein, das ist in Ordnung -- Hauptsache,
          der alte Satz steht nicht mehr live. */}
      <h3>§ 10 Haftung</h3>
      <p>
        Für Schäden aus der Verletzung des Lebens, des Körpers oder der
        Gesundheit haften wir unbeschränkt, ebenso bei Vorsatz und grober
        Fahrlässigkeit sowie nach dem Produkthaftungsgesetz. Bei einer leicht
        fahrlässigen Verletzung wesentlicher Vertragspflichten, also solcher
        Pflichten, deren Erfüllung die ordnungsgemäße Durchführung des
        Vertrages überhaupt erst möglich macht und auf deren Einhaltung Sie
        regelmäßig vertrauen dürfen, ist unsere Haftung auf den
        vertragstypischen, vorhersehbaren Schaden begrenzt. Im Übrigen ist die
        Haftung ausgeschlossen.
      </p>
      <p>
        Unsere Beratungen, Kurse und Inhalte ersetzen keine tierärztliche
        Untersuchung, Diagnose oder Behandlung. Für Schäden, die auf
        unrichtigen oder unvollständigen Angaben des Kunden, auf individuellen
        Reaktionen des Pferdes oder auf einer von unseren Empfehlungen
        abweichenden Umsetzung beruhen, haften wir nicht.
      </p>

      <h3>§ 11 Rechtswahl</h3>
      <p>Es gilt deutsches Recht, das UN-Kaufrecht ist ausgeschlossen.</p>

      <hr />

      <h2>II. Kundeninformationen</h2>

      <h3>1. Anbieter</h3>
      <p>
        Yasemin Halac, Steigeweg 7, 74722 Buchen, Deutschland. E-Mail:{" "}
        <a href="mailto:info@pferdeliebehealthy.de">
          info@pferdeliebehealthy.de
        </a>
        , Telefon: +49 15164655430
      </p>

      <h3>2. Vertragssprache</h3>
      <p>Deutsch</p>

      {/* ▸ VORHER: „Der Vertrag wird nicht dauerhaft gespeichert." Das passte
          nicht zur Datenschutzerklärung, nach der Bestellungen in der
          Datenbank liegen und Rechnungen zehn Jahre aufbewahrt werden.
          Vertragstext und Bestelldaten sind zwar zweierlei, für eine Kundin
          lasen sich die beiden Sätze aber wie ein Widerspruch. */}
      <h3>3. Vertragsspeicherung</h3>
      <p>
        Den Vertragstext, also diese AGB, machen wir Ihnen nicht gesondert
        zugänglich; Sie können ihn jederzeit auf dieser Seite aufrufen,
        ausdrucken und speichern. Ihre Bestelldaten senden wir Ihnen nach dem
        Kauf per E-Mail zu und speichern sie zur Abwicklung sowie zur
        Erfüllung unserer steuerlichen Aufbewahrungspflichten. Einzelheiten
        dazu finden Sie in unserer Datenschutzerklärung.
      </p>

      {/* ▸ „nicht bereit" gehört dazu und stand nur im Impressum. Nach § 36
          VSBG kommt es gerade auf die Erklärung der Bereitschaft an, nicht
          auf die Verpflichtung. Jetzt steht an beiden Stellen dasselbe. */}
      <h3>4. Streitbeilegung</h3>
      <p>
        Wir sind nicht bereit und nicht verpflichtet, an
        Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
        teilzunehmen.
      </p>

      <h3>Nutzung externer Dienstleister</h3>
      <p>
        Die Zahlungsabwicklung erfolgt über Stripe, Anbieter ist die Stripe
        Payments Europe, Limited, Dublin, Irland. Je nach gewählter Zahlungsart
        werden dabei weitere Anbieter eingebunden, etwa PayPal oder Klarna.
        Vertragspartner bleiben in jedem Fall wir; Stripe wickelt lediglich die
        Zahlung ab.
      </p>
      <p>
        Digitale Inhalte stellen wir über unsere Lernplattform, die
        Pferdeliebehealthy Akademie, bereit. Nach dem Kauf erhalten Sie per
        E-Mail einen persönlichen Zugang.
      </p>
      <p>
        Im Rahmen der Vertragsabwicklung werden personenbezogene Daten an diese
        Dienstleister weitergegeben, soweit dies zur Vertragserfüllung
        erforderlich ist. Einzelheiten dazu, welche Daten das sind und auf
        welcher Grundlage sie verarbeitet werden, finden Sie in unserer
        Datenschutzerklärung.
      </p>
    </LegalLayout>
  );
}
