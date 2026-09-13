import matter from "gray-matter";
import { istAngemeldet } from "@/lib/admin-zugang";
import { beitragAusText } from "@/lib/blog";
import {
  githubEingerichtet,
  slugGueltig,
  beitragSpeichern,
  beitragStatusSetzen,
  beitragAnlegen,
  bildHochladen,
  type Ergebnis,
} from "@/lib/blog-github";
import { beitragZusammensetzen, LEERER_KOPF } from "@/lib/blog-kopf";

// ---------------------------------------------------------------------------
// Die Steuerung des Blog-Editors: Vorschau, speichern, veröffentlichen,
// zurück in den Entwurf, neu anlegen.
//
// ▸ JEDE ANFRAGE PRÜFT DIE ANMELDUNG ZUERST, wie beim Newsletter. Wer die
//   Adresse kennt, ruft sie direkt auf.
//
// ▸ DIE VORSCHAU BRAUCHT KEIN GITHUB. Sie rechnet den Text mit genau dem Code
//   der Blogseite (beitragAusText in lib/blog.ts) und schreibt nichts.
// ---------------------------------------------------------------------------

export const runtime = "nodejs";

/** Der längste Beitrag hat gut 30.000 Zeichen. Das hier ist nur ein Netz. */
const HOECHSTENS = 400_000;

/** Womit ein neuer Entwurf beginnt. Die Regeln stehen ausführlich in
 *  inhalte/blog/_vorlage.md, hier nur das Gerüst. */
const GERUEST = `Beantworte hier im ersten Absatz die Frage, nach der gesucht wird. Wer über Google kommt, will nicht erst eine Geschichte lesen.

## Die erste Frage als Überschrift?

Unter jede Überschrift gehören zwei bis drei Sätze, die die Frage vollständig beantworten. Danach die Erklärung.

## Die zweite Frage?

Text.
`;

function fehler(meldung: string, status: number) {
  return Response.json({ fehler: meldung }, { status });
}

function antwort(e: Ergebnis) {
  if (e.ok) return Response.json(e);
  return Response.json(
    { fehler: e.meldung, konflikt: e.grund === "konflikt" },
    { status: e.grund === "konflikt" ? 409 : 502 }
  );
}

export async function POST(request: Request) {
  if (!(await istAngemeldet())) return fehler("Nicht angemeldet.", 401);

  let d: Record<string, unknown>;
  try {
    d = await request.json();
  } catch {
    return fehler("Ungültige Anfrage.", 400);
  }

  const was = String(d.was ?? "");
  const slug = String(d.slug ?? "");
  const text = typeof d.text === "string" ? d.text : "";
  const sha = String(d.sha ?? "");

  if (!slugGueltig(slug)) {
    return fehler(
      "Die Adresse darf nur Kleinbuchstaben, Ziffern und Bindestriche enthalten, keine Umlaute und keine Leerzeichen.",
      400
    );
  }
  if (text.length > HOECHSTENS) return fehler("Der Text ist zu lang.", 400);

  if (was !== "anlegen" && was !== "bild") {
    try {
      matter(text);
    } catch {
      return fehler("Die Kopfangaben sind nicht lesbar. Prüf die Felder oben.", 400);
    }
  }

  if (was === "vorschau") {
    const b = beitragAusText(slug, text);
    return Response.json({
      ok: true,
      html: b.html,
      lesezeit: b.lesezeit,
      werbung: b.werbung,
      fragen: b.fragen.length,
    });
  }

  if (!githubEingerichtet()) {
    return fehler(
      "Zum Speichern fehlt noch der GitHub-Schlüssel. Die Anleitung steht auf der Übersicht des Blog-Editors.",
      503
    );
  }

  try {
    switch (was) {
      case "speichern":
        return antwort(await beitragSpeichern(slug, text, sha));
      case "veroeffentlichen":
        return antwort(await beitragStatusSetzen(slug, text, sha, true));
      case "zurueckziehen":
        return antwort(await beitragStatusSetzen(slug, text, sha, false));
      case "bild": {
        // Das Bild kommt verkleinert aus dem Browser. Geprüft wird trotzdem,
        // ob es wirklich ein WebP oder JPG ist: Über diese Stelle soll nichts
        // anderes in den öffentlichen Ordner der Website gelangen.
        const roh = String(d.daten ?? "");
        if (!roh || roh.length > 4_000_000) return fehler("Das Bild ist zu groß oder leer.", 400);
        const daten = Buffer.from(roh, "base64");
        const istWebp =
          daten.subarray(0, 4).toString("latin1") === "RIFF" &&
          daten.subarray(8, 12).toString("latin1") === "WEBP";
        const istJpg = daten[0] === 0xff && daten[1] === 0xd8 && daten[2] === 0xff;
        if (!istWebp && !istJpg) return fehler("Das ist kein Bild, das die Website anzeigen kann.", 400);
        const name =
          String(d.name ?? "")
            .toLowerCase()
            .replace(/ä/g, "ae")
            .replace(/ö/g, "oe")
            .replace(/ü/g, "ue")
            .replace(/ß/g, "ss")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 60) || slug;
        const r = await bildHochladen(name, istWebp ? "webp" : "jpg", daten);
        return r.ok ? Response.json(r) : fehler(r.meldung, 502);
      }
      case "anlegen": {
        const titel = String(d.titel ?? "").trim().slice(0, 200);
        const heute = new Date().toISOString().slice(0, 10);
        const neu = beitragZusammensetzen({ ...LEERER_KOPF, titel, datum: heute }, GERUEST);
        return antwort(await beitragAnlegen(slug, neu));
      }
      default:
        return fehler("Unbekannte Aktion.", 400);
    }
  } catch {
    return fehler("GitHub antwortet gerade nicht. In einer Minute noch einmal versuchen.", 502);
  }
}
