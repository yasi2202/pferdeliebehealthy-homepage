import type { MetadataRoute } from "next";
import { alleBeitraege } from "@/lib/beitraege";
import { alleBlogBeitraege } from "@/lib/blog";
import { produkte, shopSichtbar } from "@/lib/shop";
import { url } from "@/lib/seo";

// Die Seitenuebersicht fuer Suchmaschinen. Neue Insider-Beitraege landen
// automatisch darin, sobald die Markdown-Datei im Ordner liegt.
export default function sitemap(): MetadataRoute.Sitemap {
  const feste: Array<{ pfad: string; prioritaet: number; takt: "weekly" | "monthly" | "yearly" }> = [
    { pfad: "/", prioritaet: 1.0, takt: "weekly" },
    { pfad: "/ausbildung", prioritaet: 0.9, takt: "monthly" },
    { pfad: "/futter-check", prioritaet: 0.9, takt: "monthly" },
    // ▸ DIE PRODUKTSEITEN.
    //   Sie stehen hier von Hand und nicht aus digital.ts erzeugt: Nicht
    //   jedes Produkt im Katalog hat eine eigene Seite, und die Ausbildung
    //   soll erst ab dem Vertriebsbeginn bei Google auftauchen.
    { pfad: "/mineral-klarheit", prioritaet: 0.8, takt: "monthly" },
    { pfad: "/ganzjahresfutterplan", prioritaet: 0.8, takt: "monthly" },
    { pfad: "/pferdeliebe-365", prioritaet: 0.8, takt: "monthly" },
    { pfad: "/ratiopro", prioritaet: 0.8, takt: "monthly" },
    { pfad: "/symptom-navigator", prioritaet: 0.8, takt: "monthly" },
    { pfad: "/basisfutterkurs", prioritaet: 0.7, takt: "monthly" },
    { pfad: "/darmaufbau", prioritaet: 0.7, takt: "monthly" },
    { pfad: "/magen-reset", prioritaet: 0.7, takt: "monthly" },
    { pfad: "/salzratgeber", prioritaet: 0.7, takt: "monthly" },
    { pfad: "/equidesk", prioritaet: 0.8, takt: "monthly" },
    { pfad: "/blog", prioritaet: 0.9, takt: "weekly" },
    { pfad: "/insider", prioritaet: 0.8, takt: "weekly" },
    // Der Shop steht erst in der Übersicht, wenn er freigeschaltet ist.
    // Sonst schickt Google Leute auf eine Seite, die es im Menü nicht gibt.
    // Der Schalter sitzt in lib/shop.ts.
    ...(shopSichtbar
      ? ([
          { pfad: "/shop", prioritaet: 0.9, takt: "weekly" },
          { pfad: "/zahlung-und-versand", prioritaet: 0.3, takt: "yearly" },
        ] as const)
      : []),
    { pfad: "/empfehlungen", prioritaet: 0.6, takt: "monthly" },
    { pfad: "/impressum", prioritaet: 0.2, takt: "yearly" },
    { pfad: "/datenschutz", prioritaet: 0.2, takt: "yearly" },
    { pfad: "/agb", prioritaet: 0.2, takt: "yearly" },
    { pfad: "/widerrufsbelehrung", prioritaet: 0.2, takt: "yearly" },
  ];

  // Nur was offen steht. Ein Beitrag hinter der Schranke traegt auf
  // `noindex`, ihn trotzdem anzumelden waere ein Widerspruch: Man bittet
  // Google zu einer Seite und verbietet ihm dort das Lesen.
  const beitraege = alleBeitraege().filter((b) => b.frei);
  const blog = alleBlogBeitraege();

  // Aeltester gemeinsamer Nenner fuer "zuletzt geaendert": das Datum des
  // neuesten Beitrags, sonst nichts. Ein erfundenes Datum waere schlechter
  // als gar keines -- Suchmaschinen misstrauen Uebersichten, in denen alles
  // immer von heute stammt.
  const neuestes = beitraege[0]?.datum;

  return [
    ...feste.map((s) => ({
      url: url(s.pfad),
      ...(s.pfad === "/" && neuestes ? { lastModified: new Date(neuestes) } : {}),
      changeFrequency: s.takt,
      priority: s.prioritaet,
    })),
    ...(shopSichtbar
      ? produkte.map((p) => ({
          url: url(`/shop/${p.slug}`),
          changeFrequency: "monthly" as const,
          priority: 0.8,
        }))
      : []),
    // Der Blog steht vor den Insider-Beitraegen: Er ist der Teil, der
    // gefunden werden soll.
    ...blog.map((b) => ({
      url: url(`/blog/${b.slug}`),
      ...(b.aktualisiert || b.datum
        ? { lastModified: new Date(b.aktualisiert || b.datum) }
        : {}),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...beitraege.map((b) => ({
      url: url(`/insider/${b.slug}`),
      ...(b.datum ? { lastModified: new Date(b.datum) } : {}),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
