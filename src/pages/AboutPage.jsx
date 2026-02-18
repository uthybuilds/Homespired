import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import ceoPrimary from "../Homespired CEO 1.jpeg";
import ceoSecondary from "../Homespired CEO 2.jpeg";

const Motion = motion;

const values = [
  {
    title: "Curated Calm",
    description:
      "Every space is composed to feel serene, with clean lines, soft textures, and balanced proportions.",
  },
  {
    title: "Intentional Luxury",
    description:
      "Materials are selected for tactile richness and longevity, creating a quiet sense of luxury.",
  },
  {
    title: "Client‑Centered",
    description:
      "We translate your lifestyle into a refined environment that feels personal, functional, and future ready.",
  },
];

const timeline = [
  {
    year: "2018",
    title: "Homespired founded",
    description:
      "A studio rooted in modern luxury, focused on elevated residential environments.",
  },
  {
    year: "2020",
    title: "Expanded service offerings",
    description:
      "Added procurement, custom millwork, and white‑glove styling services.",
  },
  {
    year: "2023",
    title: "Signature private commissions",
    description:
      "Delivered large‑scale projects across Lagos and select international clients.",
  },
  {
    year: "2026",
    title: "Homespired Studio",
    description:
      "A refined interior design studio delivering full‑service and signature collections.",
  },
];

function AboutPage() {
  const [spotlight, setSpotlight] = useState({
    x: 50,
    y: 40,
    active: false,
  });

  const maskStyle = useMemo(() => {
    const radius = spotlight.active ? 220 : 0;
    const position = `${spotlight.x}% ${spotlight.y}%`;
    const mask = `radial-gradient(${radius}px at ${position}, black 0%, black 55%, transparent 70%)`;
    return {
      WebkitMaskImage: mask,
      maskImage: mask,
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
    };
  }, [spotlight]);

  return (
    <div className="min-h-screen bg-porcelain text-obsidian">
      <Navbar />
      <main className="pt-24">
        <section
          className="relative min-h-[60vh] overflow-hidden lg:min-h-[70vh]"
          onMouseMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;
            setSpotlight({ x, y, active: true });
          }}
          onMouseLeave={() =>
            setSpotlight((prev) => ({ ...prev, active: false }))
          }
        >
          <div className="absolute inset-0">
            <img
              src={ceoPrimary}
              alt="Homespired founder"
              className="h-full w-full object-cover object-[center_20%]"
            />
            <img
              src={ceoSecondary}
              alt="Homespired founder in studio"
              className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
              style={maskStyle}
            />
            <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/30 to-transparent" />
          </div>
          <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-20 text-white lg:py-24">
            <p className="text-xs uppercase tracking-[0.4em] text-white/70">
              About
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold sm:text-5xl">
              A studio devoted to sculptural interiors and lived‑in luxury.
            </h1>
            <p className="max-w-2xl text-base text-white/80 sm:text-lg">
              Homespired is led by Fatimah Adetona, crafting modern homes that
              feel calm, elevated, and deeply personal.
            </p>
          </div>
        </section>

        <section className="bg-porcelain py-20 lg:py-24">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 lg:gap-14">
            <Motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <p className="text-xs uppercase tracking-[0.4em] text-ash">
                Our Story
              </p>
              <h2 className="max-w-3xl text-3xl font-semibold sm:text-4xl">
                Spaces designed to feel timeless, calm, and unmistakably yours.
              </h2>
              <p className="max-w-[60ch] text-base text-ash sm:text-lg">
                We believe luxury should feel effortless. Our design process
                blends architectural precision with softness, ensuring every
                space is functional, refined, and deeply lived in.
              </p>
              <p className="max-w-[60ch] text-base text-ash sm:text-lg">
                From the first moodboard to the final styling layer, we curate a
                narrative that reflects your lifestyle, your rituals, and the
                way you want to feel at home.
              </p>
              <p className="max-w-[60ch] text-base text-ash sm:text-lg">
                Homespired brings together bespoke craftsmanship, thoughtful
                procurement, and a calm, collaborative process so every space
                reads with clarity and intention.
              </p>
            </Motion.div>

            <div className="grid gap-6 md:grid-cols-3">
              {values.map((value, index) => (
                <Motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="rounded-3xl border border-ash/30 bg-linen p-6 shadow-[0_24px_40px_rgba(0,0,0,0.06)]"
                >
                  <h3 className="text-xl font-semibold text-obsidian">
                    {value.title}
                  </h3>
                  <p className="mt-3 text-sm text-ash">{value.description}</p>
                </Motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-linen py-24">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.4em] text-ash">
                Studio Timeline
              </p>
              <h2 className="text-3xl font-semibold sm:text-4xl">
                From vision to global commissions.
              </h2>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {timeline.map((item) => (
                <div
                  key={item.year}
                  className="rounded-3xl border border-ash/30 bg-porcelain p-6"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-ash">
                    {item.year}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-obsidian">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm text-ash">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default AboutPage;
