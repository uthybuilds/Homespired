import { motion } from "framer-motion";

const Motion = motion;

const testimonials = [
  {
    name: "Amaka I.",
    project: "Larami Residence",
    quote:
      "Homespired delivered a space that feels like a private retreat. Every detail felt intentional and refined.",
  },
  {
    name: "Tobi A.",
    project: "Israel's Court",
    quote:
      "The team understood our vision instantly. The lighting, textures, and layout are beyond what we imagined.",
  },
  {
    name: "Mariam K.",
    project: "Project DPK",
    quote:
      "Professional, calm, and deeply creative. The home feels modern yet warm in every room.",
  },
];

function TestimonialsSection() {
  return (
    <section id="testimonials" className="bg-linen py-24 text-obsidian">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <p className="text-xs uppercase tracking-[0.4em] text-ash">
            Testimonials
          </p>
          <h2 className="max-w-2xl text-3xl font-semibold sm:text-4xl">
            The client experience is as curated as the space.
          </h2>
        </Motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <Motion.div
              key={item.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="rounded-3xl border border-ash/30 bg-porcelain p-6 shadow-[0_24px_40px_rgba(0,0,0,0.06)]"
            >
              <p className="text-sm text-ash">{item.project}</p>
              <p className="mt-4 text-base text-obsidian">{item.quote}</p>
              <p className="mt-6 text-xs uppercase tracking-[0.3em] text-ash">
                {item.name}
              </p>
            </Motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
