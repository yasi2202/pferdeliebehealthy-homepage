import Hero from "@/components/Hero";
import Gesundheitsakte from "@/components/Gesundheitsakte";
import ProblemSection from "@/components/ProblemSection";
import WegeSection from "@/components/WegeSection";
import MitgliederStreifen from "@/components/MitgliederStreifen";
import PillarsSection from "@/components/PillarsSection";
import AboutSection from "@/components/AboutSection";
import TestimonialSection from "@/components/TestimonialSection";
import InsiderSection from "@/components/InsiderSection";
import CtaFinal from "@/components/CtaFinal";

export default function Home() {
  return (
    <main>
      <Hero />
      <Gesundheitsakte />
      <ProblemSection />
      <WegeSection />
      <MitgliederStreifen />
      <PillarsSection />
      <AboutSection />
      <TestimonialSection />
      <InsiderSection />
      <CtaFinal />
    </main>
  );
}
