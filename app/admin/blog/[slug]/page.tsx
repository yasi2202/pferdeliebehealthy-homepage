import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import matter from "gray-matter";
import { adminEingerichtet, istAngemeldet } from "@/lib/admin-zugang";
import { beitragHolen, githubEingerichtet, type BeitragDatei } from "@/lib/blog-github";
import { kopfAusDaten } from "@/lib/blog-kopf";
import { angebotsHinweise } from "@/lib/angebote";
import BlogEditor from "./BlogEditor";

// ---------------------------------------------------------------------------
// Ein Beitrag im Editor. Geladen wird von GitHub, damit immer der neueste
// Stand im Editor steht, auch wenn die Website gerade noch neu baut.
// ---------------------------------------------------------------------------

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Beitrag bearbeiten",
  robots: { index: false, follow: false },
};

function Hinweisseite({ children }: { children: React.ReactNode }) {
  return (
    <main className="px-6 py-20">
      <div className="mx-auto max-w-lg text-center text-[15px] leading-relaxed text-ink-soft">
        {children}
      </div>
    </main>
  );
}

export default async function BeitragBearbeiten({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!adminEingerichtet() || !(await istAngemeldet())) {
    return (
      <Hinweisseite>
        Bitte zuerst{" "}
        <Link href="/admin" className="text-rose-deep underline underline-offset-2">
          anmelden
        </Link>
        .
      </Hinweisseite>
    );
  }
  if (!githubEingerichtet()) {
    return (
      <Hinweisseite>
        Zum Bearbeiten fehlt noch der GitHub-Schlüssel. Die Anleitung steht auf
        der{" "}
        <Link href="/admin/blog" className="text-rose-deep underline underline-offset-2">
          Übersicht
        </Link>
        .
      </Hinweisseite>
    );
  }

  const { slug } = await params;
  let datei: BeitragDatei | null;
  try {
    datei = await beitragHolen(slug);
  } catch {
    return (
      <Hinweisseite>
        GitHub antwortet gerade nicht. Lad die Seite in einer Minute neu.
      </Hinweisseite>
    );
  }
  if (!datei) notFound();

  let data: Record<string, unknown> = {};
  let inhalt = datei.text;
  try {
    const teile = matter(datei.text);
    data = teile.data;
    inhalt = teile.content;
  } catch {
    // Kaputter Kopf: Der Editor zeigt dann leere Felder und den ganzen Text.
  }
  const { kopf, extras } = kopfAusDaten(data);

  const angebote = Object.entries(angebotsHinweise).map(([schluessel, a]) => ({
    schluessel,
    name: a.name,
  }));

  return (
    <BlogEditor
      slug={datei.slug}
      sha={datei.sha}
      entwurf={datei.entwurf}
      kopf={kopf}
      inhalt={inhalt}
      extras={extras}
      angebote={angebote}
    />
  );
}
