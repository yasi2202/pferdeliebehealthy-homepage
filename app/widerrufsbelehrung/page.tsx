import LegalLayout from "@/components/LegalLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/widerrufsbelehrung" },
  title: "Widerrufsbelehrung",
};

export default function Widerruf() {
  return (
    <LegalLayout
      eyebrow="Rechtliches"
      title="Widerrufsbelehrung und Widerrufsformular"
    >
      <h2>A. Widerrufsbelehrung</h2>
      <p>
        Verbrauchern steht ein Widerrufsrecht nach folgender Maßgabe zu.
        Verbraucher ist jede natürliche Person, die ein Rechtsgeschäft zu
        Zwecken abschließt, die überwiegend weder ihrer gewerblichen noch
        ihrer selbständigen beruflichen Tätigkeit zugerechnet werden können.
      </p>

      <h3>Widerrufsrecht bei physischen Waren, zum Beispiel Pferdefutter</h3>
      <p>
        Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen
        diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn
        Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter,
        der nicht der Beförderer ist, die Ware in Besitz genommen haben.
      </p>
      <p>
        Um Ihr Widerrufsrecht auszuüben, müssen Sie uns, Yasemin Halac,
        Pferdeliebehealthy, Steigeweg 7, 74722 Buchen, Deutschland, Telefon
        0151 64655430, E-Mail{" "}
        <a href="mailto:info@pferdeliebehealthy.de">
          info@pferdeliebehealthy.de
        </a>
        , mittels einer eindeutigen Erklärung, etwa per Post oder E-Mail,
        über Ihren Entschluss informieren. Sie können dafür das beigefügte
        Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben
        ist. Zur Wahrung der Frist reicht es aus, die Mitteilung vor
        Fristablauf abzusenden.
      </p>

      <h3>Folgen des Widerrufs bei physischen Waren</h3>
      <p>
        Wenn Sie diesen Vertrag widerrufen, erhalten Sie alle Zahlungen,
        einschließlich der Lieferkosten mit Ausnahme zusätzlicher Kosten
        durch eine andere als die günstigste Standardlieferung, unverzüglich
        und spätestens binnen vierzehn Tagen ab Eingang der
        Widerrufsmitteilung zurück. Für die Rückzahlung verwenden wir
        dasselbe Zahlungsmittel wie bei der ursprünglichen Transaktion,
        sofern nicht ausdrücklich anderes vereinbart wurde. Es werden Ihnen
        dafür keine Entgelte berechnet.
      </p>
      <p>
        Wir können die Rückzahlung verweigern, bis wir die Ware
        zurückerhalten haben oder Sie den Nachweis der Rücksendung erbracht
        haben, je nachdem, welches der frühere Zeitpunkt ist. Sie haben die
        Ware unverzüglich und spätestens binnen vierzehn Tagen ab der
        Widerrufsmitteilung zurückzusenden, die Frist ist gewahrt, wenn Sie
        die Ware vor Fristablauf absenden. Sie tragen die unmittelbaren
        Kosten der Rücksendung und müssen für einen Wertverlust nur
        aufkommen, wenn dieser auf einen zur Prüfung nicht notwendigen
        Umgang mit der Ware zurückzuführen ist.
      </p>

      <h3>
        Ausschluss beziehungsweise vorzeitiges Erlöschen des Widerrufsrechts
      </h3>
      <p>Das Widerrufsrecht besteht nicht:</p>
      <ul>
        <li>
          bei digitalen Produkten wie E-Books, Online-Kursen, digitalen
          Anleitungen und Ausbildungen, wenn der Verbraucher beim Kauf
          ausdrücklich zugestimmt hat, dass mit der Ausführung des Vertrags
          vor Ablauf der Widerrufsfrist begonnen wird, und zur Kenntnis
          genommen hat, dass sein Widerrufsrecht mit Beginn der Ausführung
          erlischt
        </li>
        {/* ▸ „BEGONNEN" WAR FALSCH UND STAND IM WIDERSPRUCH ZU DEN AGB.
            Bei einer Dienstleistung erlischt das Widerrufsrecht erst mit der
            VOLLSTÄNDIGEN Erbringung (§ 356 Abs. 4 BGB), und nur wenn die
            Kundin vorher beides bestätigt hat: sofortiger Beginn und Kenntnis
            der Folge. Genau so fragt es die Kasse in DigitalKasse.tsx ab,
            und genau so steht es in § 6 der AGB. Nur hier stand es anders. */}
        <li>
          bei Beratungsleistungen wie Futterberatungen, sobald die Leistung
          vollständig erbracht ist und Sie beim Kauf ausdrücklich zugestimmt
          haben, dass wir vor Ablauf der Widerrufsfrist mit der Ausführung
          beginnen, und dabei zur Kenntnis genommen haben, dass Sie Ihr
          Widerrufsrecht mit der vollständigen Erfüllung verlieren
        </li>
        {/* ▸ VORHER STAND HIER „verderbliche Waren ... etwa bestimmtes
            Futtermittel" (§ 312g Abs. 2 Nr. 2 BGB). Das trug nicht:
            Ergänzungsfutter im 1,5-kg-Eimer ist nicht schnell verderblich,
            und ein Ausschluss, der im Streit fällt, ist schlechter als
            keiner -- er hält die Kundin nur davon ab, ihr Recht auszuüben.

            ▸ Yasemin hat am 02.09.2026 bestätigt, dass die Eimer einen
            Originalitätsverschluss haben („so ein Klick-Dings"), der beim
            ersten Öffnen bricht. Damit greift Nr. 3: versiegelte Ware, die
            aus Gründen des Gesundheitsschutzes oder der Hygiene nach dem
            Öffnen nicht mehr zurückgenommen werden kann. Das ist bei
            Futter- und Lebensmitteln der übliche und tragfähige Weg.

            ▸ ABHÄNGIGKEIT: Fällt der Verschluss je weg oder kommt ein
            Produkt ohne ihn dazu, verliert dieser Satz seine Grundlage.
            Dann muss geöffnete Ware zurückgenommen werden. */}
        <li>
          bei Futtermitteln, deren Behälter bei der Lieferung mit einem
          Originalitätsverschluss versehen ist, sobald Sie diesen entfernt
          haben; geöffnetes Futter ist aus Gründen des Gesundheitsschutzes und
          der Hygiene nicht zur Rückgabe geeignet
        </li>
      </ul>

      {/* ▸ HIER STAND EIN ABSATZ „Hinweis zur E-Mail-Kommunikation und zum
          Newsletter", entfernt am 02.09.2026. Zwei Gründe:

          1. Er war sachlich falsch. Dort stand, die Newsletter-Anmeldung
             erfolge „im Rahmen des Kaufs ohne separate Einwilligung". Die
             Kasse hat aber ein eigenes, NICHT vorangekreuztes Häkchen, und
             Zeitpunkt und Herkunft der Einwilligung werden gespeichert. Der
             Text machte die Umsetzung schlechter, als sie ist, und behauptete
             ausgerechnet das, was nach § 7 Abs. 3 UWG angreifbar wäre.
          2. Ein Newsletter-Hinweis gehört nicht in eine Widerrufsbelehrung.
             Je näher sie an der amtlichen Musterbelehrung bleibt, desto
             sicherer greift deren Schutzwirkung.

          Beschrieben wird der Weg über das Kassenhäkchen jetzt in der
          Datenschutzerklärung, Abschnitt „Newsletter Pferdeliebe Insider". */}

      <hr />

      <h2>B. Widerrufsformular</h2>
      <p>
        Wenn Sie den Vertrag widerrufen wollen, füllen Sie bitte dieses
        Formular aus und senden es zurück an:
      </p>
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
        <br />
        {/* ▸ HIER STAND BIS ZUM 02.09.2026 pferdeliebehealthy@hotmail.com.
            Das ist eines der beiden Postfächer, die Yasemin nicht liest --
            ein Widerruf wäre dort liegen geblieben, und die Frist läuft für
            sie trotzdem. Überall sonst auf der Seite steht die Arbeitsadresse.
            Wenn sich die Adresse je ändert, muss sie hier mitgeändert
            werden: Diese Anschrift ist die, an die ein Widerruf rechtlich
            wirksam gerichtet wird. */}
        E-Mail:{" "}
        <a href="mailto:info@pferdeliebehealthy.de">
          info@pferdeliebehealthy.de
        </a>
      </p>
      <p>
        Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen
        Vertrag über den Kauf der folgenden Waren (*) / die Erbringung der
        folgenden Dienstleistung (*):
      </p>
      <div
        style={{
          borderBottom: "1px solid var(--line)",
          height: "20px",
          marginBottom: "14px",
        }}
      />
      <p>
        Bestellt am (*) ____________________ / erhalten am (*)
        ____________________
      </p>
      <p>Name des/der Verbraucher(s):</p>
      <div
        style={{
          borderBottom: "1px solid var(--line)",
          height: "20px",
          marginBottom: "14px",
        }}
      />
      <p>Anschrift des/der Verbraucher(s):</p>
      <div
        style={{
          borderBottom: "1px solid var(--line)",
          height: "20px",
          marginBottom: "14px",
        }}
      />
      <p>Unterschrift des/der Verbraucher(s), nur bei Mitteilung auf Papier:</p>
      <div
        style={{
          borderBottom: "1px solid var(--line)",
          height: "20px",
          marginBottom: "14px",
        }}
      />
      <p>Datum: ____________________</p>
      <p style={{ fontSize: "13px" }}>(*) Unzutreffendes bitte streichen</p>

      <hr />

      <h2>C. Haftungsausschluss für Online-Kurse und Ausbildungen</h2>
      <p>
        Für etwaige Schäden oder Verletzungen, die im Rahmen der Ausbildung
        oder bei der Umsetzung der Inhalte entstehen könnten, übernehmen
        Frau Yasemin Halac sowie gegebenenfalls beteiligte Dozentinnen und
        Dozenten keine Haftung. Die Teilnahme an der Ausbildung und die
        Umsetzung der Inhalte erfolgt auf eigene Verantwortung.
      </p>
      <p>
        Alle Inhalte werden nach bestem Wissen zusammengestellt, es besteht
        jedoch kein Anspruch auf Vollständigkeit, Richtigkeit oder
        Aktualität der vermittelten Informationen. Die Verantwortung für
        die Anwendung der Inhalte liegt ausschließlich bei den
        Teilnehmerinnen und Teilnehmern, für Entscheidungen auf Grundlage
        der bereitgestellten Informationen wird keine Haftung übernommen.
        Ansprüche sind ausdrücklich ausgeschlossen. Ein bestimmter
        beruflicher Erfolg oder eine Berufsausübungsbefähigung wird nicht
        garantiert.
      </p>
      <p>
        Für die Verfügbarkeit von Plattformen, Tools, Technik, Endgeräten
        oder Internetverbindungen wird keine Haftung übernommen.
        Kursinhalte, Materialien und Abläufe dürfen jederzeit aktualisiert
        oder verändert werden, ein Anspruch auf weitergehende Leistungen
        besteht nicht.
      </p>
    </LegalLayout>
  );
}
