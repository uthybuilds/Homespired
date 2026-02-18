import Navbar from "../components/Navbar.jsx";
import ContactSection from "../components/ContactSection.jsx";
import Footer from "../components/Footer.jsx";

function ContactPage() {
  return (
    <div className="min-h-screen bg-porcelain text-obsidian">
      <Navbar />
      <main className="pt-20">
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}

export default ContactPage;
