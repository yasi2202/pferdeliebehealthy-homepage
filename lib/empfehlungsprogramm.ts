import type { DigitalProdukt } from "@/lib/digital";

// ---------------------------------------------------------------------------
// Das Empfehlungsprogramm: die Regeln.
//
// Hier stehen nur die Regeln und das Rechnen, nichts, was eine Datenbank
// oder das Internet braucht. Deshalb darf diese Datei von überall benutzt
// werden, auch von einer Seite im Browser. Alles, was mit Supabase spricht,
// steht in lib/empfehlungsprogramm-server.ts.
//
// ▸ NICHT VERWECHSELN MIT lib/empfehlungen.ts
//   Das ist die andere Richtung: Dort stehen die Rabattcodes der Partner,
//   bei denen DU Provision bekommst, wenn du sie empfiehlst. Hier geht es
//   um Menschen, die DICH empfehlen und von dir Provision bekommen.
//
// ▸ WIE DAS PROGRAMM IN FÜNF SÄTZEN FUNKTIONIERT
//   1. Jemand bewirbt sich unter /weiterempfehlen. Du siehst die Bewerbung unter
//      /admin/empfehler und schaltest sie frei oder eben nicht.
//   2. Wer freigeschaltet ist, bekommt einen persönlichen Link, zum Beispiel
//      pferdeliebehealthy.de/e/MARIE
//   3. Wer darauf klickt, bekommt einen Keks in den Browser gelegt, 30 Tage
//      lang. Die Käuferin merkt davon nichts und zahlt den normalen Preis.
//   4. Kauft sie in diesen 30 Tagen etwas, entsteht eine Provisionszeile.
//   5. Du zahlst von Hand aus, wenn genug zusammengekommen ist, und hakst
//      es unter /admin/empfehler ab.
// ---------------------------------------------------------------------------

/**
 * ▸ DIE PROVISIONSSÄTZE
 *
 * Yasemin hat am 10.09.2026 so entschieden: 20 % auf alles unter 100 €,
 * 10 % auf alles darüber.
 *
 * Der Grund für die Staffel: Bei einem Heft für 12,99 € sind 20 % gerade
 * einmal 2,18 €, und weniger wäre kein Anreiz, überhaupt mitzumachen. Bei
 * der Masterclass für 899 € wären 20 % dagegen 151 € pro Verkauf, und das
 * ist mehr, als du auf Dauer tragen möchtest.
 *
 * Beides lässt sich hier ändern, und der Satz an einem einzelnen Produkt
 * lässt sich in lib/digital.ts übersteuern (siehe `provision` dort).
 *
 * ▸ ACHTUNG BEIM ÄNDERN: Der Satz wird bei jedem Verkauf in die
 *   Provisionszeile geschrieben. Änderst du ihn hier, gilt der neue Satz nur
 *   für neue Verkäufe. Alte Zeilen behalten ihren Satz, und das ist richtig
 *   so: Es war die Vereinbarung von damals.
 */
export const SCHWELLE = 10_000;
export const SATZ_KLEIN = 20;
export const SATZ_GROSS = 10;

/**
 * ▸ DIE SCHUTZFRIST IN TAGEN
 *
 * So lange steht eine Provision als "offen" im Konto, bevor sie ausgezahlt
 * werden darf. Erstattest du den Kauf in dieser Zeit, kostet er dich keine
 * Provision. Warum das wichtig ist, steht in
 * datenbank/empfehlungsprogramm.sql bei `faellig_ab`.
 */
export const FRIST_TAGE = 14;

/**
 * ▸ AB WELCHER SUMME AUSGEZAHLT WIRD, in Cent.
 *
 * Unter diesem Betrag bleibt die Provision stehen und wächst weiter. Sonst
 * überweist du für 2,18 € und zahlst die Zeit dafür aus der eigenen Tasche.
 * Dieselbe Grenze setzt Biohof Elmengrund bei dir an, dort sind es 50 €.
 */
export const MINDESTAUSZAHLUNG = 5_000;

/**
 * ▸ WIE LANGE DER KEKS LIEGEN BLEIBT, in Sekunden.
 *
 * 30 Tage. Wer über einen Empfehlungslink kommt und erst drei Wochen später
 * kauft, zählt also noch. Das ist im Handel üblich und großzügiger als die
 * 24 Stunden, die manche Programme geben.
 */
export const KEKS_DAUER = 60 * 60 * 24 * 30;

export const KEKS_NAME = "pfh_empfehlung";

