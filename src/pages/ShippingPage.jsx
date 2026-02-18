import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

function ShippingPage() {
  return (
    <div className="min-h-screen bg-linen text-obsidian">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-24 pt-32">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-ash">
            Shipping
          </p>
          <h1 className="text-4xl font-semibold sm:text-5xl">
            Shipping & Delivery
          </h1>
          <p className="max-w-2xl text-base text-ash sm:text-lg">
            We deliver signature pieces with white‑glove handling and curated
            placement.
          </p>
        </div>

        <div className="grid gap-6">
          <section className="rounded-3xl border border-ash/30 bg-porcelain p-6">
            <h2 className="text-xl font-semibold text-obsidian">
              Delivery Zones
            </h2>
            <p className="mt-3 text-sm text-ash">
              Shipping is grouped into Lagos Island, Lagos Mainland, and outside
              Lagos zones. Each zone carries its own delivery fee and scheduling
              window.
            </p>
            <p className="mt-3 text-sm text-ash">
              Nationwide delivery is available across Nigeria, while
              international delivery is coordinated for private commissions.
            </p>
          </section>
          <section className="rounded-3xl border border-ash/30 bg-porcelain p-6">
            <h2 className="text-xl font-semibold text-obsidian">
              Location‑Based Rates
            </h2>
            <p className="mt-3 text-sm text-ash">
              At checkout, we apply delivery pricing based on the city and state
              you provide. Lagos Island and Mainland are recognized
              automatically, while all other states default to outside Lagos.
            </p>
          </section>
          <section className="rounded-3xl border border-ash/30 bg-porcelain p-6">
            <h2 className="text-xl font-semibold text-obsidian">
              Estimated Timelines
            </h2>
            <p className="mt-3 text-sm text-ash">
              Ready‑to‑ship items typically arrive within 5‑10 business days.
              Custom pieces follow the timeline confirmed during procurement.
            </p>
          </section>
          <section className="rounded-3xl border border-ash/30 bg-porcelain p-6">
            <h2 className="text-xl font-semibold text-obsidian">
              White‑Glove Service
            </h2>
            <p className="mt-3 text-sm text-ash">
              Our team handles delivery, placement, and packaging removal for a
              seamless experience.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ShippingPage;
