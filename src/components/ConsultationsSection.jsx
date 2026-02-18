import { NavLink } from "react-router-dom";

function ConsultationsSection() {
  return (
    <section id="consultations" className="bg-porcelain py-24 text-obsidian">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6">
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.4em] text-ash">
            Consultations
          </p>
          <h2 className="max-w-3xl text-3xl font-semibold sm:text-4xl">
            Personalised design guidance with a luxury finish.
          </h2>
          <p className="max-w-2xl text-base text-ash sm:text-lg">
            We align on your vision, create a refined concept, and guide every
            detail so the final space feels effortless.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-ash/30 bg-linen p-6 shadow-[0_24px_40px_rgba(0,0,0,0.06)]">
            <p className="text-xs uppercase tracking-[0.3em] text-ash">
              Advisory Sessions
            </p>
            <h3 className="mt-3 text-xl font-semibold">
              Strategic guidance for curated interiors.
            </h3>
            <p className="mt-3 text-sm text-ash">
              Explore three advisory tiers with clear pricing and tailored
              deliverables.
            </p>
            <NavLink
              to="/advisory"
              className="mt-6 inline-flex rounded-full bg-obsidian px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-porcelain transition"
            >
              View Advisory
            </NavLink>
          </div>
          <div className="rounded-3xl border border-ash/30 bg-porcelain p-6 shadow-[0_24px_40px_rgba(0,0,0,0.06)]">
            <p className="text-xs uppercase tracking-[0.3em] text-ash">
              On-site Inspections
            </p>
            <h3 className="mt-3 text-xl font-semibold">
              Site visits and scope assessments.
            </h3>
            <p className="mt-3 text-sm text-ash">
              Choose from three inspection categories based on your location.
            </p>
            <NavLink
              to="/inspections"
              className="mt-6 inline-flex rounded-full border border-ash px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-obsidian transition"
            >
              View Inspections
            </NavLink>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ConsultationsSection;
