import Hero from "@/components/Hero";
import ProblemSection from "@/components/ProblemSection";
import WegeSection from "@/components/WegeSection";
import ProdukteSection from "@/components/ProdukteSection";
import PillarsSection from "@/components/PillarsSection";
import AboutSection from "@/components/AboutSection";
import TestimonialSection from "@/components/TestimonialSection";
import CtaFinal from "@/components/CtaFinal";

export default function Home() {
  return (
    <main>
      <Hero />
      <ProblemSection />
      <WegeSection />
      <ProdukteSection />
      <PillarsSection />
      <AboutSection />
      <TestimonialSection />
      <CtaFinal />
    </main>
  );
}
