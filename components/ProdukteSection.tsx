import Link from "next/link";

type Product = {
  titel: string;
  preis: string;
  desc: string;
  href: string;
  external?: boolean;
  linkLabel: string;
  featured?: boolean;
  id?: string;
};

const products: Product[] = [
  {
    titel: "Der Futter-Check",
    preis: "0€",
    desc: "Finde in wenigen Minuten heraus, wo die größten Lücken in der aktuellen Fütterung liegen.",
    href: "#kontakt",
    linkLabel: "Jetzt starten →",
  },
  {
    titel: "Mineral-Klarheit",
    preis: "27€",
    desc: "Der Rechner und Kurs, mit dem du Mineralstoffversorgung endlich selbst durchschaust.",
    href: "https://alfima.com/pferdeliebehealthy/p/ai-page-8-2",
    external: true,
    linkLabel: "Kurs ansehen →",
  },
  {
    titel: "Die Ausbildung",
    preis: "899€",
    desc: "8 Module, die dich von den Grundlagen bis zur zertifizierten Beraterin für ganzheitliche Pferdefütterung führen.",
    href: "#kontakt",
    linkLabel: "Ausbildung entdecken →",
    featured: true,
    id: "ausbildung",
  },
  {
    titel: "Pferdeliebe 365",
    preis: "Auf Anfrage",
    desc: "Deine individuelle Gesundheitsakte und Feeding Plan, persönlich mit dir erarbeitet.",
    href: "#kontakt",
    linkLabel: "Anfragen →",
  },
];

export default function ProdukteSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <span className="fade-in block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
          Übersicht
        </span>
        <h2 className="fade-in font-serif font-normal text-[26px] sm:text-[38px] leading-tight max-w-3xl">
          Alle Angebote auf einen Blick
        </h2>
        <div className="fade-in grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-14">
          {products.map((p) => (
            <div
              key={p.titel}
              id={p.id}
              className={`relative bg-white rounded-[18px] border p-7 flex flex-col ${
                p.featured ? "border-[1.5px] border-rose-deep" : "border-line"
              }`}
            >
              {p.featured && (
                <span className="absolute -top-[13px] left-6 bg-rose-deep text-white text-[11px] font-semibold px-3.5 py-1 rounded-full">
                  Meist gewählt
                </span>
              )}
              <div className="font-medium text-base mb-1">{p.titel}</div>
              <div className="font-serif text-[26px] my-1">{p.preis}</div>
              <p className="text-[13.5px] text-ink-soft flex-grow mb-5">
                {p.desc}
              </p>
              {p.external ? (
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener"
                  className="text-[13.5px] font-medium text-rose-deep"
                >
                  {p.linkLabel}
                </a>
              ) : (
                <Link
                  href={p.href}
                  className="text-[13.5px] font-medium text-rose-deep"
                >
                  {p.linkLabel}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
