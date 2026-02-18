import { motion } from "framer-motion";

const Motion = motion;

const faqs = [
  {
    question: "What is the typical project timeline?",
    answer:
      "Timelines range from 6–16 weeks depending on scope. After the consultation, we provide a detailed schedule.",
  },
  {
    question: "Do you handle procurement and installation?",
    answer:
      "Yes. We manage sourcing, logistics, and white‑glove installation to ensure the final styling feels cohesive.",
  },
  {
    question: "Can you work with existing pieces?",
    answer:
      "Absolutely. We assess what to keep, re‑upholster, or re‑style so the space feels intentional.",
  },
  {
    question: "What locations do you serve?",
    answer:
      "We are based in Lagos and deliver projects across Nigeria and select international locations.",
  },
];

function FaqSection() {
  return (
    <section id="faq" className="bg-porcelain py-24 text-obsidian">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <p className="text-xs uppercase tracking-[0.4em] text-ash">FAQ</p>
          <h2 className="max-w-2xl text-3xl font-semibold sm:text-4xl">
            Everything you need to know before we begin.
          </h2>
        </Motion.div>

        <div className="grid gap-4">
          {faqs.map((item, index) => (
            <Motion.div
              key={item.question}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="rounded-3xl border border-ash/30 bg-linen p-6"
            >
              <p className="text-lg font-semibold text-obsidian">
                {item.question}
              </p>
              <p className="mt-3 text-sm text-ash">{item.answer}</p>
            </Motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FaqSection;
