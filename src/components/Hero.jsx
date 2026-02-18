import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import ceoPrimary from "../Homespired CEO 1.jpeg";

const Motion = motion;

function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-20 sm:pt-24">
      <div className="absolute inset-0">
        <img
          src={ceoPrimary}
          alt="Homespired CEO"
          className="h-full w-full object-cover object-[center_20%]"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/30 to-black/50" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-start gap-4 px-6 pb-12 text-left text-white sm:gap-6 sm:pb-20">
        <Motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-[10px] uppercase tracking-[0.4em] text-white/70 sm:text-xs sm:tracking-[0.45em]"
        >
          Founder Spotlight
        </Motion.p>
        <Motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.05 }}
          className="max-w-4xl text-4xl font-semibold leading-tight sm:text-6xl lg:text-7xl drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
        >
          Fatimah Adetona<span className="text-white"> Homespired</span>
        </Motion.h1>
        <Motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="max-w-2xl text-base text-white/80 sm:text-xl"
        >
          Futuristic interiors crafted to feel timeless, personal, and
          uncompromisingly luxurious.
        </Motion.p>
        <Motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.12 }}
          className="max-w-xl text-xs text-white/70 sm:text-base"
        >
          Available for Lagos-based projects and remote design consultations.
        </Motion.p>
        <Motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/70 sm:text-[11px] sm:tracking-[0.32em]"
        >
          <span>Lagos-based studio</span>
          <span className="h-1 w-1 rounded-full bg-white/70" />
          <span>Full-service interiors</span>
          <span className="h-1 w-1 rounded-full bg-white/70" />
          <span>Private commissions</span>
        </Motion.div>
        <Motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          className="flex flex-wrap gap-3 sm:gap-4"
        >
          <NavLink
            to="/consultations"
            className="rounded-full bg-black/85 px-6 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white shadow-[0_16px_32px_rgba(0,0,0,0.45)] ring-1 ring-white/70 backdrop-blur transition sm:px-7 sm:py-3 sm:text-[12px] sm:tracking-[0.26em]"
          >
            Book Appointment
          </NavLink>
          <NavLink
            to="/portfolio"
            className="rounded-full border border-white/70 bg-white/10 px-6 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur transition sm:px-7 sm:py-3 sm:text-xs sm:tracking-[0.24em]"
          >
            View Portfolio
          </NavLink>
        </Motion.div>
        <Motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.25 }}
          className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4"
        >
          <div className="rounded-2xl border border-white/15 bg-black/40 p-3 backdrop-blur sm:p-4">
            <p className="text-[10px] uppercase tracking-[0.26em] text-white/60 sm:text-xs sm:tracking-[0.3em]">
              Concept Direction
            </p>
            <p className="mt-2 text-xs text-white/80 sm:text-sm">
              Clear spatial strategy, materials, and layout guidance.
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-black/40 p-3 backdrop-blur sm:p-4">
            <p className="text-[10px] uppercase tracking-[0.26em] text-white/60 sm:text-xs sm:tracking-[0.3em]">
              Spatial Styling
            </p>
            <p className="mt-2 text-xs text-white/80 sm:text-sm">
              Layered textures, lighting, and bespoke finishes.
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-black/40 p-3 backdrop-blur sm:p-4">
            <p className="text-[10px] uppercase tracking-[0.26em] text-white/60 sm:text-xs sm:tracking-[0.3em]">
              Procurement & Install
            </p>
            <p className="mt-2 text-xs text-white/80 sm:text-sm">
              Curated sourcing and white-glove execution.
            </p>
          </div>
        </Motion.div>
      </div>
    </section>
  );
}

export default Hero;
