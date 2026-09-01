"use client";

// ---------------------------------------------------------------------------
// Die Kasse: Anschrift links, Bestellübersicht rechts.
//
// ▸ Warum die Kasse hier liegt und nicht bei Stripe:
//   Nach deutschem Recht (§ 312j BGB, die sogenannte Button-Lösung) müssen
//   unmittelbar über dem Bestellknopf die Ware, der Gesamtpreis und die
//   Versandkosten stehen, und der Knopf muss ausdrücklich sagen, dass die
//   Bestellung etwas kostet. Deshalb steht hier „Zahlungspflichtig bestellen"
//   und keine freundlichere Formulierung. Bitte nicht umbenennen.
//   Stripe kommt erst danach und macht nur noch die Bezahlung.
//
// ▸ Was hier steht, ist die Anzeige. Gerechnet wird zusätzlich noch einmal
//   auf dem Server, siehe app/api/kasse/route.ts. Der Browser bestimmt keine
//   Preise.
// ---------------------------------------------------------------------------

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useWarenkorb } from "@/components/WarenkorbProvider";
import { laender, preisText, versandhinweis } from "@/lib/shop";

type Felder = {
  vorname: string;
  nachname: string;
  email: string;
  strasse: string;
  plz: string;
  ort: string;
  land: "DE" | "AT";
  anmerkung: string;
};

const LEER: Felder = {
  vorname: "",
  nachname: "",
  email: "",
  strasse: "",
  plz: "",
  ort: "",
  // Das erste Land aus der Liste, nicht fest "DE" -- so stimmt der Startwert
  // auch dann noch, wenn in lib/shop.ts einmal etwas anderes obenan steht.
  land: laender[0].code,
  anmerkung: "",
};

const EMAIL_MUSTER = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Damit alle Eingabefelder gleich aussehen. */
const FELD =
  "w-full rounded-[12px] border border-line bg-white px-4 py-3 text-[15px] outline-none transition-colors focus:border-rose-deep";

