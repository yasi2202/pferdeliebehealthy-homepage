import { digitalFinden } from "@/lib/digital";
import { rabattPruefen } from "@/lib/digital-server";
import { kuerzen } from "@/lib/versand";

// ---------------------------------------------------------------------------
// Prüft einen Rabattcode, während die Kundin noch in der Kasse steht.
//
// ▸ WAS HIER NICHT PASSIERT: Der Code wird NICHT eingelöst und nichts
//   hochgezählt. Das geschieht erst, wenn wirklich bestellt wird, in
//   app/api/digitalkasse. Sonst würde jeder Tippversuch eine Einlösung
//   verbrauchen.
//
// ▸ WARUM DER PREIS TROTZDEM NOCH EINMAL GEPRÜFT WIRD, wenn wirklich bestellt
//   wird: Diese Antwort hier dient nur der Anzeige. Zwischen dem Eintippen
//   und dem Klick auf den Bestellknopf kann ein Code ablaufen oder
//   aufgebraucht werden. Verlässlich ist allein die Prüfung beim Bestellen.
//
// ▸ ABSICHTLICH SPARSAM MIT AUSKÜNFTEN: Zurück geht nur, ob der Code gilt
//   und wie viel er bringt. Nie, wie oft er noch einlösbar ist oder für
//   welche anderen Produkte er gälte.
// ---------------------------------------------------------------------------

export const runtime = "nodejs";

export async function POST(request: Request) {
  let daten: Record<string, unknown>;

  try {
    daten = await request.json();
  } catch {
    return Response.json({ fehler: "Ungültige Anfrage." }, { status: 400 });
  }

  const slug = kuerzen(daten.slug, 80);
  const produkt = digitalFinden(slug);

  if (!produkt) {
    return Response.json(
      { fehler: "Dieses Angebot kenne ich nicht." },
      { status: 400 },
    );
  }

  // Ein Code ist ein kurzes Wort. Alles darüber ist ein Versuch, die
  // Datenbankabfrage zu belasten, und wird gar nicht erst nachgeschlagen.
  const code = kuerzen(daten.code, 40);

  const ergebnis = await rabattPruefen({
    code,
    slug: produkt.slug,
    preis: produkt.preis,
  });

  if ("fehler" in ergebnis) {
    // 200 und nicht 400: Ein falsch getippter Code ist kein Fehler der
    // Anfrage, sondern ein normales Ergebnis. Die Kasse zeigt den Satz an.
    return Response.json({ gueltig: false, fehler: ergebnis.fehler });
  }

  return Response.json({
    gueltig: true,
    code: ergebnis.code,
    rabattCent: ergebnis.rabattCent,
    endpreis: ergebnis.endpreis,
  });
}
