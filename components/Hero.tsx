import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-end overflow-hidden">
      <Image
        src="/images/yasi-helena.jpg"
        alt="Yasi mit ihrer Stute Helena"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[68%_22%]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/40 via-55% to-ink/85" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-8 pt-36 pb-20 sm:pb-24">
        <span className="inline-block text-[13px] tracking-[0.14em] uppercase text-rose font-semibold mb-4">
          Ernährungsberaterin für Pferde · Odenwald
        </span>
        <h1 className="font-serif font-normal text-cream text-[34px] sm:text-5xl lg:text-[62px] leading-[1.12] tracking-tight max-w-3xl mb-6">
          Dein Pferd verdient keine{" "}
          <em className="italic text-rose">Vermutungen</em>, sondern ein
          Fundament, das wirklich trägt
        </h1>
        <p className="text-cream/85 text-lg max-w-xl mb-8">
          Ich begleite Pferdebesitzerinnen und angehende Beraterinnen dabei,
          Fütterung nicht mehr dem Zufall zu überlassen. Ganzheitlich,
          individuell und mit einem System, das auch dann für dein Pferd
          oder deine Kundinnen arbeitet, wenn du gerade selbst keine Zeit
          dafür hast.
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
            <div className="font-serif text-[30px] text-rose">28</div>
            <div className="text-[13px] text-cream/75">
              Jahre Erfahrung mit Helena
            </div>
          </div>
          <div>
            <div className="font-serif text-[30px] text-rose">8</div>
            <div className="text-[13px] text-cream/75">
              Module in der Ausbildung
            </div>
          </div>
          <div>
            <div className="font-serif text-[30px] text-rose">1:1</div>
            <div className="text-[13px] text-cream/75">
              Individuelle Gesundheitsakten
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
