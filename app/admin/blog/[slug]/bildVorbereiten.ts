// ---------------------------------------------------------------------------
// Bilder für den Blog im Browser verkleinern, bevor sie hochgeladen werden.
//
// ▸ WARUM IM BROWSER
//   Ein Handyfoto hat schnell 5 MB. So groß soll es weder hochgeladen werden
//   noch auf der Website liegen. Der Browser kann Bilder selbst umrechnen,
//   dafür braucht es kein zusätzliches Programm auf dem Server.
//
// ▸ DIE ZWEI FORMATE
//   Kopfbild: genau 1344 × 1260, das Verhältnis des Bildplatzes im Beitrag
//   (siehe die Notiz zu den Blogbildern). Ein Hochformat wird dort sonst zur
//   Hälfte weggeschnitten, ohne dass man es beim Hochladen merkt. Deshalb
//   wird hier schon zugeschnitten, und zwar etwas oberhalb der Mitte, weil
//   dort bei Pferdefotos meist Kopf und Hals sitzen.
//   Bild im Text: höchstens 1344 Pixel breit, Seitenverhältnis bleibt.
//
// ▸ WEBP, SONST JPG
//   Edge und Chrome können WebP schreiben. Kann ein Browser das nicht, liefert
//   er stillschweigend PNG; dann wird stattdessen JPG erzeugt.
// ---------------------------------------------------------------------------

export type Vorbereitet = {
  blob: Blob;
  breite: number;
  hoehe: number;
  /** Das Original war schmaler als das Ziel und wurde hochgerechnet. */
  klein: boolean;
};

function laden(url: string): Promise<HTMLImageElement> {
  return new Promise((ok, fehler) => {
    const bild = new Image();
    bild.onload = () => ok(bild);
    bild.onerror = () => fehler(new Error("format"));
    bild.src = url;
  });
}

function alsBlob(leinwand: HTMLCanvasElement, typ: string, guete: number): Promise<Blob | null> {
  return new Promise((ok) => leinwand.toBlob(ok, typ, guete));
}

export async function bildVorbereiten(datei: File, art: "kopf" | "text"): Promise<Vorbereitet> {
  const url = URL.createObjectURL(datei);
  try {
    const bild = await laden(url);
    let sx = 0;
    let sy = 0;
    let sw = bild.naturalWidth;
    let sh = bild.naturalHeight;
    let zw: number;
    let zh: number;

    if (art === "kopf") {
      zw = 1344;
      zh = 1260;
      const ziel = zw / zh;
      if (sw / sh > ziel) {
        const neu = sh * ziel;
        sx = (sw - neu) / 2;
        sw = neu;
      } else {
        const neu = sw / ziel;
        sy = (sh - neu) * 0.3;
        sh = neu;
      }
    } else {
      const faktor = Math.min(1, 1344 / sw);
      zw = Math.round(sw * faktor);
      zh = Math.round(sh * faktor);
    }

    const leinwand = document.createElement("canvas");
    leinwand.width = zw;
    leinwand.height = zh;
    const ctx = leinwand.getContext("2d");
    if (!ctx) throw new Error("leinwand");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bild, sx, sy, sw, sh, 0, 0, zw, zh);

    let blob = await alsBlob(leinwand, "image/webp", 0.82);
    if (!blob || blob.type !== "image/webp") blob = await alsBlob(leinwand, "image/jpeg", 0.85);
    if (!blob) throw new Error("umrechnen");

    return { blob, breite: zw, hoehe: zh, klein: sw < zw * 0.7 };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Der Inhalt eines Blobs als Base64, ohne den Vorspann „data:...;base64,“. */
export function alsBase64(blob: Blob): Promise<string> {
  return new Promise((ok, fehler) => {
    const leser = new FileReader();
    leser.onload = () => ok(String(leser.result).split(",")[1] ?? "");
    leser.onerror = () => fehler(new Error("lesen"));
    leser.readAsDataURL(blob);
  });
}

/** Ein Dateiname für die Website: „Mein Pony im Schnee.JPG“ wird zu
 *  „mein-pony-im-schnee“. Die Endung setzt der Server. */
export function bildname(datei: File, slug: string, art: "kopf" | "text"): string {
  const basis = datei.name
    .replace(/\.[a-z0-9]+$/i, "")
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  // Handyfotos heißen IMG_4711. Dann lieber die Adresse des Beitrags.
  if (!basis || /^(img|dsc|pxl|image|foto|photo)-?\d*/.test(basis)) {
    return `${slug.slice(0, 40)}-${art === "kopf" ? "kopf" : "bild"}`;
  }
  return basis.slice(0, 60);
}
