import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden bg-rose-deep">
      <div className="grid lg:grid-cols-2">
        {/* Image side — full photo, no crop */}
        <div className="relative order-1 lg:order-2 flex items-center justify-center bg-rose-deep">
          <Image
            src="/images/yasi-helena.jpg"
            alt="Yasi mit ihrer Stute Helena"
            width={1122}
            height={1402}
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="w-full h-auto"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-rose-deep/50 via-transparent to-transparent lg:hidden" />
          <div className="hidden lg:block absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-rose-deep to-transparent" />
          <div className="hidden lg:block absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-rose-deep/60 to-transparent" />
          <div className="hidden lg:block absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-rose-deep/60 to-transparent" />
        </div>

        {/* Text side */}
        <div className="relative order-2 lg:order-1 flex items-center">
          {/* Oben mehr Abstand als unten: Die Kopfleiste liegt ueber dem Hero,
              und seit die Zeile "Ernährungsberaterin für Pferde" weg ist,
              fehlt der Puffer, den sie mitgebracht hat. Ohne ihn klebt der
              erste Satz am Logo. */}
          <div className="w-full px-6 sm:px-10 lg:px-16 pt-24 pb-16 lg:pt-32 lg:pb-24">
            {/* Hier stand bis zum 07.09.2026 "Ernährungsberaterin für Pferde
                · Odenwald". Raus auf Yasemins Wunsch: Die Zeile stellte die
                Beratung nach vorn, und um die geht es auf dieser Seite nicht
                mehr zuerst. Für Google steht sie weiter in den Metadaten von
                app/layout.tsx und im Text von AboutSection. */}
            {/* Anrede: spricht eine konkrete Person an, statt allgemein zu
                behaupten. Danach erst das Versprechen. */}
            <p className="text-cream/75 text-[17px] sm:text-lg max-w-lg mb-5">
              Zehn Ratschläge aus dem Stall, drei Zusatzfutter im Schrank, und
              du weißt immer noch nicht, ob es reicht?
            </p>

            {/* ▸ AM 08.09.2026 EIN WORT GEAENDERT: "ein Fundament" heisst jetzt
                "eine Fütterung".

                Grund: Die Überschrift ist das stärkste Signal, das Google auf
                einer Seite liest, und in dieser stand bisher nicht, worum es
                geht. "Fundament" kann alles sein, ein Hausbau, ein
                Sparvertrag. Jetzt steht das Thema drin, ohne dass der Satz
                seinen Klang verliert: Es bleibt derselbe Rhythmus und
                derselbe hervorgehobene Gegensatz zu "Vermutungen".

                Bitte kein Stichwortstapeln daraus machen. Eine Überschrift,
                die verkauft, ist mehr wert als eine, die Begriffe aufzählt. */}
            <h1 className="font-serif font-normal text-cream text-[34px] sm:text-5xl lg:text-[52px] leading-[1.12] tracking-tight mb-6">
              Dein Pferd verdient keine{" "}
              <em className="italic text-cream underline decoration-gold decoration-2 underline-offset-[6px]">
                Vermutungen
              </em>
              , sondern eine Fütterung, die wirklich trägt
            </h1>

            {/* Der Slogan stand bisher versteckt unter „Über mich". */}
            <p className="font-serif italic text-cream text-[19px] sm:text-[22px] mb-7">
              Dein Pferd, gut versorgt. Dein Wissen, gut fundiert.
            </p>

            {/* AM 07.09.2026 VON BERATUNG AUF KURSE GEDREHT.
                Vorher stand hier "Ich schaue mir an ... ich schreibe auf, wo
                die Lücke ist". Das beschreibt eine Leistung, die Yasemin
                erbringt, und macht jede Besucherin zur Auftraggeberin. Der
                Schwerpunkt liegt jetzt auf den Kursen: Wer selbst rechnen
                kann, braucht niemanden zu fragen. Die Beratung gibt es
                weiterhin, sie steht nur nicht mehr als Erstes da. */}
            <p className="text-cream/85 text-lg max-w-xl mb-8">
              In meinen Kursen lernst du, selbst zu sehen, was dein Pferd
              braucht. Mit Rechnern, die deine Zahlen nehmen, und Erklärungen,
              die auch dann noch tragen, wenn der nächste Trend kommt.
            </p>
            {/* Die drei Zahlen 28 / 8 / 1:1 standen hier wie eine Statistik,
                messen aber Verschiedenes. An ihre Stelle tritt der Auszug aus
                dem RatioPro-Auszug direkt unter dem Hero. */}
            <div className="flex flex-wrap gap-4 pb-6 sm:pb-10">
              {/* Der erste Knopf führt zu den Kursen, nicht mehr zum
                  Futter-Check. Der zweite bleibt kostenlos, damit auch
                  mitnehmen kann, wer heute nichts kaufen will. */}
              <Link
                href="#wege"
                className="bg-cream text-ink px-7 py-4 rounded-full text-[15px] font-medium hover:bg-rose transition-colors"
              >
                Kurse ansehen
              </Link>
              <Link
                href="/stall-organizer"
                className="border border-cream text-cream px-7 py-3.5 rounded-full text-[15px] font-medium hover:bg-cream/15 transition-colors"
              >
                Stall Organizer holen, kostenlos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
