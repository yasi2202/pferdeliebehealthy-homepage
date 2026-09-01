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

const TITEL = "Pferdeliebehealthy | Ganzheitliche Pferdefütterung mit Yasemin Halac";
const BESCHREIBUNG =
  "Ernährungsberaterin für Pferde aus dem Odenwald. Kostenloser Futter-Check, Mineral-Klarheit, RatioPro, Futterberatung 365 und die Ausbildung Ganzheitliche Pferdefütterung.";

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
  keywords: [
    "Pferdefütterung",
    "Ernährungsberatung Pferd",
    "Pferdeernährungsberaterin",
    "Mineralfutter Pferd",
    "Heuanalyse",
    "Rationsberechnung Pferd",
    "PPID Cushing Fütterung",
    "Odenwald",
  ],
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
    images: [
      {
        url: "/images/yasi-helena.jpg",
        width: 1122,
        height: 1402,
        alt: "Yasemin Halac mit ihrer Stute Helena",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITEL,
    description: BESCHREIBUNG,
    images: ["/images/yasi-helena.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  category: "Pferdegesundheit",
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
