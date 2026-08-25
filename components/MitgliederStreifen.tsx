import { mitgliederbereich } from "@/lib/seite";

// ---------------------------------------------------------------------------
// Eigener Block für den Mitgliederbereich.
//
// Steht bewusst direkt hinter den Angeboten: Wer dort erkennt, dass er das
// Gebuchte schon hat, findet hier den Weg hinein — ohne dass der Login oben
// in der Kopfzeile mit dem kostenlosen Einstieg konkurriert.
//
// Adresse: lib/seite.ts
// ---------------------------------------------------------------------------

export default function MitgliederStreifen() {
  return (
    <section className="px-6 sm:px-8 pb-4">
      <div className="fade-in max-w-6xl mx-auto bg-white border border-line rounded-[18px] px-7 sm:px-10 py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <span
            className="shrink-0 w-11 h-11 rounded-full bg-cream-deep flex items-center justify-center text-rose-deep"
            aria-hidden="true"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
            >
              <rect x="4" y="10.5" width="16" height="10" rx="2.5" />
              <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
            </svg>
          </span>

          <div>
            <h2 className="font-serif text-[21px] leading-snug">
              Du bist schon dabei?
            </h2>
            <p className="text-[14.5px] text-ink-soft mt-1">
              Hier geht es direkt zu deinen Kursen in der Akademie.
            </p>
          </div>
        </div>

        <a
          href={mitgliederbereich.url}
          target="_blank"
          rel="noopener"
          className="shrink-0 text-center border border-ink text-ink px-7 py-3.5 rounded-full text-[15px] font-medium hover:bg-ink hover:text-cream transition-colors"
        >
          Zum {mitgliederbereich.label}
        </a>
      </div>
    </section>
  );
}
