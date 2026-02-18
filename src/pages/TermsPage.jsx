import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

function TermsPage() {
  return (
    <div className="min-h-screen bg-porcelain text-obsidian">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-24 pt-32">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-ash">Terms</p>
          <h1 className="text-4xl font-semibold sm:text-5xl">
            Terms & Conditions
          </h1>
          <p className="max-w-2xl text-base text-ash sm:text-lg">
            These terms outline the relationship between Homespired Studio and
            our clients for services, products, and digital experiences.
          </p>
        </div>

        <div className="grid gap-6">
          <section className="rounded-3xl border border-ash/30 bg-linen p-6">
            <h2 className="text-xl font-semibold text-obsidian">
              Studio Services
            </h2>
            <p className="mt-3 text-sm text-ash">
              Project scope, deliverables, and timelines are defined in a
              written proposal. Work begins once the proposal is approved and
              the initial deposit is received.
            </p>
            <p className="mt-3 text-sm text-ash">
              Clients are expected to review concepts, drawings, and schedules
              within the agreed timeline to avoid delivery delays.
            </p>
          </section>
          <section className="rounded-3xl border border-ash/30 bg-linen p-6">
            <h2 className="text-xl font-semibold text-obsidian">
              Consultations & Fees
            </h2>
            <p className="mt-3 text-sm text-ash">
              Consultation fees are due at booking and cover project intake and
              strategic recommendations. Fees may be credited toward a full
              design engagement at Homespired Studio’s discretion.
            </p>
            <p className="mt-3 text-sm text-ash">
              No work product is released until all consultation balances are
              settled.
            </p>
          </section>
          <section className="rounded-3xl border border-ash/30 bg-linen p-6">
            <h2 className="text-xl font-semibold text-obsidian">
              Payments & Billing
            </h2>
            <p className="mt-3 text-sm text-ash">
              Payments are due according to the milestones outlined in your
              proposal or invoice. Late payments may pause work and adjust
              delivery timelines.
            </p>
            <p className="mt-3 text-sm text-ash">
              All fees are exclusive of applicable taxes, shipping, and
              third‑party vendor charges unless otherwise specified.
            </p>
          </section>
          <section className="rounded-3xl border border-ash/30 bg-linen p-6">
            <h2 className="text-xl font-semibold text-obsidian">
              Procurement & Deliveries
            </h2>
            <p className="mt-3 text-sm text-ash">
              Procurement items are ordered after final approval and payment of
              deposits. Lead times are estimates provided by vendors and may
              shift due to availability or shipping constraints.
            </p>
            <p className="mt-3 text-sm text-ash">
              Homespired Studio coordinates delivery, but is not liable for
              manufacturer delays, freight damage claims, or carrier
              disruptions.
            </p>
          </section>
          <section className="rounded-3xl border border-ash/30 bg-linen p-6">
            <h2 className="text-xl font-semibold text-obsidian">
              Changes & Revisions
            </h2>
            <p className="mt-3 text-sm text-ash">
              Design revisions are included as outlined in your scope.
              Additional revisions or material changes may incur extra fees and
              extend timelines.
            </p>
            <p className="mt-3 text-sm text-ash">
              Client‑requested changes after procurement or fabrication begins
              may not be refundable.
            </p>
          </section>
          <section className="rounded-3xl border border-ash/30 bg-linen p-6">
            <h2 className="text-xl font-semibold text-obsidian">
              Client Responsibilities
            </h2>
            <p className="mt-3 text-sm text-ash">
              Clients agree to provide accurate measurements, site access, and
              required approvals. Homespired Studio is not responsible for
              delays caused by restricted access or incomplete information.
            </p>
            <p className="mt-3 text-sm text-ash">
              The client is responsible for securing any necessary permits or
              landlord approvals unless otherwise agreed in writing.
            </p>
          </section>
          <section className="rounded-3xl border border-ash/30 bg-linen p-6">
            <h2 className="text-xl font-semibold text-obsidian">
              Cancellations & Refunds
            </h2>
            <p className="mt-3 text-sm text-ash">
              Design fees and deposits are non‑refundable once work begins.
              Refunds for product purchases are subject to the vendor’s return
              policy and the Homespired refund terms.
            </p>
            <p className="mt-3 text-sm text-ash">
              Cancellation requests must be submitted in writing and are
              reviewed within five business days.
            </p>
          </section>
          <section className="rounded-3xl border border-ash/30 bg-linen p-6">
            <h2 className="text-xl font-semibold text-obsidian">
              Intellectual Property
            </h2>
            <p className="mt-3 text-sm text-ash">
              All designs, drawings, visuals, and concepts remain the property
              of Homespired Studio. Reproduction or resale requires written
              permission.
            </p>
            <p className="mt-3 text-sm text-ash">
              Homespired Studio retains the right to photograph completed spaces
              for portfolio and marketing purposes unless otherwise agreed.
            </p>
          </section>
          <section className="rounded-3xl border border-ash/30 bg-linen p-6">
            <h2 className="text-xl font-semibold text-obsidian">
              Limitation of Liability
            </h2>
            <p className="mt-3 text-sm text-ash">
              Homespired Studio is not liable for incidental damages, contractor
              performance, or vendor defects beyond the value of the services
              provided.
            </p>
            <p className="mt-3 text-sm text-ash">
              By engaging our services, clients accept these terms and agree to
              resolve disputes in Lagos, Nigeria.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default TermsPage;
