import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

const Motion = motion;

function ConsultationsPage() {
  return (
    <div className="min-h-screen bg-porcelain text-obsidian">
      <Navbar />
      <Motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-24 pt-32"
      >
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-ash">
            Consultations
          </p>
          <h1 className="text-4xl font-semibold sm:text-5xl">
            Choose the experience that matches your project stage.
          </h1>
          <p className="max-w-2xl text-base text-ash sm:text-lg">
            Each category has its own page with pricing and a dedicated request
            form.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Motion.section
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="rounded-3xl border border-ash/30 bg-linen p-8 shadow-[0_24px_40px_rgba(0,0,0,0.06)]"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-ash">
              On-site Inspection
            </p>
            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
              Site visits and client enquiries.
            </h2>
            <p className="mt-4 text-sm text-ash">
              Book an in-person walkthrough, scope review, or location-based
              design assessment.
            </p>
            <NavLink
              to="/inspections"
              className="mt-6 inline-flex rounded-full bg-obsidian px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-porcelain transition"
            >
              View Inspections
            </NavLink>
          </Motion.section>

          <Motion.section
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
            className="rounded-3xl border border-ash/30 bg-porcelain p-8 shadow-[0_24px_40px_rgba(0,0,0,0.06)]"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-ash">
              Advisory Sessions
            </p>
            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
              Guided design direction.
            </h2>
            <p className="mt-4 text-sm text-ash">
              Select a tailored advisory package with pricing and upload your
              confirmation.
            </p>
            <NavLink
              to="/advisory"
              className="mt-6 inline-flex rounded-full border border-ash px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-obsidian transition"
            >
              View Advisory
            </NavLink>
          </Motion.section>

          <Motion.section
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="rounded-3xl border border-ash/30 bg-linen p-8 shadow-[0_24px_40px_rgba(0,0,0,0.06)]"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-ash">
              Interior Design Class
            </p>
            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
              Learn interior design with guided training.
            </h2>
            <p className="mt-4 text-sm text-ash">
              Choose the physical or online class and submit your enrollment
              request.
            </p>
            <NavLink
              to="/classes"
              className="mt-6 inline-flex rounded-full bg-obsidian px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-porcelain transition"
            >
              View Classes
            </NavLink>
          </Motion.section>
        </div>
      </Motion.main>
      <Footer />
    </div>
  );
}

export default ConsultationsPage;
