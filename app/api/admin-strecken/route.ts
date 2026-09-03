import { istAngemeldet } from "@/lib/admin-zugang";
import { kuerzen } from "@/lib/versand";
import { seitenUrl } from "@/lib/seo";
import { sendeMail } from "@/lib/versand";
import { textZuHtml, namenEinsetzen, newsletterRahmen } from "@/lib/newsletter";
import { abmeldeLink } from "@/lib/newsletter-server";
import {
  streckeAnlegen,
  streckeSchalten,
  streckeLoeschen,
  streckenMailSpeichern,
  streckenMailLoeschen,
  type Strecke,
} from "@/lib/newsletter-strecken";

// ---------------------------------------------------------------------------
// Die Steuerung der Mailstrecken.
//
// ▸ JEDE ANFRAGE PRÜFT DIE ANMELDUNG ZUERST.
// ---------------------------------------------------------------------------

export const runtime = "nodejs";

const AUSLOESER: Strecke["ausloeser"][] = ["insider", "futter-check", "alle"];

export async function POST(request: Request) {
  if (!(await istAngemeldet())) {
    return Response.json({ fehler: "Nicht angemeldet." }, { status: 401 });
  }

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
      const name = kuerzen(daten.name, 120);
      if (name.length < 2) {
        return Response.json({ fehler: "Die Strecke braucht einen Namen." }, { status: 400 });
      }

      const ausloeserRoh = kuerzen(daten.ausloeser, 30) as Strecke["ausloeser"];
      const ausloeser = AUSLOESER.includes(ausloeserRoh) ? ausloeserRoh : "insider";

      const strecke = await streckeAnlegen(name, ausloeser);
      if (!strecke) {
        return Response.json(
          { fehler: "Die Strecke liess sich nicht anlegen. Stehen die Tabellen schon in Supabase?" },
          { status: 500 }
        );
      }
      return Response.json({ ok: true, id: strecke.id });
    }

    // -----------------------------------------------------------------
    case "schalten": {
      const ok = await streckeSchalten(id, Boolean(daten.aktiv));
      if (!ok) return Response.json({ fehler: "Nicht geändert." }, { status: 400 });
      return Response.json({ ok: true });
    }

    // -----------------------------------------------------------------
    case "loeschen": {
      const ok = await streckeLoeschen(id);
      if (!ok) return Response.json({ fehler: "Nicht gelöscht." }, { status: 400 });
      return Response.json({ ok: true });
    }

    // -----------------------------------------------------------------
    case "mail-speichern": {
      const schritt = Number(daten.schritt);
      const tage = Number(daten.tage_danach);

      if (!Number.isInteger(schritt) || schritt < 1) {
        return Response.json({ fehler: "Ungültiger Schritt." }, { status: 400 });
      }

      const ok = await streckenMailSpeichern(id, schritt, {
        tage_danach: Number.isFinite(tage) && tage >= 0 ? Math.floor(tage) : 0,
        betreff: kuerzen(daten.betreff, 200),
        inhalt: kuerzen(daten.inhalt, 60000),
      });

      if (!ok) return Response.json({ fehler: "Nicht gespeichert." }, { status: 400 });
      return Response.json({ ok: true });
    }

    // -----------------------------------------------------------------
    case "mail-loeschen": {
      const ok = await streckenMailLoeschen(kuerzen(daten.mailId, 60));
      if (!ok) return Response.json({ fehler: "Nicht gelöscht." }, { status: 400 });
      return Response.json({ ok: true });
    }

    // -----------------------------------------------------------------
    // Testmail für eine einzelne Mail der Strecke. Ohne Zählung — eine
    // Streckenmail wird nicht ausgewertet, sie ist ja immer dieselbe.
    case "testmail": {
      const an = kuerzen(daten.an, 200);
      const betreff = kuerzen(daten.betreff, 200);
      const inhalt = kuerzen(daten.inhalt, 60000);

      if (!betreff.trim() || !inhalt.trim()) {
        return Response.json(
          { fehler: "Betreff und Text müssen ausgefüllt sein." },
          { status: 400 }
        );
      }

      const html = newsletterRahmen(
        textZuHtml(namenEinsetzen(inhalt, "Yasi")),
        "",
        abmeldeLink(an, seitenUrl)
      );

      const raus = await sendeMail(an, `[Test] ${namenEinsetzen(betreff, "Yasi")}`, html);
      if (!raus) {
        return Response.json(
          { fehler: "Die Testmail ging nicht raus. Steht der Resend-Schlüssel bei Vercel?" },
          { status: 400 }
        );
      }
      return Response.json({ ok: true, text: `Die Testmail ist an ${an} unterwegs.` });
    }

    default:
      return Response.json({ fehler: "Unbekannter Auftrag." }, { status: 400 });
  }
}
