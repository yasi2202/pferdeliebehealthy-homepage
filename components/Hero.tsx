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
          <div className="w-full px-6 sm:px-10 lg:px-16 py-16 lg:py-24">
            <span className="inline-block text-[13px] tracking-[0.14em] uppercase text-gold font-semibold mb-4">
              Ernährungsberaterin für Pferde · Odenwald
            </span>
            <h1 className="font-serif font-normal text-cream text-[34px] sm:text-5xl lg:text-[52px] leading-[1.12] tracking-tight mb-6">
              Dein Pferd verdient keine{" "}
              <em className="italic text-gold">Vermutungen</em>, sondern ein
              Fundament, das wirklich trägt
            </h1>
            <p className="text-cream/85 text-lg max-w-xl mb-8">
              Ich begleite Pferdebesitzerinnen und angehende Beraterinnen
              dabei, Fütterung nicht mehr dem Zufall zu überlassen.
              Ganzheitlich, individuell und mit einem System, das auch dann
              für dein Pferd oder deine Kundinnen arbeitet, wenn du gerade
              selbst keine Zeit dafür hast.
            </p>
            <div className="flex flex-wrap gap-4 mb-10">
              <Link
                href="#kontakt"
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
            <div className="flex gap-10 flex-wrap">
              <div>
                <div className="font-serif text-[30px] text-gold">28</div>
                <div className="text-[13px] text-cream/75">
                  Jahre Erfahrung mit Helena
                </div>
              </div>
              <div>
                <div className="font-serif text-[30px] text-gold">8</div>
                <div className="text-[13px] text-cream/75">
                  Module in der Ausbildung
                </div>
              </div>
              <div>
                <div className="font-serif text-[30px] text-gold">1:1</div>
                <div className="text-[13px] text-cream/75">
                  Individuelle Gesundheitsakten
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
