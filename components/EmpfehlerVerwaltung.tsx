"use client";

// ---------------------------------------------------------------------------
// Die Verwaltung der Empfehlerinnen.
//
// Die Liste kommt fertig gerechnet von der Seite (Server-Komponente), hier
// passiert nur das Umschalten, das Notieren und das Auszahlen. Nach jeder
// Änderung wird die Seite neu geholt, damit die Zahlen stimmen.
//
// ▸ WARUM DAS AUSZAHLEN EINE RÜCKFRAGE HAT
//   Der Knopf bucht die Provisionen als ausgezahlt und legt eine Gutschrift
//   mit fortlaufender Nummer an. Beides lässt sich nicht mit einem Klick
//   rückgängig machen: Eine Gutschriftnummer, die vergeben ist, darf nicht
//   verschwinden, sonst reisst eine Lücke in die Reihe. Ein versehentliches
//   Drücken wäre also echte Arbeit, deshalb die Rückfrage.
// ---------------------------------------------------------------------------

import { useRouter } from "next/navigation";
import { useState } from "react";
import { preisText } from "@/lib/shop";
import {
  empfehlungslink,
  MINDESTAUSZAHLUNG,
  type Empfehler,
} from "@/lib/empfehlungsprogramm";

export type EmpfehlerZeile = Empfehler & {
  /** Vorgerechnet von der Seite, siehe kontostand(). */
  stand: {
    inFrist: number;
    auszahlbar: number;
    ausgezahlt: number;
    storniert: number;
    verkaeufe: number;
    offenGesamt: number;
    reif: boolean;
  };
};

const SCHILD: Record<string, string> = {
  angefragt: "bg-pfirsich/30 text-ink",
  aktiv: "bg-rose-deep text-cream",
  gesperrt: "bg-line text-ink-soft",
};

