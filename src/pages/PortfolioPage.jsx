import { useState } from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { portfolioProjects } from "../data/portfolio.js";

const Motion = motion;

function PortfolioImage({ src, alt }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (hasError) return null;

  return (
    <div
      className={`h-40 overflow-hidden rounded-2xl border border-ash/20 bg-linen ${
        isLoaded ? "" : "animate-pulse"
      }`}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`h-40 w-full object-cover transition-opacity duration-500 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

function PortfolioPage() {
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
            Portfolio
          </p>
          <h1 className="text-4xl font-semibold sm:text-5xl">
            A curated archive of Homespired spaces.
          </h1>
          <p className="max-w-2xl text-base text-ash sm:text-lg">
            Explore each project in full detail, from concept to final styling.
          </p>
        </div>

        <div className="space-y-16">
          {portfolioProjects.map((project, index) => (
            <Motion.section
              key={project.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                ease: "easeOut",
                delay: index * 0.05,
              }}
              className="space-y-6"
            >
              <div className="flex flex-col gap-2">
                <p className="text-xs uppercase tracking-[0.3em] text-ash">
                  {project.location}
                </p>
                <h2 className="text-3xl font-semibold">{project.title}</h2>
                <p className="text-sm text-ash">Completed {project.year}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {project.images.filter(Boolean).map((image, index) => (
                  <PortfolioImage
                    key={`${project.id}-${index}`}
                    src={image}
                    alt={`${project.title} view ${index + 1}`}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <NavLink
                  to={`/portfolio/${project.id}`}
                  className="rounded-full bg-obsidian px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-porcelain transition"
                >
                  View Project
                </NavLink>
                <NavLink
                  to="/consultations"
                  className="rounded-full border border-ash px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-obsidian transition"
                >
                  Start a Similar Space
                </NavLink>
              </div>
            </Motion.section>
          ))}
        </div>
      </Motion.main>
      <Footer />
    </div>
  );
}

export default PortfolioPage;
