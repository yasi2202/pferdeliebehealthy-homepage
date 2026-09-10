import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";
import { preisText } from "@/lib/shop";
import {
  FRIST_TAGE,
  MINDESTAUSZAHLUNG,
  SATZ_GROSS,
  SATZ_KLEIN,
  SCHWELLE,
} from "@/lib/empfehlungsprogramm";

// ---------------------------------------------------------------------------
// Die Teilnahmebedingungen des Empfehlungsprogramms.
//
// ▸ WAS DAS HIER IST UND WAS NICHT
//   Das ist der Vertrag zwischen Yasemin und den Menschen, die sie
//   empfehlen. Er regelt, wer wann wie viel bekommt und was nicht erlaubt
//   ist. Er ist mit Sorgfalt geschrieben, aber er ist nicht anwaltlich
//   geprüft.
//
//   ▸ VOR DEM START EINMAL PRÜFEN LASSEN. Yasemin ist Mitglied im
//     Händlerbund, dort ist anwaltliche Beratung enthalten. Das kostet sie
//     also nichts ausser einer Mail. Besonders diese drei Punkte gehören
//     dorthin:
//       1. Die Kennzeichnungspflicht und wer haftet, wenn eine Empfehlerin
//          sie missachtet (Ziffer 4).
//       2. Der Keks, der die Empfehlung merkt: § 25 TDDDG und die Frage, ob
//          eine Einwilligung nötig ist.
//       3. Das Gutschriftverfahren bei Teilnehmerinnen, die keine
//          Unternehmerinnen sind (Ziffer 6).
//
// ▸ DIE ZAHLEN STEHEN NICHT ALS TEXT IN DER SEITE, sondern kommen aus
//   lib/empfehlungsprogramm.ts. Änderst du dort einen Satz, ändert sich der
//   Vertragstext mit. Andernfalls stünde nach der ersten Anpassung im
//   Vertrag etwas anderes als im Programm, und im Streitfall gilt das, was
//   im Vertrag steht.
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  alternates: { canonical: "/weiterempfehlen/bedingungen" },
  title: "Teilnahmebedingungen Empfehlungsprogramm",
  description:
    "Die Bedingungen für das Empfehlungsprogramm von Pferdeliebehealthy: Provision, Auszahlung, Kennzeichnungspflicht und was nicht erlaubt ist.",
};

