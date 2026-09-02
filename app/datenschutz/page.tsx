import LegalLayout from "@/components/LegalLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/datenschutz" },
  title: "Datenschutzerklärung | Pferdeliebehealthy",
};

export default function Datenschutz() {
  return (
    <LegalLayout eyebrow="Rechtliches" title="Datenschutzerklärung">
      <p style={{ marginBottom: "30px" }}>
        Soweit nachstehend keine anderen Angaben gemacht werden, ist die
        Bereitstellung Ihrer personenbezogenen Daten weder gesetzlich noch
        vertraglich vorgeschrieben, noch für einen Vertragsabschluss
        erforderlich. Sie sind zur Bereitstellung der Daten nicht
        verpflichtet, eine Nichtbereitstellung hat keine Folgen, soweit bei
        den nachfolgenden Verarbeitungsvorgängen keine anderweitige Angabe
        gemacht wird. „Personenbezogene Daten&quot; sind alle Informationen,
        die sich auf eine identifizierte oder identifizierbare natürliche
        Person beziehen.
      </p>

      <h2>Server-Logfiles</h2>
      <p>
        Sie können unsere Webseiten besuchen, ohne Angaben zu Ihrer Person zu
        machen. Bei jedem Zugriff auf unsere Website werden an uns oder
        unseren Webhoster beziehungsweise IT-Dienstleister Nutzungsdaten
        durch Ihren Internet Browser übermittelt und in Protokolldaten
        gespeichert, etwa der Name der aufgerufenen Seite, Datum und Uhrzeit
        des Abrufs, die IP-Adresse, die übertragene Datenmenge und der
        anfragende Provider.
      </p>
      <p>
        Die Verarbeitung erfolgt auf Grundlage des Art. 6 Abs. 1 lit. f
        DSGVO aus unserem überwiegenden berechtigten Interesse an der
        Gewährleistung eines störungsfreien Betriebs unserer Website sowie
        zur Verbesserung unseres Angebotes. Ihre Daten werden dabei
        gegebenenfalls in Drittstaaten außerhalb der Europäischen Union
        übermittelt, für die ein Angemessenheitsbeschluss der EU-Kommission
        vorliegt.
      </p>

      <h2>Kontakt und Verantwortlicher</h2>
      <p>
        Verantwortlicher für die Datenverarbeitung ist Yasemin Halac,
        Steigeweg 7, 74722 Buchen, Deutschland, Telefon 015164655430,
        E-Mail{" "}
        <a href="mailto:info@pferdeliebehealthy.de">
          info@pferdeliebehealthy.de
        </a>
        .
      </p>

      {/* ▸ „oder über das Kontaktformular" ist am 02.09.2026 entfallen: Ein
          Kontaktformular gibt es auf dieser Website nicht. Es gibt nur die
          Anmeldefelder für Insider-Kanal und Futter-Check, und die sind
          weiter unten eigens beschrieben. Falls je eines dazukommt, gehört
          der Halbsatz zurück -- und dann auch ein Satz dazu, welche Felder
          es hat. */}
      <h3>Kontaktaufnahme per E-Mail</h3>
      <p>
        Wenn Sie per E-Mail mit uns in
        Geschäftskontakt treten, erheben wir Ihre personenbezogenen Daten
        wie Name, E-Mail-Adresse und Nachrichtentext nur in dem von Ihnen
        zur Verfügung gestellten Umfang. Dient die Kontaktaufnahme
        vorvertraglichen Maßnahmen oder einem bereits bestehenden Vertrag,
        erfolgt die Verarbeitung auf Grundlage des Art. 6 Abs. 1 lit. b
        DSGVO. Erfolgt sie aus anderen Gründen, erfolgt sie auf Grundlage
        des Art. 6 Abs. 1 lit. f DSGVO aus unserem überwiegenden
        berechtigten Interesse an der Bearbeitung und Beantwortung Ihrer
        Anfrage. Sie haben das Recht, dieser Verarbeitung aus Gründen Ihrer
        besonderen Situation jederzeit zu widersprechen. Ihre Daten werden
        nach Bearbeitung unter Beachtung gesetzlicher Aufbewahrungsfristen
        gelöscht.
      </p>

      <h3>WhatsApp Business</h3>
      <p>
        Treten Sie per WhatsApp mit uns in Kontakt, nutzen wir hierfür
        WhatsApp Business der WhatsApp Ireland Limited beziehungsweise
        WhatsApp Inc. für Nutzer außerhalb des Europäischen
        Wirtschaftsraums. Wir erheben dabei Ihre bei WhatsApp hinterlegte
        Mobilfunknummer sowie gegebenenfalls Ihren Namen. Ihre Daten werden
        an Server der Meta Platforms Inc. in den USA übermittelt, für die
        das EU-US Data Privacy Framework als
        Angemessenheitsbeschluss der EU-Kommission gilt. Nähere
        Informationen finden Sie unter{" "}
        <a
          href="https://www.whatsapp.com/legal/"
          target="_blank"
          rel="noopener"
        >
          whatsapp.com/legal
        </a>
        .
      </p>

      {/* ▸ DER SATZ ZUM KUNDENKONTO IST AM 02.09.2026 ENTFALLEN. Ein
          Kundenkonto kann man auf dieser Website nicht anlegen: Gekauft wird
          ohne Konto, und der Zugang zur Akademie kommt danach als Link per
          Mail. Beschrieben ist dieser Zugang im Abschnitt „Mitgliederbereich
          der Akademie" gleich darunter. Eine Erklärung, die Vorgänge
          beschreibt, die es nicht gibt, macht die übrigen Angaben
          unglaubwürdig. */}
      <h3>Bestellungen</h3>
      <p>
        Bei
        Bestellungen verarbeiten wir Ihre Daten, soweit dies zur Erfüllung
        und Abwicklung erforderlich ist, auf Grundlage des Art. 6 Abs. 1
        lit. b DSGVO. Eine Weitergabe erfolgt an Versandunternehmen,
        Zahlungsdienstleister und IT-Dienstleister im erforderlichen
        Mindestumfang, gegebenenfalls in Drittstaaten mit
        Angemessenheitsbeschluss der EU-Kommission.
      </p>

      <h2>Mitgliederbereich der Akademie</h2>
      <p>
        Wer ein Produkt der Pferdeliebehealthy Akademie erworben hat, erhält
        Zugang zu einem persönlichen Mitgliederbereich. Die Anmeldung erfolgt
        ohne Passwort über einen persönlichen Zugangslink oder einen
        Zahlencode, den wir Ihnen per E-Mail zusenden. Gespeichert werden dafür
        Ihre E-Mail-Adresse, die für Sie freigeschalteten Produkte und der
        Zeitpunkt Ihrer letzten Anmeldung.
      </p>
      <p>
        Bei der Nutzung entstehen weitere Daten, die wir Ihrem Zugang zuordnen:
        Ihr Lernfortschritt, von Ihnen angelegte Notizen, Markierungen und
        Lesezeichen zu einzelnen Lektionen, Ihre Antworten auf Reflexionsfragen
        sowie, falls Sie an einer Ausbildung teilnehmen, Prüfungsergebnisse und
        die Angaben für Ihr Zertifikat. Nutzen Sie die enthaltenen Werkzeuge,
        kommen die dort eingetragenen Angaben hinzu, insbesondere Angaben zu
        Ihrem Pferd, zu Fütterung, Haltung und Gesundheit, Terminen und
        Gewichtsverläufen sowie von Ihnen hochgeladene Unterlagen wie Blut- oder
        Heuanalysen und Ihre Nachrichten an uns im Rahmen einer Futterberatung.
      </p>
      <p>
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, die Verarbeitung ist zur
        Erfüllung des mit Ihnen geschlossenen Vertrages erforderlich. Ohne diese
        Angaben lassen sich die gekauften Leistungen nicht erbringen.
      </p>
      <p>
        Gespeichert werden diese Daten bei Supabase Inc. in einem Rechenzentrum
        in Irland, also innerhalb der Europäischen Union. Betrieben wird die
        Anwendung bei Vercel Inc. mit Serverstandort Frankfurt am Main. Für
        System- und Erinnerungsmails setzen wir Resend, Inc. ein. Mit allen drei
        Anbietern bestehen Verträge zur Auftragsverarbeitung nach Art. 28 DSGVO.
        Von Ihnen hochgeladene Dateien liegen in einem nicht öffentlichen
        Speicher und sind nur über zeitlich befristete Adressen erreichbar.
      </p>
      <p>
        Wir speichern diese Daten, solange Ihr Zugang besteht. Danach löschen
        wir sie auf Ihren Wunsch, soweit keine gesetzliche Aufbewahrungspflicht
        entgegensteht; Rechnungen müssen wir zehn Jahre aufbewahren.
      </p>

      <h2>Kundenverwaltung EquiDesk</h2>
      <p>
        EquiDesk ist eine Kundenverwaltung für Futterberaterinnen. Wer sie
        erwirbt, verwaltet darin die Daten der eigenen Kundinnen und Kunden.
      </p>
      <p>
        Für diese Daten ist allein die jeweilige Beraterin verantwortlich im
        Sinne der DSGVO. Wir stellen ausschließlich die Technik bereit und
        verarbeiten die Daten in ihrem Auftrag nach Art. 28 DSGVO. Wir nutzen
        sie nicht für eigene Zwecke und insbesondere nicht für Werbung. Einen
        Vertrag zur Auftragsverarbeitung stellen wir in der Anwendung bereit.
      </p>
      <p>
        Sind Sie Kundin oder Kunde einer Beraterin, die EquiDesk einsetzt,
        wenden Sie sich mit Fragen zu Ihren Daten sowie mit Auskunfts- und
        Löschverlangen bitte an diese Beraterin. Wir dürfen darüber nicht selbst
        entscheiden, sondern nur auf ihre Weisung tätig werden. Speicherort und
        eingesetzte Dienstleister entsprechen den Angaben im vorstehenden
        Abschnitt.
      </p>

      <h2>Werbung</h2>
      <h3>Postalische Werbung</h3>
      <p>
        Wir nutzen Name und Anschrift, die wir im Rahmen eines Verkaufs
        erhalten haben, für postalische Werbung, sofern Sie dem nicht
        widersprochen haben. Die Verarbeitung erfolgt auf Grundlage des Art.
        6 Abs. 1 lit. f DSGVO. Sie können jederzeit widersprechen, die
        Kontaktdaten finden Sie im Impressum.
      </p>
      <h3>Newsletter „Pferdeliebe Insider"</h3>
      <p>
        Wenn Sie sich für den Insider-Kanal eintragen, verarbeiten wir Ihren
        Vornamen und Ihre E-Mail-Adresse, um Ihnen regelmäßig Informationen zur
        Pferdefütterung zu senden. Grundlage ist Ihre Einwilligung nach Art. 6
        Abs. 1 lit. a DSGVO, die Sie beim Absenden des Formulars erteilen.
        Zusätzlich speichern wir, an welcher Stelle unserer Website Sie sich
        eingetragen haben, sowie den Zeitpunkt Ihrer Anmeldung und Ihrer
        Bestätigung, dies dient dem Nachweis der Einwilligung.
      </p>
      <p>
        Nach der Anmeldung erhalten Sie eine E-Mail mit einem Bestätigungslink
        (Double-Opt-in-Verfahren). Erst nach Ihrer Bestätigung versenden wir den
        Newsletter. Ohne Bestätigung erfolgt kein Versand. Sie können Ihre
        Einwilligung jederzeit über den Abmeldelink im Newsletter oder per
        Mitteilung an uns widerrufen; wir löschen Ihre Daten dann unverzüglich.
        Nicht bestätigte Anmeldungen löschen wir spätestens nach zwei Monaten.
      </p>
      {/* ▸ DIESER ABSATZ FEHLTE. Beschrieben war nur der Weg über das
          Formular. Der zweite Weg, das Häkchen in der Kasse
          (newsletterEintragen() in lib/digital-server.ts), stand nirgends --
          dafür stand in der Widerrufsbelehrung, die Anmeldung erfolge „ohne
          separate Einwilligung", was schlicht nicht stimmte. Der Absatz dort
          ist entfernt, die Beschreibung steht jetzt hier, wo sie hingehört.

          ▸ WARUM HIER KEINE BESTÄTIGUNGSMAIL KOMMT, ist im Code an der
          Funktion selbst begründet: Die Adresse ist durch die Zahlung schon
          bestätigt, das Häkchen ist nicht vorangekreuzt, Zeitpunkt und
          Herkunft werden gespeichert. Wer das Häkchen je vorankreuzt, macht
          diesen Absatz falsch. */}
      <p>
        In den Newsletter eintragen können Sie sich auch beim Kauf. In der
        Kasse steht dafür ein eigenes Feld, das nicht vorausgewählt ist; nur
        wenn Sie es selbst anhaken, nehmen wir Ihre Adresse auf. Auch das ist
        eine Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO. Eine
        Bestätigungsmail senden wir in diesem Fall nicht, weil Ihre Adresse
        durch die Zahlung bereits belegt ist; wir speichern stattdessen den
        Zeitpunkt und das Produkt, bei dem Sie zugestimmt haben. Abmelden
        können Sie sich jederzeit mit dem Link am Ende jeder Nachricht.
      </p>
      <h3>Futter-Check</h3>
      <p>
        Beim kostenlosen Futter-Check verarbeiten wir Ihren Vornamen, Ihre
        E-Mail-Adresse sowie Ihre Antworten auf die fünf Fragen und das daraus
        errechnete Ergebnis. Grundlage ist Ihre Einwilligung nach Art. 6 Abs. 1
        lit. a DSGVO, die Sie beim Absenden des Formulars erteilen. Nach der
        Anmeldung erhalten Sie eine E-Mail mit einem Bestätigungslink
        (Double-Opt-in-Verfahren); erst nach Ihrer Bestätigung senden wir Ihnen
        Ihr Ergebnis und weitere Informationen zur Pferdefütterung zu. Ohne
        Bestätigung erfolgt kein weiterer Versand.
      </p>
      <p>
        Sie können Ihre Einwilligung jederzeit formlos widerrufen, etwa per
        Nachricht an die im Impressum genannte Adresse. Wir löschen Ihre Daten
        dann unverzüglich. Nicht bestätigte Anmeldungen löschen wir spätestens
        nach zwei Monaten.
      </p>
      <h3>Speicherung und Versand (Insider-Kanal und Futter-Check)</h3>
      <p>
        Die Daten aus beiden vorgenannten Anmeldungen werden in einer Datenbank
        des Anbieters Supabase Inc., USA, gespeichert. Für den Versand der
        E-Mails nutzen wir Resend, Inc., USA. Beide Anbieter verarbeiten die
        Daten in unserem Auftrag auf Grundlage eines
        Auftragsverarbeitungsvertrags; die Übermittlung in die USA erfolgt auf
        Grundlage von Standardvertragsklauseln. Ein Tracking-Pixel oder
        Öffnungs-Tracking setzen wir nicht ein. Nähere Informationen unter{" "}
        <a href="https://supabase.com/privacy" target="_blank" rel="noopener">
          supabase.com/privacy
        </a>{" "}
        und{" "}
        <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener">
          resend.com/legal/privacy-policy
        </a>
        .
      </p>

      <h3>Direktwerbung per E-Mail</h3>
      <p>
        Wir nutzen Ihre E-Mail-Adresse aus einem Kaufvorgang für Werbung zu
        ähnlichen eigenen Waren oder Dienstleistungen, sofern Sie dem nicht
        widersprochen haben, auf Grundlage des Art. 6 Abs. 1 lit. f DSGVO.
        Ein Widerspruch ist jederzeit über den Link in der Werbe-E-Mail oder
        per Mitteilung an uns möglich.
      </p>

      <h2>Versanddienstleister</h2>
      <p>
        Wir geben Ihre E-Mail-Adresse im Rahmen der Vertragsabwicklung an
        das Transportunternehmen weiter, sofern Sie im Bestellvorgang
        ausdrücklich zugestimmt haben, damit Sie über den Versandstatus
        informiert werden. Die Verarbeitung erfolgt auf Grundlage des Art. 6
        Abs. 1 lit. a DSGVO und kann jederzeit widerrufen werden.
      </p>

      <h2>Hosting</h2>
      <p>
        Diese Website wird bei Vercel betrieben, Anbieter ist die Vercel Inc.,
        340 S Lemon Ave #4133, Walnut, CA 91789, USA. Beim Aufruf der Seite
        verarbeitet Vercel technisch notwendige Daten, insbesondere Ihre
        IP-Adresse, den Zeitpunkt des Zugriffs, die aufgerufene Adresse sowie
        Angaben zu Browser und Betriebssystem. Ohne diese Verarbeitung lässt
        sich eine Website nicht ausliefern.
      </p>
      <p>
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes
        Interesse liegt im sicheren und zuverlässigen Betrieb dieser Website.
      </p>
      <p>
        Eine Übermittlung von Daten in die Vereinigten Staaten ist möglich. Die
        Europäische Kommission hat dafür einen Angemessenheitsbeschluss gefasst
        (EU-US Data Privacy Framework), Vercel ist unter diesem Rahmen
        zertifiziert. Näheres finden Sie in der{" "}
        <a
          href="https://vercel.com/legal/privacy-policy"
          target="_blank"
          rel="noopener"
        >
          Datenschutzerklärung von Vercel
        </a>
        .
      </p>

      <h2>Besucherzählung und Messung der Ladezeiten</h2>
      <p>
        Um zu erfahren, wie oft unsere Seiten aufgerufen werden und wie schnell
        sie bei Ihnen laden, setzen wir Vercel Web Analytics und Vercel Speed
        Insights ein. Anbieter ist die Vercel Inc., 340 S Lemon Ave #4133,
        Walnut, CA 91789, USA.
      </p>
      <p>
        Beide Dienste arbeiten ohne Cookies. Auf Ihrem Endgerät wird nichts
        gespeichert und nichts ausgelesen, es wird keine dauerhafte Kennung
        vergeben, und es findet keine Wiedererkennung über mehrere Websites
        hinweg statt. Aus diesem Grund ist keine Einwilligung nach § 25 Abs. 1
        TDDDG erforderlich.
      </p>
      <p>
        Bei der Besucherzählung werden je Seitenaufruf gespeichert: Zeitpunkt,
        aufgerufene Adresse, die Seite, von der Sie gekommen sind, bestimmte
        Parameter in der Adresse, eine ungefähre Ortsangabe aus der IP-Adresse
        (Land, Region, Ort), Gerätetyp, Betriebssystem und Browser. Bei der
        Ladezeitmessung kommen die gemessenen Ladewerte und die Netzgeschwindigkeit
        hinzu, hier wird nur das Land erfasst.
      </p>
      <p>
        Ihre IP-Adresse wird dabei nicht gespeichert. Damit ein wiederkehrender
        Aufruf innerhalb eines Tages nicht doppelt gezählt wird, bildet Vercel
        aus der Anfrage einen Kennwert, der nach vierundzwanzig Stunden verfällt.
        Ein Personenbezug wird nicht hergestellt, ein Nutzungsprofil entsteht
        nicht.
      </p>
      <p>
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes
        Interesse liegt darin, unser Angebot bedarfsgerecht zu gestalten und
        technische Probleme zu erkennen. Sie können dieser Verarbeitung nach
        Art. 21 Abs. 1 DSGVO jederzeit widersprechen, die Kontaktdaten finden
        Sie im Impressum. Es gelten dieselben Angaben zur Übermittlung in die
        Vereinigten Staaten wie im vorstehenden Abschnitt zum Hosting.
      </p>

      <h2>Zahlungsabwicklung über Stripe</h2>
      <p>
        Für die Abwicklung von Zahlungen setzen wir Stripe ein, Anbieter ist
        die Stripe Payments Europe, Limited, 1 Grand Canal Street Lower, Grand
        Canal Dock, Dublin, Irland.
      </p>
      <p>
        Wenn Sie etwas bestellen, übermitteln wir an Stripe die für die
        Zahlung erforderlichen Angaben: Ihren Namen, Ihre E-Mail-Adresse, Ihre
        Rechnungsanschrift, den Rechnungsbetrag und die Bezeichnung der
        bestellten Leistung. Ihre Zahlungsdaten selbst, also etwa Ihre
        Kartennummer, geben Sie ausschließlich auf der Bezahlseite von Stripe
        ein. Diese Daten erreichen uns nicht und werden von uns weder
        gespeichert noch eingesehen.
      </p>
      <p>
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, die Verarbeitung ist
        zur Erfüllung des Vertrages mit Ihnen erforderlich.
      </p>
      <p>
        Über Stripe können je nach Auswahl weitere Zahlungsarten angeboten
        werden, etwa Kreditkarte, PayPal, Klarna oder Apple Pay. Wählen Sie
        eine solche Zahlungsart, verarbeitet der jeweilige Anbieter Ihre Daten
        eigenverantwortlich nach seinen eigenen Bestimmungen. Bei einer
        Ratenzahlung über Klarna kann dabei auch eine Bonitätsprüfung
        stattfinden; über die Einzelheiten informiert Sie Klarna vor Abschluss.
      </p>
      <p>
        Wenn wir Ihnen nach einem Kauf ein Anschlussangebot machen, das Sie
        mit einem Klick annehmen können, wird Ihre Zahlungsart bei Stripe für
        diesen Zweck hinterlegt. Eine Abbuchung erfolgt ausschließlich, wenn
        Sie das Angebot ausdrücklich annehmen.
      </p>
      <p>
        Stripe gehört zur Stripe, Inc. mit Sitz in den Vereinigten Staaten,
        eine Übermittlung von Daten dorthin ist möglich. Die Europäische
        Kommission hat für die USA einen Angemessenheitsbeschluss gefasst
        (EU-US Data Privacy Framework), Stripe ist unter diesem Rahmen
        zertifiziert.
      </p>
      <p>
        Näheres finden Sie in der{" "}
        <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener">
          Datenschutzerklärung von Stripe
        </a>
        .
      </p>

      <h2>Cookies und Speicherung in Ihrem Browser</h2>
      <p>
        Cookies sind kleine Textdateien, die eine Website in Ihrem Browser
        ablegt. Wir setzen ausschließlich solche ein, die für den Betrieb der
        Seite und für die von Ihnen aufgerufenen Funktionen notwendig sind.
        Cookies zu Werbezwecken, zur Reichweitenmessung oder von
        Drittanbietern setzen wir nicht ein. Deshalb erscheint auf unserer
        Website auch kein Einwilligungsbanner.
      </p>
      <p>Im Einzelnen sind das zwei Cookies:</p>
      <ul>
        <li>
          <strong>pfh_insider_zugang</strong>, Laufzeit ein Jahr. Er öffnet
          den Insider-Bereich, nachdem Sie sich über den Bestätigungslink in
          unserer E-Mail angemeldet haben.
        </li>
        <li>
          <strong>pfh_admin</strong>, Laufzeit eine Woche. Er hält die
          Anmeldung am Verwaltungsbereich. Diesen Cookie erhält nur die
          Betreiberin der Website, nicht Besucherinnen und Besucher.
        </li>
      </ul>
      <p>
        Daneben legt Ihr Browser zwei Angaben in seinem eigenen Speicher ab,
        die unseren Server nie erreichen: den Inhalt Ihres Warenkorbs, damit
        er beim Wechsel zwischen den Seiten erhalten bleibt, und den Vermerk,
        dass Sie den Hinweis auf unseren Insider-Kanal weggeklickt haben.
        Beide enthalten keine Kennung, mit der sich jemand wiedererkennen
        ließe.
      </p>
      <p>
        Rechtsgrundlage für die Speicherung und das Auslesen ist § 25 Abs. 2
        Nr. 2 TDDDG, da beides unbedingt erforderlich ist, um Ihnen die von
        Ihnen ausdrücklich gewünschte Funktion bereitzustellen. Die damit
        verbundene Verarbeitung Ihrer Daten stützen wir auf Art. 6 Abs. 1
        lit. b DSGVO, soweit sie der Anbahnung oder Erfüllung eines Vertrages
        dient, im Übrigen auf Art. 6 Abs. 1 lit. f DSGVO. Über die
        Einstellungen Ihres Browsers können Sie Cookies und den Browserspeicher
        jederzeit löschen oder deren Ablage von vornherein verhindern.
      </p>
      <p>
        Wenn Sie eine Bestellung bezahlen, wechseln Sie auf die Bezahlseite von
        Stripe. Dort setzt Stripe eigene Cookies, unter anderem zur
        Betrugsvorbeugung. Darauf haben wir keinen Einfluss, es gelten die
        Bestimmungen von Stripe.
      </p>

      <h2>Betroffenenrechte und Speicherdauer</h2>
      <p>
        Nach vollständiger Vertragsabwicklung werden Ihre Daten zunächst für
        die Dauer der Gewährleistungsfrist und danach unter Beachtung
        gesetzlicher, insbesondere steuer- und handelsrechtlicher
        Aufbewahrungsfristen gespeichert und anschließend gelöscht.
      </p>
      <p>
        Ihnen stehen bei Vorliegen der gesetzlichen Voraussetzungen die
        Rechte nach Art. 15 bis 20 DSGVO zu: Auskunft, Berichtigung,
        Löschung, Einschränkung der Verarbeitung und Datenübertragbarkeit.
        Zudem steht Ihnen nach Art. 21 Abs. 1 DSGVO ein Widerspruchsrecht
        gegen Verarbeitungen zu, die auf Art. 6 Abs. 1 lit. f DSGVO
        beruhen, sowie gegen die Verarbeitung zu Zwecken der Direktwerbung.
      </p>

      <h2>Beschwerderecht</h2>
      <p>
        Sie haben gemäß Art. 77 DSGVO das Recht, sich bei einer
        Aufsichtsbehörde zu beschweren. Zuständig ist:
      </p>
      <p>
        Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit
        Baden-Württemberg
        <br />
        Lautenschlagerstraße 20
        <br />
        70173 Stuttgart
        <br />
        Telefon: +49 711 615541-0
        <br />
        E-Mail: poststelle@lfdi.bwl.de
      </p>
    </LegalLayout>
  );
}
