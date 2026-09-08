import type { Metadata } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { seitenUrl, url } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollFade from "@/components/ScrollFade";
import InsiderBar from "@/components/InsiderBar";
import WarenkorbProvider from "@/components/WarenkorbProvider";
import WarenkorbLade from "@/components/WarenkorbLade";

// ---------------------------------------------------------------------------
// Die Schriften werden beim Bauen heruntergeladen und von der eigenen Domain
// ausgeliefert. Der Browser der Besucherin fragt damit nichts mehr bei Google
// an — keine IP-Adresse geht in die USA, kein Cookie-Banner nötig.
//
// Vorher standen hier <link>-Tags auf fonts.googleapis.com.
// ---------------------------------------------------------------------------

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-fraunces",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-work-sans",
});

// ▸ AM 08.09.2026 GEKUERZT, beides war fuer Google zu lang.
//   Der Titel hatte 68 Zeichen und wurde im Ergebnis abgeschnitten, jetzt
//   sind es 49. Der Markenname und das Hauptstichwort reichen, der Name
//   Yasemin Halac steht ohnehin im Text der Seite und in den
//   strukturierten Daten weiter unten.
//
//   Die Beschreibung war eine Aufzaehlung aller Produkte, 199 Zeichen lang
//   und damit ebenfalls abgeschnitten. Jetzt steht dort ein Grund zu
//   klicken statt einer Liste. Faustregel: Titel unter 60 Zeichen,
//   Beschreibung unter 155.
const TITEL = "Pferdeliebehealthy | Ganzheitliche Pferdefütterung";
const BESCHREIBUNG =
  "Ernährungsberaterin für Pferde: kostenloser Futter-Check, Rationsberechnung und die Ausbildung Ganzheitliche Pferdefütterung. Fütterung, die zu deinem Pferd passt.";

export const metadata: Metadata = {
  // metadataBase macht aus allen relativen Angaben unten vollstaendige
  // Adressen. Ohne sie bleiben Vorschaubilder beim Teilen leer.
  metadataBase: new URL(seitenUrl),
  title: {
    default: TITEL,
    // Unterseiten setzen nur ihren eigenen Namen; der Markenname kommt
    // automatisch dahinter.
    template: "%s | Pferdeliebehealthy",
  },
  description: BESCHREIBUNG,
  applicationName: "Pferdeliebehealthy",
  authors: [{ name: "Yasemin Halac" }],
  creator: "Yasemin Halac",
  publisher: "Pferdeliebehealthy",
  // Das Feld `keywords` stand hier bis zum 08.09.2026 mit acht Begriffen.
  // Entfernt: Google wertet <meta name="keywords"> seit 2009 ausdruecklich
  // nicht mehr aus, Bing ebenso wenig. Es stand auf jeder Seite gleich und
  // hat nie etwas bewirkt.
  // Sagt Google, welche Adresse die richtige ist -- wichtig, solange die
  // Seite unter mehreren Adressen erreichbar ist.
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Pferdeliebehealthy",
    title: TITEL,
    description: BESCHREIBUNG,
    url: "/",
    // ▸ QUERFORMAT, NICHT HOCHFORMAT.
    //   Bis zum 02.09.2026 stand hier yasi-helena.jpg, und das ist 1122 x
    //   1402, also hochkant. Jede Vorschau, ob bei Google, WhatsApp oder
    //   Facebook, rechnet mit 1200 x 630 und schneidet ein hochkantes Bild
    //   oben und unten weg. Uebrig blieb ein Ausschnitt ohne Zusammenhang.
    //
    //   vorschau.jpg ist genau 1200 x 630 und traegt den Namen, die
    //   Taetigkeit und den Ort. Gebaut aus demselben Foto, damit es zum Rest
    //   passt. Die Quelldatei dazu liegt in
    //   Dokumente\Google Unternehmensprofil.
    images: [
      {
        url: "/images/vorschau.jpg",
        width: 1200,
        height: 630,
        alt: "Pferdeliebehealthy, Ernährungsberatung für Pferde aus dem Odenwald",
      },
    ],
  },
  // ▸ HIER STEHT ABSICHTLICH NUR DIE KARTENFORM (seit 08.09.2026).
  //   Vorher standen hier auch Titel, Text und Bild der Startseite. Next.js
  //   vererbt Metadaten an jede Seite, die sie nicht selbst setzt, und keine
  //   einzige Unterseite setzte `twitter`. Ergebnis: Wer den Blog oder die
  //   Ausbildung bei X teilte, bekam die Vorschau der Startseite zu sehen.
  //
  //   Fehlen Titel und Text hier, nimmt X die Open-Graph-Angaben der
  //   jeweiligen Seite. Damit ist die Karte ueberall von selbst richtig.
  //   Also nicht wieder auffuellen, siehe `teilen()` in lib/seo.ts.
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  category: "Pferdegesundheit",
  // -------------------------------------------------------------------------
  // Der Nachweis fuer die Google Search Console.
  //
  // Google prueft damit, dass die Seite wirklich Yasemin gehoert. Next.js
  // macht daraus ein <meta name="google-site-verification"> im Kopf jeder
  // Seite. Kein Geheimnis: Der Wert steht ohnehin oeffentlich im Quelltext.
  //
  // ▸ NICHT ENTFERNEN. Faellt die Zeile weg, verliert Google den Nachweis,
  //   und der Zugang zur Search Console geht verloren. Angelegt am
  //   02.09.2026 fuer die Adresse https://www.pferdeliebehealthy.de.
  // -------------------------------------------------------------------------
  verification: {
    google: "2iG62PmBewzCcBQY3cZEolcGSvFobhPMavLmY1Uctlw",
  },
};

