import LegalLayout from "@/components/LegalLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/widerrufsbelehrung" },
  title: "Widerrufsbelehrung | Pferdeliebehealthy",
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
        <li>
          bei Beratungsleistungen wie Futterberatungen, sofern bereits
          Unterlagen heruntergeladen oder die Leistung begonnen wurde
        </li>
        <li>
          bei verderblichen Waren oder solchen, deren Verfallsdatum schnell
          überschritten würde, etwa bestimmtes Futtermittel
        </li>
      </ul>

      <h3>Hinweis zur E-Mail-Kommunikation und zum Newsletter</h3>
      <p>
        Im Rahmen der Vertragsabwicklung behalten wir uns vor, Ihnen per
        E-Mail produktbezogene Informationen, begleitende Inhalte wie
        Downloads oder Kurshinweise sowie weiterführende Tipps zu
        übermitteln, soweit dies zur Vertragserfüllung erforderlich ist.
        Darüber hinaus können wir Ihnen im Anschluss an den Kauf unseren
        thematisch passenden Newsletter zusenden, mit Informationen zu neuen
        Produkten, Kursen, Angeboten und relevanten Inhalten. Die Anmeldung
        erfolgt im Rahmen des Kaufs ohne separate Einwilligung, Sie können
        jederzeit über den Abmeldelink oder eine formlose Nachricht
        widersprechen. Weitere Informationen finden Sie in unserer
        Datenschutzerklärung.
      </p>

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
        E-Mail:{" "}
        <a href="mailto:pferdeliebehealthy@hotmail.com">
          pferdeliebehealthy@hotmail.com
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
