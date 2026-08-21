export default function CtaFinal() {
  return (
    <section id="kontakt" className="py-16 sm:py-20 px-6 sm:px-8">
      <div className="bg-ink text-cream rounded-[32px] px-8 sm:px-16 py-16 sm:py-20 text-center fade-in">
        <span className="block text-[13px] tracking-[0.14em] uppercase text-rose font-semibold mb-4">
          Bereit für den nächsten Schritt?
        </span>
        <h2 className="font-serif font-normal text-cream text-[26px] sm:text-[38px] leading-tight max-w-2xl mx-auto mb-5">
          Lass uns herausfinden, welcher Weg zu dir und deinem Pferd passt
        </h2>
        <p className="text-cream/70 max-w-md mx-auto mb-9 text-base">
          Egal ob du mit dem kostenlosen Futter-Check startest oder direkt
          Fragen zur Ausbildung oder zu Pferdeliebe 365 hast, schreib mir
          einfach.
        </p>
        <a
          href="mailto:info@pferdeliebehealthy.de"
          className="inline-block bg-rose text-ink px-8 py-4 rounded-full text-[15px] font-medium hover:bg-gold transition-colors"
        >
          Nachricht schreiben
        </a>
      </div>
    </section>
  );
}