// ---------------------------------------------------------------------------
// Strukturierte Daten.
//
// Damit versteht Google, dass hinter der Seite ein konkretes Unternehmen mit
// einer konkreten Person an einem konkreten Ort steht. Das ist die Grundlage
// dafuer, bei Suchen wie "Ernaehrungsberaterin Pferd Odenwald" ueberhaupt in
// Frage zu kommen, und fuellt die Infokarte rechts neben den Ergebnissen.
// ---------------------------------------------------------------------------
const strukturierteDaten = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfessionalService",
      "@id": url("/#unternehmen"),
      name: "Pferdeliebehealthy",
      description: BESCHREIBUNG,
      url: seitenUrl,
      image: url("/images/yasi-helena.jpg"),
      email: "info@pferdeliebehealthy.de",
      priceRange: "€€",
      areaServed: { "@type": "Country", name: "Deutschland" },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Buchen",
        addressRegion: "Baden-Württemberg",
        addressCountry: "DE",
      },
      founder: { "@id": url("/#yasemin") },
      sameAs: [
        "https://www.instagram.com/pferdeliebehealthy",
        "https://www.tiktok.com/@pferdeliebehealthy",
      ],
    },
    {
      "@type": "Person",
      "@id": url("/#yasemin"),
      name: "Yasemin Halac",
      jobTitle: "Ernährungsberaterin für Pferde",
      image: url("/images/yasi-portrait.jpg"),
      worksFor: { "@id": url("/#unternehmen") },
      knowsAbout: [
        "Pferdefütterung",
        "Rationsberechnung",
        "Mineralstoffversorgung",
        "PPID und Cushing beim Pferd",
      ],
    },
    {
      "@type": "WebSite",
      "@id": url("/#website"),
      url: seitenUrl,
      name: "Pferdeliebehealthy",
      inLanguage: "de-DE",
      publisher: { "@id": url("/#unternehmen") },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={`${fraunces.variable} ${workSans.variable}`}>
      <body className="font-sans antialiased text-ink bg-cream">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(strukturierteDaten) }}
        />
        {/* Der Warenkorb umschliesst alles, weil sowohl die Kopfzeile als
            auch die Produktseiten und die Kasse ihn brauchen. Er lebt im
            Browser der Besucherin und setzt kein Cookie. */}
        <WarenkorbProvider>
          <Header />
          {children}
          <Footer />
          <WarenkorbLade />
        </WarenkorbProvider>
        <ScrollFade />
        <InsiderBar />
        {/* Besucherzählung ohne Cookies: erkennt niemanden wieder, speichert
            keine Kennung im Browser, deshalb ohne Einwilligung zulässig.
            Zählt erst, wenn Web Analytics im Vercel-Konto aktiviert ist. */}
        <Analytics />
        {/* Misst, wie schnell die Seite bei echten Besucherinnen lädt.
            Ebenfalls ohne Cookies, zeigt Werte im Vercel-Konto unter
            "Speed Insights" -- dort muss es einmal aktiviert werden. */}
        <SpeedInsights />
      </body>
    </html>
  );
}