/**
 * Darf für dieses Angebot geworben werden?
 *
 * ▸ WARUM DAS NICHT DASSELBE IST WIE "gibt es im Katalog"
 *   Drei Dinge müssen zusammenkommen, und jedes einzelne wäre ohne diese
 *   Prüfung ein Ärgernis:
 *
 *   1. Es darf gerade verkauft werden. Die Ausbildung startet erst am
 *      01.10.2026, weil die Zulassung der ZFU noch aussteht, und die Kasse
 *      weist einen Kauf davor ab. Stünde sie trotzdem in der Liste, schickte
 *      eine Empfehlerin ihre Leute gegen eine verschlossene Tür, und die
 *      Provision, die daneben steht, gäbe es nie.
 *   2. Es ist nicht versteckt. Versteckte Angebote sind Zusatzmodule, die
 *      ohne ihr Hauptprodukt keinen Sinn ergeben.
 *   3. Es ist nicht vom Programm ausgenommen.
 *
 * ▸ Der Vorteil dieser Prüfung: Am 01.10.2026 steht die Ausbildung von selbst
 *   in jeder Liste, ohne dass jemand daran denken muss.
 */
export function empfehlbar(produkt: DigitalProdukt, jetzt = new Date()): boolean {
  if (produkt.versteckt || produkt.keineProvision) return false;

  if (produkt.verkaufAb && jetzt < new Date(`${produkt.verkaufAb}T00:00:00+02:00`)) {
    return false;
  }

  if (produkt.verkaufBis && jetzt > new Date(`${produkt.verkaufBis}T23:59:59+02:00`)) {
    return false;
  }

  return true;
}

/** Der Satz für ein Produkt, in Prozent. */
export function provisionssatz(produkt: DigitalProdukt): number {
  if (produkt.keineProvision) return 0;

  // Ein eigener Satz am Produkt schlägt die Staffel. Gedacht für den Fall,
  // dass du mit jemandem einmal etwas anderes vereinbarst.
  if (typeof produkt.provision === "number") return produkt.provision;

  return produkt.preis < SCHWELLE ? SATZ_KLEIN : SATZ_GROSS;
}

/**
 * Rechnet aus einem Bruttobetrag den Nettobetrag, also ohne Umsatzsteuer.
 *
 * Aus 2900 Cent bei 19 % werden 2437 Cent. Gerundet wird kaufmännisch, wie
 * überall sonst auf dieser Website auch.
 */
export function netto(bruttoCent: number, mwst: number): number {
  return Math.round(bruttoCent / (1 + mwst / 100));
}

/**
 * Die Provision auf einen Verkauf, in Cent.
 *
 * ▸ Grundlage ist immer der Nettobetrag, nicht der Bruttobetrag. Ausführlich
 *   begründet in datenbank/empfehlungsprogramm.sql.
 * ▸ Grundlage ist außerdem der tatsächlich gezahlte Betrag, also nach Abzug
 *   eines Rabattcodes. Wer mit deinem Fellwechselrabatt kauft, bringt eben
 *   weniger ein, und die Provision sinkt entsprechend mit. Andernfalls
 *   könntest du in eine Aktion laufen, bei der die Provision höher ist als
 *   das, was von dem Verkauf bei dir hängen bleibt.
 */
export function provisionBetrag(
  bezahltCent: number,
  mwst: number,
  satz: number,
): number {
  return Math.round((netto(bezahltCent, mwst) * satz) / 100);
}

/**
 * Macht aus einer Eingabe einen brauchbaren Code.
 *
 * Erlaubt sind Buchstaben und Ziffern, alles andere fliegt raus. Umlaute
 * werden umgeschrieben, weil der Code in einer Internetadresse steht und
 * ein „ü“ dort als Zeichensalat ankommt. Aus „Müller-Lüdenscheid“ wird
 * also MUELLERLUEDENSCHEID.
 */
export function codeSaeubern(eingabe: string): string {
  return eingabe
    .trim()
    .toUpperCase()
    .replace(/Ä/g, "AE")
    .replace(/Ö/g, "OE")
    .replace(/Ü/g, "UE")
    .replace(/ß/gi, "SS")
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 24);
}

/** Sagt, ob ein Code brauchbar ist. */
export function codeTaugt(code: string): boolean {
  return /^[A-Z0-9]{3,24}$/.test(code);
}

/**
 * ▸ ANGEBOTE, DEREN VERKAUFSSEITE ANDERS HEISST ALS SIE SELBST.
 *
 * Normalerweise liegt die Seite zu einem Angebot unter seinem eigenen Namen:
 * ratiopro liegt unter /ratiopro. Es gibt aber Ausnahmen, und ein Link auf
 * eine Seite, die es nicht gibt, wäre das Schlimmste, was man einer
 * Empfehlerin mitgeben kann: Sie teilt ihn in gutem Glauben, und wer darauf
 * klickt, landet auf einer Fehlerseite.
 *
 * Deshalb steht hier, wo es abweicht:
 * - `equidesk-abo` ist der Monatszugang. Beworben wird er auf /equidesk,
 *   eine eigene Seite gibt es nicht.
 *
 * ▸ WER EIN ANGEBOT OHNE EIGENE SEITE HINZUFÜGT, trägt es hier ein.
 *   Vergisst man es, zeigt der Link ins Leere, und niemand merkt es, weil
 *   die Seite selbst weiterhin einwandfrei aussieht.
 */
