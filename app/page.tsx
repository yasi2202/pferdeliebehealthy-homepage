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

export default function Home() {
  return (
    <main>
      <Hero />
      <RatioProAuszug />
      <ProblemSection />
      <StallOrganizerSection />
      <WegeSection />
      <MitgliederStreifen />
      <PillarsSection />
      <AboutSection />
      <TestimonialSection />
      {/* Der Blog steht vor der Insider-Einladung: erst zeigen, dass es etwas
          zu lesen gibt, dann nach der Adresse fragen. Sind alle Beitraege
          Entwuerfe, blendet sich der Abschnitt selbst aus. */}
      <BlogSection />
      {/* Nach dem Blog: Wer bis hierher gelesen hat, interessiert sich fuer
          das Thema und fragt frueher oder spaeter, womit Yasemin selbst
          arbeitet. Bewusst ein schmaler Streifen, keine grosse Flaeche:
          Es sind fremde Produkte, die nicht mit den eigenen konkurrieren
          sollen. */}
      <EmpfehlungenStreifen />
      {/* Wer schon Insider ist, wird nicht noch einmal eingeladen. */}
      <NurFuerNichtInsider>
        <InsiderSection />
      </NurFuerNichtInsider>
      <CtaFinal />
    </main>
  );
}
