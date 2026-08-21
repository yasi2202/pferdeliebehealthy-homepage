export default function ProblemSection() {
  const items = [
    "Du brauchst kein Blattfüttern nach Gefühl mehr, bei dem du nie sicher weißt, ob dein Pferd wirklich versorgt ist.",
    "Du brauchst keine widersprüchlichen Ratschläge aus zehn verschiedenen Foren mehr, die dich am Ende noch unsicherer machen.",
    "Du brauchst keine teuren Zusatzfutter, die niemand wirklich auf euer Pferd oder eure Kundschaft abgestimmt hat.",
  ];

  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <h2 className="fade-in font-serif font-normal text-[26px] sm:text-[38px] leading-tight max-w-3xl mx-auto text-center">
          Gute Nachricht: du musst nicht jede Futterentscheidung allein und
          aus dem Bauch heraus treffen
        </h2>
        <div className="fade-in grid grid-cols-1 md:grid-cols-3 gap-px bg-line rounded-[18px] overflow-hidden mt-14">
          {items.map((text, i) => (
            <div key={i} className="bg-cream p-8">
              <div className="w-[34px] h-[34px] rounded-full border border-rose-deep text-rose-deep flex items-center justify-center text-[15px] mb-4">
                ✕
              </div>
              <p className="text-[15px] text-ink-soft">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
