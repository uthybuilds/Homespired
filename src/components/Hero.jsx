import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { portfolioProjects } from "../data/portfolio.js";

function Hero() {
  const heroImages = useMemo(
    () =>
      portfolioProjects
        .flatMap((project) => project.images)
        .filter(Boolean)
        .slice(0, 6),
    [],
  );
  const [activeIndex, setActiveIndex] = useState(null);
  const [loadedIndices, setLoadedIndices] = useState([]);

  useEffect(() => {
    if (heroImages.length === 0) return undefined;
    let isActive = true;
    heroImages.forEach((src, index) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        if (!isActive) return;
        setLoadedIndices((prev) =>
          prev.includes(index) ? prev : [...prev, index],
        );
        setActiveIndex((prev) => (prev === null ? index : prev));
      };
    });
    return () => {
      isActive = false;
    };
  }, [heroImages]);

  useEffect(() => {
    if (loadedIndices.length < 2 || activeIndex === null) return undefined;
    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        if (prev === null) return loadedIndices[0];
        const currentPos = loadedIndices.indexOf(prev);
        const nextPos =
          currentPos === -1 ? 0 : (currentPos + 1) % loadedIndices.length;
        return loadedIndices[nextPos];
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [activeIndex, loadedIndices]);

  return (
    <section className="relative flex min-h-[60vh] items-center overflow-hidden pt-20 sm:min-h-[70vh] sm:pt-24 lg:min-h-screen">
      <div className="absolute inset-0">
        {heroImages.map((src, index) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              activeIndex === index ? "opacity-100" : "opacity-0"
            }`}
          >
            {loadedIndices.includes(index) && src ? (
              <img
                src={src}
                alt=""
                loading={index === 0 ? "eager" : "lazy"}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
        ))}
        <div className="absolute inset-0 bg-black/35" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-6 pb-12 text-center text-white sm:pb-20">
        <h1 className="max-w-xl text-3xl font-semibold uppercase tracking-[0.3em] sm:text-5xl lg:text-6xl">
          Curated Interiors
        </h1>
        <div>
          <NavLink
            to="/consultations"
            className="border border-black bg-white px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-black transition"
          >
            Book Consultation
          </NavLink>
        </div>
      </div>
    </section>
  );
}

export default Hero;
