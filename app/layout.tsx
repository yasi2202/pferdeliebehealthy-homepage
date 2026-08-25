import type { Metadata } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollFade from "@/components/ScrollFade";
import InsiderBar from "@/components/InsiderBar";

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

export const metadata: Metadata = {
  title: "Pferdeliebehealthy | Ganzheitliche Pferdefütterung mit Yasemin Halac",
  description:
    "Ernährungsberaterin für Pferde aus dem Odenwald. Kostenloser Futter-Check, Mineral-Klarheit, RatioPro, Futterberatung 365 und die Masterclass zur Pferdefütterung.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={`${fraunces.variable} ${workSans.variable}`}>
      <body className="font-sans antialiased text-ink bg-cream">
        <Header />
        {children}
        <Footer />
        <ScrollFade />
        <InsiderBar />
        {/* Besucherzählung ohne Cookies: erkennt niemanden wieder, speichert
            keine Kennung im Browser, deshalb ohne Einwilligung zulässig.
            Zählt erst, wenn Web Analytics im Vercel-Konto aktiviert ist. */}
        <Analytics />
      </body>
    </html>
  );
}
