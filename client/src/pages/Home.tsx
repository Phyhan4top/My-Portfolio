import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Skills } from "@/components/Skills";
import { Experience } from "@/components/Experience";
import { Projects } from "@/components/Projects";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { motion, useScroll, useSpring } from "framer-motion";
import { usePortfolio } from "@/hooks/use-portfolio";
import { defaultPortfolio } from "@shared/schema";

export default function Home() {
  const { data } = usePortfolio();
  const portfolio = data ?? defaultPortfolio;
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/30 selection:text-primary-foreground">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-[100] origin-left"
        style={{ scaleX }}
      />

      <Navbar brand={portfolio.brand} />
      
      <main>
        <Hero data={portfolio.hero} />
        <About data={portfolio.about} />
        <Skills data={portfolio.skills} />
        <Experience data={portfolio.experience} />
        <Projects data={portfolio.projects} />
        <Contact data={portfolio.contact} />
      </main>

      <Footer brand={portfolio.brand} footer={portfolio.footer} />
    </div>
  );
}