export default function KasseFormular() {
  const { zeilen, summe, bereit, setzeMenge } = useWarenkorb();
  const [felder, setFelder] = useState<Felder>(LEER);
  const [einverstanden, setEinverstanden] = useState(false);
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  const versand = useMemo(
    () => laender.find((l) => l.code === felder.land)?.kosten ?? 0,
    [felder.land],
  );

  const gesamt = summe + versand;

  const setze = (name: keyof Felder) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setFelder((alt) => ({ ...alt, [name]: e.target.value }));
    setFehler(null);
  };

  const vollstaendig =
    felder.vorname.trim() !== "" &&
    felder.nachname.trim() !== "" &&
    EMAIL_MUSTER.test(felder.email.trim()) &&
    felder.strasse.trim() !== "" &&
    felder.plz.trim() !== "" &&
    felder.ort.trim() !== "" &&
    einverstanden &&
    zeilen.length > 0;

  const bestellen = async () => {
    if (!vollstaendig || laeuft) {
      return;
    }

    setLaeuft(true);
    setFehler(null);

    try {
      const antwort = await fetch("/api/kasse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          korb: zeilen.map((z) => ({ slug: z.slug, menge: z.menge })),
          ...felder,
        }),
      });

      const daten = await antwort.json();

      if (!antwort.ok || !daten.url) {
        setFehler(
          daten.fehler ??
            "Da ist etwas schiefgegangen. Versuch es bitte noch einmal oder schreib mir an info@pferdeliebehealthy.de.",
        );
        setLaeuft(false);
        return;
      }

      // Weiter zu Stripe. Der Warenkorb bleibt absichtlich stehen: Wer die
      // Bezahlung abbricht, kommt zurück und findet alles wieder vor.
      // Geleert wird er erst auf der Dankeseite.
      window.location.href = daten.url;
    } catch {
      setFehler(
        "Die Verbindung hat nicht geklappt. Prüf bitte kurz dein Netz und versuch es noch einmal.",
      );
      setLaeuft(false);
    }
  };

  // Solange der Korb noch nicht aus dem Browser gelesen ist, darf hier nichts
  // Endgültiges stehen -- sonst blitzt „Warenkorb ist leer" kurz auf.
  if (!bereit) {
    return (
      <div className="rounded-[18px] border border-line bg-white p-8 text-[15px] text-ink-soft">
        Einen Moment, ich hole deinen Warenkorb.
      </div>
    );
  }

  if (zeilen.length === 0) {
    return (
      <div className="rounded-[18px] border border-line bg-white p-8">
        <p className="text-[16px]">Dein Warenkorb ist leer.</p>

        <Link
          href="/shop"
          className="mt-5 inline-block rounded-full bg-ink px-6 py-3 text-[14px] font-medium text-cream transition-colors hover:bg-rose-deep"
        >
          Zum Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px] lg:gap-12">
      {/* ------------------------------------------------------------------ */}
      {/* Anschrift                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="rounded-[18px] border border-line bg-white p-6 sm:p-8">
        <h2 className="mb-6 font-serif text-[22px]">Wohin darf es gehen?</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[13.5px] text-ink-soft">
              Vorname
            </span>
            <input
              type="text"
              autoComplete="given-name"
              value={felder.vorname}
              onChange={setze("vorname")}
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
              value={felder.nachname}
              onChange={setze("nachname")}
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
              value={felder.email}
              onChange={setze("email")}
              className={FELD}
            />
            <span className="mt-1.5 block text-[12.5px] text-ink-soft">
              Hierhin schicke ich die Bestellbestätigung.
            </span>
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-[13.5px] text-ink-soft">
              Straße und Hausnummer
            </span>
            <input
              type="text"
              autoComplete="street-address"
              value={felder.strasse}
              onChange={setze("strasse")}
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
              value={felder.plz}
              onChange={setze("plz")}
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
              value={felder.ort}
              onChange={setze("ort")}
              className={FELD}
            />
          </label>

          {/* Solange nur ein Land beliefert wird, wäre ein Ausklappfeld mit
              einem einzigen Eintrag eine Zumutung. Dann steht das Land einfach
              da. Kommt in lib/shop.ts ein zweites dazu, erscheint die Auswahl
              von selbst wieder. */}
          <div className="block sm:col-span-2">
            <span className="mb-1.5 block text-[13.5px] text-ink-soft">
              Land
            </span>

            {laender.length > 1 ? (
              <select
                value={felder.land}
                onChange={setze("land")}
                aria-label="Land"
                className={FELD}
              >
                {laender.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="rounded-[12px] border border-line bg-cream-deep px-4 py-3 text-[15px]">
                {laender[0].name}
              </div>
            )}

            <span className="mt-1.5 block text-[12.5px] text-ink-soft">
              {versandhinweis}
            </span>
          </div>

          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-[13.5px] text-ink-soft">
              Möchtest du mir noch etwas mitgeben? (freiwillig)
            </span>
            <textarea
              rows={3}
              value={felder.anmerkung}
              onChange={setze("anmerkung")}
              className={`${FELD} resize-none`}
            />
          </label>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Bestellübersicht                                                   */}
      {/* ------------------------------------------------------------------ */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[18px] border border-line bg-white p-6 sm:p-7">
          <h2 className="mb-5 font-serif text-[22px]">Deine Bestellung</h2>

          <ul>
            {zeilen.map((z) => (
              <li key={z.slug} className="flex gap-3.5 border-b border-line py-3.5 first:pt-0">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[10px] bg-cream-deep">
                  {z.produkt.bilder[0] && (
                    <Image
                      src={z.produkt.bilder[0].datei}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  )}
                </div>

                <div className="flex-grow">
                  <div className="text-[14.5px] leading-snug">
                    {z.produkt.kurzname}
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-[13px] text-ink-soft">
                    <button
                      type="button"
                      onClick={() => setzeMenge(z.slug, z.menge - 1)}
                      aria-label={`Eine ${z.produkt.kurzname} weniger`}
                      className="transition-colors hover:text-ink"
                    >
                      &minus;
                    </button>
                    <span className="tabular-nums">{z.menge} Stück</span>
                    <button
                      type="button"
                      onClick={() => setzeMenge(z.slug, z.menge + 1)}
                      aria-label={`Eine ${z.produkt.kurzname} mehr`}
                      className="transition-colors hover:text-ink"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="shrink-0 text-[14.5px] tabular-nums">
                  {preisText(z.zwischensumme)}
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-2 text-[14.5px]">
            <div className="flex justify-between">
              <span className="text-ink-soft">Zwischensumme</span>
              <span className="tabular-nums">{preisText(summe)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-ink-soft">Versand</span>
              <span className="tabular-nums">{preisText(versand)}</span>
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
            <span className="text-[16px] font-medium">Gesamt</span>
            <span className="font-serif text-[26px] tabular-nums">
              {preisText(gesamt)}
            </span>
          </div>

          <p className="mt-1.5 text-[12.5px] text-ink-soft">
            Inklusive Mehrwertsteuer.
          </p>

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
            onClick={bestellen}
            disabled={!vollstaendig || laeuft}
            className="mt-5 w-full rounded-full bg-ink px-6 py-4 text-[15px] font-medium text-cream transition-colors hover:bg-rose-deep disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-ink"
          >
            {laeuft ? "Einen Moment…" : "Zahlungspflichtig bestellen"}
          </button>

          <p className="mt-3 text-center text-[12.5px] text-ink-soft">
            Bezahlt wird im nächsten Schritt sicher über Stripe. Kreditkarte,
            PayPal, Klarna und Apple Pay stehen dort zur Wahl, je nachdem, was
            dein Gerät anbietet.
          </p>
        </div>
      </div>
    </div>
  );
}
