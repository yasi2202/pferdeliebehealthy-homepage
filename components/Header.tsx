"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { insider } from "@/lib/insider";
import { futterCheck, mitgliederbereich } from "@/lib/seite";

const links = [
  { href: "/#wege", label: "Angebote", extern: false },
  {
    href: "https://shop.pferdeliebehealthy.de/",
    label: "Shop",
    extern: true,
  },
  { href: "/ausbildung", label: "Ausbildung", extern: false },
  { href: "/insider", label: "Insider", extern: false },
  { href: "/#kontakt", label: "Kontakt", extern: false },
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
    if (!isHome) {
      setScrolled(true);
      return;
    }

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

    if (!isHome || !href.startsWith("/#")) {
      return;
    }

    const ziel = document.getElementById(href.slice(2));

    if (!ziel) {
      return;
    }

    e.preventDefault();

    requestAnimationFrame(() => {
      ziel.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      history.replaceState(null, "", href);
    });
  };

  const farben = transparent
    ? "text-cream"
    : "bg-cream/95 text-ink shadow-sm backdrop-blur-md";

  return (
    <>
      <header
        className={`${
          isHome ? "fixed" : "sticky"
        } top-0 left-0 right-0 z-[100] border-b border-transparent transition-colors duration-300 ${farben}`}
      >
        {isHome && !scrolled && !menuOpen && (
          <div className="bg-ink text-cream">
            <div className="relative max-w-6xl mx-auto px-6 sm:px-8">
              <Link
                href="/insider"
                onClick={() => setMenuOpen(false)}
                className="group flex items-center justify-center gap-2.5 py-2.5 text-center text-[13px] sm:gap-3.5 sm:text-[13.5px]"
              >
                <span className="hidden shrink-0 rounded-full bg-pfirsich px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink sm:inline-block">
                  {insider.kopfBanner.hinweis}
                </span>

                <span className="text-cream/90">
                  {insider.kopfBanner.text}
                </span>

                <span className="shrink-0 font-medium underline decoration-pfirsich underline-offset-4 group-hover:decoration-cream">
                  {insider.kopfBanner.button}
                </span>
              </Link>

              <a
                href={mitgliederbereich.url}
                target="_blank"
                rel="noopener"
                onClick={() => setMenuOpen(false)}
                className="absolute right-6 top-0 bottom-0 hidden items-center gap-1.5 whitespace-nowrap text-[13px] text-cream/80 transition-colors hover:text-cream 2xl:flex sm:right-8"
              >
                <Schloss groesse={13} />
                {mitgliederbereich.label}
              </a>
            </div>
          </div>
        )}

        <nav className="relative z-[101] mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8 sm:py-5">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className={`shrink-0 font-serif text-xl font-medium ${
              transparent ? "text-cream" : "text-ink"
            }`}
          >
            Pferdeliebe
            <span className={transparent ? "text-rose" : "text-rose-deep"}>
              healthy
            </span>
          </Link>

          <div
            className={`hidden items-center gap-4 text-[14px] xl:flex 2xl:gap-6 ${
              transparent ? "text-cream" : "text-ink"
            }`}
          >
            {links.map((link) =>
              link.extern ? (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="whitespace-nowrap transition-opacity hover:opacity-70"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => springeZu(e, link.href)}
                  className="whitespace-nowrap transition-opacity hover:opacity-70"
                >
                  {link.label}
                </Link>
              ),
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <a
              href={mitgliederbereich.url}
              target="_blank"
              rel="noopener"
              aria-label={`Zum ${mitgliederbereich.label}`}
              title={`Zum ${mitgliederbereich.label}`}
              onClick={() => setMenuOpen(false)}
              className={`hidden h-9 w-9 items-center justify-center rounded-full transition-colors sm:flex ${
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
              className={`hidden whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition-colors 2xl:inline-block ${
                transparent
                  ? "bg-white text-ink hover:bg-rose"
                  : "bg-ink text-cream hover:bg-rose-deep"
              }`}
            >
              Zum Futter-Check
            </Link>

            <button
              type="button"
              aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((value) => !value)}
              className={`relative z-[110] flex h-10 w-10 flex-col items-center justify-center gap-[5px] xl:hidden ${
                transparent ? "text-cream" : "text-ink"
              }`}
            >
              <span
                className={`block h-[1.5px] w-6 bg-current transition-transform duration-300 ${
                  menuOpen ? "translate-y-[6.5px] rotate-45" : ""
                }`}
              />

              <span
                className={`block h-[1.5px] w-6 bg-current transition-opacity duration-200 ${
                  menuOpen ? "opacity-0" : "opacity-100"
                }`}
              />

              <span
                className={`block h-[1.5px] w-6 bg-current transition-transform duration-300 ${
                  menuOpen ? "-translate-y-[6.5px] -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </nav>
      </header>

      <div
        className={`fixed inset-0 z-[90] bg-ink transition-opacity duration-300 xl:hidden ${
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex h-full flex-col items-center justify-center gap-8 px-8">
          {links.map((link) =>
            link.extern ? (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-serif text-3xl text-cream"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => springeZu(e, link.href)}
                className="font-serif text-3xl text-cream"
              >
                {link.label}
              </Link>
            ),
          )}

          <Link
            href={futterCheck.fragebogen}
            prefetch={false}
            onClick={() => setMenuOpen(false)}
            className="mt-4 rounded-full bg-rose px-8 py-3.5 text-[15px] font-medium text-ink"
          >
            Zum Futter-Check
          </Link>

          <a
            href={mitgliederbereich.url}
            target="_blank"
            rel="noopener"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 text-[15px] text-cream/80 underline decoration-cream/40 underline-offset-4"
          >
            <Schloss groesse={16} />
            Zum {mitgliederbereich.label}
          </a>
        </div>
      </div>
    </>
  );
}
