import fs from "node:fs";
import path from "node:path";

// ---------------------------------------------------------------------------
// Sucht Floskeln in den Blogbeitraegen.
//
// Aufruf aus dem Projektordner:
//
//     node scripts/floskeln-pruefen.mjs
//     node scripts/floskeln-pruefen.mjs inhalte/insider
//
//
// Gemeint sind Saetze, die auf jeder Ratgeberseite stehen koennten, weil sie
// nichts behaupten: "spielt eine wichtige Rolle", "achte auf hochwertige
// Qualitaet", "kann unterstuetzend wirken". Sie kosten Platz, sagen nichts,
// und Google erkennt an ihnen austauschbaren Text.
//
// Die Liste ist bewusst streng. Nicht jeder Treffer ist ein Fehler: "wichtig"
// kann an der richtigen Stelle genau das richtige Wort sein. Es geht darum,
// jede Stelle einmal anzusehen.
// ---------------------------------------------------------------------------

const ORDNER = process.argv[2] ?? "inhalte/blog";

const FLOSKELN = [
  // Behauptet Bedeutung, ohne sie zu begruenden
  ["spielt eine (wichtige|grosse|große|entscheidende|zentrale) Rolle", "sagt nicht, welche"],
  ["ist (sehr |besonders |äußerst )?wichtig", "wofür? und woran merkt man es?"],
  ["nicht zu unterschätzen", "leere Warnung"],
  ["das A und O", "Floskel"],
  ["von großer Bedeutung", "Floskel"],
  ["unerlässlich", "meist übertrieben"],

  // Verspricht Wirkung, ohne sie zu benennen
  ["kann (dabei )?(helfen|unterstützen)", "was genau passiert?"],
  ["wirkt (sich )?(positiv|unterstützend|förderlich)", "worauf?"],
  ["tut (dem Pferd |ihm )?gut", "unbestimmt"],
  ["für (mehr |das )?Wohlbefinden", "unbestimmt"],
  ["ganzheitlich(e|es|en)? (Ansatz|Betrachtung|Sicht)", "Schlagwort"],

  // Qualitaetsversprechen ohne Kriterium
  ["hochwertig(e|es|en|er)?", "woran erkennbar?"],
  ["beste (Qualität|Wahl)", "woran erkennbar?"],
  ["(gute|beste) Ergebnisse", "welche?"],
  ["optimal(e|es|en)?", "wonach bemessen?"],

  // Fuellsel und Schulaufsatz
  ["In diesem (Beitrag|Artikel)", "Füllsatz, der Leserin ist klar, wo sie ist"],
  ["Wie (bereits|schon) erwähnt", "Füllsatz"],
  ["Fazit:", "Überschrift ohne Inhalt"],
  ["Zusammenfassend (lässt sich|kann man)", "Füllsatz"],
  ["In der heutigen Zeit", "Füllsatz"],
  ["Es ist (ratsam|empfehlenswert|wichtig)", "wer rät? lieber selbst sagen"],
  ["sollte man", "unpersönlich, du-Ansprache passt besser"],
  ["Jedes Pferd ist (anders|individuell|einzigartig)", "steht auf jeder Seite"],
  ["Achte (unbedingt )?(darauf|auf)", "meist ohne Zahl dahinter"],
];

const dateien = fs
  .readdirSync(ORDNER)
  .filter((f) => f.endsWith(".md") && f !== "_vorlage.md");

let gesamt = 0;
const proFloskel = {};

for (const datei of dateien) {
  const text = fs.readFileSync(path.join(ORDNER, datei), "utf8");
  const zeilen = text.split("\n");
  const treffer = [];

  for (const [muster, warum] of FLOSKELN) {
    const regex = new RegExp(muster, "gi");
    zeilen.forEach((zeile, i) => {
      if (zeile.startsWith("beschreibung:") || zeile.startsWith("titel:")) return;
      const m = zeile.match(regex);
      if (!m) return;
      treffer.push({ zeile: i + 1, text: zeile.trim(), gefunden: m[0], warum });
      proFloskel[muster] = (proFloskel[muster] || 0) + m.length;
      gesamt += m.length;
    });
  }

  if (treffer.length) {
    console.log(`\n### ${datei.replace(/^_|\.md$/g, "").slice(0, 56)}  (${treffer.length})`);
    for (const t of treffer.slice(0, 6)) {
      console.log(`  Z${String(t.zeile).padStart(3)}  "${t.gefunden}"  ${t.warum}`);
      console.log(`        ${t.text.slice(0, 88)}`);
    }
    if (treffer.length > 6) console.log(`        ... und ${treffer.length - 6} weitere`);
  }
}

console.log(`\n${"=".repeat(60)}\nInsgesamt ${gesamt} Fundstellen in ${dateien.length} Beitraegen\n`);
console.log("Haeufigste:");
for (const [muster, n] of Object.entries(proFloskel).sort((a, b) => b[1] - a[1]).slice(0, 10)) {
  console.log(`  ${String(n).padStart(3)}x  ${muster}`);
}
