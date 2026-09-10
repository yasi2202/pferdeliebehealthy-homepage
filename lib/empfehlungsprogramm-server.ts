import { randomUUID } from "node:crypto";
import { digitalFinden } from "@/lib/digital";
import { preisText } from "@/lib/shop";
import {
  empfehlungslink,
  kontostand,
  provisionBetrag,
  provisionssatz,
  netto,
  FRIST_TAGE,
  MINDESTAUSZAHLUNG,
  type Empfehler,
  type Provision,
} from "@/lib/empfehlungsprogramm";
import {
  supabase,
  supabaseAlle,
  ersteZeile,
  sendeMail,
  esc,
  rahmen,
  knopf,
  anrede,
  ANTWORT_AN,
} from "@/lib/versand";

// ---------------------------------------------------------------------------
// Das Empfehlungsprogramm: alles, was mit der Datenbank spricht.
//
// Diese Datei gehört ausschliesslich auf den Server. Importiere sie nur aus
// Route-Handlern und Serverseiten, nie aus einer Datei mit "use client".
// Die Regeln und das Rechnen stehen in lib/empfehlungsprogramm.ts, die darf
// überall benutzt werden.
//
// ▸ DER WICHTIGSTE GRUNDSATZ HIER: Eine Provision entsteht nur einmal.
//   Die Sperre dafür sitzt nicht in diesem Programm, sondern in der
//   Datenbank: `bestellnummer` ist dort einmalig. Stripe meldet einen Kauf
//   gelegentlich zweimal, und dann lehnt die Datenbank die zweite Zeile ab.
//   Verlass dich beim Ändern nie darauf, dass hier vorher geprüft wird.
// ---------------------------------------------------------------------------

/** Der Schlüssel für das eigene Konto unter /weiterempfehlen/konto. */
export function empfehlungsToken(): string {
  return randomUUID().replace(/-/g, "") + randomUUID().replace(/-/g, "");
}

// ---------------------------------------------------------------------------
// Nachschlagen
// ---------------------------------------------------------------------------

/** Die Empfehlerin zu einem Code, egal ob groß oder klein geschrieben.
 *
 *  ▸ Kommt auch dann zurück, wenn sie gesperrt ist oder noch wartet. Ob ein
 *    Verkauf zählt, entscheidet `provisionGutschreiben`, nicht diese
 *    Funktion. So kannst du an anderer Stelle unterscheiden zwischen "den
 *    Code gibt es nicht" und "den Code gibt es, er ist aber stillgelegt". */
export async function empfehlerZuCode(code: string): Promise<Empfehler | null> {
  const sauber = code.trim().toUpperCase();
  if (!sauber) return null;

  // ilike statt eq: Der Code steht in der Adresse und wird dort oft klein
  // geschrieben. Der eindeutige Index in der Datenbank sorgt dafür, dass es
  // trotzdem immer höchstens einen Treffer gibt.
  return ersteZeile<Empfehler>(
    `empfehler?code=ilike.${encodeURIComponent(sauber)}&select=*&limit=1`,
  );
}

export async function empfehlerZuToken(token: string): Promise<Empfehler | null> {
  if (!token || token.length < 20) return null;

  return ersteZeile<Empfehler>(
    `empfehler?token=eq.${encodeURIComponent(token)}&select=*&limit=1`,
  );
}

export async function empfehlerZuEmail(email: string): Promise<Empfehler | null> {
  return ersteZeile<Empfehler>(
    `empfehler?email=ilike.${encodeURIComponent(email.trim())}&select=*&limit=1`,
  );
}

export async function empfehlerAlle(): Promise<Empfehler[]> {
  return (
    (await supabaseAlle<Empfehler>("empfehler?select=*&order=angelegt_am.desc")) ??
    []
  );
}

export async function provisionenZu(empfehlerId: string): Promise<Provision[]> {
  return (
    (await supabaseAlle<Provision>(
      `provisionen?empfehler_id=eq.${empfehlerId}&select=*&order=angelegt_am.desc`,
    )) ?? []
  );
}

export async function provisionenAlle(): Promise<Provision[]> {
  return (
    (await supabaseAlle<Provision>(
      "provisionen?select=*&order=angelegt_am.desc",
    )) ?? []
  );
}

// ---------------------------------------------------------------------------
// Anmelden und Freischalten
// ---------------------------------------------------------------------------

