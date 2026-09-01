import type { MetadataRoute } from "next";
import { alleBeitraege } from "@/lib/beitraege";
import { produkte, shopSichtbar } from "@/lib/shop";
import { url } from "@/lib/seo";

// Die Seitenuebersicht fuer Suchmaschinen. Neue Insider-Beitraege landen
// automatisch darin, sobald die Markdown-Datei im Ordner liegt.
export default function sitemap(): MetadataRoute.Sitemap {
  const feste: Array<{ pfad: string; prioritaet: number; takt: "weekly" | "monthly" | "yearly" }> = [
    { pfad: "/", prioritaet: 1.0, takt: "weekly" },
    { pfad: "/ausbildung", prioritaet: 0.9, takt: "monthly" },
    { pfad: "/futter-check", prioritaet: 0.9, takt: "monthly" },
    { pfad: "/mineral-klarheit", prioritaet: 0.8, takt: "monthly" },
    { pfad: "/equidesk", prioritaet: 0.8, takt: "monthly" },
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

  const beitraege = alleBeitraege();

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
    ...beitraege.map((b) => ({
      url: url(`/insider/${b.slug}`),
      ...(b.datum ? { lastModified: new Date(b.datum) } : {}),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
