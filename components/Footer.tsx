import Link from "next/link";
import { futterCheck } from "@/lib/seite";

export default function Footer() {
  return (
    <footer className="px-6 sm:px-8 pt-16 pb-10">
      <div className="grid grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-8 max-w-6xl mx-auto pb-10 border-b border-line">
        <div>
          <div className="font-serif text-xl font-medium mb-3">
            Pferdeliebe<span className="text-rose-deep">healthy</span>
          </div>
          <p className="text-[13.5px] text-ink-soft max-w-[260px]">
            Ganzheitliche Pferdefütterung von Yasemin Halac, Ernährungsberaterin
            für Pferde, Buchen im Odenwald.
          </p>
        </div>
        <div>
          <h4 className="text-[13px] font-semibold uppercase tracking-wide text-rose-deep mb-4">
            Angebote
          </h4>
          <ul className="space-y-2.5 text-sm text-ink-soft">
            <li>
              <a
                href={futterCheck.anmeldung}
                target="_blank"
                rel="noopener"
                className="hover:text-ink"
              >
                Der Futter-Check
              </a>
            </li>
            <li>
              <a
                href="https://alfima.com/pferdeliebehealthy/p/ai-page-8-2"
                target="_blank"
                rel="noopener"
                className="hover:text-ink"
              >
                Mineral-Klarheit
              </a>
            </li>
            <li>
              <Link href="/#ausbildung" className="hover:text-ink">
                Die Masterclass
              </Link>
            </li>
            <li>
              <Link href="/#kontakt" className="hover:text-ink">
                Futterberatung 365
              </Link>
            </li>
            <li>
              <Link href="/empfehlungen" className="hover:text-ink">
                Rabattcodes &amp; Empfehlungen
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-[13px] font-semibold uppercase tracking-wide text-rose-deep mb-4">
            Über
          </h4>
          <ul className="space-y-2.5 text-sm text-ink-soft">
            <li>
              <Link href="/#ueber-mich" className="hover:text-ink">
                Über mich
              </Link>
            </li>
            <li>
              <Link href="/#warum" className="hover:text-ink">
                Meine Haltung
              </Link>
            </li>
            <li>
              <a
                href="https://www.instagram.com/pferdeliebehealthy"
                target="_blank"
                rel="noopener"
                className="hover:text-ink"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href="https://www.tiktok.com/@pferdeliebehealthy"
                target="_blank"
                rel="noopener"
                className="hover:text-ink"
              >
                TikTok
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com/groups/3007687892858005"
                target="_blank"
                rel="noopener"
                className="hover:text-ink"
              >
                Facebook-Gruppe
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-[13px] font-semibold uppercase tracking-wide text-rose-deep mb-4">
            Rechtliches
          </h4>
          <ul className="space-y-2.5 text-sm text-ink-soft">
            <li>
              <Link href="/impressum" className="hover:text-ink">
                Impressum
              </Link>
            </li>
            <li>
              <Link href="/datenschutz" className="hover:text-ink">
                Datenschutz
              </Link>
            </li>
            <li>
              <Link href="/agb" className="hover:text-ink">
                AGB
              </Link>
            </li>
            <li>
              <Link href="/widerrufsbelehrung" className="hover:text-ink">
                Widerrufsrecht
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-6 flex justify-between flex-wrap gap-3 text-[12.5px] text-ink-soft">
        <span>© 2026 Pferdeliebehealthy</span>
        <span>Buchen, Odenwald</span>
      </div>
    </footer>
  );
}
