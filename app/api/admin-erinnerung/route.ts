import { NextRequest, NextResponse } from "next/server";
import { istAngemeldet } from "@/lib/admin-zugang";
import { supabase, supabaseAlle } from "@/lib/versand";
import { abbruchErinnerungSenden } from "@/lib/digital-server";
import { lageBestimmen, spalteDaIst } from "@/lib/abbrueche";
import { digitalFinden } from "@/lib/digital";
import { url } from "@/lib/seo";
import { kulanzEnde, kulanzSchluessel } from "@/lib/kulanz";

// ---------------------------------------------------------------------------
// Eine Erinnerung an eine liegengebliebene Bestellung verschicken.
//
// ▸ ES GIBT NUR DIESEN WEG, VON HAND. Kein täglicher Lauf, kein Zeitplan.
//   Eine Erinnerung ist ein persönlicher Schritt, und wer sie automatisiert,
//   verschickt sie irgendwann auch dann, wenn sie unpassend ist.
//
// ▸ ALLE PRÜFUNGEN LAUFEN HIER NOCH EINMAL, obwohl die Seite den Knopf schon
//   nur dort zeigt, wo er hingehört. Eine Seite, die eine Viertelstunde offen
//   im Browser stand, kennt den Stand von vorhin: In der Zwischenzeit kann
//   die Kundin bezahlt haben. Die Entscheidung, wer Post bekommt, gehört
//   deshalb auf den Server.
//
// ▸ DIE EINWILLIGUNG IST DIE ENGSTE HÜRDE.
//   Eine Erinnerung an einen liegengebliebenen Einkauf ist Werbung. Die
//   Ausnahme für Bestandskundinnen in § 7 Abs. 3 UWG hilft hier gerade
//   nicht: Sie setzt einen tatsächlichen Verkauf voraus, und der ist ja
//   nicht zustande gekommen. Bleibt das Häkchen beim Newsletter.
// ---------------------------------------------------------------------------

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Zeile = {
  id: string;
  nummer: string;
  angelegt_am: string;
  status: string;
  art: string;
  email: string;
  vorname: string;
  nachname: string;
  gesamt: number;
  newsletter: boolean;
  artikel: { slug: string; name: string; preis: number }[] | null;
  erinnert_am?: string | null;
};

