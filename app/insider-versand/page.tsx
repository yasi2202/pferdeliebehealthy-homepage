import type { Metadata } from "next";
import Link from "next/link";
import { alleBeitraege, datumDeutsch } from "@/lib/beitraege";
import { aktuellerInsider } from "@/lib/insider-zugang";
import {
  istAdmin,
  alleVersandvermerke,
  offeneUebernahmen,
  nachfrageSchonRaus,
  bewertungsbitteSchonRaus,
  bewertungsbitteEmpfaenger,
  offeneEinladungen,
  einladungSchonRaus,
} from "@/lib/insider-versand";
import { supabaseZaehlen } from "@/lib/versand";
import VersandKnopf from "@/components/VersandKnopf";
import NachfrageKnopf from "@/components/NachfrageKnopf";
import EinladungKnopf from "@/components/EinladungKnopf";
import BewertungsbitteKnopf from "@/components/BewertungsbitteKnopf";

// ---------------------------------------------------------------------------
// Yasis Versandseite: alle Beiträge, daneben ein Knopf "An alle Insider
// schicken" — und bei denen, die schon raus sind, steht stattdessen, wann und
// an wie viele.
//
// Wer nicht als Yasi angemeldet ist, sieht nichts weiter als einen Hinweis.
// Die Seite steht auch nicht im Suchindex.
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "Versand",
  robots: { index: false, follow: false },
};

/** Wie viele bestätigte Insider es gerade gibt.
 *
 *  Holt nur die Kennungen, keine Adressen — für eine Zahl auf einer Seite
 *  braucht niemand die Liste selbst im Speicher zu haben. */
async function empfaengerZaehlen(): Promise<number> {
  const anzahl = await supabaseZaehlen("insider_anmeldungen?bestaetigt=eq.true");
  return Math.max(anzahl, 0);
}

