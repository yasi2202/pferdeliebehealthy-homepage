"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { insider } from "@/lib/insider";

const links = [
  { href: "/#wege", label: "Angebote" },
  { href: "/insider", label: "Insider" },
  { href: "/empfehlungen", label: "Empfehlungen" },
  { href: "/#warum", label: "Meine Haltung" },
  { href: "/#ueber-mich", label: "Über mich" },
  { href: "/#kontakt", label: "Kontakt" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => {
      const heroHeight = window.innerHeight;
      setScrolled(window.scrollY > heroHeight - 90);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const transparent = isHome && !scrolled && !menuOpen;

  return (
    <>
    <header
      className={`${
        isHome ? "absolute" : "sticky"
      } top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        transparent
          ? "bg-transparent border-transparent"
          : "bg-cream/90 backdrop-blur-md border-b border-line"
      }`}
    >
      {/* Schmales Insider-Banner, nur auf der Startseite und ganz oben.
          Es liegt innerhalb der Kopfzeile, damit deren Positionierung
          (über dem Hero) unverändert bleibt. Text: lib/insider.ts */}
      {isHome && (
        <Link
          href="/insider"
          onClick={() => setMenuOpen(false)}
          className="group block bg-ink text-cream"
        >
          <div className="max-w-6xl mx-auto px-6 sm:px-8 py-2.5 flex items-center justify-center gap-2.5 sm:gap-3.5 text-[13px] sm:text-[13.5px] text-center">
            <span className="hidden sm:inline-block bg-pfirsich text-ink font-semibold px-2.5 py-0.5 rounded-full text-[11px] tracking-wide uppercase shrink-0">
              {insider.kopfBanner.hinweis}
            </span>
            <span className="text-cream/90">{insider.kopfBanner.text}</span>
            <span className="font-medium underline underline-offset-4 decoration-pfirsich group-hover:decoration-cream shrink-0">
              {insider.kopfBanner.button}
            </span>
          </div>
        </Link>
      )}

      <nav className="flex items-center justify-between max-w-6xl mx-auto px-6 sm:px-8 py-5">
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          className={`font-serif text-xl font-medium ${
            transparent ? "text-cream" : "text-ink"
          }`}
        >
          Pferdeliebe
          <span className={transparent ? "text-rose" : "text-rose-deep"}>
            healthy
          </span>
        </Link>

        <div
          className={`hidden lg:flex gap-7 text-[14.5px] ${
            transparent ? "text-cream" : "text-ink"
          }`}
        >
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:opacity-70 transition-opacity">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/futter-check"
            onClick={() => setMenuOpen(false)}
            className={`hidden sm:inline-block text-sm font-medium px-5 py-2.5 rounded-full transition-colors ${
              transparent
                ? "bg-white text-ink hover:bg-rose"
                : "bg-ink text-cream hover:bg-rose-deep"
            }`}
          >
            Zum Futter-Check
          </Link>

          <button
            aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
            onClick={() => setMenuOpen((v) => !v)}
            className={`lg:hidden relative z-[60] w-10 h-10 flex flex-col items-center justify-center gap-[5px] ${
              transparent ? "text-cream" : "text-ink"
            }`}
          >
            <span
              className={`block w-6 h-[1.5px] bg-current transition-transform duration-300 ${
                menuOpen ? "translate-y-[6.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`block w-6 h-[1.5px] bg-current transition-opacity duration-200 ${
                menuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`block w-6 h-[1.5px] bg-current transition-transform duration-300 ${
                menuOpen ? "-translate-y-[6.5px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </nav>
    </header>

    {/* Mobile menu overlay, rendered as a sibling so it is never inside a
       backdrop-filter containing block (which would break position:fixed) */}
    <div
      className={`lg:hidden fixed inset-0 bg-ink transition-opacity duration-300 z-50 ${
        menuOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex flex-col items-center justify-center h-full gap-8 px-8">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setMenuOpen(false)}
            className="font-serif text-3xl text-cream"
          >
            {l.label}
          </Link>
        ))}
        <Link
          href="/futter-check"
          onClick={() => setMenuOpen(false)}
          className="mt-4 bg-rose text-ink px-8 py-3.5 rounded-full text-[15px] font-medium"
        >
          Zum Futter-Check
        </Link>
      </div>
    </div>
    </>
  );
}