export default function EmpfehlungsBedingungen() {
  return (
    <LegalLayout
      eyebrow="Rechtliches"
      title="Teilnahmebedingungen für das Empfehlungsprogramm"
    >
      <p>
        Diese Bedingungen gelten zwischen Yasemin Halac, Steigeweg 7, 74722
        Buchen (im Folgenden „ich“ oder „Anbieterin“) und der Person, die am
        Empfehlungsprogramm teilnimmt (im Folgenden „du“ oder
        „Teilnehmerin“). Sie gelten in der Fassung, die bei der Freischaltung
        gilt.
      </p>

      <h2>1. Worum es geht</h2>
      <p>
        Du empfiehlst meine digitalen Angebote weiter. Kommt darüber ein Kauf
        zustande, bekommst du eine Provision. Ein Anspruch auf Teilnahme
        besteht nicht: Ich entscheide über jede Bewerbung selbst und kann sie
        ohne Begründung ablehnen.
      </p>
      <p>
        Durch die Teilnahme entsteht kein Arbeitsverhältnis, kein
        Handelsvertretervertrag und kein Gesellschaftsverhältnis. Du wirst
        nicht in meinem Namen tätig, gibst keine Erklärungen für mich ab und
        schließt keine Verträge für mich.
      </p>

      <h2>2. Dein Link</h2>
      <p>
        Nach der Freischaltung bekommst du einen persönlichen Link der Form
        <em> pferdeliebehealthy.de/e/DEINCODE</em>. Er ist persönlich und
        nicht übertragbar.
      </p>
      <p>
        Klickt jemand auf deinen Link, wird im Browser dieser Person eine
        Kennung gespeichert, die 30 Tage gültig ist. Kauft die Person
        innerhalb dieser Zeit eines meiner digitalen Angebote, wird der Kauf
        dir zugeordnet. Klickt sie danach auf den Link einer anderen
        Teilnehmerin, gilt der zuletzt geklickte Link.
      </p>
      <p>
        Eine Zuordnung ist technisch nicht in jedem Fall möglich. Löscht die
        Käuferin ihre Browserdaten, wechselt sie das Gerät oder verhindert
        ihre Einstellungen das Speichern, kommt keine Zuordnung zustande.
        Einen Anspruch auf Provision für einen Kauf, der technisch nicht
        zugeordnet werden konnte, gibt es nicht.
      </p>

      <h2>3. Provision</h2>
      <p>Die Provision beträgt</p>
      <ul>
        <li>
          <strong>{SATZ_KLEIN} %</strong> bei Angeboten mit einem Preis unter{" "}
          {preisText(SCHWELLE)},
        </li>
        <li>
          <strong>{SATZ_GROSS} %</strong> bei Angeboten ab {preisText(SCHWELLE)}
          .
        </li>
      </ul>
      <p>
        Grundlage ist der tatsächlich gezahlte Betrag ohne Umsatzsteuer, also
        nach Abzug eines eingelösten Rabattcodes. Maßgeblich ist der Satz, der
        im Zeitpunkt des Kaufs gilt.
      </p>
      <p>
        Bei Abonnements entsteht die Provision einmalig auf die erste Zahlung,
        nicht auf die Folgemonate.
      </p>
      <p>Keine Provision entsteht insbesondere</p>
      <ul>
        <li>
          auf eigene Käufe, also Käufe auf deine bei mir hinterlegte
          Mailadresse,
        </li>
        <li>auf Käufe, die vor deiner Freischaltung zustande kommen,</li>
        <li>
          auf Käufe, die erstattet, widerrufen oder zurückgebucht werden,
        </li>
        <li>
          auf Angebote, die ich ausdrücklich vom Programm ausgenommen habe.
        </li>
      </ul>

      <h2>4. Wie du werben darfst</h2>
      <p>
        <strong>
          Du musst jede Empfehlung, für die du Provision bekommst, als Werbung
          kennzeichnen.
        </strong>{" "}
        Ein gut sichtbares „Werbung“ oder „Anzeige“ am Anfang des Beitrags
        genügt; ein Hinweis am Ende, in den Kommentaren oder hinter „mehr
        anzeigen“ genügt nicht. Diese Pflicht trifft dich als Werbende
        unmittelbar.
      </p>
      <p>Nicht erlaubt ist insbesondere:</p>
      <ul>
        <li>
          Werbung mit Wirkversprechen. Meine Angebote vermitteln Wissen zur
          Fütterung. Sie heilen keine Krankheit, ersetzen keine Tierärztin und
          garantieren kein Ergebnis. Behauptungen dieser Art sind
          wettbewerbswidrig.
        </li>
        <li>
          Bezahlte Suchanzeigen auf meinen Namen, auf „Pferdeliebehealthy“, auf
          Produktnamen oder auf Schreibweisen, die diesen ähneln.
        </li>
        <li>
          Gutschein-, Cashback-, Rabatt- und Couponportale sowie Seiten, deren
          Zweck das Sammeln von Empfehlungslinks ist.
        </li>
        <li>
          Unaufgeforderte Werbemails, automatisierte Nachrichten und jede Form
          von Spam.
        </li>
        <li>
          Websites mit rechtswidrigen, diskriminierenden oder jugendgefährdenden
          Inhalten.
        </li>
        <li>
          Der Eindruck, du sprächest in meinem Namen, du seiest bei mir
          angestellt oder deine Seite sei ein offizielles Angebot von mir.
        </li>
        <li>
          Das Verändern meiner Preise, Leistungsbeschreibungen oder Texte in
          einer Weise, die sie unzutreffend macht.
        </li>
      </ul>
      <p>
        Meine Texte, Bilder und mein Logo darfst du für deine Empfehlung
        verwenden, solange du sie unverändert lässt und der Zusammenhang
        stimmt. Diese Erlaubnis endet mit deiner Teilnahme.
      </p>

      <h2>5. Fälligkeit und Auszahlung</h2>
      <p>
        Eine Provision wird {FRIST_TAGE} Tage nach dem Kauf fällig. Diese Frist
        gibt mir die Möglichkeit, Erstattungen und Rückbuchungen zu
        berücksichtigen.
      </p>
      <p>
        Ausgezahlt wird, sobald die fälligen Provisionen zusammen mindestens{" "}
        {preisText(MINDESTAUSZAHLUNG)} erreichen. Bis dahin bleibt der Betrag
        stehen und wächst weiter. Die Auszahlung erfolgt auf den von dir
        angegebenen Weg, in der Regel per PayPal oder Überweisung. Kosten, die
        durch falsche Angaben deinerseits entstehen, gehen zu deinen Lasten.
      </p>
      <p>
        Deinen Stand kannst du jederzeit in deinem Empfehlungskonto einsehen.
        Einwände gegen eine Abrechnung teilst du mir bitte innerhalb von acht
        Wochen nach Zugang mit.
      </p>

      <h2>6. Steuern</h2>
      <p>
        Die Provision ist ein Bruttobetrag und versteht sich ohne
        Umsatzsteuer, sofern du nicht ausdrücklich mitteilst, dass du
        umsatzsteuerpflichtig bist. In diesem Fall weise ich die Umsatzsteuer
        zusätzlich aus.
      </p>
      <p>
        Die Abrechnung erfolgt im Gutschriftverfahren nach § 14 Abs. 2 UStG:
        Ich stelle die Abrechnung aus, du musst keine Rechnung schreiben. Du
        kannst einer Gutschrift widersprechen; sie verliert dann ihre Wirkung
        als Rechnung.
      </p>
      <p>
        <strong>
          Für die Versteuerung deiner Einnahmen bist du selbst verantwortlich.
        </strong>{" "}
        Das gilt auch für kleine Beträge und auch dann, wenn du nicht
        selbstständig bist. Ich schulde dir dazu keine steuerliche Beratung.
      </p>

      <h2>7. Datenschutz</h2>
      <p>
        Ich verarbeite deine Angaben, um das Programm durchzuführen und die
        Provision abzurechnen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b
        DSGVO, für die Aufbewahrung der Abrechnungen Art. 6 Abs. 1 lit. c
        DSGVO in Verbindung mit den handels- und steuerrechtlichen
        Aufbewahrungsfristen.
      </p>
      <p>
        In deinem Konto siehst du, was verkauft wurde und was dir dafür
        zusteht. Du erfährst nicht, wer gekauft hat. Angaben zu meinen
        Kundinnen gebe ich nicht weiter.
      </p>
      <p>
        Näheres steht in meiner{" "}
        <a href="/datenschutz">Datenschutzerklärung</a>.
      </p>

      <h2>8. Laufzeit und Ende</h2>
      <p>
        Die Teilnahme läuft auf unbestimmte Zeit. Beide Seiten können sie
        jederzeit ohne Frist und ohne Begründung beenden, eine Mail genügt.
      </p>
      <p>
        Bei einem Verstoß gegen Ziffer 4 kann ich die Teilnahme sofort
        beenden. Provisionen aus Käufen, die auf einem solchen Verstoß
        beruhen, entfallen.
      </p>
      <p>
        Endet die Teilnahme, funktioniert dein Link nicht mehr für neue
        Zuordnungen. Bereits verdiente und nicht nach Satz 2 entfallene
        Provisionen zahle ich zum nächsten Termin aus, unabhängig von der
        Mindestsumme nach Ziffer 5.
      </p>

      <h2>9. Änderungen</h2>
      <p>
        Ich kann diese Bedingungen und die Provisionssätze für die Zukunft
        ändern. Ich teile dir Änderungen mindestens vier Wochen vorher per
        Mail mit. Widersprichst du nicht bis zum Wirksamwerden, gelten sie als
        angenommen; darauf weise ich in der Mitteilung gesondert hin. Für
        Käufe, die vor der Änderung zustande gekommen sind, bleibt es beim
        alten Satz.
      </p>

      <h2>10. Schlussbestimmungen</h2>
      <p>
        Es gilt deutsches Recht. Ist eine Bestimmung unwirksam, bleiben die
        übrigen wirksam.
      </p>
      <p>
        Bei Fragen schreib mir an{" "}
        <a href="mailto:info@pferdeliebehealthy.de">
          info@pferdeliebehealthy.de
        </a>
        .
      </p>
    </LegalLayout>
  );
}
