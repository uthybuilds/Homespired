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
              Modern interiors with warm, sculpted lines.
            </h2>
            <p className="max-w-2xl text-base text-ash sm:text-lg">
              Clear concepts, layered materials, and spaces that feel timeless.
            </p>
          </div>
          <div className="grid gap-6 rounded-3xl border border-ash/30 bg-linen px-6 py-8 sm:grid-cols-3">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-ash">
                Design Focus
              </p>
              <p className="text-lg font-semibold text-obsidian">
                Modern luxury with soft shapes.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-ash">
                Materials
              </p>
              <p className="text-lg font-semibold text-obsidian">
                Warm neutrals, texture, sculptural lighting.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-ash">
                Deliverables
              </p>
              <p className="text-lg font-semibold text-obsidian">
                Concept, sourcing, styling, reveal.
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
                    Custom millwork, curated lighting, and tactile finishes for
                    a calm, elevated home.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-ash/30 bg-linen px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-ash">
                        Focus
                      </p>
                      <p className="text-sm font-semibold text-obsidian">
                        Flow + focal points
                      </p>
                    </div>
                    <div className="rounded-2xl border border-ash/30 bg-linen px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-ash">
                        Styling
                      </p>
                      <p className="text-sm font-semibold text-obsidian">
                        Sculptural decor + layered textiles
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <NavLink
                    to={`/portfolio/${project.id}`}
                    className="rounded-none border border-ash px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-obsidian transition"
                  >
                    View Project
                  </NavLink>
                  <NavLink
                    to="/consultations"
                    className="rounded-none bg-obsidian px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-porcelain transition"
                  >
                    Start a Similar Space
                  </NavLink>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PortfolioSection;