export default function EmpfehlerVerwaltung({
  zeilen,
}: {
  zeilen: EmpfehlerZeile[];
}) {
  const router = useRouter();

  const [laeuft, setLaeuft] = useState<string | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);
  const [erfolg, setErfolg] = useState<string | null>(null);
  const [offen, setOffen] = useState<string | null>(null);
  const [notizen, setNotizen] = useState<Record<string, string>>({});
  const [storno, setStorno] = useState("");

  async function schicken(id: string, koerper: Record<string, unknown>) {
    setLaeuft(id);
    setFehler(null);
    setErfolg(null);

    try {
      const antwort = await fetch("/api/admin-empfehler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...koerper }),
      });

      const daten = await antwort.json().catch(() => ({}));

      if (antwort.ok) {
        if (daten.hinweis) setErfolg(daten.hinweis);
        router.refresh();
      } else {
        setFehler(daten.fehler ?? "Das hat nicht geklappt.");
      }
    } catch {
      setFehler("Ich habe den Server gerade nicht erreicht.");
    } finally {
      setLaeuft(null);
    }
  }

  /** Nimmt die Provision zu einer erstatteten Bestellung zurück.
   *
   *  Braucht keine Empfehlerin, nur die Bestellnummer: Welche Provision
   *  daran hängt, weiss die Datenbank. */
  async function stornieren() {
    const nummer = storno.trim();
    if (!nummer || laeuft) return;

    setLaeuft("storno");
    setFehler(null);
    setErfolg(null);

    try {
      const antwort = await fetch("/api/admin-empfehler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ art: "stornieren", bestellnummer: nummer }),
      });

      const daten = await antwort.json().catch(() => ({}));

      if (antwort.ok) {
        setErfolg(daten.hinweis ?? "Erledigt.");
        setStorno("");
        router.refresh();
      } else {
        setFehler(daten.fehler ?? "Das hat nicht geklappt.");
      }
    } catch {
      setFehler("Ich habe den Server gerade nicht erreicht.");
    } finally {
      setLaeuft(null);
    }
  }

  function auszahlen(z: EmpfehlerZeile) {
    const sicher = window.confirm(
      `${preisText(z.stand.auszahlbar)} an ${z.vorname} ${z.nachname} als ` +
        `ausgezahlt buchen?\n\nDas legt eine Gutschrift mit fortlaufender ` +
        `Nummer an und schickt ihr eine Mail. Überweisen musst du danach ` +
        `selbst, an: ${z.zahlweg}`,
    );

    if (sicher) {
      void schicken(z.id, { art: "auszahlen" });
    }
  }

  if (zeilen.length === 0) {
    return (
      <p className="text-[15px] leading-relaxed text-ink-soft">
        Noch niemand dabei. Sobald sich jemand über{" "}
        <a
          href="/weiterempfehlen"
          className="text-rose-deep underline underline-offset-2"
        >
          /weiterempfehlen
        </a>{" "}
        bewirbt, steht sie hier.
      </p>
    );
  }

  return (
    <div>
      {fehler ? (
        <p className="mb-5 rounded-[12px] bg-cream-deep px-4 py-3 text-[14.5px] text-rose-deep">
          {fehler}
        </p>
      ) : null}

      {erfolg ? (
        <p className="mb-5 rounded-[12px] bg-cream-deep px-4 py-3 text-[14.5px] text-ink">
          {erfolg}
        </p>
      ) : null}

      <div className="space-y-4">
        {zeilen.map((z) => {
          const arbeitet = laeuft === z.id;
          const aufgeklappt = offen === z.id;

          return (
            <div
              key={z.id}
              className="rounded-[16px] border border-line bg-white p-5"
            >
              {/* Kopfzeile: Name, Stand, Zahlen */}
              <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2.5">
                    <p className="text-[16px] font-semibold text-ink">
                      {z.vorname} {z.nachname}
                    </p>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[12px] font-medium ${SCHILD[z.status] ?? SCHILD.gesperrt}`}
                    >
                      {z.status}
                    </span>
                  </div>

                  <p className="text-[14px] text-ink-soft">
                    {z.email} · Code <strong className="text-ink">{z.code}</strong>{" "}
                    · {z.klicks} Klicks · {z.stand.verkaeufe}{" "}
                    {z.stand.verkaeufe === 1 ? "Kauf" : "Käufe"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-serif text-[22px] leading-none text-ink">
                    {preisText(z.stand.auszahlbar)}
                  </p>
                  <p className="mt-1 text-[13px] text-ink-soft">
                    auszahlbar
                    {z.stand.inFrist > 0
                      ? ` · ${preisText(z.stand.inFrist)} in Frist`
                      : ""}
                  </p>
                </div>
              </div>

              {/* Knöpfe */}
              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                {z.status !== "aktiv" ? (
                  <button
                    type="button"
                    disabled={arbeitet}
                    onClick={() =>
                      void schicken(z.id, { art: "status", status: "aktiv" })
                    }
                    className="rounded-full bg-rose-deep px-5 py-2.5 text-[14px] font-medium text-cream transition-colors hover:bg-ink disabled:opacity-50"
                  >
                    {z.freigeschaltet_am ? "Wieder freischalten" : "Freischalten"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={arbeitet}
                    onClick={() =>
                      void schicken(z.id, { art: "status", status: "gesperrt" })
                    }
                    className="rounded-full border border-line px-5 py-2.5 text-[14px] font-medium text-ink-soft transition-colors hover:border-rose-deep hover:text-rose-deep disabled:opacity-50"
                  >
                    Sperren
                  </button>
                )}

                {z.stand.auszahlbar > 0 ? (
                  <button
                    type="button"
                    disabled={arbeitet}
                    onClick={() => auszahlen(z)}
                    className={`rounded-full px-5 py-2.5 text-[14px] font-medium transition-colors disabled:opacity-50 ${
                      z.stand.reif
                        ? "bg-ink text-cream hover:bg-rose-deep"
                        : "border border-line text-ink-soft hover:border-ink hover:text-ink"
                    }`}
                  >
                    {preisText(z.stand.auszahlbar)} auszahlen
                    {z.stand.reif
                      ? ""
                      : ` (unter ${preisText(MINDESTAUSZAHLUNG)})`}
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => setOffen(aufgeklappt ? null : z.id)}
                  className="rounded-full px-3 py-2.5 text-[14px] text-rose-deep underline underline-offset-2"
                >
                  {aufgeklappt ? "Weniger" : "Mehr"}
                </button>
              </div>

              {/* Aufgeklappt: alles, was man nur selten braucht */}
              {aufgeklappt ? (
                <div className="mt-5 space-y-4 border-t border-line pt-5">
                  <div>
                    <p className="mb-1 text-[13px] uppercase tracking-[0.1em] text-ink-soft">
                      Wo sie empfiehlt
                    </p>
                    <p className="whitespace-pre-line text-[14.5px] leading-relaxed text-ink">
                      {z.kanal || "keine Angabe"}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 text-[13px] uppercase tracking-[0.1em] text-ink-soft">
                        Auszahlung an
                      </p>
                      <p className="break-all text-[14.5px] text-ink">
                        {z.zahlweg || "keine Angabe"}
                      </p>
                    </div>

                    <div>
                      <p className="mb-1 text-[13px] uppercase tracking-[0.1em] text-ink-soft">
                        Steuerlich
                      </p>
                      <p className="text-[14.5px] text-ink">
                        {z.unternehmerin
                          ? `selbstständig${z.steuernummer ? `, ${z.steuernummer}` : ""}`
                          : "Privatperson"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-1 text-[13px] uppercase tracking-[0.1em] text-ink-soft">
                      Ihr Link
                    </p>
                    <p className="break-all text-[14.5px] text-ink">
                      {empfehlungslink(z.code)}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-[13px] uppercase tracking-[0.1em] text-ink-soft">
                      Ihr Kontolink{" "}
                      <span className="normal-case tracking-normal">
                        (nur weitergeben, wenn sie ihn verloren hat)
                      </span>
                    </p>
                    <p className="break-all text-[13.5px] text-ink-soft">
                      https://www.pferdeliebehealthy.de/weiterempfehlen/konto?k=
                      {z.token}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-[13px] uppercase tracking-[0.1em] text-ink-soft">
                      Deine Notiz
                    </p>
                    <textarea
                      rows={2}
                      value={notizen[z.id] ?? z.notiz ?? ""}
                      onChange={(e) =>
                        setNotizen({ ...notizen, [z.id]: e.target.value })
                      }
                      className="w-full rounded-[12px] border border-line bg-white px-4 py-3 text-[14.5px] outline-none transition-colors focus:border-rose-deep"
                    />
                    <button
                      type="button"
                      disabled={arbeitet}
                      onClick={() =>
                        void schicken(z.id, {
                          art: "notiz",
                          notiz: notizen[z.id] ?? z.notiz ?? "",
                        })
                      }
                      className="mt-2 rounded-full border border-line px-5 py-2 text-[14px] text-ink-soft transition-colors hover:border-ink hover:text-ink disabled:opacity-50"
                    >
                      Notiz speichern
                    </button>
                  </div>

                  {z.stand.ausgezahlt > 0 || z.stand.storniert > 0 ? (
                    <p className="text-[13.5px] text-ink-soft">
                      Insgesamt ausgezahlt: {preisText(z.stand.ausgezahlt)}
                      {z.stand.storniert > 0
                        ? ` · storniert: ${preisText(z.stand.storniert)}`
                        : ""}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* --------------------------------------------------------------- */}
      {/* Erstattung: die Provision wieder zurücknehmen.                   */}

      <div className="mt-10 rounded-[16px] border border-line bg-cream-deep p-5">
        <h2 className="mb-2 text-[16px] font-semibold text-ink">
          Kauf erstattet? Provision zurücknehmen
        </h2>

        <p className="mb-4 max-w-2xl text-[14px] leading-relaxed text-ink-soft">
          Wenn du einen Kauf über Stripe erstattest, erfährt die Website davon
          nichts. Trag die Bestellnummer hier ein, dann fällt die Provision
          dazu weg. Was schon ausgezahlt ist, bleibt stehen.
        </p>

        <div className="flex max-w-md flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={storno}
            onChange={(e) => setStorno(e.target.value)}
            placeholder="PFD-20260910-4821"
            aria-label="Bestellnummer"
            className="w-full rounded-[12px] border border-line bg-white px-4 py-3 text-[15px] outline-none transition-colors focus:border-rose-deep"
          />
          <button
            type="button"
            disabled={laeuft === "storno" || !storno.trim()}
            onClick={() => void stornieren()}
            className="shrink-0 rounded-full border border-line bg-white px-6 py-3 text-[14px] font-medium text-ink-soft transition-colors hover:border-rose-deep hover:text-rose-deep disabled:opacity-50"
          >
            Zurücknehmen
          </button>
        </div>
      </div>
    </div>
  );
}
