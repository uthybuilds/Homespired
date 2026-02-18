import { motion } from "framer-motion";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

const Motion = motion;

const steps = [
  {
    title: "Discovery",
    detail:
      "We explore your lifestyle, spatial goals, and visual references to shape the creative direction.",
  },
  {
    title: "Concept",
    detail:
      "We define the palette, materials, and architectural strategy with layouts and moodboards.",
  },
  {
    title: "Design Development",
    detail:
      "Custom millwork, furniture selection, and lighting plans are refined into a cohesive proposal.",
  },
  {
    title: "Procurement",
    detail:
      "We manage sourcing, vendor coordination, and logistics with white‑glove precision.",
  },
  {
    title: "Installation",
    detail:
      "Our team stages, styles, and completes the space for a refined final reveal.",
  },
];

function ProcessPage() {
  return (
    <div className="min-h-screen bg-porcelain text-obsidian">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-24 pt-32">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <p className="text-xs uppercase tracking-[0.4em] text-ash">Process</p>
          <h1 className="text-4xl font-semibold sm:text-5xl">
            A thoughtful, guided journey from concept to completion.
          </h1>
          <p className="max-w-2xl text-base text-ash sm:text-lg">
            Our process is designed to feel calm, transparent, and elevated from
            the first conversation to the final styling.
          </p>
        </Motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {steps.map((step, index) => (
            <Motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              className="rounded-3xl border border-ash/30 bg-linen p-6 shadow-[0_24px_40px_rgba(0,0,0,0.06)]"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-ash">
                Step {index + 1}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-obsidian">
                {step.title}
              </h3>
              <p className="mt-3 text-sm text-ash">{step.detail}</p>
            </Motion.div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ProcessPage;
