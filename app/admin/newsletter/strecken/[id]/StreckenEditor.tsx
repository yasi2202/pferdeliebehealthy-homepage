"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Strecke, StreckenMail } from "@/lib/newsletter-strecken";

// ---------------------------------------------------------------------------
// Die Schritte einer Mailstrecke bearbeiten.
//
// ▸ BEWUSST SCHLICHTER ALS DER NEWSLETTER-EDITOR. Eine Streckenmail wird
//   einmal geschrieben und läuft dann jahrelang. Der Aufwand steckt im
//   Text, nicht in der Bedienung — und die Vorschau holst du dir mit der
//   Testmail, die ist ohnehin ehrlicher als jede Bildschirmvorschau.
//
// ▸ HIER WIRD NICHT VON SELBST GESPEICHERT. Anders als beim Newsletter:
//   Mehrere Schritte stehen untereinander, und ein Speichern im
//   Hintergrund würde beim Hin- und Herspringen Fassungen überschreiben,
//   die du noch gar nicht fertig hast.
// ---------------------------------------------------------------------------

const AUSLOESER_TEXT: Record<string, string> = {
  insider: "wer sich für den Insider-Kanal einträgt",
  "futter-check": "wer den Futter-Check macht",
  alle: "jede neue Anmeldung",
};

type Entwurf = {
  schritt: number;
  tage_danach: number;
  betreff: string;
  inhalt: string;
  id?: string;
};

