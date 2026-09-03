"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  textZuHtml,
  namenEinsetzen,
  newsletterRahmen,
  briefPruefen,
  briefRatschlaege,
  lesezeit,
  type Brief,
} from "@/lib/newsletter";

// ---------------------------------------------------------------------------
// Der Editor: links schreiben, rechts sehen, wie es ankommt.
//
// ▸ ES WIRD VON SELBST GESPEICHERT, anderthalb Sekunden nachdem du aufhörst
//   zu tippen. Ein „Speichern"-Knopf ist eine Falle: Irgendwann schliesst
//   man das Fenster, ohne ihn gedrückt zu haben, und eine Stunde Arbeit ist
//   weg. Rechts oben steht immer, woran du bist.
//
// ▸ DIE VORSCHAU LÄUFT IN EINEM IFRAME. Das sieht umständlich aus, ist aber
//   der einzige Weg, die Mail wirklich so zu sehen, wie sie ankommt: Im
//   Rahmen der Adminseite würden die Schriften und Abstände der Website die
//   Mail überschreiben, und du sähest etwas, das es so nie gibt.
//
// ▸ DER SENDEKNOPF FRAGT ZWEIMAL. Ein Newsletter lässt sich nicht
//   zurückholen.
// ---------------------------------------------------------------------------

type Stand = "ruhe" | "tippt" | "speichert" | "gespeichert" | "fehler";

/** Die Bausteine der Werkzeugleiste. `einfuegen` ist, was in den Text
 *  geschrieben wird; `auswahl` sagt, welcher Teil davon danach markiert ist,
 *  damit man sofort weitertippen kann. */
const BAUSTEINE: {
  name: string;
  hinweis: string;
  einfuegen: string;
  auswahl?: [number, number];
}[] = [
  {
    name: "Überschrift",
    hinweis: "Gliedert den Text. Etwa alle drei Absätze eine.",
    einfuegen: "\n\n## Überschrift\n\n",
    auswahl: [5, 16],
  },
  {
    name: "Aufzählung",
    hinweis: "Drei Punkte sind fast immer besser als ein langer Satz.",
    einfuegen: "\n\n- Erster Punkt\n- Zweiter Punkt\n- Dritter Punkt\n\n",
    auswahl: [4, 16],
  },
  {
    name: "Hinweiskasten",
    hinweis: "Der Satz, der hängenbleiben soll. Höchstens einer pro Mail.",
    einfuegen: "\n\n> Der wichtigste Satz dieser Mail.\n\n",
    auswahl: [4, 36],
  },
  {
    name: "Knopf",
    hinweis: "Ein Ziel pro Mail. Zwei Knöpfe halbieren beide.",
    einfuegen:
      "\n\n[[knopf: Jetzt ansehen | https://www.pferdeliebehealthy.de/]]\n\n",
    auswahl: [11, 24],
  },
  {
    name: "Angebot",
    hinweis: "Name, Preis, Link, ein Satz dazu.",
    einfuegen:
      "\n\n[[angebot: Name des Angebots | 29 € | https://www.pferdeliebehealthy.de/ | Ein Satz dazu, was danach anders ist.]]\n\n",
    auswahl: [13, 30],
  },
  {
    name: "Kundenstimme",
    hinweis: "Nur mit Zustimmung, und nur echte.",
    einfuegen: '\n\n" Was sie gesagt hat. | Vorname, Monat Jahr\n\n',
    auswahl: [4, 24],
  },
  {
    name: "Bild",
    hinweis: "Muss im Netz liegen. Viele Postfächer zeigen es erst nach einem Klick.",
    einfuegen: "\n\n![Was auf dem Bild zu sehen ist](https://)\n\n",
    auswahl: [4, 33],
  },
  {
    name: "Trennlinie",
    hinweis: "Trennt den fachlichen Teil vom Angebot.",
    einfuegen: "\n\n---\n\n",
  },
  {
    name: "Nachwort",
    hinweis: "Wird oft als Erstes gelesen. Verschenk es nicht.",
    einfuegen: "\n\nPS: Der Satz, der sie zurückschreiben lässt.\n\n",
    auswahl: [6, 45],
  },
  {
    name: "Vorname",
    hinweis: "Wird durch ihren Vornamen ersetzt.",
    einfuegen: "{{vorname}}",
  },
];

