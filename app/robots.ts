import type { MetadataRoute } from "next";
import { seitenUrl } from "@/lib/seo";

// Sagt Suchmaschinen, was sie lesen duerfen und wo die Seitenuebersicht liegt.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Die Vorschauseite gehoert nicht in den Suchindex.
        disallow: ["/vorschau"],
      },
    ],
    sitemap: `${seitenUrl}/sitemap.xml`,
  };
}
