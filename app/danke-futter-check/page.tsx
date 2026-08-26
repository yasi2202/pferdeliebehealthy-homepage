import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { futterCheck } from "@/lib/seite";
import { insider } from "@/lib/insider";

// ---------------------------------------------------------------------------
// Die Dankesseite nach der Anmeldung bei alfima.
//
// Hierhin schickt alfima die Interessentin, nachdem sie Name und E-Mail
// eingetragen hat. Die Adresse traegst du in alfima beim Produkt
// „Der kostenlose Futter-Check" unter „Externer Link" ein:
//
//   https://pferdeliebehealthy-homepage.vercel.app/danke-futter-check
//
// Wichtig: Die Seite steht bewusst NICHT bei Google (robots: index false) und
// auch nicht in der Sitemap. Sie ist kein Werbetext, sondern die Tuer, die
// sich nur nach der Anmeldung oeffnet — sie soll nicht ergoogelbar sein.
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "Danke — dein Futter-Check wartet",
  description:
    "Deine Anmeldung ist da. Hier geht es direkt zum kostenlosen Futter-Check.",
  robots: { index: false, follow: false },
};

export default function DankeFutterCheckSeite() {
  return (
    <main className="py-14 sm:py-20 px-6 sm:px-8">
      <div className="max-w-2xl mx-auto">
        <span className="block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
          Geschafft
        </span>

        <h1 className="font-serif font-normal text-[32px] sm:text-[46px] leading-[1.12] tracking-tight mb-5">
          Danke — dein Futter-Check wartet auf dich.
        </h1>

        <p className="text-[17px] text-ink-soft leading-relaxed">
          Schön, dass du dir die Zeit nimmst. Fünf Fragen, keine drei Minuten,
          und danach hast du eine erste ehrliche Einordnung, wo die Fütterung
          deines Pferdes gerade steht.
        </p>

        {/* Der eigentliche Knopf. Steht bewusst weit oben — wer hier landet,
            hat sich gerade eben angemeldet und will jetzt loslegen. */}
        <div className="bg-ink text-cream rounded-[24px] p-8 sm:p-10 mt-10">
          <h2 className="font-serif text-[23px] sm:text-[27px] leading-snug mb-4">
            Los geht&rsquo;s
          </h2>
          <p className="text-[15px] text-cream/75 mb-7">
            Beantworte die fünf Fragen ehrlich, nicht so, wie es sein sollte.
            Nur dann sagt dir das Ergebnis etwas.
          </p>
          <Link
            href={futterCheck.fragebogen}
            prefetch={false}
            className="inline-block bg-rose text-ink px-8 py-4 rounded-full text-[15px] font-medium hover:bg-cream transition-colors"
          >
            Jetzt zum Futter-Check
          </Link>
        </div>

        {/* Merkzettel: Wer die Seite versehentlich schliesst, findet sie
            sonst nicht wieder — die E-Mail ist der zweite Weg zurueck. */}
        <div className="bg-cream-deep rounded-[18px] p-6 sm:p-7 mt-8">
          <h2 className="text-[15px] font-semibold mb-2.5">
            Du bekommst den Link auch per E-Mail
          </h2>
          <p className="text-[14px] text-ink-soft leading-relaxed">
            Falls du gerade keine Ruhe hast: Ich schicke dir den Futter-Check
            zusätzlich in dein Postfach, dann kannst du ihn in Ruhe machen. Schau
            dort auch kurz im Spam-Ordner nach und verschieb die Mail in den
            Posteingang — sonst geht später vielleicht etwas unter.
          </p>
        </div>

        {/* Wie es weitergeht */}
        <div className="mt-14 pt-10 border-t border-line">
          <h2 className="font-serif text-[24px] sm:text-[28px] leading-snug mb-4">
            Und danach?
          </h2>
          <p className="text-[16px] text-ink-soft leading-relaxed mb-7">
            Der Futter-Check zeigt dir, wo du stehst. Was ihn wirklich nützlich
            macht, ist der nächste Schritt — deshalb melde ich mich nach ein
            paar Tagen noch einmal bei dir und ordne dein Ergebnis ein. Bis
            dahin liest du am besten ein bisschen mit:
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/insider"
              className="inline-block border border-ink text-ink px-7 py-3.5 rounded-full text-[15px] font-medium hover:bg-ink hover:text-cream transition-colors"
            >
              Meine Insider-Beiträge lesen
            </Link>
            <a
              href={insider.anmeldeUrl}
              target="_blank"
              rel="noopener"
              className="inline-block border border-line text-ink-soft px-7 py-3.5 rounded-full text-[15px] font-medium hover:text-ink hover:border-ink transition-colors"
            >
              {insider.abschnitt.button}
            </a>
          </div>
        </div>

        {/* Persoenlicher Abschluss */}
        <div className="flex items-center gap-4 mt-14 pt-8 border-t border-line">
          <Image
            src="/images/yasi-portrait.jpg"
            alt="Yasemin Halac"
            width={56}
            height={56}
            className="w-14 h-14 rounded-full object-cover"
          />
          <div>
            <div className="text-[15px] font-medium">Yasi · Pferdeliebehealthy</div>
            <div className="text-[13.5px] text-ink-soft">
              Ernährungsberaterin für Pferde · info@pferdeliebehealthy.de
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