export default function Editor({
  brief,
  erreichbar,
}: {
  brief: Brief;
  erreichbar: number;
}) {
  const router = useRouter();

  const [betreff, setBetreff] = useState(brief.betreff);
  const [vorschautext, setVorschautext] = useState(brief.vorschautext);
  const [inhalt, setInhalt] = useState(brief.inhalt);

  const [stand, setStand] = useState<Stand>("ruhe");
  const [testAdresse, setTestAdresse] = useState("");
  const [meldung, setMeldung] = useState<string | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);
  const [sendenLaeuft, setSendenLaeuft] = useState(false);
  const [sicher, setSicher] = useState(false);
  const [testLaeuft, setTestLaeuft] = useState(false);

  const feld = useRef<HTMLTextAreaElement>(null);
  const ersterLauf = useRef(true);

  // -------------------------------------------------------------- Speichern
  const speichern = useCallback(async () => {
    setStand("speichert");
    try {
      const res = await fetch("/api/admin-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          was: "speichern",
          id: brief.id,
          betreff,
          vorschautext,
          inhalt,
        }),
      });
      setStand(res.ok ? "gespeichert" : "fehler");
    } catch {
      setStand("fehler");
    }
  }, [brief.id, betreff, vorschautext, inhalt]);

  useEffect(() => {
    // Beim ersten Aufbau der Seite ist nichts geändert — ohne diese Sperre
    // würde jedes Öffnen sofort einen Speichervorgang auslösen.
    if (ersterLauf.current) {
      ersterLauf.current = false;
      return;
    }

    setStand("tippt");
    const uhr = setTimeout(speichern, 1500);
    return () => clearTimeout(uhr);
  }, [betreff, vorschautext, inhalt, speichern]);

  // Der letzte Schutz: Wer das Fenster schliesst, während noch nicht
  // gespeichert ist, wird gefragt.
  useEffect(() => {
    function warnen(e: BeforeUnloadEvent) {
      if (stand === "tippt" || stand === "speichert") e.preventDefault();
    }
    window.addEventListener("beforeunload", warnen);
    return () => window.removeEventListener("beforeunload", warnen);
  }, [stand]);

  // -------------------------------------------------------------- Vorschau
  const vorschauHtml = useMemo(() => {
    const text = namenEinsetzen(inhalt, "Anna");
    return newsletterRahmen(
      textZuHtml(text),
      namenEinsetzen(vorschautext, "Anna"),
      "#"
    );
  }, [inhalt, vorschautext]);

  const fehltNoch = briefPruefen({ betreff, inhalt });
  const ratschlaege = briefRatschlaege({ betreff, vorschautext, inhalt });
  const bereit = fehltNoch.length === 0;

  // -------------------------------------------------------------- Bausteine
  function bausteinEinfuegen(baustein: (typeof BAUSTEINE)[number]) {
    const el = feld.current;
    if (!el) return;

    const start = el.selectionStart;
    const ende = el.selectionEnd;
    const neu = inhalt.slice(0, start) + baustein.einfuegen + inhalt.slice(ende);
    setInhalt(neu);

    // Nach dem Neuzeichnen den Text markieren, den sie überschreiben soll.
    requestAnimationFrame(() => {
      el.focus();
      if (baustein.auswahl) {
        el.setSelectionRange(
          start + baustein.auswahl[0],
          start + baustein.auswahl[1]
        );
      } else {
        const hin = start + baustein.einfuegen.length;
        el.setSelectionRange(hin, hin);
      }
    });
  }

  // -------------------------------------------------------------- Testmail
  async function testmail() {
    setTestLaeuft(true);
    setMeldung(null);
    setFehler(null);

    await speichern();

    try {
      const res = await fetch("/api/admin-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ was: "testmail", id: brief.id, an: testAdresse }),
      });
      const antwort = await res.json().catch(() => ({}));

      if (antwort.ok) setMeldung(antwort.text);
      else setFehler(antwort.fehler ?? "Die Testmail ging nicht raus.");
    } catch {
      setFehler("Keine Verbindung. Versuch es bitte noch einmal.");
    }

    setTestLaeuft(false);
  }

  // -------------------------------------------------------------- Senden
  async function senden() {
    setSendenLaeuft(true);
    setMeldung(null);
    setFehler(null);

    await speichern();

    try {
      const res = await fetch("/api/admin-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ was: "senden", id: brief.id }),
      });
      const antwort = await res.json().catch(() => ({}));

      if (antwort.ok) {
        router.refresh();
        return;
      }
      setFehler(antwort.fehler ?? "Der Versand hat nicht geklappt.");
      setSicher(false);
    } catch {
      setFehler("Keine Verbindung. Es ist offen, ob etwas rausgegangen ist — sieh im Resend-Protokoll nach, bevor du es noch einmal versuchst.");
    }

    setSendenLaeuft(false);
  }

  // -------------------------------------------------------------- Löschen
  async function loeschen() {
    if (!window.confirm("Diesen Entwurf wirklich löschen?")) return;

    await fetch("/api/admin-newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ was: "loeschen", id: brief.id }),
    });
    router.push("/admin/newsletter");
  }

  const standText = {
    ruhe: "",
    tippt: "…",
    speichert: "wird gespeichert",
    gespeichert: "gespeichert",
    fehler: "nicht gespeichert",
  }[stand];

  return (
    <main className="px-5 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-[1400px]">
        {/* ------------------------------------------------------ Kopf */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/admin/newsletter"
            className="text-[14.5px] text-rose-deep underline underline-offset-2"
          >
            ← Alle Newsletter
          </Link>

          <div className="flex items-center gap-5">
            <span
              className={`text-[13.5px] ${
                stand === "fehler" ? "text-rose-deep" : "text-ink-soft"
              }`}
            >
              {standText}
            </span>
            <button
              type="button"
              onClick={loeschen}
              className="text-[13.5px] text-ink-soft underline underline-offset-2 hover:text-rose-deep"
            >
              Entwurf löschen
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,540px)]">
          {/* ================================================== Schreiben */}
          <div>
            <label className="mb-2 block text-[13px] uppercase tracking-[0.14em] text-ink-soft">
              Betreff
            </label>
            <input
              type="text"
              value={betreff}
              onChange={(e) => setBetreff(e.target.value)}
              placeholder="Warum Kotwasser im Herbst wiederkommt"
              className="mb-1.5 w-full rounded-[14px] border border-line bg-white px-5 py-3.5 font-serif text-[19px] outline-none focus:border-rose-deep"
            />
            <p className="mb-6 text-[13px] text-ink-soft">
              {betreff.length} Zeichen. Auf dem Handy sind etwa 40 davon zu
              sehen.
            </p>

            <label className="mb-2 block text-[13px] uppercase tracking-[0.14em] text-ink-soft">
              Vorschautext
            </label>
            <input
              type="text"
              value={vorschautext}
              onChange={(e) => setVorschautext(e.target.value)}
              placeholder="Es liegt fast nie am Gras."
              className="mb-1.5 w-full rounded-[14px] border border-line bg-white px-5 py-3 text-[15.5px] outline-none focus:border-rose-deep"
            />
            <p className="mb-6 text-[13px] leading-relaxed text-ink-soft">
              Der graue Text hinter dem Betreff im Postfach. Bleibt er leer,
              steht dort der Anfang deines Textes, also meist die Anrede.
            </p>

            {/* ------------------------------------------ Werkzeugleiste */}
            <div className="mb-2 flex flex-wrap gap-1.5">
              {BAUSTEINE.map((b) => (
                <button
                  key={b.name}
                  type="button"
                  title={b.hinweis}
                  onClick={() => bausteinEinfuegen(b)}
                  className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[13.5px] text-ink transition-colors hover:border-rose-deep hover:text-rose-deep"
                >
                  {b.name}
                </button>
              ))}
            </div>

            <textarea
              ref={feld}
              value={inhalt}
              onChange={(e) => setInhalt(e.target.value)}
              spellCheck
              placeholder="Hallo {{vorname}},&#10;&#10;"
              className="min-h-[520px] w-full resize-y rounded-[14px] border border-line bg-white p-5 font-mono text-[14.5px] leading-[1.7] outline-none focus:border-rose-deep"
            />
            <p className="mt-2 text-[13px] text-ink-soft">
              {inhalt.trim().split(/\s+/).filter(Boolean).length} Wörter, etwa{" "}
              {lesezeit(inhalt)} Minuten Lesezeit
            </p>

            {/* ------------------------------------------ Prüfliste */}
            {(fehltNoch.length > 0 || ratschlaege.length > 0) && (
              <div className="mt-6 rounded-[16px] border border-line bg-white p-5">
                {fehltNoch.length > 0 && (
                  <ul className="mb-3 space-y-1.5">
                    {fehltNoch.map((f) => (
                      <li key={f} className="text-[14.5px] text-rose-deep">
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
                {ratschlaege.length > 0 && (
                  <ul className="space-y-1.5">
                    {ratschlaege.map((r) => (
                      <li
                        key={r}
                        className="text-[14.5px] leading-relaxed text-ink-soft"
                      >
                        {r}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* ================================================== Vorschau */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <p className="mb-2 text-[13px] uppercase tracking-[0.14em] text-ink-soft">
              So kommt sie an
            </p>

            {/* Das Postfach: was vor dem Öffnen zu sehen ist. */}
            <div className="mb-3 rounded-[14px] border border-line bg-white p-4">
              <p className="text-[14px] font-semibold text-ink">
                Yasi von Pferdeliebehealthy
              </p>
              <p className="mt-0.5 text-[14.5px] text-ink">
                {betreff.trim() || "Noch ohne Betreff"}
              </p>
              <p className="mt-0.5 truncate text-[13.5px] text-ink-soft">
                {vorschautext.trim() ||
                  inhalt.replace(/\s+/g, " ").slice(0, 90) ||
                  "…"}
              </p>
            </div>

            <iframe
              title="Vorschau"
              srcDoc={vorschauHtml}
              className="h-[620px] w-full rounded-[14px] border border-line bg-white"
            />

            {/* ------------------------------------------ Testmail */}
            <div className="mt-5 rounded-[16px] border border-line bg-white p-5">
              <p className="mb-3 text-[15px] text-ink">
                Schick sie dir erst selbst.
              </p>
              <div className="flex flex-wrap gap-2.5">
                <input
                  type="email"
                  value={testAdresse}
                  onChange={(e) => setTestAdresse(e.target.value)}
                  placeholder="info@pferdeliebehealthy.de"
                  className="min-w-[200px] flex-1 rounded-full border border-line px-4 py-2.5 text-[14.5px] outline-none focus:border-rose-deep"
                />
                <button
                  type="button"
                  onClick={testmail}
                  disabled={testLaeuft || !testAdresse.trim()}
                  className="rounded-full border border-ink px-5 py-2.5 text-[14.5px] font-medium text-ink transition-colors hover:bg-ink hover:text-cream disabled:opacity-40"
                >
                  {testLaeuft ? "Einen Moment …" : "Testmail"}
                </button>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
                Sieh sie dir am Handy an, nicht nur am Rechner. Dort liest sie
                die Mehrheit.
              </p>
            </div>

            {/* ------------------------------------------ Senden */}
            <div className="mt-4 rounded-[16px] border border-line bg-white p-5">
              {!sicher ? (
                <button
                  type="button"
                  onClick={() => setSicher(true)}
                  disabled={!bereit}
                  className="w-full rounded-full bg-ink px-6 py-3.5 text-[15px] font-medium text-cream transition-colors hover:bg-rose-deep disabled:opacity-40"
                >
                  {bereit
                    ? `An ${erreichbar < 0 ? "alle" : erreichbar} Adressen schicken`
                    : "Es fehlt noch etwas"}
                </button>
              ) : (
                <div>
                  <p className="mb-4 text-[15px] leading-relaxed text-ink">
                    Der Newsletter geht sofort an{" "}
                    <strong>
                      {erreichbar < 0 ? "alle bestätigten" : erreichbar}
                    </strong>{" "}
                    Adressen. Das lässt sich nicht zurücknehmen.
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={senden}
                      disabled={sendenLaeuft}
                      className="rounded-full bg-rose-deep px-6 py-3 text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {sendenLaeuft ? "Geht raus …" : "Ja, jetzt schicken"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSicher(false)}
                      disabled={sendenLaeuft}
                      className="rounded-full border border-line px-6 py-3 text-[15px] text-ink-soft"
                    >
                      Doch nicht
                    </button>
                  </div>
                </div>
              )}

              {meldung && (
                <p className="mt-4 text-[14.5px] leading-relaxed text-ink">
                  {meldung}
                </p>
              )}
              {fehler && (
                <p className="mt-4 text-[14.5px] leading-relaxed text-rose-deep">
                  {fehler}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
