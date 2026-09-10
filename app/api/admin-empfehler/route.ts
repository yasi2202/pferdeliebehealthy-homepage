import { istAngemeldet } from "@/lib/admin-zugang";
import { ersteZeile, kuerzen } from "@/lib/versand";
import {
  auszahlungBuchen,
  empfehlerNotizSetzen,
  empfehlerStatusSetzen,
  freischaltungMelden,
  provisionStornieren,
} from "@/lib/empfehlungsprogramm-server";
import type { Empfehler } from "@/lib/empfehlungsprogramm";

// ---------------------------------------------------------------------------
// Empfehlerinnen freischalten, sperren und auszahlen.
//
// ▸ JEDE ANFRAGE PRÜFT DIE ANMELDUNG ZUERST. Eine Route, die Daten ändert,
//   darf sich nicht darauf verlassen, dass die Seite davor schon geprüft
//   hat. Wer die Adresse kennt, kann sie direkt aufrufen. Hier geht es um
//   Geld, also gilt das doppelt.
//
// ▸ HIER WIRD NICHTS GELÖSCHT. Eine Empfehlerin, die aufhört, wird gesperrt.
//   Ihre Provisionszeilen sind Belege für Betriebsausgaben und müssen zehn
//   Jahre auffindbar bleiben.
// ---------------------------------------------------------------------------

export const runtime = "nodejs";

async function gesperrt() {
  return Response.json({ fehler: "Nicht angemeldet." }, { status: 401 });
}

/** Holt eine Empfehlerin über die id. */
async function empfehlerZuId(id: string): Promise<Empfehler | null> {
  return ersteZeile<Empfehler>(
    `empfehler?id=eq.${encodeURIComponent(id)}&select=*&limit=1`,
  );
}

export async function POST(request: Request) {
  if (!(await istAngemeldet())) return gesperrt();

  let daten: Record<string, unknown>;

  try {
    daten = await request.json();
  } catch {
    return Response.json({ fehler: "Ungültige Anfrage." }, { status: 400 });
  }

  // -------------------------------------------------------------------------
  // Eine Provision zurücknehmen, weil der Kauf erstattet wurde.
  //
  // ▸ WARUM DAS VON HAND GEHT UND NICHT AUTOMATISCH
  //   Die Website erfährt von einer Erstattung nichts. Der Stripe-Webhook
  //   hört auf zwei Meldungen, den abgeschlossenen Kauf und die gekündigte
  //   Zahlungsreihe, nicht auf Erstattungen. Erstattest du also über das
  //   Stripe-Dashboard, bleibt die Provision im Buch stehen.
  //
  //   Deshalb dieser Weg. Er greift bei jeder Art von Rückabwicklung, auch
  //   bei einer Rückbuchung durch die Bank und bei alten Käufen, und er
  //   braucht nichts als die Bestellnummer.
  //
  //   ▸ DAS IST DER OFFENSICHTLICHE AUSBAUPUNKT, wenn das Programm läuft:
  //     `payment_intent_data.metadata` beim Anlegen der Bezahlseite mitgeben
  //     und im Webhook auf `charge.refunded` hören. Solange kaum erstattet
  //     wird, ist der Knopf hier aber der ehrlichere Weg: Er versagt nie
  //     stillschweigend.
  //
  //   Steht die Provision schon auf "ausgezahlt", bleibt sie stehen. Was
  //   überwiesen ist, ist überwiesen, das holt man nicht zurück.
  // -------------------------------------------------------------------------

  if (daten.art === "stornieren") {
    const nummer = kuerzen(daten.bestellnummer, 40).toUpperCase();

    if (!nummer) {
      return Response.json(
        { fehler: "Welche Bestellnummer?" },
        { status: 400 },
      );
    }

    const grund =
      kuerzen(daten.grund, 200) || "Von Hand storniert, Kauf erstattet.";

    if (!(await provisionStornieren(nummer, grund))) {
      return Response.json(
        { fehler: "Das liess sich nicht stornieren." },
        { status: 502 },
      );
    }

    return Response.json({
      ok: true,
      hinweis:
        `Falls es zu ${nummer} eine noch nicht ausgezahlte Provision gab, ` +
        `ist sie jetzt storniert. War sie schon ausgezahlt, bleibt sie stehen.`,
    });
  }

  const id = kuerzen(daten.id, 40);

  if (!id) {
    return Response.json({ fehler: "Um wen geht es?" }, { status: 400 });
  }

  const empfehler = await empfehlerZuId(id);

  if (!empfehler) {
    return Response.json({ fehler: "Die kenne ich nicht." }, { status: 404 });
  }

  // -------------------------------------------------------------------------

  if (daten.art === "status") {
    const status = daten.status;

    if (status !== "aktiv" && status !== "gesperrt" && status !== "angefragt") {
      return Response.json({ fehler: "Welcher Stand?" }, { status: 400 });
    }

    if (!(await empfehlerStatusSetzen(id, status))) {
      return Response.json(
        { fehler: "Das liess sich nicht ändern." },
        { status: 502 },
      );
    }

    // ▸ DIE MAIL GEHT NUR BEIM ERSTEN FREISCHALTEN RAUS.
    //   Sonst bekäme jemand, der zwischendurch gesperrt und wieder
    //   freigeschaltet wurde, ein zweites Mal die Willkommensmail mit dem
    //   Satz "ich habe dich freigeschaltet". Erkennbar ist das daran, dass
    //   `freigeschaltet_am` vorher noch leer war.
    if (status === "aktiv" && !empfehler.freigeschaltet_am) {
      // Der frisch gesetzte Stand ist in `empfehler` noch nicht enthalten,
      // deshalb hier von Hand mitgegeben. Für die Mail zählt nur der Code
      // und der Schlüssel, und beide ändern sich nicht.
      if (!(await freischaltungMelden({ ...empfehler, status: "aktiv" }))) {
        return Response.json({
          ok: true,
          hinweis:
            `${empfehler.vorname} ist freigeschaltet, die Mail mit dem Link ` +
            `ging aber nicht raus. Schick ihr den Link bitte von Hand.`,
        });
      }
    }

    return Response.json({ ok: true });
  }

  // -------------------------------------------------------------------------

  if (daten.art === "notiz") {
    const notiz = kuerzen(daten.notiz, 600);

    if (!(await empfehlerNotizSetzen(id, notiz))) {
      return Response.json(
        { fehler: "Die Notiz liess sich nicht speichern." },
        { status: 502 },
      );
    }

    return Response.json({ ok: true });
  }

  // -------------------------------------------------------------------------

  if (daten.art === "auszahlen") {
    const ergebnis = await auszahlungBuchen({
      empfehler,
      weg: kuerzen(daten.weg, 40) || empfehler.zahlweg,
      notiz: kuerzen(daten.notiz, 300) || undefined,
    });

    if ("fehler" in ergebnis) {
      return Response.json({ fehler: ergebnis.fehler }, { status: 400 });
    }

    return Response.json({
      ok: true,
      hinweis:
        `${ergebnis.nummer} über ${(ergebnis.betrag / 100).toFixed(2)} € ist ` +
        `gebucht. Jetzt bitte tatsächlich überweisen an ` +
        `${empfehler.zahlweg}.`,
    });
  }

  return Response.json({ fehler: "Das kenne ich nicht." }, { status: 400 });
}
