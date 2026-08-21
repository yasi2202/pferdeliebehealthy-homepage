export default function LegalLayout({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="pt-32 sm:pt-36 pb-24 px-6 sm:px-8">
      <div className="max-w-[820px] mx-auto">
        <span className="block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-3.5">
          {eyebrow}
        </span>
        <h1 className="font-serif font-normal text-[28px] sm:text-[40px] leading-tight mb-10">
          {title}
        </h1>
        <div className="bg-white border border-line rounded-[18px] p-8 sm:p-12 legal-prose">
          {children}
        </div>
      </div>
    </main>
  );
}