export async function POST(request: NextRequest) {
  if (!(await istAngemeldet())) {
    return NextResponse.json({ fehler: "nicht angemeldet" }, { status: 401 });
  }

  const { nummer } = (await request.json()) as { nummer?: string };

  if (!nummer) {
    return NextResponse.json({ fehler: "keine Bestellnummer" }, { status: 400 });
  }

  // Zuerst die Spalte, dann erst die Mail. Andersherum wäre die Mail
  // draussen und niemand wüsste es hinterher.
  if (!(await spalteDaIst())) {
    return NextResponse.json(
      {
        fehler:
          "In der Datenbank fehlt die Spalte erinnert_am. Führ einmal " +
          "datenbank/erinnerung-abbruch.sql im SQL-Editor von Supabase aus, " +
          "im Projekt pferdeliebehealthy-akademie.",
      },
      { status: 400 },
    );
  }

  const zeilen = await supabaseAlle<Zeile>(
    "digitalbestellungen?select=id,nummer,angelegt_am,status,art,email,vorname," +
      "nachname,gesamt,newsletter,artikel,erinnert_am",
  );

  if (zeilen === null) {
    return NextResponse.json(
      { fehler: "Die Bestellungen liessen sich nicht laden." },
      { status: 500 },
    );
  }

  const b = zeilen.find((z) => z.nummer === nummer);

  if (!b) {
    return NextResponse.json(
      { fehler: "Bestellung nicht gefunden" },
      { status: 404 },
    );
  }

  if (b.status !== "offen") {
    return NextResponse.json(
      { fehler: "Diese Bestellung ist inzwischen bezahlt." },
      { status: 400 },
    );
  }

  if (b.erinnert_am) {
    const wann = new Date(b.erinnert_am).toLocaleDateString("de-DE");
    return NextResponse.json(
      { fehler: `Wurde am ${wann} schon erinnert.` },
      { status: 400 },
    );
  }

  const meine = zeilen.filter(
    (z) =>
      z.status === "bezahlt" &&
      z.email.toLowerCase() === b.email.toLowerCase(),
  );

  const lage = lageBestimmen(b, meine);

  if (lage === "gekauft") {
    return NextResponse.json(
      {
        fehler:
          "Diese Kundin hat dasselbe Produkt inzwischen gekauft. Eine " +
          "Erinnerung würde sie nur verwirren.",
      },
      { status: 400 },
    );
  }

  if (lage === "abgelehnt") {
    return NextResponse.json(
      {
        fehler:
          "Das war ein Zusatzangebot nach dem Kauf, das nicht angenommen " +
          "wurde. Der Preis galt nur in dem Moment, und Nachfassen auf ein " +
          "abgelehntes Angebot ist aufdringlich.",
      },
      { status: 400 },
    );
  }

  if (!b.newsletter) {
    return NextResponse.json(
      {
        fehler:
          "Diese Kundin hat beim Bestellen nicht zugestimmt, Post zu " +
          "bekommen. Eine Erinnerung ist Werbung und darf ohne Einwilligung " +
          "nicht per Mail raus. Die Ausnahme für Bestandskundinnen greift " +
          "nicht, weil kein Kauf zustande gekommen ist.",
      },
      { status: 400 },
    );
  }

  const artikel = Array.isArray(b.artikel) ? b.artikel : [];

  const produkt =
    artikel.map((a) => digitalFinden(a.slug)?.kurzname ?? a.name).join(", ") ||
    "etwas aus meinem Angebot";

  const slug = artikel[0]?.slug ?? null;
  const katalog = slug ? digitalFinden(slug) : null;

  // ▸ EIN ABGELAUFENES ANGEBOT BRAUCHT DEN KULANZLINK.
  //   Sonst führt der Knopf in der Mail auf eine Kasse, die den Kauf mit
  //   „Dieses Angebot ist ausgelaufen" abweist. Jemanden anzuschreiben und
  //   ihn dann vor eine verschlossene Tür zu schicken, ist schlimmer, als
  //   gar nicht zu schreiben. Genau für diesen Fall gibt es lib/kulanz.ts:
  //   Der Schlüssel an der Adresse öffnet den alten Preis noch, aber nur
  //   für die, der du ihn schickst, und nur bis zur Nachfrist.
  let link = slug ? url(`/kasse/${slug}`) : null;
  let gueltigBis: string | null = null;

  if (slug && katalog?.verkaufBis) {
    const ende = new Date(`${katalog.verkaufBis}T23:59:59+02:00`);

    if (new Date() > ende) {
      const schluessel = kulanzSchluessel(katalog.verkaufBis);

      if (!schluessel) {
        return NextResponse.json(
          {
            fehler:
              `Das Angebot für ${produkt} ist am ` +
              `${ende.toLocaleDateString("de-DE")} ausgelaufen, und ein ` +
              `Kulanzlink ist nicht möglich: Entweder ist die Nachfrist von ` +
              `14 Tagen vorbei, oder KULANZ_SCHLUESSEL steht nicht in den ` +
              `Vercel-Einstellungen. Ohne den Link würde die Kasse ihren ` +
              `Kauf abweisen. Schreib ihr in dem Fall lieber von Hand.`,
          },
          { status: 400 },
        );
      }

      link = url(`/kasse/${slug}?kulanz=${encodeURIComponent(schluessel)}`);
      gueltigBis = kulanzEnde(katalog.verkaufBis).toLocaleDateString("de-DE");
    }
  }

  const ok = await abbruchErinnerungSenden({
    email: b.email,
    vorname: b.vorname,
    produkt,
    link,
    gueltigBis,
  });

  if (!ok) {
    return NextResponse.json(
      { fehler: "Die Mail ging nicht raus. Steht der Resend-Schlüssel?" },
      { status: 500 },
    );
  }

  // ▸ PATCH IMMER ÜBER DIE id, nie über einen Filter auf anderen Spalten.
  await supabase(`digitalbestellungen?id=eq.${b.id}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ erinnert_am: new Date().toISOString() }),
  });

  return NextResponse.json({ ok: true });
}
