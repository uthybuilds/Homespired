import { useEffect, useMemo, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { portfolioProjects } from "../data/portfolio.js";

function ProjectDetailPage() {
  const { projectId } = useParams();
  const project = useMemo(
    () => portfolioProjects.find((item) => item.id === projectId),
    [projectId],
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!project) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % project.images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [project]);

  if (!project) {
    return (
      <div className="min-h-screen bg-porcelain text-obsidian">
        <Navbar />
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-24 pt-32">
          <h1 className="text-4xl font-semibold sm:text-5xl">
            Project not found.
          </h1>
          <p className="max-w-2xl text-base text-ash sm:text-lg">
            This project may have been archived or relocated.
          </p>
          <NavLink
            to="/portfolio"
            className="inline-flex rounded-full bg-obsidian px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-porcelain transition"
          >
            Back to Portfolio
          </NavLink>
        </main>
        <Footer />
      </div>
    );
  }

  const handlePrev = () => {
    setIndex((current) =>
      current === 0 ? project.images.length - 1 : current - 1,
    );
  };

  const handleNext = () => {
    setIndex((current) => (current + 1) % project.images.length);
  };

  return (
    <div className="min-h-screen bg-porcelain text-obsidian">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-24 pt-32">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-ash">
            {project.location}
          </p>
          <h1 className="text-4xl font-semibold sm:text-5xl">
            {project.title}
          </h1>
          <p className="max-w-2xl text-base text-ash sm:text-lg">
            {project.summary}
          </p>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-ash/30 bg-linen">
          <img
            src={project.images[index]}
            alt={`${project.title} image ${index + 1}`}
            className="h-130 w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-between px-6">
            <button
              onClick={handlePrev}
              className="rounded-full border border-white/70 bg-black/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition"
            >
              Prev
            </button>
            <button
              onClick={handleNext}
              className="rounded-full border border-white/70 bg-black/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition"
            >
              Next
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-ash/30 bg-linen p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-ash">Focus</p>
            <p className="mt-2 text-sm text-ash">{project.focus}</p>
          </div>
          <div className="rounded-3xl border border-ash/30 bg-linen p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-ash">
              Materials
            </p>
            <p className="mt-2 text-sm text-ash">{project.materials}</p>
          </div>
          <div className="rounded-3xl border border-ash/30 bg-linen p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-ash">
              Deliverables
            </p>
            <p className="mt-2 text-sm text-ash">{project.deliverables}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-ash/30 bg-porcelain p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-ash">Story</p>
          <p className="mt-3 text-sm text-ash">{project.story}</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ProjectDetailPage;
