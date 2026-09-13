"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  BEKANNTE_KATEGORIEN,
  beitragPruefen,
  beitragZusammensetzen,
  type BlogKopfFelder,
} from "@/lib/blog-kopf";
import { alsBase64, bildname, bildVorbereiten } from "./bildVorbereiten";

// ---------------------------------------------------------------------------
// Der Blog-Editor: oben die Angaben, darunter der Text, daneben die Hinweise.
//
// ▸ KEIN AUTOMATISCHES SPEICHERN, anders als beim Newsletter. Jedes Speichern
//   ist hier ein Commit auf GitHub, und Vercel baut danach die ganze Website
//   neu. Beim Tippen alle paar Sekunden wäre das eine Flut von Neubauten.
//   Stattdessen warnt der Browser, wenn du mit ungespeicherten Änderungen
//   die Seite verlassen willst.
//
// ▸ DIE VORSCHAU RECHNET AUF DEM SERVER, mit genau dem Code der Blogseite.
//   Kästen, Tabellen und Sprungmarken sehen darin also so aus wie später
//   online.
//
// ▸ BILDER werden im Browser verkleinert (bildVorbereiten.ts) und sofort
//   hochgeladen. Auf der Website liegen sie erst nach dem nächsten Neubau,
//   im Editor und in der Vorschau erscheinen sie trotzdem gleich: Bis dahin
//   zeigt der Editor die Fassung aus dem Browser.
// ---------------------------------------------------------------------------

type Stand = "ruhe" | "laeuft" | "ok" | "fehler";

const BAUSTEINE: { name: string; hinweis: string; einfuegen: string; umschliessen?: [string, string] }[] = [
  {
    name: "Überschrift",
    hinweis: "Am besten als Frage, so wie jemand sie bei Google eintippt.",
    einfuegen: "\n\n## Die Frage als Überschrift?\n\n",
  },
  {
    name: "Unterüberschrift",
    hinweis: "Gliedert einen längeren Abschnitt.",
    einfuegen: "\n\n### Unterpunkt\n\n",
  },
  {
    name: "Fett",
    hinweis: "Markiere zuerst ein Wort, dann klicken.",
    einfuegen: "**fett**",
    umschliessen: ["**", "**"],
  },
  {
    name: "Aufzählung",
    hinweis: "Drei Punkte lesen sich leichter als ein langer Satz.",
    einfuegen: "\n\n- Erster Punkt\n- Zweiter Punkt\n- Dritter Punkt\n\n",
  },
  {
    name: "Tabelle",
    hinweis: "Eigene Tabellen werden von Google besonders gern zitiert.",
    einfuegen: "\n\n| Spalte 1 | Spalte 2 | Spalte 3 |\n|---|---|---|\n| Wert | Wert | Wert |\n| Wert | Wert | Wert |\n\n",
  },
  {
    name: "Link",
    hinweis: "Auf einen anderen Beitrag: /blog/adresse-des-beitrags",
    einfuegen: "[Linktext](/blog/adresse)",
  },
  {
    name: "Hervorgehoben",
    hinweis: "Der eine Satz, der hängen bleiben soll.",
    einfuegen: "\n\n> Der wichtigste Satz.\n\n",
  },
  {
    name: "Angebotskasten",
    hinweis: "Eines deiner Angebote mitten im Text. Nie direkt hinter einen Absatz über eine Krankheit.",
    einfuegen: "\n\n[[angebot:mineral]]\n\n",
  },
  {
    name: "Partnerkasten",
    hinweis: "Partner mit Rabattcode. Die Werbekennzeichnung setzt die Seite selbst.",
    einfuegen: "\n\n[[partner:biohof-elmengrund]]\n\n",
  },
];

const feld =
  "w-full rounded-[12px] border border-line bg-white px-3.5 py-2.5 text-[15px] text-ink";
const etikett = "mb-1 block text-[12.5px] uppercase tracking-[0.1em] text-ink-soft";

