import type { CSSProperties } from "react";
import Hero from "@/components/Hero";
import RatioProAuszug from "@/components/RatioProAuszug";
import ProblemSection from "@/components/ProblemSection";
import WegeSection from "@/components/WegeSection";
import StallOrganizerSection from "@/components/StallOrganizerSection";
import MitgliederStreifen from "@/components/MitgliederStreifen";
import PillarsSection from "@/components/PillarsSection";
import AboutSection from "@/components/AboutSection";
import TestimonialSection from "@/components/TestimonialSection";
import InsiderSection from "@/components/InsiderSection";
import BlogSection from "@/components/BlogSection";
import NurFuerNichtInsider from "@/components/NurFuerNichtInsider";
import EmpfehlungenStreifen from "@/components/EmpfehlungenStreifen";
import CtaFinal from "@/components/CtaFinal";

// Ab ProblemSection steckt jeder Abschnitt in einem div mit
// "spaeter-zeichnen" (Erklaerung in app/globals.css). Der Browser rechnet
// diese Abschnitte erst durch, wenn sie in die Naehe des Bildschirms kommen,
// statt beim Aufbau die ganzen 16.600 Pixel auf einmal.
//
// Hero und RatioProAuszug bleiben aussen vor: Der Held ist ohnehin sichtbar,
// und der RatioPro-Kasten schiebt sich mit negativem Abstand ins Heldenbild
// hinein, sein Rand darf also nicht abschneiden.
//
// Die Zahl an jedem Abschnitt ist seine Hoehe auf dem Handy, am 09.09.2026
// bei 412 Pixel Breite gemessen. Der Browser haelt damit den Platz frei,
// bevor er den Abschnitt ueberhaupt gerechnet hat. Sie muss nicht auf den
// Pixel stimmen, aber grob passen: Liegt sie daneben, waechst oder schrumpft
// die Seite beim ersten Durchscrollen unter der Bildlaufleiste. Wer einen
// Abschnitt deutlich laenger oder kuerzer macht, sollte die Zahl mitziehen.
export default function Home() {
  return (
    <main>
      <Hero />
      <RatioProAuszug />
      <div
        className="spaeter-zeichnen"
        style={{ "--geschaetzte-hoehe": "880px" } as CSSProperties}
      >
        <ProblemSection />
      </div>
      <div
        className="spaeter-zeichnen"
        style={{ "--geschaetzte-hoehe": "1460px" } as CSSProperties}
      >
        <StallOrganizerSection />
      </div>
      <div
        className="spaeter-zeichnen"
        style={{ "--geschaetzte-hoehe": "2040px" } as CSSProperties}
      >
        <WegeSection />
      </div>
      <div
        className="spaeter-zeichnen"
        style={{ "--geschaetzte-hoehe": "230px" } as CSSProperties}
      >
        <MitgliederStreifen />
      </div>
      <div
        className="spaeter-zeichnen"
        style={{ "--geschaetzte-hoehe": "1190px" } as CSSProperties}
      >
        <PillarsSection />
      </div>
      <div
        className="spaeter-zeichnen"
        style={{ "--geschaetzte-hoehe": "2120px" } as CSSProperties}
      >
        <AboutSection />
      </div>
      <div
        className="spaeter-zeichnen"
        style={{ "--geschaetzte-hoehe": "1790px" } as CSSProperties}
      >
        <TestimonialSection />
      </div>
      {/* Der Blog steht vor der Insider-Einladung: erst zeigen, dass es etwas
          zu lesen gibt, dann nach der Adresse fragen. Sind alle Beitraege
          Entwuerfe, blendet sich der Abschnitt selbst aus. */}
      <div
        className="spaeter-zeichnen"
        style={{ "--geschaetzte-hoehe": "1540px" } as CSSProperties}
      >
        <BlogSection />
      </div>
      {/* Nach dem Blog: Wer bis hierher gelesen hat, interessiert sich fuer
          das Thema und fragt frueher oder spaeter, womit Yasemin selbst
          arbeitet. Bewusst ein schmaler Streifen, keine grosse Flaeche:
          Es sind fremde Produkte, die nicht mit den eigenen konkurrieren
          sollen. */}
      <div
        className="spaeter-zeichnen"
        style={{ "--geschaetzte-hoehe": "350px" } as CSSProperties}
      >
        <EmpfehlungenStreifen />
      </div>
      {/* Wer schon Insider ist, wird nicht noch einmal eingeladen. */}
      <div
        className="spaeter-zeichnen"
        style={{ "--geschaetzte-hoehe": "1530px" } as CSSProperties}
      >
        <NurFuerNichtInsider>
          <InsiderSection />
        </NurFuerNichtInsider>
      </div>
      <div
        className="spaeter-zeichnen"
        style={{ "--geschaetzte-hoehe": "640px" } as CSSProperties}
      >
        <CtaFinal />
      </div>
    </main>
  );
}
