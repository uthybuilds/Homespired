import { NavLink } from "react-router-dom";
import ceoImage from "../Homespired CEO 1.jpeg";

function ClassSection() {
  return (
    <section id="classes" className="bg-linen py-24 text-obsidian">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="overflow-hidden rounded-3xl border border-ash/30 bg-porcelain shadow-[0_30px_60px_rgba(0,0,0,0.08)]">
            <img
              src={ceoImage}
              alt="Homespired founder"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <p className="text-xs uppercase tracking-[0.4em] text-ash">
                Design Class
              </p>
              <h2 className="text-3xl font-semibold sm:text-4xl">
                Learn the process behind calm, luxury interiors.
              </h2>
              <p className="text-base text-ash sm:text-lg">
                I built Homespired through real projects, real clients, and real
                lessons. This class gives you the clear, repeatable method I use
                today, so you can design with confidence and structure.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-ash/30 bg-porcelain px-4 py-3 text-sm text-obsidian">
                Build concepts that sell
              </div>
              <div className="rounded-2xl border border-ash/30 bg-porcelain px-4 py-3 text-sm text-obsidian">
                Turn ideas into clear plans
              </div>
              <div className="rounded-2xl border border-ash/30 bg-porcelain px-4 py-3 text-sm text-obsidian">
                Present work with confidence
              </div>
              <div className="rounded-2xl border border-ash/30 bg-porcelain px-4 py-3 text-sm text-obsidian">
                Build a calm client process
              </div>
            </div>
            <p className="text-sm text-ash">
              Built for designers who want structure, clarity, and real-world
              results.
            </p>
            <div className="flex flex-wrap gap-3">
              <NavLink
                to="/classes"
                className="rounded-none bg-obsidian px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-porcelain transition"
              >
                Enroll in the Class
              </NavLink>
              <NavLink
                to="/classes"
                className="rounded-none border border-ash px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-obsidian transition"
              >
                See the Curriculum
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ClassSection;