export default function BlogEditor(props: {
  slug: string;
  sha: string;
  entwurf: boolean;
  kopf: BlogKopfFelder;
  inhalt: string;
  extras: Record<string, unknown>;
  angebote: { schluessel: string; name: string }[];
}) {
  const { slug, extras, angebote } = props;
  const [kopf, setKopf] = useState<BlogKopfFelder>(props.kopf);
  const [inhalt, setInhalt] = useState(props.inhalt);
  const [sha, setSha] = useState(props.sha);
  const [entwurf, setEntwurf] = useState(props.entwurf);
  const [stand, setStand] = useState<Stand>("ruhe");
  const [meldung, setMeldung] = useState<string | null>(null);
  const [ansicht, setAnsicht] = useState<"schreiben" | "vorschau">("schreiben");
  const [vorschau, setVorschau] = useState<{ html: string; lesezeit: number; werbung: boolean } | null>(null);
  const [laedtBild, setLaedtBild] = useState(false);
  /** Hochgeladene Bilder, die auf der Website noch nicht liegen: Pfad → Fassung aus dem Browser. */
  const [lokal, setLokal] = useState<Record<string, string>>({});

  const textfeld = useRef<HTMLTextAreaElement>(null);
  const kopfDatei = useRef<HTMLInputElement>(null);
  const textDatei = useRef<HTMLInputElement>(null);
  const cursor = useRef(0);
  const gespeichert = useRef(beitragZusammensetzen(props.kopf, props.inhalt, extras));

  const text = useMemo(() => beitragZusammensetzen(kopf, inhalt, extras), [kopf, inhalt, extras]);
  const geaendert = text !== gespeichert.current;
  const hinweise = useMemo(() => beitragPruefen(kopf, inhalt), [kopf, inhalt]);

  // Warnt beim Verlassen der Seite, solange etwas nicht gespeichert ist.
  useEffect(() => {
    if (!geaendert) return;
    const warnen = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warnen);
    return () => window.removeEventListener("beforeunload", warnen);
  }, [geaendert]);

  function setze<K extends keyof BlogKopfFelder>(schluessel: K, wert: BlogKopfFelder[K]) {
    setKopf((k) => ({ ...k, [schluessel]: wert }));
  }

  function einfuegenAn(stelle: number, bis: number, neu: string) {
    setInhalt((alt) => alt.slice(0, stelle) + neu + alt.slice(bis));
    requestAnimationFrame(() => {
      const el = textfeld.current;
      if (!el) return;
      el.focus();
      el.selectionStart = el.selectionEnd = stelle + neu.length;
    });
  }

  function baustein(b: (typeof BAUSTEINE)[number]) {
    const el = textfeld.current;
    if (!el) return;
    const von = el.selectionStart;
    const bis = el.selectionEnd;
    const markiert = inhalt.slice(von, bis);
    const neu =
      b.umschliessen && markiert ? `${b.umschliessen[0]}${markiert}${b.umschliessen[1]}` : b.einfuegen;
    einfuegenAn(von, bis, neu);
  }

  async function anfrage(was: string): Promise<Record<string, unknown> | null> {
    const res = await fetch("/api/admin-blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ was, slug, sha, text }),
    });
    const j = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      setStand("fehler");
      setMeldung(String(j.fehler ?? "Das hat nicht geklappt."));
      return null;
    }
    return j;
  }

  // -------------------------------------------------------------- Bilder
  async function bildHochladen(datei: File, art: "kopf" | "text") {
    setMeldung(null);
    setLaedtBild(true);
    try {
      let fertig;
      try {
        fertig = await bildVorbereiten(datei, art);
      } catch {
        setStand("fehler");
        setMeldung(
          "Dieses Bild kann der Browser nicht öffnen. Fotos vom iPhone liegen oft als HEIC vor, speichere sie bitte als JPG und versuch es noch einmal."
        );
        return;
      }

      let bildtext = "";
      if (art === "text") {
        bildtext =
          window.prompt(
            "Was ist auf dem Bild zu sehen? Das steht unsichtbar im Bild für Google und Vorlesegeräte, zum Beispiel: Pony knabbert an einem Haselzweig."
          ) ?? "";
      }

      const res = await fetch("/api/admin-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          was: "bild",
          slug,
          name: bildname(datei, slug, art),
          daten: await alsBase64(fertig.blob),
        }),
      });
      const j = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok) {
        setStand("fehler");
        setMeldung(String(j.fehler ?? "Das Bild ließ sich nicht hochladen."));
        return;
      }
      const pfad = String(j.pfad);
      setLokal((l) => ({ ...l, [pfad]: URL.createObjectURL(fertig.blob) }));

      if (art === "kopf") {
        setze("bild", pfad);
      } else {
        const stelle = Math.min(cursor.current, inhalt.length);
        einfuegenAn(stelle, stelle, `\n\n![${bildtext.replace(/[[\]]/g, "")}](${pfad})\n\n`);
      }
      setStand("ok");
      setMeldung(
        (art === "kopf"
          ? "Kopfbild hochgeladen und auf das Format der Kopfbilder zugeschnitten."
          : "Bild hochgeladen und an der Stelle im Text eingefügt.") +
          " Jetzt noch speichern, dann steht es nach etwa zwei Minuten auf der Website." +
          (fertig.klein ? " Das Original war recht klein, es kann etwas unscharf wirken." : "")
      );
    } catch {
      setStand("fehler");
      setMeldung("Keine Verbindung. Noch einmal versuchen.");
    } finally {
      setLaedtBild(false);
    }
  }

  function dateiGewaehlt(e: React.ChangeEvent<HTMLInputElement>, art: "kopf" | "text") {
    const datei = e.target.files?.[0];
    e.target.value = "";
    if (datei) void bildHochladen(datei, art);
  }

  /** Setzt in der Vorschau die Fassung aus dem Browser ein, solange die Website das Bild noch nicht hat. */
  function mitLokalenBildern(html: string): string {
    let neu = html;
    for (const [pfad, url] of Object.entries(lokal)) {
      neu = neu.split(`src="${pfad}"`).join(`src="${url}"`);
    }
    return neu;
  }

  async function vorschauLaden() {
    setAnsicht("vorschau");
    setVorschau(null);
    const j = await anfrage("vorschau");
    if (j) {
      setVorschau({
        html: String(j.html ?? ""),
        lesezeit: Number(j.lesezeit ?? 1),
        werbung: j.werbung === true,
      });
    }
  }

  async function speichern(was: "speichern" | "veroeffentlichen" | "zurueckziehen") {
    if (
      was === "veroeffentlichen" &&
      !window.confirm(
        "Jetzt veröffentlichen? Der Beitrag steht dann nach etwa zwei Minuten öffentlich auf der Website und bei Google."
      )
    )
      return;
    if (
      was === "zurueckziehen" &&
      !window.confirm("Den Beitrag von der Website nehmen? Er bleibt hier als Entwurf erhalten.")
    )
      return;

    setStand("laeuft");
    setMeldung(null);
    const j = await anfrage(was);
    if (!j) return;

    gespeichert.current = text;
    setSha(String(j.sha));
    const jetztEntwurf = j.entwurf === true;
    setEntwurf(jetztEntwurf);
    setStand("ok");
    setMeldung(
      j.unveraendert
        ? "Nichts geändert, es gab nichts zu speichern."
        : was === "veroeffentlichen"
          ? `Veröffentlicht. In etwa zwei Minuten steht der Beitrag unter pferdeliebehealthy.de/blog/${slug}.`
          : was === "zurueckziehen"
            ? "Der Beitrag ist wieder ein Entwurf. In etwa zwei Minuten ist er von der Website verschwunden."
            : jetztEntwurf
              ? "Gespeichert. Der Beitrag ist ein Entwurf und nur hier zu sehen."
              : "Gespeichert. In etwa zwei Minuten steht die Änderung auf der Website."
    );
  }

  const kategorien = BEKANNTE_KATEGORIEN.includes(kopf.kategorie)
    ? BEKANNTE_KATEGORIEN
    : [kopf.kategorie, ...BEKANNTE_KATEGORIEN];
  const heute = new Date().toISOString().slice(0, 10);
  const kopfbildQuelle = lokal[kopf.bild] ?? kopf.bild;

  return (
    <main className="px-6 py-10 sm:px-8 sm:py-12">
      {/* Die beiden Dateiauswahlen sind unsichtbar, die Knöpfe öffnen sie. */}
      <input ref={kopfDatei} type="file" accept="image/*" hidden onChange={(e) => dateiGewaehlt(e, "kopf")} />
      <input ref={textDatei} type="file" accept="image/*" hidden onChange={(e) => dateiGewaehlt(e, "text")} />

      <div className="mx-auto max-w-6xl">
        {/* ------------------------------------------------ Kopfleiste */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/admin/blog" className="text-[14px] text-rose-deep underline underline-offset-2">
              Alle Beiträge
            </Link>
            <p className="mt-2 text-[13px] uppercase tracking-[0.12em] text-ink-soft">
              {entwurf ? (
                <span className="text-rose-deep">Entwurf, nicht öffentlich</span>
              ) : (
                <>
                  Online unter{" "}
                  <a href={`/blog/${slug}`} target="_blank" rel="noopener" className="underline">
                    /blog/{slug}
                  </a>
                </>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {geaendert && stand !== "laeuft" && (
              <span className="text-[13.5px] text-rose-deep">Ungespeicherte Änderungen</span>
            )}
            <button
              type="button"
              onClick={() => speichern("speichern")}
              disabled={stand === "laeuft" || laedtBild || !geaendert}
              className="rounded-full bg-ink px-6 py-2.5 text-[15px] text-cream disabled:opacity-40"
            >
              {stand === "laeuft" ? "Speichert …" : "Speichern"}
            </button>
            {entwurf ? (
              <button
                type="button"
                onClick={() => speichern("veroeffentlichen")}
                disabled={stand === "laeuft" || laedtBild}
                className="rounded-full bg-rose-deep px-6 py-2.5 text-[15px] text-cream disabled:opacity-40"
              >
                Veröffentlichen
              </button>
            ) : (
              <button
                type="button"
                onClick={() => speichern("zurueckziehen")}
                disabled={stand === "laeuft" || laedtBild}
                className="rounded-full border border-line bg-white px-5 py-2.5 text-[14px] text-ink disabled:opacity-40"
              >
                Zurück in den Entwurf
              </button>
            )}
          </div>
        </div>

        {(meldung || laedtBild) && (
          <p
            className={
              "mb-6 rounded-[12px] border p-4 text-[14.5px] leading-relaxed " +
              (stand === "fehler" && !laedtBild
                ? "border-rose-deep bg-white text-rose-deep"
                : "border-line bg-cream-deep text-ink")
            }
          >
            {laedtBild ? "Das Bild wird verkleinert und hochgeladen …" : meldung}
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0">
            {/* -------------------------------------------- Angaben */}
            <section className="mb-6 rounded-[18px] border border-line bg-white p-5 sm:p-6">
              <label className={etikett}>Titel</label>
              <input
                className={`${feld} mb-4 font-serif text-[20px]`}
                value={kopf.titel}
                onChange={(e) => setze("titel", e.target.value)}
              />

              <label className={etikett}>Beschreibung für Google</label>
              <textarea
                className={`${feld} mb-4`}
                rows={2}
                value={kopf.beschreibung}
                onChange={(e) => setze("beschreibung", e.target.value)}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={etikett}>Kategorie</label>
                  <select className={feld} value={kopf.kategorie} onChange={(e) => setze("kategorie", e.target.value)}>
                    {kategorien.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={etikett}>Kasten unter dem Beitrag</label>
                  <select className={feld} value={kopf.angebot} onChange={(e) => setze("angebot", e.target.value)}>
                    <option value="">keiner</option>
                    {/* Ein Schlüssel, den die Liste (noch) nicht kennt, bleibt
                        sichtbar stehen, statt still als „keiner“ zu erscheinen. */}
                    {kopf.angebot && !angebote.some((a) => a.schluessel === kopf.angebot) && (
                      <option value={kopf.angebot}>{kopf.angebot} (noch nicht angelegt)</option>
                    )}
                    {angebote.map((a) => (
                      <option key={a.schluessel} value={a.schluessel}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={etikett}>Erschienen am</label>
                  <input type="date" className={feld} value={kopf.datum} onChange={(e) => setze("datum", e.target.value)} />
                </div>
                <div>
                  <label className={etikett}>Fachlich überarbeitet am</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      className={feld}
                      value={kopf.aktualisiert}
                      onChange={(e) => setze("aktualisiert", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setze("aktualisiert", heute)}
                      className="shrink-0 rounded-[12px] border border-line px-3 text-[13px]"
                    >
                      Heute
                    </button>
                  </div>
                  <p className="mt-1 text-[12.5px] text-ink-soft">
                    Nur setzen, wenn sich fachlich etwas geändert hat, nicht für Tippfehler.
                  </p>
                </div>
              </div>

              {/* ---------------------------------------- Kopfbild */}
              <div className="mt-6 border-t border-line pt-5">
                <p className={etikett}>Kopfbild</p>
                <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
                  <div>
                    <button
                      type="button"
                      onClick={() => kopfDatei.current?.click()}
                      disabled={laedtBild}
                      className="mb-2 rounded-full border border-line bg-white px-4 py-2 text-[14px] hover:border-rose-deep disabled:opacity-40"
                    >
                      {kopf.bild ? "Anderes Kopfbild hochladen" : "Kopfbild hochladen"}
                    </button>
                    <p className="mb-3 text-[12.5px] leading-relaxed text-ink-soft">
                      Wird automatisch auf 1344 × 1260 zugeschnitten, wie alle Kopfbilder. Nur echte
                      Fotos, keine gezeichneten Pferde, und nur Bilder, die du verwenden darfst.
                    </p>
                    <label className={etikett}>Bildtext, was darauf zu sehen ist</label>
                    <textarea
                      className={`${feld} mb-3`}
                      rows={2}
                      value={kopf.bildText}
                      onChange={(e) => setze("bildText", e.target.value)}
                    />
                    <details>
                      <summary className="cursor-pointer text-[13px] text-ink-soft">Mehr zum Bild</summary>
                      <label className={`${etikett} mt-3`}>Bilddatei</label>
                      <input className={`${feld} mb-3`} value={kopf.bild} onChange={(e) => setze("bild", e.target.value)} />
                      <label className="flex items-center gap-2 text-[14px]">
                        <input
                          type="checkbox"
                          checked={kopf.bildBreit}
                          onChange={(e) => setze("bildBreit", e.target.checked)}
                        />
                        Breites Bild mit Beschriftung (volle Textbreite)
                      </label>
                    </details>
                  </div>
                  {kopfbildQuelle.startsWith("/") || kopfbildQuelle.startsWith("blob:") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={kopfbildQuelle} alt="" className="w-full rounded-[12px] object-cover" />
                  ) : null}
                </div>
              </div>
            </section>

            {/* -------------------------------------------- Text */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setAnsicht("schreiben")}
                className={
                  "rounded-full px-4 py-2 text-[14px] " +
                  (ansicht === "schreiben" ? "bg-ink text-cream" : "border border-line bg-white")
                }
              >
                Schreiben
              </button>
              <button
                type="button"
                onClick={vorschauLaden}
                className={
                  "rounded-full px-4 py-2 text-[14px] " +
                  (ansicht === "vorschau" ? "bg-ink text-cream" : "border border-line bg-white")
                }
              >
                Vorschau
              </button>
            </div>

            {ansicht === "schreiben" ? (
              <>
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {BAUSTEINE.map((b) => (
                    <button
                      key={b.name}
                      type="button"
                      title={b.hinweis}
                      onClick={() => baustein(b)}
                      className="rounded-full border border-line bg-white px-3 py-1.5 text-[13px] hover:border-rose-deep"
                    >
                      {b.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    title="Ein Foto an der Stelle einfügen, an der der Mauszeiger im Text steht."
                    onClick={() => {
                      cursor.current = textfeld.current?.selectionStart ?? inhalt.length;
                      textDatei.current?.click();
                    }}
                    disabled={laedtBild}
                    className="rounded-full border border-rose-deep bg-white px-3 py-1.5 text-[13px] text-rose-deep disabled:opacity-40"
                  >
                    Bild einfügen
                  </button>
                </div>
                <textarea
                  ref={textfeld}
                  value={inhalt}
                  onChange={(e) => setInhalt(e.target.value)}
                  spellCheck
                  lang="de"
                  className="h-[70vh] w-full rounded-[18px] border border-line bg-white p-5 font-mono text-[14px] leading-relaxed text-ink"
                />
                <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">
                  ## ist eine Überschrift, ### eine kleinere, **so** wird fett, eine Leerzeile trennt
                  Absätze. Fahr mit der Maus über einen Baustein, dann steht dort, wofür er da ist.
                </p>
              </>
            ) : (
              <section className="rounded-[18px] border border-line bg-white p-6 sm:p-8">
                {!vorschau ? (
                  <p className="text-[15px] text-ink-soft">Die Vorschau wird gerechnet …</p>
                ) : (
                  <>
                    <p className="mb-2 text-[12px] uppercase tracking-[0.12em] text-ink-soft">
                      {kopf.kategorie} · {vorschau.lesezeit} Min. Lesezeit
                      {vorschau.werbung && " · mit Werbekennzeichnung"}
                    </p>
                    <h1 className="mb-4 font-serif text-[30px] leading-tight">{kopf.titel}</h1>
                    {kopf.beschreibung && (
                      <p className="mb-8 text-[17px] leading-relaxed text-ink-soft">{kopf.beschreibung}</p>
                    )}
                    <div
                      className="beitrag-prose"
                      dangerouslySetInnerHTML={{ __html: mitLokalenBildern(vorschau.html) }}
                    />
                  </>
                )}
              </section>
            )}
          </div>

          {/* ------------------------------------------------ Seitenleiste */}
          <aside className="space-y-5">
            <section className="rounded-[18px] border border-line bg-white p-5">
              <p className="mb-3 text-[12.5px] uppercase tracking-[0.1em] text-ink-soft">So erscheint es bei Google</p>
              <p className="text-[12.5px] text-ink-soft">pferdeliebehealthy.de › blog › {slug}</p>
              <p className="mt-1 text-[17px] leading-snug text-[#1a0dab]">
                {kopf.titel.length > 62 ? `${kopf.titel.slice(0, 60)} …` : kopf.titel || "Titel fehlt"}
              </p>
              <p className="mt-1 text-[13.5px] leading-snug text-ink-soft">
                {kopf.beschreibung.length > 158
                  ? `${kopf.beschreibung.slice(0, 155)} …`
                  : kopf.beschreibung || "Beschreibung fehlt"}
              </p>
            </section>

            <section className="rounded-[18px] border border-line bg-white p-5">
              <p className="mb-3 text-[12.5px] uppercase tracking-[0.1em] text-ink-soft">
                Deine Regeln {hinweise.length === 0 ? "" : `(${hinweise.length})`}
              </p>
              {hinweise.length === 0 ? (
                <p className="text-[14px] text-ink">
                  Alles erfüllt: keine Gedankenstriche, keine Heilversprechen, und die Punkte für
                  Google stimmen.
                </p>
              ) : (
                <ul className="space-y-3">
                  {hinweise.map((h, i) => (
                    <li key={i} className="text-[13.5px] leading-snug text-ink">
                      {h.text}
                      {h.stelle && <span className="mt-1 block text-[12.5px] italic text-ink-soft">{h.stelle}</span>}
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-4 border-t border-line pt-3 text-[12.5px] leading-relaxed text-ink-soft">
                Ein Hinweis heißt: einmal hinsehen. Speichern geht trotzdem.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
