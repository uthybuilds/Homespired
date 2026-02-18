import { NavLink } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

function AccountPage() {
  return (
    <div className="min-h-screen bg-porcelain text-obsidian">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-24 pt-32">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-ash">Account</p>
          <h1 className="text-4xl font-semibold sm:text-5xl">
            Manage your Homespired profile and preferences.
          </h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-3xl border border-ash/30 bg-linen p-6">
            <h2 className="text-xl font-semibold text-obsidian">
              Profile Details
            </h2>
            <p className="mt-2 text-sm text-ash">
              Update your name, email, and account credentials.
            </p>
            <NavLink
              to="/contact"
              className="mt-6 inline-flex rounded-full bg-obsidian px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-porcelain transition"
            >
              Contact Support
            </NavLink>
          </section>
          <section className="rounded-3xl border border-ash/30 bg-linen p-6">
            <h2 className="text-xl font-semibold text-obsidian">
              Delivery Addresses
            </h2>
            <p className="mt-2 text-sm text-ash">
              Save delivery details for signature pieces and styling kits.
            </p>
            <NavLink
              to="/contact"
              className="mt-6 inline-flex rounded-full border border-ash px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-obsidian transition"
            >
              Update Address
            </NavLink>
          </section>
          <section className="rounded-3xl border border-ash/30 bg-linen p-6">
            <h2 className="text-xl font-semibold text-obsidian">
              Concierge Access
            </h2>
            <p className="mt-2 text-sm text-ash">
              Request private styling guidance and priority appointment slots.
            </p>
            <NavLink
              to="/consultations"
              className="mt-6 inline-flex rounded-full border border-ash px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-obsidian transition"
            >
              Book Consultation
            </NavLink>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default AccountPage;
