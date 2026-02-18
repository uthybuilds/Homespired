import { NavLink } from "react-router-dom";
import { portfolioProjects } from "../data/portfolio.js";

function PortfolioSection() {
  return (
    <section
      id="portfolio"
      className="relative bg-porcelain py-24 text-obsidian"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <p className="text-xs uppercase tracking-[0.4em] text-ash">
              Portfolio
            </p>
            <h2 className="max-w-3xl text-3xl font-semibold sm:text-4xl">
              Crafted environments where sculptural forms meet warm, livable
              luxury.
            </h2>
            <p className="max-w-2xl text-base text-ash sm:text-lg">
              Each project is approached like an editorial story: a clear design
              concept, layered materials, and curated moments that feel
              timeless.
            </p>
          </div>
          <div className="grid gap-6 rounded-3xl border border-ash/30 bg-linen px-6 py-8 sm:grid-cols-3">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-ash">
                Design Focus
              </p>
              <p className="text-lg font-semibold text-obsidian">
                Modern luxury with soft, organic silhouettes.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-ash">
                Materials
              </p>
              <p className="text-lg font-semibold text-obsidian">
                Warm neutrals, layered textures, sculptural lighting.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-ash">
                Deliverables
              </p>
              <p className="text-lg font-semibold text-obsidian">
                Concept, procurement, styling, and final reveal.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-10">
          {portfolioProjects.slice(0, 4).map((project) => (
            <article
              key={project.id}
              className="grid gap-6 rounded-3xl border border-ash/30 bg-porcelain p-6 shadow-[0_30px_60px_rgba(0,0,0,0.08)] lg:grid-cols-[1.1fr_0.9fr]"
            >
              <div>
                <div className="h-64 overflow-hidden rounded-3xl sm:h-72 lg:h-80">
                  <img
                    src={project.images[0]}
                    alt={project.title}
                    loading="eager"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {project.images.slice(1, 4).map((image, imageIndex) => (
                    <img
                      key={`${project.id}-${imageIndex}`}
                      src={image}
                      alt={`${project.title} detail ${imageIndex + 1}`}
                      loading="eager"
                      decoding="async"
                      className="h-20 w-full rounded-2xl object-cover"
                    />
                  ))}
                </div>
              </div>
              <div className="flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-ash">
                    {project.location}
                  </p>
                  <h3 className="text-3xl font-semibold text-obsidian">
                    {project.title}
                  </h3>
                  <p className="text-sm text-ash">Completed {project.year}</p>
                  <p className="text-base text-ash">
                    A layered composition of custom millwork, curated lighting,
                    and tactile finishes designed to feel calm yet elevated.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-ash/30 bg-linen px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-ash">
                        Focus
                      </p>
                      <p className="text-sm font-semibold text-obsidian">
                        Spatial flow + statement focal points
                      </p>
                    </div>
                    <div className="rounded-2xl border border-ash/30 bg-linen px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-ash">
                        Styling
                      </p>
                      <p className="text-sm font-semibold text-obsidian">
                        Sculptural decor + soft layered textiles
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <NavLink
                    to={`/portfolio/${project.id}`}
                    className="rounded-full border border-ash px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-obsidian transition"
                  >
                    View Project
                  </NavLink>
                  <NavLink
                    to="/consultations"
                    className="rounded-full bg-obsidian px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-porcelain transition"
                  >
                    Start a Similar Space
                  </NavLink>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-ash/30 bg-obsidian px-6 py-8 text-porcelain">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-porcelain/70">
              Private Commissions
            </p>
            <p className="text-xl font-semibold">
              Ready to commission a space that feels unmistakably yours?
            </p>
          </div>
          <NavLink
            to="/consultations"
            className="rounded-full bg-porcelain px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-obsidian transition"
          >
            Book a Consultation
          </NavLink>
        </div>
      </div>
    </section>
  );
}

export default PortfolioSection;
