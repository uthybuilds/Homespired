import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-porcelain text-obsidian">
      <Navbar />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 pb-24 pt-32">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-ash/70">
            Privacy
          </p>
          <h1 className="text-3xl font-semibold tracking-[0.02em] sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="max-w-2xl text-[15px] leading-7 text-ash sm:text-base">
            We respect your privacy and protect your data. This policy explains
            what we collect, how we use it, and the choices available to you.
          </p>
        </div>

        <div className="space-y-8">
          <section className="space-y-3 border-b border-ash/20 pb-6">
            <h2 className="text-lg font-semibold tracking-[0.02em] text-obsidian">
              1. Information We Collect
            </h2>
            <p className="text-[15px] leading-7 text-ash sm:text-base">
              We may collect your name, email address, phone number, shipping
              address, and payment details to process orders or consultations.
            </p>
            <p className="text-[15px] leading-7 text-ash sm:text-base">
              We also collect order history, preferences, and communication
              details to provide support and improve our services.
            </p>
          </section>
          <section className="space-y-3 border-b border-ash/20 pb-6">
            <h2 className="text-lg font-semibold tracking-[0.02em] text-obsidian">
              2. Usage of Information
            </h2>
            <p className="text-[15px] leading-7 text-ash sm:text-base">
              Your information helps us fulfill orders, provide customer
              support, and communicate service updates or promotions.
            </p>
            <p className="text-[15px] leading-7 text-ash sm:text-base">
              We do not sell or trade your personal data. We share data only
              with trusted partners who help fulfill orders or where required by
              law.
            </p>
          </section>
          <section className="space-y-3 border-b border-ash/20 pb-6">
            <h2 className="text-lg font-semibold tracking-[0.02em] text-obsidian">
              3. Cookies
            </h2>
            <p className="text-[15px] leading-7 text-ash sm:text-base">
              We use cookies to enhance your experience, analyze traffic, and
              remember preferences. You can manage cookie settings through your
              browser.
            </p>
          </section>
          <section className="space-y-3 border-b border-ash/20 pb-6">
            <h2 className="text-lg font-semibold tracking-[0.02em] text-obsidian">
              4. Security
            </h2>
            <p className="text-[15px] leading-7 text-ash sm:text-base">
              We use industry‑standard security measures to protect your data.
              However, no method of transmission over the internet is 100%
              secure.
            </p>
          </section>
          <section className="space-y-3 border-b border-ash/20 pb-6">
            <h2 className="text-lg font-semibold tracking-[0.02em] text-obsidian">
              5. Third‑Party Links
            </h2>
            <p className="text-[15px] leading-7 text-ash sm:text-base">
              Our website may contain links to third‑party sites. We are not
              responsible for the privacy practices of those sites and recommend
              reviewing their policies.
            </p>
          </section>
          <section className="space-y-3 pb-2">
            <h2 className="text-lg font-semibold tracking-[0.02em] text-obsidian">
              6. Your Rights
            </h2>
            <p className="text-[15px] leading-7 text-ash sm:text-base">
              You may request access to, correction of, or deletion of your
              personal information at any time by contacting us.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default PrivacyPage;
