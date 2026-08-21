import Link from "next/link";

type Step = {
  name: string;
  meta: string;
  tag?: string;
};

function PathCard({
  tag,
  title,
  desc,
  steps,
  ctaHref,
  ctaLabel,
  anchorId,
}: {
  tag: string;
  title: string;
  desc: string;
  steps: Step[];
  ctaHref: string;
  ctaLabel: string;
  anchorId?: string;
}) {
  return (
    <div
      id={anchorId}
      className="fade-in bg-white rounded-[18px] border border-line p-9 sm:p-10 flex flex-col"
    >
      <div className="text-[12.5px] tracking-wide uppercase text-gold font-semibold mb-3.5">
        {tag}
      </div>
      <h3 className="font-serif text-2xl font-medium leading-snug mb-3.5">
        {title}
      </h3>
      <p className="text-ink-soft text-[15px] mb-7">{desc}</p>

      <div className="relative pl-7">
        <div className="absolute left-[6px] top-[6px] bottom-[6px] w-[1.5px] bg-gradient-to-b from-rose to-rose-deep" />
        {steps.map((s, i) => (
          <div key={i} className="relative pb-6 last:pb-0">
            <div className="absolute -left-7 top-0.5 w-[11px] h-[11px] rounded-full bg-white border-2 border-rose-deep" />
            <div className="font-medium text-[15.5px]">{s.name}</div>
            <div className="text-[13px] text-ink-soft">{s.meta}</div>
            {s.tag && (
              <div className="inline-block text-[11px] text-rose-deep font-semibold tracking-wide uppercase mt-1">
                {s.tag}
              </div>
            )}
          </div>
        ))}
      </div>

      <Link
        href={ctaHref}
        className="mt-8 w-full text-center border border-ink text-ink px-7 py-3.5 rounded-full text-[15px] font-medium hover:bg-white transition-colors"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}

export default function WegeSection() {
  return (
    <section id="wege" className="py-20 sm:py-24">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <span className="fade-in block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
          Deine nächsten Schritte
        </span>
        <h2 className="fade-in font-serif font-normal text-[26px] sm:text-[38px] leading-tight max-w-3xl">
          Zwei Wege führen zu mir, je nachdem wo du gerade stehst
        </h2>
        <div className="max-w-xl mt-5 mb-14">
          <p className="text-[17px] text-ink-soft">
            Manche kommen zu mir, weil ein einziges Pferd sie nachts wach
            hält. Andere, weil sie dieses Wissen zu ihrem Beruf machen
            wollen. Beide Wege beginnen kostenlos und führen dich Schritt
            für Schritt dahin, wo du wirklich hinwillst.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          <PathCard
            anchorId="futter-check"
            tag="Für dein eigenes Pferd"
            title="Du willst endlich wissen, was dein Pferd wirklich braucht"
            desc="Vom kostenlosen Check bis zur vollständigen Gesundheitsakte für euer Pferd, wenn du dir eine erfahrene Begleitung an deiner Seite wünschst."
            steps={[
              {
                name: "Der Futter-Check",
                meta: "Kostenlos in wenigen Minuten",
                tag: "Start hier",
              },
              { name: "Mineral-Klarheit", meta: "27€ · Kurs mit Rechner-Tool" },
              {
                name: "Pferdeliebe 365",
                meta: "1:1 Gesundheitsakte und Feeding Plan",
              },
            ]}
            ctaHref="#kontakt"
            ctaLabel="Futter-Check starten"
          />
          <PathCard
            tag="Für deine Karriere"
            title="Du willst Pferdefütterung zu deinem Beruf machen"
            desc="Die Ausbildung Ganzheitliche Pferdefütterung nimmt dich an die Hand, von den Grundlagen bis zur eigenen Beratungspraxis, mit Zertifikat am Ende."
            steps={[
              {
                name: "Der Futter-Check",
                meta: "Kostenlos, um dein Wissen zu testen",
                tag: "Start hier",
              },
              {
                name: "Ausbildung Ganzheitliche Pferdefütterung",
                meta: "899€ · 8 Module, Zertifikat",
              },
              {
                name: "Deine eigene Beratungspraxis",
                meta: "Mit fertigem Wissen und System",
              },
            ]}
            ctaHref="#kontakt"
            ctaLabel="Mehr zur Ausbildung"
          />
        </div>
      </div>
    </section>
  );
}