/** Trägt eine Bewerbung ein. Der Status ist immer 'angefragt', freigeschaltet
 *  wird ausschliesslich von Hand unter /admin/empfehler. */
export async function empfehlerAnlegen(opt: {
  code: string;
  vorname: string;
  nachname: string;
  email: string;
  kanal: string;
  zahlweg: string;
  unternehmerin: boolean;
  steuernummer: string;
}): Promise<Empfehler | null> {
  const res = await supabase("empfehler", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      ...opt,
      code: opt.code.toUpperCase(),
      status: "angefragt",
      token: empfehlungsToken(),
    }),
  });

  if (!res.ok) {
    console.error("Empfehler liess sich nicht anlegen:", await res.text());
    return null;
  }

  const zeilen = await res.json();
  return Array.isArray(zeilen) && zeilen.length > 0 ? zeilen[0] : null;
}

/** Ändert den Status. Schreibt zugleich den Zeitpunkt mit, damit du später
 *  siehst, wann jemand dazukam oder ausschied. */
export async function empfehlerStatusSetzen(
  id: string,
  status: "aktiv" | "gesperrt" | "angefragt",
): Promise<boolean> {
  const jetzt = new Date().toISOString();

  const felder: Record<string, unknown> = { status };

  if (status === "aktiv") {
    felder.freigeschaltet_am = jetzt;
    felder.gesperrt_am = null;
  } else if (status === "gesperrt") {
    felder.gesperrt_am = jetzt;
  }

  // ▸ Gefiltert wird über die id und nur über die id. Ein Filter auf ein
  //   anderes Feld könnte mehrere Zeilen treffen und stillschweigend fremde
  //   Einträge mit überschreiben.
  const res = await supabase(`empfehler?id=eq.${id}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(felder),
  });

  return res.ok;
}

export async function empfehlerNotizSetzen(
  id: string,
  notiz: string,
): Promise<boolean> {
  const res = await supabase(`empfehler?id=eq.${id}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ notiz }),
  });

  return res.ok;
}

/** Zählt einen Klick auf den persönlichen Link.
 *
 *  ▸ WARUM HIER GELESEN UND DANN GESCHRIEBEN WIRD, obwohl dabei theoretisch
 *    ein Klick verlorengehen kann, wenn zwei Menschen im selben Augenblick
 *    klicken: Weil es hier um eine Anzeige geht und nicht um Geld. Ein Klick
 *    mehr oder weniger ändert nichts an einer Auszahlung. Bei den
 *    Provisionen selbst wäre dieser Weg falsch, und dort steht er auch nicht.
 *
 *  ▸ Fehler werden verschluckt: Ein Zählerproblem darf niemals dazu führen,
 *    dass die Besucherin nicht auf der Seite landet, für die sie geklickt hat. */
