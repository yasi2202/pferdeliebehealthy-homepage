"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { insider } from "@/lib/insider";
import { futterCheck, mitgliederbereich } from "@/lib/seite";

const links = [
  { href: "/#wege", label: "Angebote" },
  { href: "/ausbildung", label: "Ausbildung" },
  { href: "/insider", label: "Insider" },
  { href: "/empfehlungen", label: "Empfehlungen" },
  { href: "/#warum", label: "Meine Haltung" },
  { href: "/#ueber-mich", label: "Über mich" },
  { href: "/#kontakt", label: "Kontakt" },
];

// Das Schloss neben dem Mitglieder-Zugang. Dasselbe Zeichen wie im Streifen
// "Du bist schon dabei?" weiter unten auf der Startseite, damit beide Wege
// erkennbar zusammengehoeren.
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
    // Solange der dunkle Hero hinter der Kopfzeile liegt, bleibt sie
    // durchsichtig mit hellem Text. Ist er durchgelaufen, bekommt sie creme
    // Hintergrund — sonst staende heller Text auf hellem Inhalt.
    //
    // Die Hoehe wird gemessen statt geschaetzt: auf dem Handy liegen Bild und
    // Text untereinander, der Hero ist dort weit hoeher als der Bildschirm.
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

  // Sprungmarken auf der Startseite selbst ansteuern.
  // Ueberliesse man das dem Browser, passierte beim zweiten Klick auf
  // denselben Menuepunkt nichts: der Hash steht dann schon in der Adresse
  // und der Browser sieht keinen Grund, erneut zu springen.
  const springeZu = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMenuOpen(false);
    if (!isHome || !href.startsWith("/#")) return;
    const ziel = document.getElementById(href.slice(2));
    if (!ziel) return;
    e.preventDefault();
    // Erst im naechsten Frame scrollen: das Mobilmenue setzt beim Schliessen
    // overflow auf dem body zurueck, und solange das noch hidden ist,
    // laeuft der Scroll ins Leere.
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
      {/* Schmales Insider-Banner, nur auf der Startseite und nur am Anfang.
          Seit die Kopfzeile mitlaeuft, wuerde es sonst dauerhaft Platz
          wegnehmen; beim Scrollen bleibt nur die Navigation. Ausgeblendet
          wird es ohne Layoutsprung, weil die Kopfzeile ueber dem Inhalt
          schwebt. Text: lib/insider.ts */}
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
              <span className="text-cream/90">{insider.kopfBanner.text}</span>
              <span className="font-medium underline underline-offset-4 decoration-pfirsich group-hover:decoration-cream shrink-0">
                {insider.kopfBanner.button}
              </span>
            </Link>

            {/* Der Zugang fuer alle, die schon Kundin sind. Er steht hier oben
                und nicht in der Navigation darunter: dort ist die Zeile bereits
                randvoll, ein weiterer Begriff wuerde sie umbrechen lassen. Hier
                faellt er sofort ins Auge, ohne dem Futter-Check die
                Aufmerksamkeit zu nehmen. Adresse: lib/seite.ts */}
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
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={(e) => springeZu(e, l.href)}
              className="hover:opacity-70 transition-opacity"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dasselbe Ziel als kompaktes Schloss. Es bleibt auch sichtbar,
              wenn die dunkle Leiste beim Scrollen verschwindet, und auf jeder
              Unterseite. Fuer den ausgeschriebenen Begriff ist in dieser Zeile
              kein Platz; auf dem Handy steht er im aufgeklappten Menue. */}
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
            onClick={(e) => springeZu(e, l.href)}
            className="font-serif text-3xl text-cream"
          >
            {l.label}
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
