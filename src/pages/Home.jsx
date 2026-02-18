import { motion } from "framer-motion";
import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";
import PortfolioSection from "../components/PortfolioSection.jsx";
import SignaturePiecesSection from "../components/SignaturePiecesSection.jsx";
import ConsultationsSection from "../components/ConsultationsSection.jsx";
import ClassSection from "../components/ClassSection.jsx";
import ContactSection from "../components/ContactSection.jsx";
import AboutSection from "../components/AboutSection.jsx";
import TestimonialsSection from "../components/TestimonialsSection.jsx";
import FaqSection from "../components/FaqSection.jsx";
import NewsletterSection from "../components/NewsletterSection.jsx";
import Footer from "../components/Footer.jsx";

const Motion = motion;

function Home() {
  const canAnimateOnView =
    typeof window !== "undefined" && "IntersectionObserver" in window;
  const inViewProps = canAnimateOnView
    ? {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.3 },
        transition: { duration: 0.6, ease: "easeOut" },
      }
    : { initial: false };

  return (
    <div className="min-h-screen bg-porcelain text-obsidian">
      <Navbar />
      <Hero />
      <Motion.div {...inViewProps}>
        <ConsultationsSection />
      </Motion.div>
      <Motion.div {...inViewProps}>
        <ClassSection />
      </Motion.div>
      <Motion.div {...inViewProps}>
        <PortfolioSection />
      </Motion.div>
      <Motion.div {...inViewProps}>
        <AboutSection />
      </Motion.div>
      <Motion.div {...inViewProps}>
        <SignaturePiecesSection />
      </Motion.div>
      <Motion.div {...inViewProps}>
        <TestimonialsSection />
      </Motion.div>
      <div>
        <NewsletterSection />
      </div>
      <Motion.div {...inViewProps}>
        <FaqSection />
      </Motion.div>
      <Motion.div {...inViewProps}>
        <ContactSection />
      </Motion.div>
      <Footer />
    </div>
  );
}

export default Home;
