// ---------------------------------------------------------------------------
// Baut Anzeigenbilder aus echten Aufnahmen der Produkte.
//
// Aufruf (aus diesem Ordner):  node bilder.js motive-ratiopro.json
//
// Jedes Motiv: ein Ausschnitt einer Aufnahme, im Browserfenster ("fenster")
// oder als Karte ("karte"), darüber Kennzeile, Überschrift, Preisschild und
// „Von Yasemin Halac …“. Heraus kommen je Motiv ein Feed-Bild 1080 × 1350 und
// ein Hochformat 1080 × 1920 als JPG im Zielordner.
//
// ▸ AUSSCHNITTE BEWUSST WÄHLEN. Was in der Aufnahme steht, steht in der
//   Anzeige: keine Heilaussagen, keine Partnerprodukte, kein Öl, keine
//   Vorher-Nachher-Kurven. „abdecken“ überdeckt kleine Störstellen wie einen
//   Hinweis „offline“ mit der Farbe gleich daneben.
// ▸ JEDES BILD ANSEHEN, bevor es rausgeht. So will es Yasemin.
// ▸ Chrome wird ohne mitgelesene Ausgabe aufgerufen; mit mitgelesener
//   Ausgabe hängt der Aufruf, weil Chromes Kindprozesse die Leitung halten.
// ---------------------------------------------------------------------------
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const sharp = require("C:/Users/Yasi/OneDrive/Dokumente/website/akademieapp/node_modules/sharp");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

const KOPF = `<!doctype html><html lang="de"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Work+Sans:wght@500;600;700&display=block">
<style>
  :root { --creme:#F9EDED; --rose:#DFA9A9; --tief:#95534F; --ink:#3B2A28; --leise:#6B5450; }
  * { box-sizing:border-box; margin:0; padding:0; }
  html, body { width:var(--w); height:var(--h); overflow:hidden; }
  body { background:var(--creme); font-family:"Work Sans","Segoe UI",sans-serif; color:var(--ink); position:relative; }
  .schein { position:absolute; border-radius:50%; background:var(--rose); opacity:.3; }
  .kicker { position:absolute; left:var(--rand); font-weight:700; letter-spacing:.2em; text-transform:uppercase; color:var(--tief); font-size:26px; }
  h1 { position:absolute; left:var(--rand); right:var(--rand); font-family:"Fraunces",Georgia,serif; font-weight:600; letter-spacing:-.008em; line-height:1.06; }
  .von { position:absolute; left:var(--rand); color:var(--leise); font-weight:500; font-size:28px; }
  .preis { position:absolute; right:var(--rand); background:var(--ink); color:var(--creme); font-weight:700; border-radius:999px; font-size:24px; padding:10px 22px; }
  .rahmen { position:absolute; left:50%; transform:translateX(-50%); background:#fff; overflow:hidden;
            box-shadow:0 40px 90px rgba(59,42,40,.26), 0 8px 20px rgba(59,42,40,.10); border:1px solid rgba(59,42,40,.08); }
  .fenster { border-radius:22px; }
  .karte { border-radius:30px; }
  .leiste { height:44px; background:#F3E6E4; display:flex; align-items:center; gap:10px; padding:0 20px; }
  .leiste span { width:13px; height:13px; border-radius:50%; background:#DCC7C4; }
  .leiste b { margin-left:18px; flex:1; height:24px; border-radius:12px; background:#fff; font:500 13px "Work Sans",sans-serif; color:#9B8480; display:flex; align-items:center; padding-left:14px; }
  .rahmen img { display:block; width:100%; }
</style></head>`;

function seite(plan, m, bild, bildB, bildH, w, h, zoneOben, zoneUnten, titelGroesse) {
  const rand = Math.round(w * 0.083);
  const breite = m.breite || (m.rahmen === "karte" ? 720 : 960);
  const leiste = m.rahmen === "fenster" ? 44 : 0;
  const rahmenHoehe = leiste + Math.round((bildH * breite) / bildB) + 2;
  // Kopf: Kennzeile, zwei Zeilen Überschrift, Absenderzeile, dann der Rahmen.
  const kopfHoehe = 56 + Math.round(titelGroesse * 1.06 * 2) + 80 + 50;
  const inhalt = kopfHoehe + rahmenHoehe;
  const oben = Math.max(zoneOben, Math.round(zoneOben + (zoneUnten - zoneOben - inhalt) / 2));
  const rahmenOben = oben + kopfHoehe;
  return `${KOPF}<body style="--w:${w}px;--h:${h}px;--rand:${rand}px">
  <div class="schein" style="width:${w}px;height:${w}px;left:${Math.round(w * 0.1)}px;top:${rahmenOben + 120}px"></div>
  <div class="kicker" style="top:${oben}px">${m.kicker}</div>
  <div class="preis" style="top:${oben - 10}px">${plan.preis}</div>
  <h1 style="top:${oben + 56}px;font-size:${titelGroesse}px">${m.titel}</h1>
  <div class="von" style="top:${rahmenOben - 80}px">${plan.von}</div>
  <div class="rahmen ${m.rahmen}" style="width:${breite}px;top:${rahmenOben}px">
    ${leiste ? `<div class="leiste"><span></span><span></span><span></span><b>akademie.pferdeliebehealthy.de</b></div>` : ""}
    <img src="file:///${bild.replace(/\\/g, "/")}" alt="">
  </div>
</body></html>`;
}

