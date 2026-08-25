import Image from "next/image";

export default function AboutSection() {
  return (
    <section id="ueber-mich" className="py-20 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-16 items-center">
        <div className="fade-in relative aspect-[3/4] rounded-[18px] overflow-hidden border border-line">
          <Image
            src="/images/yasi-portrait.jpg"
            alt="Yasemin Halac, Ernährungsberaterin für Pferde"
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover object-[50%_12%]"
          />
        </div>
        <div className="fade-in">
          <span className="block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
            Über mich
          </span>
          <h2 className="font-serif font-normal text-[26px] sm:text-[38px] leading-tight mb-6">
            Hallo, ich bin Yasi
          </h2>
          <p className="text-ink-soft text-base mb-4.5">
            Ernährungsberaterin für Pferde, Gründerin von Pferdeliebehealthy
            und seit Helenas PPID-Diagnose überzeugt davon, dass Fütterung
            kein Zufallsprodukt sein sollte, sondern ein Fundament, auf das
            man sich verlassen kann.
          </p>
          <p className="text-ink-soft text-base mb-4.5">
            Ich glaube nicht an Patentrezepte oder Zusatzfutter nach
            Bauchgefühl. Ich glaube an individuelle Rationen, an Substanz
            statt Marketing und daran, dass jede Pferdebesitzerin und jede
            angehende Beraterin dieses Wissen selbst durchdringen kann, wenn
            es ihr richtig vermittelt wird.
          </p>
          <p className="text-ink-soft text-base mb-4.5">
            Von Buchen im Odenwald aus begleite ich heute Menschen und ihre
            Pferde auf genau diesem Weg, mit meinen zwei Pferden Helena und
            Donni und drei Hunden immer irgendwo in der Nähe.
          </p>
          {/* Der Slogan steht jetzt im Hero — hier stünde er ein zweites Mal
              und verlöre dort oben an Gewicht. */}
        </div>
      </div>
    </section>
  );
}
