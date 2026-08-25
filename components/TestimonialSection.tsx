// ---------------------------------------------------------------------------
// Kundenstimmen.
//
// ▸ WEITERE STIMMEN HINZUFÜGEN: einfach einen Block in die Liste unten
//   einfügen. Der Abschnitt passt sein Layout selbst an — eine Stimme steht
//   breit, ab zwei nebeneinander.
//
//   { zitat: "…", name: "Vorname", rolle: "Teilnehmerin der Ausbildung" },
//
// ▸ Zitate immer wörtlich lassen. Wenn du kürzt, dann mit … und ohne den
//   Sinn zu verändern.
// ---------------------------------------------------------------------------

const stimmen = [
  {
    zitat:
      "Ich habe meine Ausbildung bei euch gemacht und dabei unglaublich viel gelernt. So viel, dass ich mich mittlerweile sogar noch zur Aromatherapeutin bei euch ausbilden lasse.",
    name: "Marion",
    rolle: "Teilnehmerin der Ausbildung",
  },
];

export default function TestimonialSection() {
  const einzeln = stimmen.length === 1;

  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <span className="fade-in block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
          Stimmen
        </span>
        <h2 className="fade-in font-serif font-normal text-[26px] sm:text-[38px] leading-tight max-w-3xl">
          Was Kundinnen mir danach geschrieben haben
        </h2>

        <div
          className={`fade-in mt-14 grid gap-6 ${
            einzeln ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
          }`}
        >
          {stimmen.map((s) => (
            <figure
              key={s.name}
              className="bg-cream-deep rounded-[18px] p-9 sm:p-12 flex flex-col"
            >
              <blockquote
                className={`font-serif italic leading-snug flex-grow ${
                  einzeln ? "text-[22px] max-w-2xl" : "text-[19px]"
                }`}
              >
                <span className="text-rose-deep">„</span>
                {s.zitat}
                <span className="text-rose-deep">“</span>
              </blockquote>
              <figcaption className="text-sm text-ink-soft mt-6">
                {s.name} · {s.rolle}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
