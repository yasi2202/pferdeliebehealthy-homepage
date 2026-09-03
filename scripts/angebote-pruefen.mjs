import fs from "node:fs";
import path from "node:path";

// ---------------------------------------------------------------------------
// Prueft die Angebotsketten in lib/digital.ts.
//
// Aufruf aus dem Projektordner:
//
//     node scripts/angebote-pruefen.mjs
//
//
// ▸ WARUM ES DIESES SKRIPT GIBT
//   Am 03.09.2026 stand in zwei Ketten ein "Angebot" ueber dem Normalpreis:
//   Der Darmaufbau wurde nach dem Kauf fuer 27 € angeboten und kostet
//   regulaer 22 €. Wer zugriff, zahlte fuenf Euro MEHR als auf der
//   Produktseite. Vermutlich war irgendwann der Einzelpreis gesenkt und die
//   Kette nicht mitgezogen worden.
//
//   Solche Fehler fallen niemandem auf. Sie stehen in einer Datei mit tausend
//   Zeilen, betreffen zwei Zahlen, und die Seite sieht danach genauso aus wie
//   vorher. Deshalb diese Pruefung: Sie liest die Datei direkt, braucht keinen
//   Server und laeuft in einer Sekunde. Am besten nach jeder Preisaenderung.
//
// ▸ WAS GEPRUEFT WIRD
//   1. Jedes Angebot muss GUENSTIGER sein als der normale Preis. Sonst ist es
//      kein Angebot.
//   2. Der Downsell muss guenstiger sein als der Upsell. Er ist das
//      Ausweichangebot fuer die, denen der Upsell zu teuer war.
//   3. Jedes Ziel muss es als Produkt geben. Ein Tippfehler im Slug fuehrt
//      sonst zu "Zu diesem Kauf gibt es kein Angebot".
//   4. Ein befristetes Angebot (`verkaufBis`) darf NICHT Ziel einer Kette
//      sein. Nach dem Stichtag fuehrt es auf einen Knopf, den die Kasse
//      abweist.
//   5. Jedes Produkt sollte eine Kette haben. Ohne sie kommt nach dem Kauf
//      kein Angebot mehr, und das ist verschenktes Geld.
//
//   Punkt 5 ist ein Hinweis, kein Fehler: Es kann gute Gruende geben, einem
//   Produkt bewusst nichts nachzuschieben.
// ---------------------------------------------------------------------------

const DATEI = path.join(process.cwd(), "lib", "digital.ts");

if (!fs.existsSync(DATEI)) {
  console.error("lib/digital.ts nicht gefunden. Bitte aus dem Projektordner aufrufen.");
  process.exit(1);
}

const quelle = fs.readFileSync(DATEI, "utf8");

// ---------------------------------------------------------------------------
// Die Datei wird gelesen, nicht ausgefuehrt: Ein Import wuerde die ganze
// Next-Umgebung mitziehen. Dafuer reicht es, an den Slugs zu schneiden und in
// jedem Abschnitt nach den paar Werten zu suchen.
// ---------------------------------------------------------------------------
function abschnitte(text, muster) {
  const stellen = [];
  const rx = new RegExp(muster, "g");
  let treffer;
  while ((treffer = rx.exec(text))) stellen.push([treffer.index, treffer[1]]);
  return stellen.map(([von, name], i) => ({
    name,
    text: text.slice(von, i + 1 < stellen.length ? stellen[i + 1][0] : text.length),
  }));
}

const wert = (text, muster) => {
  const t = text.match(muster);
  return t ? t[1] : null;
};

const katalogText = quelle.slice(
  quelle.indexOf("digitalprodukte"),
  quelle.indexOf("export type Funnel")
);
const funnelText = quelle.slice(quelle.indexOf("export const funnel"));

const produkte = new Map();
for (const a of abschnitte(katalogText, 'slug: "([^"]+)"')) {
  produkte.set(a.name, {
    preis: Number(wert(a.text, /preis: (\d+)/)),
    befristet: /verkaufBis: "/.test(a.text),
  });
}

const ketten = abschnitte(funnelText, 'produkt: "([^"]+)"').map((a) => ({
  produkt: a.name,
  upsell: wert(a.text, /upsell: "([^"]+)"/),
  upsellPreis: Number(wert(a.text, /upsellPreis: (\d+)/)),
  downsell: wert(a.text, /downsell: "([^"]+)"/),
  downsellPreis: Number(wert(a.text, /downsellPreis: (\d+)/)),
}));

const euro = (cent) => (cent / 100).toFixed(2).replace(".", ",") + " €";
const fehler = [];
const hinweise = [];

for (const k of ketten) {
  for (const stufe of ["upsell", "downsell"]) {
    const ziel = k[stufe];
    const preis = k[stufe === "upsell" ? "upsellPreis" : "downsellPreis"];
    if (!ziel) continue;

    const produkt = produkte.get(ziel);
    if (!produkt) {
      fehler.push(`${k.produkt}: ${stufe} zeigt auf "${ziel}", das Produkt gibt es nicht.`);
      continue;
    }
    if (!Number.isFinite(preis)) {
      fehler.push(`${k.produkt}: ${stufe} "${ziel}" hat keinen Preis.`);
      continue;
    }
    if (preis >= produkt.preis) {
      fehler.push(
        `${k.produkt}: ${stufe} bietet "${ziel}" fuer ${euro(preis)} an, regulaer kostet es ${euro(produkt.preis)}.`
      );
    }
    if (produkt.befristet) {
      fehler.push(
        `${k.produkt}: ${stufe} zeigt auf "${ziel}", und das ist ein befristetes Angebot. Nach dem Stichtag weist die Kasse den Kauf ab.`
      );
    }
  }

  if (k.downsell && Number.isFinite(k.downsellPreis) && k.downsellPreis >= k.upsellPreis) {
    fehler.push(
      `${k.produkt}: Downsell (${euro(k.downsellPreis)}) ist nicht guenstiger als der Upsell (${euro(k.upsellPreis)}).`
    );
  }
}

for (const [slug] of produkte) {
  if (!ketten.some((k) => k.produkt === slug)) {
    hinweise.push(`${slug}: keine Kette, nach dem Kauf kommt kein Angebot mehr.`);
  }
}

console.log(`${produkte.size} Produkte, ${ketten.length} Ketten geprueft.\n`);

if (hinweise.length) {
  console.log("Hinweise:");
  for (const h of hinweise) console.log("  · " + h);
  console.log("");
}

if (fehler.length) {
  console.log("FEHLER:");
  for (const f of fehler) console.log("  ✗ " + f);
  process.exit(1);
}

console.log("Alles in Ordnung: Jedes Angebot liegt unter dem Normalpreis, jeder");
console.log("Downsell unter seinem Upsell, und jedes Ziel gibt es wirklich.");
