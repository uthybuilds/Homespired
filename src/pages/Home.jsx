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
  const sectionMotionProps = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  };

  return (
    <div className="min-h-screen bg-porcelain text-obsidian">
      <Navbar />
      <Hero />
      <Motion.div {...sectionMotionProps}>
        <ConsultationsSection />
      </Motion.div>
      <Motion.div {...sectionMotionProps}>
        <ClassSection />
      </Motion.div>
      <Motion.div {...sectionMotionProps}>
        <PortfolioSection />
      </Motion.div>
      <Motion.div {...sectionMotionProps}>
        <AboutSection />
      </Motion.div>
      <Motion.div {...sectionMotionProps}>
        <SignaturePiecesSection />
      </Motion.div>
      <Motion.div {...sectionMotionProps}>
        <TestimonialsSection />
      </Motion.div>
      <div>
        <NewsletterSection />
      </div>
      <Motion.div {...sectionMotionProps}>
        <FaqSection />
      </Motion.div>
      <Motion.div {...sectionMotionProps}>
        <ContactSection />
      </Motion.div>
      <Footer />
    </div>
  );
}

export default Home;
