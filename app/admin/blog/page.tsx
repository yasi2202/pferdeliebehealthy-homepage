import type { Metadata } from "next";
import Link from "next/link";
import { adminEingerichtet, istAngemeldet } from "@/lib/admin-zugang";
import { beitraegeListen, githubEingerichtet } from "@/lib/blog-github";
import NeuerBeitrag from "./NeuerBeitrag";

// ---------------------------------------------------------------------------
// Der Blog-Editor: die Übersicht aller Beiträge, Entwürfe zuerst.
//
// Die Liste kommt direkt von GitHub und nicht aus dem Ordner der
// veröffentlichten Seite. So steht eine gerade gespeicherte Änderung schon
// hier, während Vercel die Seite noch neu baut.
// ---------------------------------------------------------------------------

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog bearbeiten",
  robots: { index: false, follow: false },
};

function datum(wert: string): string {
  if (!wert) return "";
  const [j, m, t] = wert.split("-");
  return `${t}.${m}.${j}`;
}

function Anleitung() {
  return (
    <div className="rounded-[18px] border border-line bg-white p-6 sm:p-7">
      <h2 className="mb-3 font-serif text-[22px]">Einmal einrichten</h2>
      <p className="mb-4 text-[15px] leading-relaxed text-ink-soft">
        Der Editor speichert deine Änderungen direkt im Code der Website auf
        GitHub. Dafür braucht die Website einmalig einen Schlüssel, der nur für
        dieses eine Projekt gilt und nur Dateien schreiben darf.
      </p>
      <ol className="list-decimal space-y-2.5 pl-5 text-[15px] leading-relaxed text-ink">
        <li>
          Auf <strong>github.com</strong> oben rechts auf dein Bild klicken,
          dann <strong>Settings</strong>, ganz unten links{" "}
          <strong>Developer settings</strong>, dann{" "}
          <strong>Personal access tokens</strong> und{" "}
          <strong>Fine-grained tokens</strong>.
        </li>
        <li>
          <strong>Generate new token</strong>. Name: Blog-Editor. Ablauf: so
          lang wie möglich, zum Beispiel ein Jahr.
        </li>
        <li>
          Bei <strong>Repository access</strong>:{" "}
          <strong>Only select repositories</strong> und dort{" "}
          <strong>pferdeliebehealthy-homepage</strong> wählen.
        </li>
        <li>
          Bei <strong>Permissions</strong>, Repository permissions:{" "}
          <strong>Contents</strong> auf <strong>Read and write</strong>{" "}
          stellen. Sonst nichts.
        </li>
        <li>
          <strong>Generate token</strong> und den Schlüssel kopieren. Er beginnt
          mit <code>github_pat_</code> und wird nur dieses eine Mal angezeigt.
        </li>
        <li>
          Auf <strong>vercel.com</strong> das Projekt{" "}
          <strong>pferdeliebehealthy-homepage</strong> öffnen,{" "}
          <strong>Settings</strong>, <strong>Environment Variables</strong>.
          Name <code>GITHUB_TOKEN</code>, als Wert den Schlüssel einfügen,
          speichern.
        </li>
        <li>
          Unter <strong>Deployments</strong> beim obersten Eintrag auf die drei
          Punkte und <strong>Redeploy</strong>. Danach steht hier die Liste
          deiner Beiträge.
        </li>
      </ol>
    </div>
  );
}

export default async function BlogUebersicht() {
  if (!adminEingerichtet() || !(await istAngemeldet())) {
    return (
      <main className="px-6 py-20">
        <div className="mx-auto max-w-lg text-center">
          <p className="text-[15px] text-ink-soft">
            Bitte zuerst{" "}
            <Link href="/admin" className="text-rose-deep underline underline-offset-2">
              anmelden
            </Link>
            .
          </p>
        </div>
      </main>
    );
  }

  const eingerichtet = githubEingerichtet();
  const beitraege = eingerichtet ? await beitraegeListen() : null;
  const entwuerfe = beitraege?.filter((b) => b.entwurf) ?? [];
  const online = beitraege?.filter((b) => !b.entwurf) ?? [];

  return (
    <main className="px-6 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="font-serif text-[32px] font-normal leading-tight tracking-tight sm:text-[40px]">
            Blog bearbeiten
          </h1>
          <nav className="flex flex-wrap gap-5 text-[14.5px]">
            <Link href="/blog" className="text-rose-deep underline underline-offset-2">
              Zum Blog
            </Link>
            <Link href="/admin" className="text-rose-deep underline underline-offset-2">
              Auswertung
            </Link>
          </nav>
        </div>

        <p className="mb-8 max-w-[70ch] text-[15px] leading-relaxed text-ink-soft">
          Hier schreibst und änderst du deine Beiträge. Ein Entwurf ist nur hier
          zu sehen. Was du speicherst oder veröffentlichst, steht nach etwa zwei
          Minuten auf der Website, so lange braucht sie zum Neubauen.
        </p>

        {!eingerichtet ? (
          <Anleitung />
        ) : !beitraege ? (
          <div className="rounded-[18px] border border-line bg-white p-6 text-[15px] leading-relaxed text-ink-soft">
            GitHub antwortet gerade nicht, oder der Schlüssel passt nicht mehr.
            Lad die Seite in einer Minute neu. Bleibt es so, ist der Schlüssel
            vermutlich abgelaufen, dann einen neuen anlegen wie beim ersten Mal.
          </div>
        ) : (
          <>
            <NeuerBeitrag />

            <section className="mt-10">
              <h2 className="mb-4 font-serif text-[22px]">
                {entwuerfe.length === 0
                  ? "Keine Entwürfe"
                  : entwuerfe.length === 1
                    ? "Ein Entwurf"
                    : `${entwuerfe.length} Entwürfe`}
              </h2>
              <div className="space-y-3">
                {entwuerfe.map((b) => (
                  <Link
                    key={b.slug}
                    href={`/admin/blog/${b.slug}`}
                    className="block rounded-[16px] border border-line bg-white p-5 transition-colors hover:border-rose-deep"
                  >
                    <p className="font-serif text-[19px] leading-snug text-ink">{b.titel}</p>
                    <p className="mt-1.5 text-[14px] text-ink-soft">
                      <span className="text-rose-deep">Entwurf</span>
                      {b.kategorie && <> · {b.kategorie}</>}
                      {b.datum && <> · {datum(b.datum)}</>}
                    </p>
                  </Link>
                ))}
              </div>
            </section>

            <section className="mt-10">
              <h2 className="mb-4 font-serif text-[22px]">Online ({online.length})</h2>
              <div className="space-y-3">
                {online.map((b) => (
                  <Link
                    key={b.slug}
                    href={`/admin/blog/${b.slug}`}
                    className="block rounded-[16px] border border-line bg-white p-5 transition-colors hover:border-rose-deep"
                  >
                    <p className="font-serif text-[19px] leading-snug text-ink">{b.titel}</p>
                    <p className="mt-1.5 text-[14px] text-ink-soft">
                      {b.kategorie}
                      {b.datum && <> · erschienen {datum(b.datum)}</>}
                      {b.aktualisiert && <> · überarbeitet {datum(b.aktualisiert)}</>}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
