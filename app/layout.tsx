import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollFade from "@/components/ScrollFade";

export const metadata: Metadata = {
  title: "Pferdeliebehealthy | Ganzheitliche Pferdefütterung mit Yasemin Halac",
  description:
    "Ernährungsberaterin für Pferde. Ganzheitliche Pferdefütterung für Pferdebesitzerinnen und angehende Beraterinnen. Kostenloser Futter-Check, Mineral-Klarheit, die Ausbildung und Pferdeliebe 365.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=Work+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased text-ink bg-cream">
        <Header />
        {children}
        <Footer />
        <ScrollFade />
      </body>
    </html>
  );
}
