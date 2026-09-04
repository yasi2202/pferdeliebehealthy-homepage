const pillars = [
  {
    title: "Individuell statt Schema",
    text: "Kein Pferd bekommt bei mir eine Standardration. Alter, Vorgeschichte, Stoffwechsel und Haltung entscheiden, was wirklich passt.",
  },
  {
    title: "Substanz statt Trend",
    text: "Whole-Blood-Selen statt Serum, Vitamin E in pflanzlicher Form, keine Lebendhefen. Ich richte mich nach dem, was tatsächlich wirkt, nicht nach dem, was sich gut verkauft.",
  },
  {
    title: "Wissen, das bleibt",
    text: "Ob Kurs oder Beratung, du sollst am Ende verstehen, warum etwas funktioniert, nicht nur, was du kaufen sollst.",
  },
  {
    title: "Aus eigener Erfahrung",
    text: "Helenas PPID-Diagnose hat mich gelehrt, wie viel ein durchdachtes Fütterungskonzept für die Lebensqualität eines Pferdes bedeuten kann.",
  },
];

export default function PillarsSection() {
  return (
    <section id="warum" className="py-20 sm:py-24">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <span className="fade-in block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
          Meine Haltung
        </span>
        <h2 className="fade-in font-serif font-normal text-[26px] sm:text-[38px] leading-tight max-w-3xl">
          Ganzheitlich heißt für mich, dass nichts isoliert betrachtet wird
        </h2>
        <div className="fade-in grid grid-cols-1 sm:grid-cols-2 gap-px bg-line rounded-[18px] overflow-hidden mt-14">
          {pillars.map((p) => (
            <div key={p.title} className="bg-cream p-9">
              <div className="font-serif text-[19px] mb-2.5">{p.title}</div>
              <p className="text-[14.5px] text-ink-soft">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