export async function klickZaehlen(empfehler: Empfehler): Promise<void> {
  try {
    await supabase(`empfehler?id=eq.${empfehler.id}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ klicks: (empfehler.klicks ?? 0) + 1 }),
    });
  } catch (fehler) {
    console.error("Klick liess sich nicht zählen:", fehler);
  }
}

// ---------------------------------------------------------------------------
// Die Provision
// ---------------------------------------------------------------------------

/**
 * Schreibt einem Verkauf seine Provision gut.
 *
 * Wird von `nachDerZahlung` aufgerufen, also erst, wenn das Geld da ist.
 * Gibt zurück, was passiert ist, damit die aufrufende Stelle es ins
 * Protokoll schreiben kann.
 *
 * ▸ WAS ALLES DAZU FÜHRT, DASS ES KEINE PROVISION GIBT, und warum das jedes
 *   Mal richtig ist:
 *   - Kein Code an der Bestellung: Die Käuferin kam nicht über eine
 *     Empfehlung.
 *   - Den Code gibt es nicht mehr: Vertippt oder gelöscht.
 *   - Die Empfehlerin ist nicht 'aktiv': Sie wartet noch auf dich oder ist
 *     gesperrt. Ein Link, der vor der Freischaltung geteilt wurde, soll
 *     nicht rückwirkend Geld kosten.
 *   - Die Käuferin ist die Empfehlerin selbst: Provision auf den eigenen
 *     Kauf ist ein verdeckter Rabatt, und zwar einer, den du nicht angeboten
 *     hast. Erkannt wird das an der Mailadresse.
 *   - Das Produkt ist ausgenommen (`keineProvision` in lib/digital.ts).
 *
 * ▸ BEI EINEM ABO ENTSTEHT DIE PROVISION NUR EINMAL, auf den ersten Monat.
 *   Das ist keine Entscheidung dieser Funktion, sondern ergibt sich daraus,
 *   wann sie aufgerufen wird: `nachDerZahlung` läuft beim Abschluss, nicht
 *   bei jeder Folgebuchung. Beim EquiDesk-Abo für 19 € im Monat sind das
 *   rund 3 €, einmalig. Ob das genug Anreiz ist, wird sich zeigen; wenn
 *   nicht, ist der Weg dorthin ein eigener `provision`-Satz an diesem
 *   Produkt und nicht etwa eine Provision auf jede Monatsbuchung. Die wäre
 *   eine Dauerverpflichtung, die niemand mehr überblickt.
 *   So steht es auch in den Teilnahmebedingungen, Ziffer 3.
 */
export async function provisionGutschreiben(bestellung: {
  nummer: string;
  email: string;
  empfehler_code?: string | null;
  artikel: { slug: string; name: string; mwst: number }[];
  gesamt: number;
}): Promise<string | null> {
  const code = (bestellung.empfehler_code ?? "").trim();
  if (!code) return null;

  const empfehler = await empfehlerZuCode(code);

  if (!empfehler) {
    return `Der Empfehlungscode ${code} steht an der Bestellung, es gibt ihn aber nicht.`;
  }

  if (empfehler.status !== "aktiv") {
    return `${empfehler.code} ist nicht aktiv (${empfehler.status}), keine Provision.`;
  }

  if (
    empfehler.email.trim().toLowerCase() === bestellung.email.trim().toLowerCase()
  ) {
    return `${empfehler.code} hat auf die eigene Adresse gekauft, keine Provision.`;
  }

  const artikel = bestellung.artikel[0];
  const produkt = digitalFinden(artikel?.slug ?? "");

  if (!produkt) {
    return `Das Produkt ${artikel?.slug} steht nicht mehr im Katalog, keine Provision.`;
  }

  const satz = provisionssatz(produkt);

  if (satz <= 0) {
    return `Für ${produkt.kurzname} gibt es keine Provision.`;
  }

  const betrag = provisionBetrag(bestellung.gesamt, produkt.mwst, satz);

  const frist = new Date();
  frist.setDate(frist.getDate() + FRIST_TAGE);

  const res = await supabase("provisionen", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      empfehler_id: empfehler.id,
      bestellnummer: bestellung.nummer,
      produkt_slug: produkt.slug,
      produkt_name: produkt.kurzname,
      umsatz_brutto: bestellung.gesamt,
      umsatz_netto: netto(bestellung.gesamt, produkt.mwst),
      satz,
      betrag_cent: betrag,
      status: "offen",
      faellig_ab: frist.toISOString(),
    }),
  });

  if (!res.ok) {
    const text = await res.text();

    // 23505 ist der Fehler "gibt es schon". Er bedeutet hier: Stripe hat den
    // Kauf zweimal gemeldet, die Provision steht längst im Buch. Das ist kein
    // Fehler, sondern genau das, wogegen die Sperre gebaut wurde.
    if (text.includes("23505")) {
      return null;
    }

    console.error("Provision liess sich nicht anlegen:", text);
    return `Die Provision für ${empfehler.code} liess sich nicht speichern.`;
  }

  // Die Mail darf den Ablauf nicht aufhalten. Kommt sie nicht an, steht die
  // Provision trotzdem im Konto und die Empfehlerin sieht sie dort.
  await verkaufMelden(empfehler, produkt.kurzname, betrag);

  return null;
}

/** Nimmt eine Provision wieder zurück, wenn ein Kauf erstattet wurde. */
export async function provisionStornieren(
  bestellnummer: string,
  grund: string,
): Promise<boolean> {
  const res = await supabase(
    `provisionen?bestellnummer=eq.${encodeURIComponent(bestellnummer)}&status=neq.ausgezahlt`,
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ status: "storniert", hinweis: grund }),
    },
  );

  return res.ok;
}

// ---------------------------------------------------------------------------
// Die Auszahlung
// ---------------------------------------------------------------------------

/**
 * Bucht alle fälligen Provisionen einer Empfehlerin als ausgezahlt.
 *
 * ▸ WAS DIESE FUNKTION NICHT TUT: Geld überweisen. Das machst du selbst, per
 *   PayPal oder Banküberweisung. Hier wird nur festgehalten, dass es
 *   passiert ist, und die Gutschrift dafür angelegt.
 *
 * ▸ DIE REIHENFOLGE IST ABSICHT: Erst die Auszahlung anlegen, dann die
 *   Provisionen daran hängen. Bricht es dazwischen ab, steht eine Auszahlung
 *   ohne Provisionen im Buch, und das siehst du sofort. Andersherum stünden
 *   Provisionen auf "ausgezahlt", ohne dass es einen Beleg dafür gäbe, und
 *   das würdest du nie bemerken.
 */
export async function auszahlungBuchen(opt: {
  empfehler: Empfehler;
  weg: string;
  notiz?: string;
}): Promise<{ betrag: number; anzahl: number; nummer: string } | { fehler: string }> {
  const alle = await provisionenZu(opt.empfehler.id);
  const jetzt = Date.now();

  const faellig = alle.filter(
    (p) =>
      p.status !== "ausgezahlt" &&
      p.status !== "storniert" &&
      new Date(p.faellig_ab).getTime() <= jetzt,
  );

  if (faellig.length === 0) {
    return { fehler: "Es ist gerade nichts fällig." };
  }

  const betrag = faellig.reduce((summe, p) => summe + p.betrag_cent, 0);

  const res = await supabase("provisionsauszahlungen", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      empfehler_id: opt.empfehler.id,
      betrag_cent: betrag,
      anzahl: faellig.length,
      weg: opt.weg,
      notiz: opt.notiz ?? null,
    }),
  });

  if (!res.ok) {
    console.error("Auszahlung liess sich nicht anlegen:", await res.text());
    return { fehler: "Die Auszahlung liess sich nicht speichern." };
  }

  const zeilen = await res.json();
  const auszahlung = Array.isArray(zeilen) ? zeilen[0] : null;

  if (!auszahlung) {
    return { fehler: "Die Auszahlung kam ohne Nummer zurück." };
  }

  const ids = faellig.map((p) => p.id).join(",");

  const nach = await supabase(`provisionen?id=in.(${ids})`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      status: "ausgezahlt",
      auszahlung_id: auszahlung.id,
    }),
  });

  if (!nach.ok) {
    console.error("Provisionen liessen sich nicht abhaken:", await nach.text());
    return {
      fehler:
        `Die Auszahlung ${auszahlung.gutschriftnummer} steht im Buch, die ` +
        `einzelnen Provisionen liessen sich aber nicht abhaken. Bitte in ` +
        `Supabase nachsehen, bevor du ein zweites Mal überweist.`,
    };
  }

  await auszahlungMelden(opt.empfehler, {
    betrag,
    anzahl: faellig.length,
    nummer: auszahlung.gutschriftnummer,
    posten: faellig,
  });

  return {
    betrag,
    anzahl: faellig.length,
    nummer: auszahlung.gutschriftnummer,
  };
}

// ---------------------------------------------------------------------------
// Die Mails
// ---------------------------------------------------------------------------

/** An dich: jemand möchte mitmachen. */
export async function bewerbungMelden(e: Empfehler): Promise<boolean> {
  const zeile = (was: string, wert: string) =>
    `<p style="margin:4px 0;font-size:15px;"><strong>${was}:</strong> ${esc(wert)}</p>`;

  return sendeMail(
    ANTWORT_AN,
    `Empfehlungsprogramm: ${e.vorname} ${e.nachname} möchte mitmachen`,
    rahmen(`
      <h2 style="font-size:20px;margin:0 0 16px;">Neue Bewerbung</h2>
      ${zeile("Name", `${e.vorname} ${e.nachname}`)}
      ${zeile("Mail", e.email)}
      ${zeile("Wunschcode", e.code)}
      ${zeile("Wo sie empfiehlt", e.kanal || "keine Angabe")}
      ${zeile("Auszahlung an", e.zahlweg || "keine Angabe")}
      ${zeile(
        "Steuerlich",
        e.unternehmerin
          ? `selbstständig${e.steuernummer ? `, ${e.steuernummer}` : ""}`
          : "Privatperson, siehe Hinweis unten",
      )}
      ${
        e.unternehmerin
          ? ""
          : `<p style="font-size:14px;color:#8a7070;background:#F9EDED;padding:12px 14px;border-radius:10px;margin:16px 0;">
               Sie hat angegeben, keine Selbstständige zu sein. Provision ist
               trotzdem Einkommen, und du brauchst für die Auszahlung einen
               Beleg. Kläre das, bevor du freischaltest.
             </p>`
      }
      ${knopf("https://www.pferdeliebehealthy.de/admin/empfehler", "Ansehen und entscheiden")}
    `),
  );
}

/** An die Empfehlerin: du bist dabei, hier ist dein Link. */
export async function freischaltungMelden(e: Empfehler): Promise<boolean> {
  const link = empfehlungslink(e.code);

  return sendeMail(
    e.email,
    "Du bist dabei: dein Empfehlungslink",
    rahmen(`
      <h2 style="font-size:20px;margin:0 0 16px;">Willkommen im Empfehlungsprogramm</h2>

      <p style="font-size:16px;line-height:1.6;">${anrede(e.vorname)}</p>

      <p style="font-size:16px;line-height:1.6;">
        ich habe dich freigeschaltet. Ab sofort zählt jeder Kauf, der über
        deinen Link zustande kommt.
      </p>

      <p style="font-size:16px;line-height:1.6;">Das ist dein Link:</p>

      <p style="font-size:17px;background:#F9EDED;padding:14px 16px;border-radius:10px;word-break:break-all;">
        <strong>${esc(link)}</strong>
      </p>

      <p style="font-size:16px;line-height:1.6;">
        Du kannst ihn überall hinsetzen, wo du magst: in deine Instagram-Bio,
        in eine Story, in eine Nachricht an eine Stallfreundin. Wer darauf
        klickt, zahlt den normalen Preis, es gibt also nichts zu erklären.
      </p>

      <p style="font-size:16px;line-height:1.6;">
        Möchtest du direkt auf ein bestimmtes Angebot verweisen, hängst du es
        hinten an, zum Beispiel <strong>${esc(link)}?zu=ratiopro</strong>
      </p>

      <p style="font-size:16px;line-height:1.6;">
        Deinen Stand siehst du jederzeit hier, ohne Passwort. Speicher dir den
        Link am besten ab.
      </p>

      ${knopf(
        `https://www.pferdeliebehealthy.de/weiterempfehlen/konto?k=${e.token}`,
        "Mein Empfehlungskonto",
      )}

      <p style="font-size:16px;line-height:1.6;">
        Ein Hinweis, der sein muss: Wenn du meine Angebote empfiehlst und
        dafür Geld bekommst, ist das Werbung, und die muss gekennzeichnet
        sein. Ein "Werbung" oder "Anzeige" gut sichtbar am Beitrag genügt.
        Alles Weitere steht in den Teilnahmebedingungen.
      </p>

      <p style="font-size:16px;line-height:1.6;">Danke, dass du mich weiterempfiehlst.<br>Yasemin</p>
    `),
  );
}

/** An die Empfehlerin: du hast etwas verkauft. */
async function verkaufMelden(
  e: Empfehler,
  produkt: string,
  betrag: number,
): Promise<boolean> {
  return sendeMail(
    e.email,
    `Deine Empfehlung hat geklappt: ${preisText(betrag)}`,
    rahmen(`
      <h2 style="font-size:20px;margin:0 0 16px;">Jemand hat über dich gekauft</h2>

      <p style="font-size:16px;line-height:1.6;">${anrede(e.vorname)}</p>

      <p style="font-size:16px;line-height:1.6;">
        über deinen Link wurde gerade <strong>${esc(produkt)}</strong>
        gekauft. Deine Provision dafür beträgt
        <strong>${preisText(betrag)}</strong>.
      </p>

      <p style="font-size:16px;line-height:1.6;">
        Sie steht ab heute in deinem Konto und ist in ${FRIST_TAGE} Tagen
        auszahlbar. Diese Frist gibt es, weil ein Kauf in dieser Zeit noch
        erstattet werden kann. Ausgezahlt wird ab
        ${preisText(MINDESTAUSZAHLUNG)}.
      </p>

      ${knopf(
        `https://www.pferdeliebehealthy.de/weiterempfehlen/konto?k=${e.token}`,
        "Mein Empfehlungskonto",
      )}

      <p style="font-size:16px;line-height:1.6;">Danke dir.<br>Yasemin</p>
    `),
  );
}

/** An die Empfehlerin: das Geld ist unterwegs, hier ist die Gutschrift. */
async function auszahlungMelden(
  e: Empfehler,
  opt: {
    betrag: number;
    anzahl: number;
    nummer: string | null;
    posten: Provision[];
  },
): Promise<boolean> {
  const zeilen = opt.posten
    .map(
      (p) =>
        `<tr>
           <td style="padding:6px 10px 6px 0;font-size:14px;">${esc(p.produkt_name)}</td>
           <td style="padding:6px 10px 6px 0;font-size:14px;color:#8a7070;">${new Date(
             p.angelegt_am,
           ).toLocaleDateString("de-DE")}</td>
           <td style="padding:6px 0;font-size:14px;text-align:right;">${preisText(
             p.betrag_cent,
           )}</td>
         </tr>`,
    )
    .join("");

  return sendeMail(
    e.email,
    `Deine Provision ist unterwegs: ${preisText(opt.betrag)}`,
    rahmen(`
      <h2 style="font-size:20px;margin:0 0 16px;">Gutschrift ${esc(opt.nummer ?? "")}</h2>

      <p style="font-size:16px;line-height:1.6;">${anrede(e.vorname)}</p>

      <p style="font-size:16px;line-height:1.6;">
        ich habe dir <strong>${preisText(opt.betrag)}</strong> für
        ${opt.anzahl} vermittelte ${opt.anzahl === 1 ? "Bestellung" : "Bestellungen"}
        überwiesen, an ${esc(e.zahlweg || "den vereinbarten Weg")}.
      </p>

      <table style="width:100%;border-collapse:collapse;margin:20px 0;border-top:1px solid #EAD8D8;border-bottom:1px solid #EAD8D8;">
        ${zeilen}
      </table>

      <p style="font-size:14px;color:#8a7070;line-height:1.6;">
        Diese Mail ist deine Gutschrift im Sinne des § 14 Abs. 2 UStG. Der
        Betrag versteht sich ohne Umsatzsteuer. Bist du umsatzsteuerpflichtig,
        sag mir bitte Bescheid, dann stelle ich die Gutschrift um. Widersprich
        mir bitte, wenn etwas nicht stimmt.
      </p>

      <p style="font-size:16px;line-height:1.6;">Danke für deine Empfehlungen.<br>Yasemin</p>
    `),
  );
}

/** Schickt der Empfehlerin ihren Kontolink noch einmal zu.
 *
 *  ▸ WARUM DIE ANTWORT IMMER GLEICH AUSSIEHT, egal ob es die Adresse gibt:
 *    Sonst könnte jeder durch Ausprobieren herausfinden, wer bei dir im
 *    Programm ist. Das ist dieselbe Regel wie bei jedem
 *    Passwort-vergessen-Formular. */
export async function kontolinkSenden(email: string): Promise<void> {
  const e = await empfehlerZuEmail(email);
  if (!e || e.status === "gesperrt") return;

  const stand = kontostand(await provisionenZu(e.id));

  await sendeMail(
    e.email,
    "Dein Empfehlungskonto",
    rahmen(`
      <p style="font-size:16px;line-height:1.6;">${anrede(e.vorname)}</p>

      <p style="font-size:16px;line-height:1.6;">
        hier ist der Link zu deinem Konto. Er gilt dauerhaft, du kannst ihn
        dir abspeichern.
      </p>

      ${knopf(
        `https://www.pferdeliebehealthy.de/weiterempfehlen/konto?k=${e.token}`,
        "Mein Empfehlungskonto",
      )}

      ${
        e.status === "aktiv"
          ? `<p style="font-size:16px;line-height:1.6;">
               Dein Link zum Teilen: <strong>${esc(empfehlungslink(e.code))}</strong><br>
               Offen für dich: <strong>${preisText(stand.offenGesamt)}</strong>
             </p>`
          : `<p style="font-size:16px;line-height:1.6;">
               Deine Bewerbung liegt mir vor, ich sehe sie mir an und melde
               mich. Solange zählt dein Link noch nicht.
             </p>`
      }

      <p style="font-size:16px;line-height:1.6;">Liebe Grüße<br>Yasemin</p>
    `),
  );
}