export default async function VersandSeite() {
  const angemeldet = await aktuellerInsider();

  if (!istAdmin(angemeldet)) {
    return (
      <main className="py-14 sm:py-20 px-6 sm:px-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-serif font-normal text-[30px] sm:text-[40px] leading-tight mb-5">
            Diese Seite ist nicht für dich gedacht
          </h1>
          <p className="text-[17px] text-ink-soft leading-relaxed mb-8">
            Hier verschickt Yasi ihre Beiträge an den Verteiler. Wenn du nach
            den Beiträgen selbst suchst, geht es hier entlang.
          </p>
          <Link
            href="/insider"
            className="inline-block bg-ink text-cream px-7 py-3.5 rounded-full text-[15px] font-medium hover:bg-rose-deep transition-colors"
          >
            Zum Insider-Bereich
          </Link>
        </div>
      </main>
    );
  }

  const beitraege = alleBeitraege();
  const vermerke = await alleVersandvermerke();
  const anzahl = await empfaengerZaehlen();
  const offen = await offeneUebernahmen();
  const nachfrage = await nachfrageSchonRaus();
  const eingeladen = await offeneEinladungen();
  const einladung = await einladungSchonRaus();
  const bewertung = await bewertungsbitteSchonRaus();
  const bewertungEmpfaenger = bewertung ? 0 : await bewertungsbitteEmpfaenger();

  return (
    <main className="py-14 sm:py-20 px-6 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <span className="block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
          Nur für dich
        </span>
        <h1 className="font-serif font-normal text-[32px] sm:text-[44px] leading-[1.12] tracking-tight mb-5">
          Beiträge verschicken
        </h1>
        <p className="text-[17px] text-ink-soft leading-relaxed">
          Dein Verteiler umfasst gerade <strong>{anzahl}</strong>{" "}
          {anzahl === 1 ? "bestätigte Adresse" : "bestätigte Adressen"}. Jede
          Mail enthält einen persönlichen Link, der die Leserin unterwegs
          anmeldet, und einen Abmeldelink.
        </p>

        <div className="bg-cream-deep rounded-[18px] p-6 mt-8">
          <p className="text-[14.5px] text-ink-soft leading-relaxed">
            Jeder Beitrag lässt sich nur einmal verschicken. Willst du einen
            doch noch einmal senden, lösch die Zeile in der Supabase-Tabelle{" "}
            <code className="text-[13.5px]">insider_versand</code>, danach
            geht der Knopf wieder.
          </p>
        </div>

        {/* Die einmalige Nachfrage an die aus alfima übernommenen Adressen.
            Verschwindet, sobald niemand mehr darauf wartet. */}
        {offen > 0 && (
          <div className="bg-cream-deep rounded-[18px] p-6 sm:p-7 mt-6">
            <div className="text-[11px] tracking-[0.16em] uppercase text-rose-deep font-semibold mb-3">
              Aus alfima übernommen
            </div>
            <h2 className="font-serif text-[20px] sm:text-[23px] leading-snug mb-3">
              {offen} {offen === 1 ? "Adresse wartet" : "Adressen warten"} noch
              auf ihre Bestätigung
            </h2>
            <p className="text-[14.5px] text-ink-soft leading-relaxed max-w-xl mb-5">
              Diese Leute haben sich damals bei alfima eingetragen, aber es ist
              kein Bestätigungsklick dokumentiert. Sie bekommen deshalb nichts
              von dir, außer dieser einen Nachfrage. Wer darauf klickt, ist
              danach normal dabei; wer nicht, hört nichts mehr.
            </p>

            {nachfrage ? (
              <p className="text-[14px] text-ink-soft">
                ✓ Nachfrage verschickt am{" "}
                {datumDeutsch(nachfrage.versendet_am.slice(0, 10))} an{" "}
                {nachfrage.empfaenger} Adressen
              </p>
            ) : (
              <NachfrageKnopf anzahl={offen} />
            )}
          </div>
        )}

        {/* ▸ DIE EINMALIGE BITTE UM EINE GOOGLE-BEWERTUNG.
            Zwanzig Bewertungen bei ueber 500 Einzelberatungen: Da fehlt nicht
            die Zufriedenheit, da fehlt das Fragen. Der taegliche Lauf unter
            /api/bewertungsbitte erreicht nur Leute, die ueber die eigene
            Kasse gekauft haben, und die gibt es erst seit dem 01.09.2026.
            Alle Kundinnen davor erreicht nur diese eine Mail.

            Sie geht ausschliesslich an bestaetigte Adressen: Die Frage nach
            der Zufriedenheit ist Werbung (BGH VI ZR 225/17) und braucht eine
            Einwilligung. */}
        <div className="bg-cream-deep rounded-[18px] p-6 sm:p-7 mt-6">
          <div className="text-[11px] tracking-[0.16em] uppercase text-rose-deep font-semibold mb-3">
            Google-Bewertungen
          </div>
          <h2 className="font-serif text-[20px] sm:text-[23px] leading-snug mb-3">
            Einmal den ganzen Verteiler um eine Bewertung bitten
          </h2>
          <p className="text-[14.5px] text-ink-soft leading-relaxed max-w-xl mb-5">
            Zwanzig Bewertungen bei über 500 Einzelberatungen: Da fehlt nicht
            die Zufriedenheit, da fehlt das Fragen. Die Mail bittet um eine
            ehrliche Bewertung, ausdrücklich auch wenn etwas gefehlt hat, und
            bietet an, sich stattdessen bei dir zu melden. Sie geht nur an
            bestätigte Adressen und nur ein einziges Mal.
          </p>

          {/* ▸ ERST ANSEHEN, DANN VERSCHICKEN.
              Ein Rundversand laesst sich nicht zurueckholen. Wer nicht sehen
              kann, was rausgeht, drueckt entweder nie auf den Knopf oder
              einmal zu schnell. Die Vorschau zeigt die echte Mail, aus
              derselben Funktion, die auch verschickt. */}
          <p className="mb-5 text-[14px]">
            <a
              href="/api/insider/bewertung/vorschau"
              target="_blank"
              rel="noopener"
              className="text-rose-deep underline underline-offset-4"
            >
              Die Mail ansehen, bevor sie rausgeht
            </a>
            <span className="text-ink-soft">
              {" "}· Empfänger stehen unter{" "}
            </span>
            <a
              href="/admin/adressen"
              className="text-rose-deep underline underline-offset-4"
            >
              Adressen
            </a>
          </p>

          {bewertung ? (
            <p className="text-[14px] text-ink-soft">
              ✓ Verschickt am{" "}
              {datumDeutsch(bewertung.versendet_am.slice(0, 10))} an{" "}
              {bewertung.empfaenger} Adressen
            </p>
          ) : (
            <BewertungsbitteKnopf anzahl={bewertungEmpfaenger} />
          )}
        </div>

        {/* Die einmalige Einladung an die Bestandskundinnen aus Tentary.
            Verschwindet, sobald niemand mehr darauf wartet. */}
        {eingeladen > 0 && (
          <div className="bg-cream-deep rounded-[18px] p-6 sm:p-7 mt-6">
            <div className="text-[11px] tracking-[0.16em] uppercase text-rose-deep font-semibold mb-3">
              Bestandskundinnen
            </div>
            <h2 className="font-serif text-[20px] sm:text-[23px] leading-snug mb-3">
              {eingeladen} {eingeladen === 1 ? "Adresse wartet" : "Adressen warten"}{" "}
              noch auf ihre Einladung
            </h2>
            <p className="text-[14.5px] text-ink-soft leading-relaxed max-w-xl mb-5">
              Diese Leute haben bei dir gekauft, aber ihr Produkt gibt es in der
              Akademie nicht: Fliegenspray, Fellwechsel, Arthrose und so weiter.
              Sie bekommen deshalb nichts von dir, außer dieser einen Einladung.
              Wer darauf klickt, ist danach normal dabei; wer nicht, hört nichts
              mehr.
            </p>

            {einladung ? (
              <p className="text-[14px] text-ink-soft">
                ✓ Einladung verschickt am{" "}
                {datumDeutsch(einladung.versendet_am.slice(0, 10))} an{" "}
                {einladung.empfaenger} Adressen
              </p>
            ) : (
              <EinladungKnopf anzahl={eingeladen} />
            )}
          </div>
        )}

        <ul className="divide-y divide-line border-t border-line mt-10">
          {beitraege.map((b) => {
            const vermerk = vermerke.find((v) => v.slug === b.slug);
            return (
              <li key={b.slug} className="py-7">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                  <span className="text-[12.5px] text-ink-soft tabular-nums">
                    {datumDeutsch(b.datum)}
                  </span>
                  <span className="text-[11.5px] tracking-[0.1em] uppercase text-rose-deep font-semibold">
                    {b.kategorie}
                  </span>
                </div>

                <h2 className="font-serif text-[21px] leading-snug mb-1">
                  <Link
                    href={`/insider/${b.slug}`}
                    className="hover:text-rose-deep transition-colors"
                  >
                    {b.titel}
                  </Link>
                </h2>

                <p className="text-[14.5px] text-ink-soft max-w-xl mb-4">
                  {b.beschreibung}
                </p>

                {vermerk ? (
                  <p className="text-[14px] text-ink-soft">
                    ✓ Verschickt am{" "}
                    {datumDeutsch(vermerk.versendet_am.slice(0, 10))} an{" "}
                    {vermerk.empfaenger}{" "}
                    {vermerk.empfaenger === 1 ? "Adresse" : "Adressen"}
                  </p>
                ) : (
                  <VersandKnopf slug={b.slug} titel={b.titel} anzahl={anzahl} />
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
