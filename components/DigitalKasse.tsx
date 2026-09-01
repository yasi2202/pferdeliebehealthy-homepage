"use client";

// ---------------------------------------------------------------------------
// Die Kasse für digitale Produkte: Kurse und Pläne.
//
// ▸ WARUM DIE KASSE HIER LIEGT UND NICHT BEI STRIPE
//   Nach deutschem Recht (§ 312j BGB, die sogenannte Button-Lösung) müssen
//   unmittelbar über dem Bestellknopf die Leistung und der Gesamtpreis
//   stehen, und der Knopf muss ausdrücklich sagen, dass die Bestellung etwas
//   kostet. Deshalb steht hier "Zahlungspflichtig bestellen" und keine
//   freundlichere Formulierung. Bitte nicht umbenennen. Stripe kommt erst
//   danach und macht nur noch die Bezahlung.
//
// ▸ WARUM HIER EINE ANSCHRIFT STEHT, OBWOHL NICHTS VERSCHICKT WIRD
//   Bis 250 € würde eine Kleinbetragsrechnung ohne Anschrift genügen.
//   Yasemin hat sich am 31.08.2026 bewusst dagegen entschieden, damit alle
//   Rechnungen gleich aussehen, sich in ein Buchhaltungsprogramm einlesen
//   lassen und auch bei einem teureren Produkt noch vollständig sind.
//   Jedes Pflichtfeld kostet allerdings Käufe, deshalb steht neben der
//   Anschrift, wofür sie gebraucht wird.
//
// ▸ DIE DREI HÄKCHEN, IN DIESER REIHENFOLGE
//   1. AGB, Widerruf, Datenschutz gelesen. Pflicht, wie im Shop.
//   2. Sofortiger Zugang und damit Verzicht auf den Widerruf. Pflicht, und
//      der wichtigste Satz auf dieser Seite. Ohne ihn dürfte der Zugang erst
//      nach vierzehn Tagen freigeschaltet werden. Warum das so ist, steht
//      ausführlich in app/api/digitalkasse/route.ts.
//   3. Newsletter. FREIWILLIG und nicht vorangekreuzt. Das muss so bleiben:
//      Ein vorangekreuztes Häkchen ist keine wirksame Einwilligung.
//
// ▸ Was hier steht, ist die Anzeige. Der Preis wird auf dem Server noch
//   einmal aus lib/digital.ts geholt. Der Browser bestimmt keine Preise.
// ---------------------------------------------------------------------------

import Link from "next/link";
import { useState } from "react";
import { preisText } from "@/lib/shop";
import type { DigitalProdukt } from "@/lib/digital";

const LAENDER = [
  { code: "DE", name: "Deutschland" },
  { code: "AT", name: "Österreich" },
  { code: "CH", name: "Schweiz" },
  { code: "XX", name: "Ein anderes Land" },
];

const EMAIL_MUSTER = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const FELD =
  "w-full rounded-[12px] border border-line bg-white px-4 py-3 text-[15px] outline-none transition-colors focus:border-rose-deep";

