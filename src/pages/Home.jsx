import { motion } from "framer-motion";
import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";
import PortfolioSection from "../components/PortfolioSection.jsx";
import SignaturePiecesSection from "../components/SignaturePiecesSection.jsx";
import ClassSection from "../components/ClassSection.jsx";
import AboutSection from "../components/AboutSection.jsx";
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
        <PortfolioSection />
      </Motion.div>
      <Motion.div {...sectionMotionProps}>
        <ClassSection />
      </Motion.div>
      <Motion.div {...sectionMotionProps}>
        <SignaturePiecesSection />
      </Motion.div>
      <Motion.div {...sectionMotionProps}>
        <AboutSection />
      </Motion.div>
      <div>
        <NewsletterSection />
      </div>
      <Footer />
    </div>
  );
}

export default Home;
