import { NavLink } from "react-router-dom";

function ClassSection() {
  return (
    <section id="classes" className="bg-linen py-24 text-obsidian">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6">
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.4em] text-ash">Classes</p>
          <h2 className="max-w-3xl text-3xl font-semibold sm:text-4xl">
            Learn interior design with hands-on or online classes.
          </h2>
          <p className="max-w-2xl text-base text-ash sm:text-lg">
            Choose the class format that fits your schedule and submit your
            enrollment details.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-ash/30 bg-porcelain p-6 shadow-[0_24px_40px_rgba(0,0,0,0.06)]">
            <p className="text-xs uppercase tracking-[0.3em] text-ash">
              Physical Class
            </p>
            <h3 className="mt-3 text-xl font-semibold">
              In-person training with studio guidance.
            </h3>
            <p className="mt-3 text-sm text-ash">
              Join the studio for immersive learning and real project reviews.
            </p>
            <NavLink
              to="/classes/class-physical"
              className="mt-6 inline-flex rounded-full bg-obsidian px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-porcelain transition"
            >
              View Classes
            </NavLink>
          </div>
          <div className="rounded-3xl border border-ash/30 bg-porcelain p-6 shadow-[0_24px_40px_rgba(0,0,0,0.06)]">
            <p className="text-xs uppercase tracking-[0.3em] text-ash">
              Online Class
            </p>
            <h3 className="mt-3 text-xl font-semibold">
              Live sessions with tailored feedback.
            </h3>
            <p className="mt-3 text-sm text-ash">
              Learn remotely with structured modules and tutor support.
            </p>
            <NavLink
              to="/classes/class-online"
              className="mt-6 inline-flex rounded-full border border-ash px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-obsidian transition"
            >
              View Classes
            </NavLink>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ClassSection;