export default function DigitalKasse({
  produkt,
  mitAngebot,
}: {
  produkt: DigitalProdukt;
  /** Ob nach dem Kauf ein Angebot kommt. Nur dann wird die Zahlungsart
   *  gespeichert, und nur dann darf der Hinweis dazu erscheinen. */
  mitAngebot: boolean;
}) {
  const [vorname, setVorname] = useState("");
  const [nachname, setNachname] = useState("");
  const [email, setEmail] = useState("");
  const [strasse, setStrasse] = useState("");
  const [plz, setPlz] = useState("");
  const [ort, setOrt] = useState("");
  const [land, setLand] = useState("DE");

  // Der Rabattcode. `rabatt` ist erst gesetzt, wenn der Server ihn bestätigt
  // hat. Was hier steht, ist nur die Anzeige: Gerechnet wird noch einmal
  // beim Bestellen, siehe app/api/digitalkasse/route.ts.
  const [code, setCode] = useState("");
  const [codeLaeuft, setCodeLaeuft] = useState(false);
  const [codeFehler, setCodeFehler] = useState<string | null>(null);
  const [rabatt, setRabatt] = useState<{
    code: string;
    rabattCent: number;
    endpreis: number;
  } | null>(null);
  const [einverstanden, setEinverstanden] = useState(false);
  const [sofort, setSofort] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  // Bei einem Fernlehrgang gibt es kein Verzichtshäkchen, deshalb darf es
  // dort auch nicht Voraussetzung für den Kauf sein.
  const brauchtVerzicht = produkt.art !== "fernunterricht";

  const vollstaendig =
    vorname.trim().length >= 2 &&
    nachname.trim().length >= 2 &&
    EMAIL_MUSTER.test(email.trim()) &&
    strasse.trim().length >= 4 &&
    plz.trim().length >= 4 &&
    ort.trim().length >= 2 &&
    einverstanden &&
    (sofort || !brauchtVerzicht);

  const zuZahlen = rabatt ? rabatt.endpreis : produkt.preis;

  const codePruefen = async () => {
    if (!code.trim() || codeLaeuft) return;

    setCodeLaeuft(true);
    setCodeFehler(null);

    try {
      const antwort = await fetch("/api/rabattcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: produkt.slug, code }),
      });

      const daten = await antwort.json();

      if (daten.gueltig) {
        setRabatt({
          code: daten.code,
          rabattCent: daten.rabattCent,
          endpreis: daten.endpreis,
        });
      } else {
        setRabatt(null);
        setCodeFehler(daten.fehler ?? "Dieser Code gilt nicht.");
      }
    } catch {
      setCodeFehler("Der Code liess sich gerade nicht prüfen.");
    }

    setCodeLaeuft(false);
  };

  const codeEntfernen = () => {
    setRabatt(null);
    setCode("");
    setCodeFehler(null);
  };

  const kaufen = async () => {
    if (!vollstaendig || laeuft) return;

    setLaeuft(true);
    setFehler(null);

    try {
      const antwort = await fetch("/api/digitalkasse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: produkt.slug,
          vorname,
          nachname,
          email,
          strasse,
          plz,
          ort,
          land,
          einverstanden,
          widerrufVerzicht: sofort,
          newsletter,
          rabattcode: rabatt ? rabatt.code : "",
        }),
      });

      const daten = await antwort.json();

      // Zwei mögliche Wege zurück:
      //   `url`    -> weiter zur Bezahlseite von Stripe, der Normalfall.
      //   `weiter` -> ein Rabattcode hat den Preis auf null gesenkt, es gibt
      //               nichts zu bezahlen, der Zugang ist schon freigeschaltet.
      const ziel = daten.url ?? daten.weiter;

      if (!antwort.ok || !ziel) {
        setFehler(
          daten.fehler ??
            "Da ist etwas schiefgegangen. Versuch es bitte noch einmal oder schreib mir an info@pferdeliebehealthy.de.",
        );
        setLaeuft(false);
        return;
      }

      window.location.href = ziel;
    } catch {
      setFehler(
        "Die Verbindung hat nicht geklappt. Prüf bitte kurz dein Netz und versuch es noch einmal.",
      );
      setLaeuft(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px] lg:gap-12">
      {/* ------------------------------------------------------------------ */}
      {/* Deine Angaben                                                      */}
      {/* ------------------------------------------------------------------ */}
      <div className="rounded-[18px] border border-line bg-white p-6 sm:p-8">
        <h2 className="mb-2 font-serif text-[22px]">Deine Angaben</h2>

        <p className="mb-6 text-[14.5px] leading-relaxed text-ink-soft">
          {produkt.art === "dienstleistung"
            ? "Es wird nichts verschickt, wir schreiben uns per Mail. Die Anschrift brauche ich nur für deine Rechnung."
            : "Es wird nichts verschickt, deinen Zugang bekommst du per Mail. Die Anschrift brauche ich nur für deine Rechnung."}
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[13.5px] text-ink-soft">
              Vorname
            </span>
            <input
              type="text"
              autoComplete="given-name"
              value={vorname}
              onChange={(e) => {
                setVorname(e.target.value);
                setFehler(null);
              }}
              className={FELD}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13.5px] text-ink-soft">
              Nachname
            </span>
            <input
              type="text"
              autoComplete="family-name"
              value={nachname}
              onChange={(e) => {
                setNachname(e.target.value);
                setFehler(null);
              }}
              className={FELD}
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-[13.5px] text-ink-soft">
              E-Mail-Adresse
            </span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFehler(null);
              }}
              className={FELD}
            />
            <span className="mt-1.5 block text-[12.5px] text-ink-soft">
              Hierhin schicke ich deinen Zugang. Bitte prüf sie kurz, eine
              vertippte Adresse ist der häufigste Grund, warum die Mail nicht
              ankommt.
            </span>
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-[13.5px] text-ink-soft">
              Straße und Hausnummer
            </span>
            <input
              type="text"
              autoComplete="street-address"
              value={strasse}
              onChange={(e) => {
                setStrasse(e.target.value);
                setFehler(null);
              }}
              className={FELD}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13.5px] text-ink-soft">
              Postleitzahl
            </span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              value={plz}
              onChange={(e) => {
                setPlz(e.target.value);
                setFehler(null);
              }}
              className={FELD}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13.5px] text-ink-soft">
              Ort
            </span>
            <input
              type="text"
              autoComplete="address-level2"
              value={ort}
              onChange={(e) => {
                setOrt(e.target.value);
                setFehler(null);
              }}
              className={FELD}
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-[13.5px] text-ink-soft">
              Land
            </span>
            <select
              value={land}
              onChange={(e) => setLand(e.target.value)}
              className={FELD}
            >
              {LAENDER.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Übersicht und Bestellknopf                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[18px] border border-line bg-white p-6 sm:p-7">
          <h2 className="mb-5 font-serif text-[22px]">Dein Kauf</h2>

          {/* Leistung und Preis stehen unmittelbar über dem Knopf. Das ist
              die Button-Lösung, siehe Kommentar oben. Nicht verschieben. */}
          <div className="border-b border-line pb-4">
            <div className="text-[15px] leading-snug">{produkt.name}</div>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
              {produkt.leistung}
            </p>
          </div>

          {/* ------------------------------------------------- Rabattcode */}
          {/* Steht über der Summe, damit der Endpreis darunter immer der
              ist, der auch abgebucht wird. Der Gesamtpreis muss unmittelbar
              über dem Bestellknopf stehen, siehe Kommentar oben. */}
          <div className="mt-4">
            {rabatt ? (
              <div className="flex items-start justify-between gap-3 rounded-[12px] bg-cream-deep px-4 py-3">
                <span className="text-[13.5px] leading-relaxed">
                  Code <strong>{rabatt.code}</strong> ist eingelöst.
                </span>
                <button
                  type="button"
                  onClick={codeEntfernen}
                  className="shrink-0 text-[13px] text-ink-soft underline underline-offset-2 transition-colors hover:text-ink"
                >
                  entfernen
                </button>
              </div>
            ) : (
              <>
                <label className="mb-1.5 block text-[13.5px] text-ink-soft">
                  Rabattcode (falls du einen hast)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      setCodeFehler(null);
                    }}
                    onKeyDown={(e) => {
                      // Enter darf hier nicht das Formular abschicken,
                      // sondern prüft den Code. Sonst wäre der häufigste
                      // Ablauf ein versehentlicher Kauf ohne Rabatt.
                      if (e.key === "Enter") {
                        e.preventDefault();
                        codePruefen();
                      }
                    }}
                    placeholder="z. B. FELLWECHSEL25"
                    className={`${FELD} flex-grow`}
                  />
                  <button
                    type="button"
                    onClick={codePruefen}
                    disabled={!code.trim() || codeLaeuft}
                    className="shrink-0 rounded-[12px] border border-line px-4 text-[14px] transition-colors hover:border-rose-deep disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {codeLaeuft ? "…" : "Einlösen"}
                  </button>
                </div>
                {codeFehler && (
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                    {codeFehler}
                  </p>
                )}
              </>
            )}
          </div>

          {/* ------------------------------------------------------ Summe */}
          {rabatt && (
            <div className="mt-4 space-y-1.5 border-t border-line pt-4 text-[14.5px]">
              <div className="flex justify-between">
                <span className="text-ink-soft">Preis</span>
                <span className="tabular-nums">{preisText(produkt.preis)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-soft">Rabatt</span>
                <span className="tabular-nums">
                  &minus;{preisText(rabatt.rabattCent)}
                </span>
              </div>
            </div>
          )}

          <div
            className={`flex items-baseline justify-between ${
              rabatt ? "mt-3" : "mt-4 border-t border-line pt-4"
            }`}
          >
            <span className="text-[16px] font-medium">Gesamt</span>

            <span className="flex items-baseline gap-3">
              {/* Der frühere Preis, falls es einen gibt und gerade kein
                  Rabattcode läuft. Bei aktivem Code stünden sonst zwei
                  durchgestrichene Beträge nebeneinander, und niemand wüsste,
                  worauf sich was bezieht. Wann ein Streichpreis überhaupt
                  gesetzt werden darf, steht bei `statt` in lib/digital.ts. */}
              {!rabatt && produkt.statt && produkt.statt > produkt.preis && (
                <span className="text-[16px] text-ink-soft line-through tabular-nums">
                  {preisText(produkt.statt)}
                </span>
              )}
              <span className="font-serif text-[26px] tabular-nums">
                {preisText(zuZahlen)}
              </span>
            </span>
          </div>

          <p className="mt-1.5 text-[12.5px] text-ink-soft">
            {zuZahlen === 0
              ? "Mit diesem Code ist nichts zu zahlen. Du bekommst deinen Zugang sofort."
              : `Einmalig, inklusive ${produkt.mwst} % Mehrwertsteuer. Kein Abo.`}
          </p>

          {/* --------------------------------------------------- Häkchen 1 */}
          <label className="mt-6 flex cursor-pointer gap-3 text-[13.5px] leading-relaxed text-ink-soft">
            <input
              type="checkbox"
              checked={einverstanden}
              onChange={(e) => {
                setEinverstanden(e.target.checked);
                setFehler(null);
              }}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[color:var(--rose-deep)]"
            />
            <span>
              Ich habe die{" "}
              <Link
                href="/agb"
                target="_blank"
                className="text-rose-deep underline underline-offset-2"
              >
                AGB
              </Link>
              , die{" "}
              <Link
                href="/widerrufsbelehrung"
                target="_blank"
                className="text-rose-deep underline underline-offset-2"
              >
                Widerrufsbelehrung
              </Link>{" "}
              und die{" "}
              <Link
                href="/datenschutz"
                target="_blank"
                className="text-rose-deep underline underline-offset-2"
              >
                Datenschutzerklärung
              </Link>{" "}
              gelesen.
            </span>
          </label>

          {/* --------------------------------------------------- Häkchen 2 */}
          {/* Der Wortlaut ist rechtlich vorgegeben und muss beide Teile
              enthalten: die Zustimmung zum sofortigen Beginn UND die
              Kenntnis von den Folgen. Bitte nicht umformulieren, auch nicht
              freundlicher.

              ▸ ZWEI FASSUNGEN, UND DER UNTERSCHIED IST WICHTIG:
                Bei einem KURS erlischt das Widerrufsrecht, sobald die Kundin
                den Zugang hat. Ein Satz, fertig.
                Bei einer DIENSTLEISTUNG wie Pferdeliebe 365 erlischt es erst,
                wenn die Leistung vollständig erbracht ist, also nach der
                Akte und den vier Wochen Begleitung. Bis dahin kann die
                Kundin widerrufen. Sie schuldet dann aber Wertersatz für das,
                was bis dahin gemacht wurde -- und zwar nur, wenn sie genau
                das hier vorher bestätigt hat. Ohne diesen Satz arbeitest du
                bis zu vierzehn Werktage an einer Akte und bekommst bei einem
                Widerruf nichts. */}
          {/* ▸ BEI EINEM FERNLEHRGANG STEHT HIER KEIN HÄKCHEN, SONDERN EIN
              HINWEIS. Das ist kein Versehen und auch keine Bequemlichkeit:
              § 4 FernUSG gibt der Teilnehmerin ein eigenes Widerrufsrecht,
              und § 8 FernUSG erklärt jede Abweichung zu ihrem Nachteil für
              unwirksam. Ein Häkchen "mein Widerrufsrecht erlischt" hätte
              hier also keine Wirkung. Es stehen zu lassen wäre schlimmer als
              es wegzulassen: Es sähe nach einer Absicherung aus, die es
              nicht gibt, und im Streitfall stünde die Frage im Raum, ob die
              Teilnehmerin bewusst falsch informiert wurde. */}
          {!brauchtVerzicht && (
            <p className="mt-4 rounded-[12px] bg-cream-deep p-4 text-[13.5px] leading-relaxed text-ink-soft">
              Für diesen Lehrgang gilt das Widerrufsrecht nach dem
              Fernunterrichtsschutzgesetz: Du kannst innerhalb von vierzehn
              Tagen widerrufen, auch wenn du schon angefangen hast. Nach sechs
              Monaten kannst du den Vertrag ausserdem jederzeit kündigen.
            </p>
          )}

          {brauchtVerzicht && (
          <label className="mt-4 flex cursor-pointer gap-3 text-[13.5px] leading-relaxed text-ink-soft">
            <input
              type="checkbox"
              checked={sofort}
              onChange={(e) => {
                setSofort(e.target.checked);
                setFehler(null);
              }}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[color:var(--rose-deep)]"
            />
            <span>
              {produkt.art === "dienstleistung" ? (
                <>
                  Ich möchte, dass du mit der Leistung sofort beginnst, noch
                  vor Ablauf der Widerrufsfrist. Mir ist bekannt, dass mein
                  Widerrufsrecht erst mit der vollständigen Erbringung
                  erlischt und ich bei einem Widerruf Wertersatz für das
                  schulde, was bis dahin geleistet wurde.
                </>
              ) : (
                <>
                  Ich möchte den Zugang sofort, noch vor Ablauf der
                  Widerrufsfrist. Mir ist bekannt, dass mein Widerrufsrecht
                  damit erlischt, sobald ich den Zugang erhalten habe.
                </>
              )}
            </span>
          </label>
          )}

          {/* --------------------------------------------------- Häkchen 3 */}
          <label className="mt-4 flex cursor-pointer gap-3 text-[13.5px] leading-relaxed text-ink-soft">
            <input
              type="checkbox"
              checked={newsletter}
              onChange={(e) => setNewsletter(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[color:var(--rose-deep)]"
            />
            <span>
              Schick mir gerne deine Futter-Tipps per Mail. Abmelden kann ich
              mich jederzeit mit einem Klick.
            </span>
          </label>

          {fehler && (
            <p
              role="alert"
              className="mt-4 rounded-[12px] bg-cream-deep p-4 text-[14px] leading-relaxed"
            >
              {fehler}
            </p>
          )}

          {/* Der Knopftext ist rechtlich vorgegeben. Siehe Kommentar oben. */}
          <button
            type="button"
            onClick={kaufen}
            disabled={!vollstaendig || laeuft}
            className="mt-5 w-full rounded-full bg-ink px-6 py-4 text-[15px] font-medium text-cream transition-colors hover:bg-rose-deep disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-ink"
          >
            {laeuft ? "Einen Moment…" : "Zahlungspflichtig bestellen"}
          </button>

          <p className="mt-3 text-[12.5px] leading-relaxed text-ink-soft">
            Bezahlt wird im nächsten Schritt sicher über Stripe. Kreditkarte,
            PayPal, Klarna und Apple Pay stehen dort zur Wahl, je nachdem, was
            dein Gerät anbietet.
          </p>

          {/* Eine gespeicherte Zahlungsart legt man nicht stillschweigend an.
              Dieser Hinweis gehört zum Ein-Klick-Angebot dazu. Wenn der
              Upsell für dieses Produkt je wegfällt, verschwindet er von
              selbst, weil dann `mitAngebot` false ist.

              Der Satz nennt bewusst die Karte: Bei PayPal und Klarna wird
              nichts hinterlegt, dort führt das Angebot über die normale
              Bezahlseite. Warum das so ist, steht in lib/digital-server.ts. */}
          {mitAngebot && (
            <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">
              Zahlst du mit Karte, wird sie bei Stripe hinterlegt, damit du
              ein mögliches Anschlussangebot mit einem Klick annehmen kannst.
              Es wird nichts ohne dein Zutun abgebucht.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