function fotografieren(html, w, h, ausgabe) {
  const profil = fs.mkdtempSync(path.join(os.tmpdir(), "anzeige-"));
  execFileSync(CHROME, [
    "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars", "--allow-file-access-from-files",
    "--force-device-scale-factor=1", "--virtual-time-budget=7000", `--window-size=${w},${h}`,
    `--user-data-dir=${profil}`, `--screenshot=${ausgabe}`, "file:///" + html.replace(/\\/g, "/"),
  ], { stdio: "ignore", timeout: 100000 });
}

(async () => {
  const plan = JSON.parse(fs.readFileSync(process.argv[2], "utf-8"));
  const arbeit = fs.mkdtempSync(path.join(os.tmpdir(), "anzeigen-"));
  fs.mkdirSync(plan.ziel, { recursive: true });
  for (const m of plan.motive) {
    const info = await sharp(m.quelle).metadata();
    const a = m.ausschnitt || { oben: 0, hoehe: info.height };
    // Erst auf Weiss legen: Manche Aufnahmen sind teilweise durchsichtig. Im
    // fertigen Bild scheint dann Weiss durch, eine deckende Abdeckung in der
    // gemessenen Farbe wirkt daneben grau (am 11.09.2026 bei RatioPro).
    const flach = await sharp(m.quelle).flatten({ background: "#ffffff" }).png().toBuffer();
    let bild = sharp(flach).extract({ left: 0, top: a.oben, width: info.width, height: a.hoehe });
    const ueberdecken = [];
    for (const d of m.abdecken || []) {
      // Am sichersten: ein leeres Stück derselben Aufnahme darüberkopieren
      // (`kopie`). Eine gemessene Füllfarbe traf den Kartengrund am
      // 11.09.2026 zweimal nicht, der Kasten blieb als graue Fläche sichtbar.
      if (d.kopie) {
        const stueck = await sharp(flach).extract({ left: d.kopie.x, top: d.kopie.y, width: d.b, height: d.h }).png().toBuffer();
        ueberdecken.push({ input: stueck, left: d.x, top: d.y - a.oben });
        continue;
      }
      // Die Farbe von einer leeren Stelle nehmen: `probe` im Motiv, sonst
      // direkt links daneben. Links daneben liegt oft Schrift, dann wird der
      // Kasten sichtbar grau (so am 11.09.2026 bei RatioPro passiert).
      const p = d.probe || { x: Math.max(0, d.x - 6), y: d.y };
      const probe = await sharp(flach).extract({ left: p.x, top: p.y, width: 4, height: 4 }).stats();
      const [r, g, b] = probe.channels.map((c) => Math.round(c.mean));
      ueberdecken.push({ input: { create: { width: d.b, height: d.h, channels: 3, background: { r, g, b } } }, left: d.x, top: d.y - a.oben });
    }
    if (ueberdecken.length) bild = sharp(await bild.png().toBuffer()).composite(ueberdecken);
    const zuschnitt = path.join(arbeit, `${m.name}-zuschnitt.png`);
    await bild.png().toFile(zuschnitt);

    for (const [art, w, h, zo, zu, tg] of [["Einzelbild", 1080, 1350, 90, 1260, 80], ["Hochformat", 1080, 1920, 300, 1580, 84]]) {
      const html = path.join(arbeit, `${m.name}-${art}.html`);
      const png = path.join(arbeit, `${m.name}-${art}.png`);
      fs.writeFileSync(html, seite(plan, m, zuschnitt, info.width, a.hoehe, w, h, zo, zu, tg));
      fotografieren(html, w, h, png);
      await sharp(png).jpeg({ quality: 92, mozjpeg: true }).toFile(path.join(plan.ziel, `${art} ${m.name}.jpg`));
      console.log("fertig:", `${art} ${m.name}.jpg`);
    }
  }
  console.log("Arbeitsordner zum Ansehen:", arbeit);
})();
