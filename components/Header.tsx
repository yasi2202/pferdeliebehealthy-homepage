import Image from "next/image";
import Link from "next/link";
import { futterCheck } from "@/lib/seite";

export default function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden bg-rose-deep">
      <div className="grid lg:grid-cols-2">
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

        <div className="relative order-2 lg:order-1 flex items-center">
          <div className="w-full px-6 sm:px-10 lg:px-16 pt-32 sm:pt-36 lg:pt-40 pb-16 sm:pb-20 lg:pb-24">
            <span className="inline-block text-[13px] tracking-[0.14em] uppercase text-cream/90 font-semibold mb-4">
              Ernährungsberaterin für Pferde · Odenwald
            </span>

            <p className="text-cream/75 text-[17px] sm:text-lg max-w-lg mb-5">
              Zehn Ratschläge aus dem Stall, drei Zusatzfutter im Schrank — und
              du weißt immer noch nicht, ob es reicht?
            </p>

            <h1 className="font-serif font-normal text-cream text-[34px] sm:text-5xl lg:text-[52px] leading-[1.12] tracking-tight mb-6">
              Dein Pferd verdient keine{" "}
              <em className="italic text-cream underline decoration-gold decoration-2 underline-offset-[6px]">
                Vermutungen
              </em>
              , sondern ein Fundament, das wirklich trägt
            </h1>

            <p className="font-serif italic text-cream text-[19px] sm:text-[22px] mb-7">
              Dein Pferd, gut versorgt. Dein Wissen, gut fundiert.
            </p>

            <p className="text-cream/85 text-lg max-w-xl mb-8">
              Ich schaue mir an, was dein Pferd tatsächlich bekommt, gleiche es
              mit dem ab, was es braucht, und schreibe auf, wo die Lücke ist.
              Danach weißt du, woran du bist.
            </p>

            <div className="flex flex-wrap gap-4 pb-6 sm:pb-10">
              <Link
                href={futterCheck.fragebogen}
                prefetch={false}
                className="bg-cream text-ink px-7 py-4 rounded-full text-[15px] font-medium hover:bg-rose transition-colors"
              >
                Kostenlosen Futter-Check machen
              </Link>

              <Link
                href="#wege"
                className="border border-cream text-cream px-7 py-3.5 rounded-full text-[15px] font-medium hover:bg-cream/15 transition-colors"
              >
                Alle Angebote ansehen
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
