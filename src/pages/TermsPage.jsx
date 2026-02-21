import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

function TermsPage() {
  return (
    <div className="min-h-screen bg-porcelain text-obsidian">
      <Navbar />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 pb-24 pt-32">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-ash/70">
            Terms
          </p>
          <h1 className="text-3xl font-semibold tracking-[0.02em] sm:text-4xl">
            Terms & Conditions of Service
          </h1>
          <p className="max-w-2xl text-[15px] leading-7 text-ash sm:text-base">
            These terms describe how we work with clients on services, products,
            and digital experiences.
          </p>
          <p className="max-w-2xl text-[15px] leading-7 text-ash sm:text-base">
            By accessing or using Homespired, you agree to the terms below. If
            you do not agree, please do not use the site or place orders.
          </p>
        </div>

        <div className="space-y-8">
          <section className="space-y-3 border-b border-ash/20 pb-6">
            <h2 className="text-lg font-semibold tracking-[0.02em] text-obsidian">
              1. Use of Site
            </h2>
            <p className="text-[15px] leading-7 text-ash sm:text-base">
              You agree to use this site for lawful purposes only and in a way
              that does not infringe on the rights of others or restrict their
              access. Any misuse may result in termination of access.
            </p>
            <p className="text-[15px] leading-7 text-ash sm:text-base">
              Content may not be copied, republished, or used for commercial
              purposes without written permission.
            </p>
          </section>
          <section className="space-y-3 border-b border-ash/20 pb-6">
            <h2 className="text-lg font-semibold tracking-[0.02em] text-obsidian">
              2. Product Information
            </h2>
            <p className="text-[15px] leading-7 text-ash sm:text-base">
              We strive to display product colors, dimensions, and materials as
              accurately as possible. Variations may occur due to lighting,
              screens, and production batches.
            </p>
            <p className="text-[15px] leading-7 text-ash sm:text-base">
              Measurements listed are approximate unless noted otherwise.
            </p>
          </section>
          <section className="space-y-3 border-b border-ash/20 pb-6">
            <h2 className="text-lg font-semibold tracking-[0.02em] text-obsidian">
              3. Pricing and Payment
            </h2>
            <p className="text-[15px] leading-7 text-ash sm:text-base">
              Prices are subject to change without notice. Promotions may end at
              any time, and pricing errors may be corrected before fulfillment.
            </p>
            <p className="text-[15px] leading-7 text-ash sm:text-base">
              By placing an order, you confirm that payment information is
              accurate and that you are authorized to use the selected payment
              method.
            </p>
          </section>
          <section className="space-y-3 border-b border-ash/20 pb-6">
            <h2 className="text-lg font-semibold tracking-[0.02em] text-obsidian">
              4. Order Acceptance
            </h2>
            <p className="text-[15px] leading-7 text-ash sm:text-base">
              We reserve the right to accept or cancel any order for reasons
              including availability, pricing errors, or suspected fraud.
            </p>
            <p className="text-[15px] leading-7 text-ash sm:text-base">
              If an order is canceled after payment, a full refund will be
              issued to the original payment method.
            </p>
          </section>
          <section className="space-y-3 border-b border-ash/20 pb-6">
            <h2 className="text-lg font-semibold tracking-[0.02em] text-obsidian">
              5. Studio Services
            </h2>
            <p className="text-[15px] leading-7 text-ash sm:text-base">
              Project scope, deliverables, and timelines are set in a written
              proposal. Work begins after approval and the initial deposit.
            </p>
            <p className="text-[15px] leading-7 text-ash sm:text-base">
              Clients review concepts and schedules on time to avoid delays.
            </p>
          </section>
          <section className="space-y-3 border-b border-ash/20 pb-6">
            <h2 className="text-lg font-semibold tracking-[0.02em] text-obsidian">
              6. Consultations & Fees
            </h2>
            <p className="text-[15px] leading-7 text-ash sm:text-base">
              Consultation fees are due at booking and cover intake and
              recommendations. Fees may be applied to a full engagement at our
              discretion.
            </p>
            <p className="text-[15px] leading-7 text-ash sm:text-base">
              No work product is released until balances are paid.
            </p>
          </section>
          <section className="space-y-3 border-b border-ash/20 pb-6">
            <h2 className="text-lg font-semibold tracking-[0.02em] text-obsidian">
              7. Payments & Billing
            </h2>
            <p className="text-[15px] leading-7 text-ash sm:text-base">
              Payments follow the milestones in your proposal or invoice. Late
              payments may pause work and adjust timelines.
            </p>
            <p className="text-[15px] leading-7 text-ash sm:text-base">
              Fees exclude taxes, shipping, and third‑party vendor charges
              unless stated otherwise.
            </p>
          </section>
          <section className="space-y-3 border-b border-ash/20 pb-6">
            <h2 className="text-lg font-semibold tracking-[0.02em] text-obsidian">
              8. Procurement & Deliveries
            </h2>
            <p className="text-[15px] leading-7 text-ash sm:text-base">
              Items are ordered after final approval and deposit. Lead times are
              vendor estimates and may shift.
            </p>
            <p className="text-[15px] leading-7 text-ash sm:text-base">
              We coordinate delivery, but are not liable for vendor delays,
              freight claims, or carrier disruptions.
            </p>
          </section>
          <section className="space-y-3 border-b border-ash/20 pb-6">
            <h2 className="text-lg font-semibold tracking-[0.02em] text-obsidian">
              9. Changes & Revisions
            </h2>
            <p className="text-[15px] leading-7 text-ash sm:text-base">
              Revisions are included as outlined in scope. Extra revisions or
              material changes may add fees and time.
            </p>
            <p className="text-[15px] leading-7 text-ash sm:text-base">
              Changes after procurement or fabrication may be non‑refundable.
            </p>
          </section>
          <section className="space-y-3 border-b border-ash/20 pb-6">
            <h2 className="text-lg font-semibold tracking-[0.02em] text-obsidian">
              10. Client Responsibilities
            </h2>
            <p className="text-[15px] leading-7 text-ash sm:text-base">
              Clients provide accurate measurements, site access, and approvals.
              We are not responsible for delays caused by restricted access or
              missing information.
            </p>
            <p className="text-[15px] leading-7 text-ash sm:text-base">
              Clients secure permits or landlord approvals unless agreed
              otherwise in writing.
            </p>
          </section>
          <section className="space-y-3 border-b border-ash/20 pb-6">
            <h2 className="text-lg font-semibold tracking-[0.02em] text-obsidian">
              11. Cancellations & Refunds
            </h2>
            <p className="text-[15px] leading-7 text-ash sm:text-base">
              Design fees and deposits are non‑refundable once work begins.
              Product refunds follow vendor return policies and Homespired
              terms.
            </p>
            <p className="text-[15px] leading-7 text-ash sm:text-base">
              Cancellation requests must be in writing and are reviewed within
              five business days.
            </p>
          </section>
          <section className="space-y-3 border-b border-ash/20 pb-6">
            <h2 className="text-lg font-semibold tracking-[0.02em] text-obsidian">
              12. Intellectual Property
            </h2>
            <p className="text-[15px] leading-7 text-ash sm:text-base">
              All designs, drawings, visuals, and concepts remain our property.
              Reproduction or resale requires written permission.
            </p>
            <p className="text-[15px] leading-7 text-ash sm:text-base">
              We may photograph completed spaces for portfolio and marketing
              unless agreed otherwise.
            </p>
          </section>
          <section className="space-y-3 border-b border-ash/20 pb-6">
            <h2 className="text-lg font-semibold tracking-[0.02em] text-obsidian">
              13. Limitation of Liability
            </h2>
            <p className="text-[15px] leading-7 text-ash sm:text-base">
              We are not liable for indirect, incidental, or consequential
              damages arising from use of the site, products, or services.
            </p>
            <p className="text-[15px] leading-7 text-ash sm:text-base">
              Liability is limited to the amount paid for the applicable product
              or service.
            </p>
          </section>
          <section className="space-y-3 pb-2">
            <h2 className="text-lg font-semibold tracking-[0.02em] text-obsidian">
              14. Governing Law
            </h2>
            <p className="text-[15px] leading-7 text-ash sm:text-base">
              These terms are governed by the laws of Nigeria. By engaging our
              services, clients accept these terms and resolve disputes in
              Lagos, Nigeria.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default TermsPage;
