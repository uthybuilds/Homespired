import { motion } from "framer-motion";

const Motion = motion;

const pillars = [
  {
    title: "Vision",
    description:
      "We design for calm, clarity, and elevated daily living, blending sculptural form with soft materiality.",
  },
  {
    title: "Craft",
    description:
      "Every space is composed with bespoke joinery, curated objects, and lighting that shapes mood.",
  },
  {
    title: "Experience",
    description:
      "From first concept to final styling, we guide a seamless, white‑glove process.",
  },
];

function AboutSection() {
  return (
    <section id="about" className="bg-porcelain py-24 text-obsidian">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6">
        <Motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-3xl space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-ash">
              About Homespired
            </p>
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Design rooted in serenity, shaped by modern luxury.
            </h2>
            <p className="text-base text-ash sm:text-lg">
              Homespired creates interiors that feel curated yet welcoming. Our
              studio blends thoughtful spatial planning, warm material palettes,
              and sculptural silhouettes to craft homes that feel timeless.
            </p>
          </div>
          <div className="rounded-3xl border border-ash/30 bg-linen px-6 py-5 text-sm text-ash">
            Lagos · Global Projects · Private Commissions
          </div>
        </Motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((pillar, index) => (
            <Motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="rounded-3xl border border-ash/30 bg-linen p-6 shadow-[0_24px_40px_rgba(0,0,0,0.06)]"
            >
              <h3 className="text-xl font-semibold text-obsidian">
                {pillar.title}
              </h3>
              <p className="mt-3 text-sm text-ash">{pillar.description}</p>
            </Motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
