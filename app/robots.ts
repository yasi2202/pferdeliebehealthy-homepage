import type { MetadataRoute } from "next";
import { seitenUrl } from "@/lib/seo";

// Sagt Suchmaschinen, was sie lesen duerfen und wo die Seitenuebersicht liegt.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Die Vorschauseite gehoert nicht in den Suchindex, die Kasse und
        // die Dankeseite ebenso wenig: Sie sind ohne Warenkorb leer und
        // helfen niemandem, der ueber Google dort landet.
        disallow: ["/vorschau", "/kasse", "/bestellung-danke"],
      },
    ],
    sitemap: `${seitenUrl}/sitemap.xml`,
  };
}
