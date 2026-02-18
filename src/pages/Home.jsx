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
  return (
    <div className="min-h-screen bg-porcelain text-obsidian">
      <Navbar />
      <Hero />
      <Motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <ConsultationsSection />
      </Motion.div>
      <Motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <ClassSection />
      </Motion.div>
      <Motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <PortfolioSection />
      </Motion.div>
      <Motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <AboutSection />
      </Motion.div>
      <Motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <SignaturePiecesSection />
      </Motion.div>
      <Motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <TestimonialsSection />
      </Motion.div>
      <div>
        <NewsletterSection />
      </div>
      <Motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <FaqSection />
      </Motion.div>
      <Motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <ContactSection />
      </Motion.div>
      <Footer />
    </div>
  );
}

export default Home;