export default function StreckenEditor({
  strecke,
  mails,
}: {
  strecke: Strecke;
  mails: StreckenMail[];
}) {
  const router = useRouter();

  const [schritte, setSchritte] = useState<Entwurf[]>(
    mails.length > 0
      ? mails.map((m) => ({
          id: m.id,
          schritt: m.schritt,
          tage_danach: m.tage_danach,
          betreff: m.betreff,
          inhalt: m.inhalt,
        }))
      : [{ schritt: 1, tage_danach: 0, betreff: "", inhalt: "Hallo {{vorname}},\n\n" }]
  );

  const [aktiv, setAktiv] = useState(strecke.aktiv);
  const [meldung, setMeldung] = useState<string | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);
  const [testAdresse, setTestAdresse] = useState("");
  const [laeuft, setLaeuft] = useState<number | null>(null);

  function aendern(i: number, felder: Partial<Entwurf>) {
    setSchritte((alt) => alt.map((s, n) => (n === i ? { ...s, ...felder } : s)));
  }

  async function speichern(i: number) {
    const s = schritte[i];
    setLaeuft(i);
    setMeldung(null);
    setFehler(null);

    try {
      const res = await fetch("/api/admin-strecken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          was: "mail-speichern",
          id: strecke.id,
          schritt: s.schritt,
          tage_danach: s.tage_danach,
          betreff: s.betreff,
          inhalt: s.inhalt,
        }),
      });
      const antwort = await res.json().catch(() => ({}));

      if (antwort.ok) {
        setMeldung(`Mail ${s.schritt} ist gespeichert.`);
        router.refresh();
      } else {
        setFehler(antwort.fehler ?? "Nicht gespeichert.");
      }
    } catch {
      setFehler("Keine Verbindung.");
    }
    setLaeuft(null);
  }

  async function testmail(i: number) {
    const s = schritte[i];
    setLaeuft(i);
    setMeldung(null);
    setFehler(null);

    try {
      const res = await fetch("/api/admin-strecken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          was: "testmail",
          an: testAdresse,
          betreff: s.betreff,
          inhalt: s.inhalt,
        }),
      });
      const antwort = await res.json().catch(() => ({}));

      if (antwort.ok) setMeldung(antwort.text);
      else setFehler(antwort.fehler ?? "Die Testmail ging nicht raus.");
    } catch {
      setFehler("Keine Verbindung.");
    }
    setLaeuft(null);
  }

  async function schalten() {
    const neu = !aktiv;
    setAktiv(neu);
    setMeldung(null);
    setFehler(null);

    const res = await fetch("/api/admin-strecken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ was: "schalten", id: strecke.id, aktiv: neu }),
    });

    if (res.ok) {
      setMeldung(
        neu
          ? "Die Strecke läuft. Ab jetzt bekommt jede neue Anmeldung die Kette."
          : "Die Strecke ist aus. Es geht nichts mehr raus."
      );
      router.refresh();
    } else {
      setAktiv(!neu);
      setFehler("Das Umschalten hat nicht geklappt.");
    }
  }

  async function loeschen() {
    if (
      !window.confirm(
        "Die ganze Strecke mit allen Mails löschen? Das lässt sich nicht rückgängig machen."
      )
    )
      return;

    await fetch("/api/admin-strecken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ was: "loeschen", id: strecke.id }),
    });
    router.push("/admin/newsletter/strecken");
  }

  function schrittHinzufuegen() {
    const letzter = schritte[schritte.length - 1];
    setSchritte([
      ...schritte,
      {
        schritt: (letzter?.schritt ?? 0) + 1,
        tage_danach: (letzter?.tage_danach ?? 0) + 3,
        betreff: "",
        inhalt: "Hallo {{vorname}},\n\n",
      },
    ]);
  }

  const fertig = schritte.filter((s) => s.betreff.trim() && s.inhalt.trim()).length;

  return (
    <main className="px-6 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin/newsletter/strecken"
          className="mb-6 inline-block text-[14.5px] text-rose-deep underline underline-offset-2"
        >
          ← Alle Strecken
        </Link>

        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="font-serif text-[30px] font-normal leading-tight tracking-tight sm:text-[38px]">
            {strecke.name}
          </h1>
          <button
            type="button"
            onClick={loeschen}
            className="text-[13.5px] text-ink-soft underline underline-offset-2 hover:text-rose-deep"
          >
            Strecke löschen
          </button>
        </div>

        <p className="mt-2 text-[15px] text-ink-soft">
          Läuft los für {AUSLOESER_TEXT[strecke.ausloeser] ?? strecke.ausloeser}
        </p>

        {/* ------------------------------------------------ Ein- und Ausschalten */}
        <div className="mt-6 rounded-[18px] border border-line bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="max-w-md">
              <p className="text-[16px] text-ink">
                {aktiv ? "Die Strecke läuft." : "Die Strecke ist aus."}
              </p>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-soft">
                {aktiv
                  ? "Jede neue Anmeldung läuft hinein und bekommt die Kette der Reihe nach."
                  : fertig === 0
                    ? "Schreib zuerst mindestens eine Mail, dann kannst du einschalten."
                    : "Es geht nichts raus, solange sie aus ist."}
              </p>
            </div>

            <button
              type="button"
              onClick={schalten}
              disabled={!aktiv && fertig === 0}
              className={`rounded-full px-6 py-3 text-[15px] font-medium transition-colors disabled:opacity-40 ${
                aktiv
                  ? "border border-line text-ink-soft"
                  : "bg-ink text-cream hover:bg-rose-deep"
              }`}
            >
              {aktiv ? "Ausschalten" : "Einschalten"}
            </button>
          </div>

          {!strecke.aktiv_seit && (
            <p className="mt-4 border-t border-line pt-4 text-[14px] leading-relaxed text-ink-soft">
              Beim ersten Einschalten merkt sich die Strecke den Zeitpunkt. Es
              läuft nur hinein, wer sich danach anmeldet — deine
              Bestandsadressen bekommen nichts.
            </p>
          )}
        </div>

        {/* ------------------------------------------------ Testadresse */}
        <div className="mt-5 rounded-[16px] border border-line bg-white p-5">
          <label className="mb-2 block text-[13px] uppercase tracking-[0.14em] text-ink-soft">
            Testmails gehen an
          </label>
          <input
            type="email"
            value={testAdresse}
            onChange={(e) => setTestAdresse(e.target.value)}
            placeholder="info@pferdeliebehealthy.de"
            className="w-full rounded-full border border-line px-5 py-2.5 text-[15px] outline-none focus:border-rose-deep"
          />
        </div>

        {/* ------------------------------------------------ Die Schritte */}
        <div className="mt-8 space-y-6">
          {schritte.map((s, i) => (
            <div key={s.schritt} className="rounded-[18px] border border-line bg-white p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="font-serif text-[20px] text-ink">Mail {s.schritt}</p>

                <label className="flex items-center gap-2 text-[14.5px] text-ink-soft">
                  geht raus nach
                  <input
                    type="number"
                    min={0}
                    max={365}
                    value={s.tage_danach}
                    onChange={(e) =>
                      aendern(i, { tage_danach: Number(e.target.value) })
                    }
                    className="w-20 rounded-full border border-line px-3 py-1.5 text-center text-[14.5px] outline-none focus:border-rose-deep"
                  />
                  {s.tage_danach === 1 ? "Tag" : "Tagen"}
                </label>
              </div>

              <input
                type="text"
                value={s.betreff}
                onChange={(e) => aendern(i, { betreff: e.target.value })}
                placeholder="Betreff"
                className="mb-3 w-full rounded-[14px] border border-line px-5 py-3 font-serif text-[17.5px] outline-none focus:border-rose-deep"
              />

              <textarea
                value={s.inhalt}
                onChange={(e) => aendern(i, { inhalt: e.target.value })}
                spellCheck
                className="min-h-[260px] w-full resize-y rounded-[14px] border border-line p-4 font-mono text-[14px] leading-[1.7] outline-none focus:border-rose-deep"
              />

              <div className="mt-3 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => speichern(i)}
                  disabled={laeuft !== null}
                  className="rounded-full bg-ink px-5 py-2.5 text-[14.5px] font-medium text-cream transition-colors hover:bg-rose-deep disabled:opacity-40"
                >
                  {laeuft === i ? "Einen Moment …" : "Speichern"}
                </button>
                <button
                  type="button"
                  onClick={() => testmail(i)}
                  disabled={laeuft !== null || !testAdresse.trim() || !s.betreff.trim()}
                  className="rounded-full border border-ink px-5 py-2.5 text-[14.5px] text-ink transition-colors hover:bg-ink hover:text-cream disabled:opacity-40"
                >
                  Testmail
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={schrittHinzufuegen}
          className="mt-5 rounded-full border border-line bg-white px-6 py-3 text-[15px] text-ink transition-colors hover:border-rose-deep"
        >
          Noch eine Mail anhängen
        </button>

        {meldung && <p className="mt-5 text-[15px] text-ink">{meldung}</p>}
        {fehler && <p className="mt-5 text-[15px] text-rose-deep">{fehler}</p>}

        <div className="mt-10 rounded-[16px] border border-line bg-white p-5">
          <h2 className="mb-2 font-serif text-[18px]">Zum Schreiben</h2>
          <p className="text-[14.5px] leading-relaxed text-ink-soft">
            Es gelten dieselben Bausteine wie im Newsletter:{" "}
            <code className="rounded bg-cream-deep px-1 py-0.5">## Überschrift</code>,{" "}
            <code className="rounded bg-cream-deep px-1 py-0.5">**fett**</code>,{" "}
            <code className="rounded bg-cream-deep px-1 py-0.5">- Aufzählung</code>,{" "}
            <code className="rounded bg-cream-deep px-1 py-0.5">&gt; Hinweis</code>,{" "}
            <code className="rounded bg-cream-deep px-1 py-0.5">
              [[knopf: Text | Link]]
            </code>{" "}
            und{" "}
            <code className="rounded bg-cream-deep px-1 py-0.5">{"{{vorname}}"}</code>.
            Schick dir jede Mail einmal selbst, bevor du einschaltest.
          </p>
        </div>
      </div>
    </main>
  );
}
