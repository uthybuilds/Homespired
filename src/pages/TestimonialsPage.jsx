import { motion } from "framer-motion";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

const Motion = motion;

const testimonials = [
  {
    name: "Amaka I.",
    role: "Private Residence",
    quote:
      "Homespired understood the mood we wanted instantly. The result is a refined, calm space that feels like a retreat.",
  },
  {
    name: "Tobi A.",
    role: "Family Villa",
    quote:
      "The process was seamless and the design is breathtaking. Every room feels layered and intentional.",
  },
  {
    name: "Mariam K.",
    role: "Entertaining Suite",
    quote:
      "The lighting and material palette completely changed how we live in the space. It’s elegant and welcoming.",
  },
  {
    name: "Adeola F.",
    role: "Apartment Refresh",
    quote:
      "They balanced my existing furniture with new custom pieces perfectly. It feels cohesive and luxurious.",
  },
];

function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-linen text-obsidian">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-24 pt-32">
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
          <h1 className="text-4xl font-semibold sm:text-5xl">
            Clients describe the experience as calm, elevated, and effortless.
          </h1>
          <p className="max-w-2xl text-base text-ash sm:text-lg">
            Each project is built around the client’s lifestyle. These are the
            words that matter most to us.
          </p>
        </Motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.map((item, index) => (
            <Motion.div
              key={item.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              className="rounded-3xl border border-ash/30 bg-porcelain p-6 shadow-[0_24px_40px_rgba(0,0,0,0.06)]"
            >
              <p className="text-sm text-ash">{item.role}</p>
              <p className="mt-4 text-base text-obsidian">{item.quote}</p>
              <p className="mt-6 text-xs uppercase tracking-[0.3em] text-ash">
                {item.name}
              </p>
            </Motion.div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default TestimonialsPage;