const ANDERE_SEITE: Record<string, string> = {
  "equidesk-abo": "equidesk",
};

/** Unter welchem Namen die Verkaufsseite eines Angebots liegt. */
export function zielseite(slug: string): string {
  return ANDERE_SEITE[slug] ?? slug;
}

/** Der persönliche Link einer Empfehlerin.
 *
 *  ▸ DIE ADRESSE STEHT HIER FEST und wird nicht aus der Umgebung gelesen wie
 *    sonst auf dieser Website. Grund: Dieser Link geht in Mails, in
 *    Instagram-Bios und auf Zettel. Käme dort einmal eine Vorschauadresse
 *    von Vercel oder gar localhost heraus, wäre er dauerhaft kaputt, und
 *    zwar an Stellen, an denen ihn niemand mehr ändern kann. */
export function empfehlungslink(code: string, ziel?: string): string {
  const link = `https://www.pferdeliebehealthy.de/e/${code}`;

  // Ohne Ziel landet sie auf der Startseite. Mit Ziel direkt auf der
  // Verkaufsseite, zum Beispiel /e/MARIE?zu=ratiopro
  return ziel ? `${link}?zu=${zielseite(ziel)}` : link;
}

// ---------------------------------------------------------------------------
// Die Zeilen, wie sie aus der Datenbank kommen
// ---------------------------------------------------------------------------

export type EmpfehlerStatus = "angefragt" | "aktiv" | "gesperrt";

export type Empfehler = {
  id: string;
  angelegt_am: string;
  code: string;
  vorname: string;
  nachname: string;
  email: string;
  status: EmpfehlerStatus;
  freigeschaltet_am: string | null;
  gesperrt_am: string | null;
  kanal: string;
  zahlweg: string;
  unternehmerin: boolean;
  steuernummer: string;
  token: string;
  klicks: number;
  notiz: string | null;
};

export type ProvisionStatus = "offen" | "faellig" | "ausgezahlt" | "storniert";

export type Provision = {
  id: string;
  angelegt_am: string;
  empfehler_id: string;
  bestellnummer: string;
  produkt_slug: string;
  produkt_name: string;
  umsatz_brutto: number;
  umsatz_netto: number;
  satz: number;
  betrag_cent: number;
  status: ProvisionStatus;
  faellig_ab: string;
  auszahlung_id: string | null;
  hinweis: string | null;
};

export type Auszahlung = {
  id: string;
  angelegt_am: string;
  empfehler_id: string;
  betrag_cent: number;
  anzahl: number;
  weg: string;
  gutschriftnummer: string | null;
  notiz: string | null;
};

/**
 * Der Stand eines Kontos: was noch in der Frist steht, was ausgezahlt werden
 * darf und was schon geflossen ist.
 *
 * ▸ WARUM DAS HIER GERECHNET WIRD UND NICHT IN DER DATENBANK
 *   Weil eine Provision von selbst fällig wird, wenn ihr Tag gekommen ist.
 *   Stünde der Übergang von "offen" auf "faellig" in der Datenbank, bräuchte
 *   es einen Dienst, der jede Nacht nachsieht. So gibt es nichts, was
 *   ausfallen kann: Der Stand ergibt sich aus dem Datum.
 */
export function kontostand(provisionen: Provision[]) {
  const jetzt = Date.now();

  let inFrist = 0;
  let auszahlbar = 0;
  let ausgezahlt = 0;
  let storniert = 0;
  let verkaeufe = 0;

  for (const p of provisionen) {
    if (p.status === "storniert") {
      storniert += p.betrag_cent;
      continue;
    }

    verkaeufe += 1;

    if (p.status === "ausgezahlt") {
      ausgezahlt += p.betrag_cent;
    } else if (new Date(p.faellig_ab).getTime() > jetzt) {
      inFrist += p.betrag_cent;
    } else {
      auszahlbar += p.betrag_cent;
    }
  }

  return {
    inFrist,
    auszahlbar,
    ausgezahlt,
    storniert,
    verkaeufe,
    /** Alles, was noch nicht bei ihr ist. */
    offenGesamt: inFrist + auszahlbar,
    /** Darf jetzt überwiesen werden? */
    reif: auszahlbar >= MINDESTAUSZAHLUNG,
  };
}
