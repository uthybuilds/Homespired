import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

function RefundsPage() {
  return (
    <div className="min-h-screen bg-porcelain text-obsidian">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-24 pt-32">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-ash">Refunds</p>
          <h1 className="text-4xl font-semibold sm:text-5xl">
            Refund & Returns Policy
          </h1>
          <p className="max-w-2xl text-base text-ash sm:text-lg">
            We aim for complete satisfaction and handle returns with care and
            clarity.
          </p>
        </div>

        <div className="grid gap-6">
          <section className="rounded-3xl border border-ash/30 bg-linen p-6">
            <h2 className="text-xl font-semibold text-obsidian">
              Custom Commissions
            </h2>
            <p className="mt-3 text-sm text-ash">
              Custom and made‑to‑order pieces are final sale. We confirm details
              before production to avoid errors.
            </p>
          </section>
          <section className="rounded-3xl border border-ash/30 bg-linen p-6">
            <h2 className="text-xl font-semibold text-obsidian">
              Ready‑to‑Ship Items
            </h2>
            <p className="mt-3 text-sm text-ash">
              Returns are accepted within 7 days of delivery, provided items are
              unused and in original packaging.
            </p>
          </section>
          <section className="rounded-3xl border border-ash/30 bg-linen p-6">
            <h2 className="text-xl font-semibold text-obsidian">
              Refund Processing
            </h2>
            <p className="mt-3 text-sm text-ash">
              Approved refunds are processed within 7‑10 business days after
              inspection.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default RefundsPage;
