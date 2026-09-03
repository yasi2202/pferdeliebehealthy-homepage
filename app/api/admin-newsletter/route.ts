import { istAngemeldet } from "@/lib/admin-zugang";
import { kuerzen } from "@/lib/versand";
import { seitenUrl } from "@/lib/seo";
import {
  briefAnlegen,
  briefHolen,
  briefSpeichern,
  briefLoeschen,
  briefVersenden,
  testmailSenden,
  newsletterAbmelden,
} from "@/lib/newsletter-server";
import { GRUPPEN, type GruppenSchluessel } from "@/lib/newsletter-gruppen";

// ---------------------------------------------------------------------------
// Die Steuerung des Newsletter-Programms: anlegen, speichern, Testmail,
// senden, löschen, jemanden von Hand abmelden.
//
// ▸ JEDE ANFRAGE PRÜFT DIE ANMELDUNG ZUERST. Eine Route, die Mails
//   verschickt, darf sich nicht darauf verlassen, dass die Seite davor schon
//   geprüft hat — wer die Adresse kennt, ruft sie direkt auf.
//
// ▸ WARUM DIE LINKS AUS `seitenUrl` KOMMEN und nicht aus der Adresse der
//   Anfrage: Rufst du den Adminbereich einmal über die Vercel-Adresse auf,
//   stünde diese in jedem Abmeldelink der Mail — und die Kundin landete auf
//   einer Adresse, die deine Seite gar nicht sein soll. `seitenUrl` ist
//   immer die richtige.
//
// ▸ MAXDURATION: Der Versand läuft in Bündeln zu hundert mit einer kurzen
//   Pause dazwischen. Ohne diese Zeile bräche Vercel nach zehn Sekunden
//   mitten im Verteiler ab, und niemand wüsste, wer die Mail schon hat.
// ---------------------------------------------------------------------------

export const runtime = "nodejs";
export const maxDuration = 60;

async function gesperrt() {
  return Response.json({ fehler: "Nicht angemeldet." }, { status: 401 });
}

export async function POST(request: Request) {
  if (!(await istAngemeldet())) return gesperrt();

  let daten: Record<string, unknown>;
  try {
    daten = await request.json();
  } catch {
    return Response.json({ fehler: "Ungültige Anfrage." }, { status: 400 });
  }

  const was = kuerzen(daten.was, 30);
  const id = kuerzen(daten.id, 60);

  switch (was) {
    // -----------------------------------------------------------------
    case "anlegen": {
      const brief = await briefAnlegen(kuerzen(daten.vorlage, 30) || "leer");
      if (!brief) {
        return Response.json(
          { fehler: "Der Entwurf liess sich nicht anlegen. Steht die Tabelle newsletter_briefe schon in Supabase?" },
          { status: 500 }
        );
      }
      return Response.json({ ok: true, id: brief.id });
    }

    // -----------------------------------------------------------------
    case "speichern": {
      // Nur bekannte Gruppen. Käme hier ein erfundener Wert durch, stünde
      // er am Brief, und der Versand fiele auf „alle" zurück — also auf
      // mehr Menschen, als gemeint waren.
      const gewaehlt = kuerzen(daten.gruppe, 30) as GruppenSchluessel;
      const gruppe = GRUPPEN.some((g) => g.schluessel === gewaehlt)
        ? gewaehlt
        : undefined;

      const gespeichert = await briefSpeichern(id, {
        gruppe,
        betreff: kuerzen(daten.betreff, 200),
        vorschautext: kuerzen(daten.vorschautext, 200),
        // Grosszügig bemessen: Ein langer Newsletter hat leicht 8.000
        // Zeichen, und ein abgeschnittener Text wäre der ärgerlichste
        // aller Datenverluste.
        inhalt: kuerzen(daten.inhalt, 60000),
      });

      if (!gespeichert) {
        return Response.json(
          { fehler: "Nicht gespeichert. Ein Newsletter, der schon raus ist, lässt sich nicht mehr ändern." },
          { status: 400 }
        );
      }
      return Response.json({ ok: true });
    }

    // -----------------------------------------------------------------
    case "testmail": {
      const brief = await briefHolen(id);
      if (!brief) return Response.json({ fehler: "Entwurf nicht gefunden." }, { status: 404 });

      const ergebnis = await testmailSenden(brief, kuerzen(daten.an, 200), seitenUrl);
      if (!ergebnis.ok) return Response.json({ fehler: ergebnis.text }, { status: 400 });

      return Response.json({ ok: true, text: ergebnis.text });
    }

    // -----------------------------------------------------------------
    // Der eine Knopf, der sich nicht zurücknehmen lässt.
    case "senden": {
      const brief = await briefHolen(id);
      if (!brief) return Response.json({ fehler: "Entwurf nicht gefunden." }, { status: 404 });

      const ergebnis = await briefVersenden(brief, seitenUrl);

      if (!ergebnis.ok) {
        return Response.json({ fehler: ergebnis.text }, { status: 400 });
      }

      const nachsatz =
        ergebnis.uebersprungen > 0
          ? ` ${ergebnis.uebersprungen} unbrauchbare Adressen wurden übersprungen.`
          : "";

      return Response.json({
        ok: true,
        text: `Der Newsletter ist an ${ergebnis.empfaenger} Adressen rausgegangen.${nachsatz}`,
      });
    }

    // -----------------------------------------------------------------
    case "loeschen": {
      const weg = await briefLoeschen(id);
      if (!weg) {
        return Response.json(
          { fehler: "Nicht gelöscht. Versendete Newsletter bleiben stehen, sie sind dein Nachweis." },
          { status: 400 }
        );
      }
      return Response.json({ ok: true });
    }

    // -----------------------------------------------------------------
    // Der Notweg: jemanden von Hand austragen, weil sie dir geschrieben
    // hat statt zu klicken.
    case "abmelden": {
      const email = kuerzen(daten.email, 200);
      const weg = await newsletterAbmelden(email, "hand");

      if (!weg) {
        return Response.json(
          { fehler: "Diese Adresse sieht nicht richtig aus." },
          { status: 400 }
        );
      }
      return Response.json({ ok: true, text: `${email} bekommt keine Post mehr.` });
    }

    default:
      return Response.json({ fehler: "Unbekannter Auftrag." }, { status: 400 });
  }
}
