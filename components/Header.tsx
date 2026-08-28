"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { insider } from "@/lib/insider";
import { futterCheck, mitgliederbereich } from "@/lib/seite";

const links = [
  { href: "/#wege", label: "Angebote" },
  { href: "https://shop.pferdeliebehealthy.de/", label: "Shop" },
  { href: "/ausbildung", label: "Ausbildung" },
  { href: "/insider", label: "Insider" },
  { href: "/empfehlungen", label: "Empfehlungen" },
  { href: "/#warum", label: "Meine Haltung" },
  { href: "/#ueber-mich", label: "Über mich" },
  { href: "/#kontakt", label: "Kontakt" },
];

function Schloss({ groesse = 15 }: { groesse?: number }) {
  return (
    <svg
      width={groesse}
      height={groesse}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <rect x="4" y="10.5" width="16" height="10" rx="2.5" />
      <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
    </svg>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    if (!isHome) return;

    const pruefen = () => {
      const hero = document.getElementById("hero");
      const grenze = (hero ? hero.offsetHeight : window.innerHeight) - 90;
      setScrolled(window.scrollY > grenze);
    };

    pruefen();
    window.addEventListener("scroll", pruefen, { passive: true });
    window.addEventListener("resize", pruefen);

    return () => {
      window.removeEventListener("scroll", pruefen);
      window.removeEventListener("resize", pruefen);
    };
  }, [isHome]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const transparent = isHome && !scrolled && !menuOpen;

  const springeZu = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMenuOpen(false);

    if (!isHome || !href.startsWith("/#")) return;

    const ziel = document.getElementById(href.slice(2));
    if (!ziel) return;

    e.preventDefault();

    requestAnimationFrame(() => {
      ziel.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", href);
    });
  };

  return (
    <>
      <header
        className={`${
          isHome ? "fixed" : "sticky"
        } top-0 left-0 right-0 z-50 transition-colors duration-300 ${
          transparent
            ? "bg-transparent border-transparent"
            : "bg-cream/90 backdrop-blur-md border-b border-line"
        }`}
      >
        {isHome && !scrolled && !menuOpen && (
          <div className="bg-ink text-cream">
            <div className="relative max-w-6xl mx-auto px-6 sm:px-8">
              <Link
                href="/insider"
                onClick={() => setMenuOpen(false)}
                className="group py-2.5 flex items-center justify-center gap-2.5 sm:gap-3.5 text-[13px] sm:text-[13.5px] text-center"
              >
                <span className="hidden sm:inline-block bg-pfirsich text-ink font-semibold px-2.5 py-0.5 rounded-full text-[11px] tracking-wide uppercase shrink-0">
                  {insider.kopfBanner.hinweis}
                </span>

                <span className="text-cream/90">
                  {insider.kopfBanner.text}
                </span>

                <span className="font-medium underline underline-offset-4 decoration-pfirsich group-hover:decoration-cream shrink-0">
                  {insider.kopfBanner.button}
                </span>
              </Link>

              <a
                href={mitgliederbereich.url}
                target="_blank"
                rel="noopener"
                onClick={() => setMenuOpen(false)}
                className="hidden lg:flex absolute right-6 sm:right-8 top-0 bottom-0 items-center gap-1.5 text-[13px] text-cream/80 hover:text-cream transition-colors whitespace-nowrap"
              >
                <Schloss groesse={13} />
                {mitgliederbereich.label}
              </a>
            </div>
          </div>
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
            className={`hidden lg:flex gap-5 xl:gap-6 text-[14.5px] ${
              transparent ? "text-cream" : "text-ink"
            }`}
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => springeZu(e, link.href)}
                className="hover:opacity-70 transition-opacity"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={mitgliederbereich.url}
              target="_blank"
              rel="noopener"
              aria-label={`Zum ${mitgliederbereich.label}`}
              title={`Zum ${mitgliederbereich.label}`}
              onClick={() => setMenuOpen(false)}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
                transparent
                  ? "text-cream hover:bg-white/15"
                  : "text-ink hover:bg-cream-deep"
              }`}
            >
              <Schloss groesse={17} />
            </a>

            <Link
              href={futterCheck.fragebogen}
              prefetch={false}
              onClick={() => setMenuOpen(false)}
              className={`hidden sm:inline-block text-sm font-medium px-5 py-2.5 rounded-full whitespace-nowrap transition-colors ${
                transparent
                  ? "bg-white text-ink hover:bg-rose"
                  : "bg-ink text-cream hover:bg-rose-deep"
              }`}
            >
              Zum Futter-Check
            </Link>

            <button
              aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
              onClick={() => setMenuOpen((value) => !value)}
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

      <div
        className={`lg:hidden fixed inset-0 bg-ink transition-opacity duration-300 z-50 ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8 px-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => springeZu(e, link.href)}
              className="font-serif text-3xl text-cream"
            >
              {link.label}
            </Link>
          ))}

          <Link
            href={futterCheck.fragebogen}
            prefetch={false}
            onClick={() => setMenuOpen(false)}
            className="mt-4 bg-rose text-ink px-8 py-3.5 rounded-full text-[15px] font-medium"
          >
            Zum Futter-Check
          </Link>

          <a
            href={mitgliederbereich.url}
            target="_blank"
            rel="noopener"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 text-cream/80 text-[15px] underline underline-offset-4 decoration-cream/40"
          >
            <Schloss groesse={16} />
            Zum {mitgliederbereich.label}
          </a>
        </div>
      </div>
    </>
  );
}
