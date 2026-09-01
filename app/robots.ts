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
        //
        // /admin, /angebot und /downsell ebenfalls nicht. Bei /admin ist das
        // allerdings nur Hoeflichkeit gegenueber Suchmaschinen, kein Schutz:
        // Der Schutz sitzt im Passwort, ohne das dort nichts geladen wird.
        // Eine robots-Angabe haelt niemanden auf, der es darauf anlegt.
        disallow: [
          "/vorschau",
          "/kasse",
          "/bestellung-danke",
          "/admin",
          "/angebot",
          "/downsell",
          "/danke",
        ],
      },
    ],
    sitemap: `${seitenUrl}/sitemap.xml`,
  };
}
