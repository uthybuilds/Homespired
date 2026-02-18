import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-linen text-obsidian">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-24 pt-32">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-ash">Privacy</p>
          <h1 className="text-4xl font-semibold sm:text-5xl">Privacy Policy</h1>
          <p className="max-w-2xl text-base text-ash sm:text-lg">
            We respect your privacy and safeguard your data across all Homespired
            experiences.
          </p>
        </div>

        <div className="grid gap-6">
          <section className="rounded-3xl border border-ash/30 bg-porcelain p-6">
            <h2 className="text-xl font-semibold text-obsidian">
              Information We Collect
            </h2>
            <p className="mt-3 text-sm text-ash">
              We collect contact details, project preferences, and transaction
              information needed to deliver services and products.
            </p>
          </section>
          <section className="rounded-3xl border border-ash/30 bg-porcelain p-6">
            <h2 className="text-xl font-semibold text-obsidian">
              How We Use Data
            </h2>
            <p className="mt-3 text-sm text-ash">
              Data is used to manage consultations, process orders, and deliver
              personalized design guidance.
            </p>
          </section>
          <section className="rounded-3xl border border-ash/30 bg-porcelain p-6">
            <h2 className="text-xl font-semibold text-obsidian">Your Rights</h2>
            <p className="mt-3 text-sm text-ash">
              You can request access, updates, or removal of your personal data
              by contacting our support team.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default PrivacyPage;
