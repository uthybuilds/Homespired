import { motion } from "framer-motion";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

const Motion = motion;

const faqs = [
  {
    question: "How do I start a project with Homespired?",
    answer:
      "Begin with a consultation request. We’ll schedule a discovery call, review your needs, and provide a tailored proposal.",
  },
  {
    question: "What does full‑service interior design include?",
    answer:
      "Concept, layouts, custom millwork, procurement, lighting direction, styling, and white‑glove installation.",
  },
  {
    question: "Do you work with existing furniture?",
    answer:
      "Yes. We evaluate your current pieces and integrate what supports the vision, then curate the remaining selections.",
  },
  {
    question: "Can I book virtual consultations?",
    answer:
      "Absolutely. Virtual sessions are ideal for planning, styling direction, and design guidance from anywhere.",
  },
  {
    question: "How is pricing structured?",
    answer:
      "Projects are quoted based on scope, timeline, and deliverables. You’ll receive a transparent estimate before we begin.",
  },
  {
    question: "Do you offer styling‑only services?",
    answer:
      "Yes. Our signature styling and seasonal refresh offerings are perfect for polishing an existing space.",
  },
  {
    question: "What is your typical project timeline?",
    answer:
      "Timelines vary by scope. Most residential projects run 8–16 weeks once procurement begins.",
  },
  {
    question: "Do you handle procurement and installation?",
    answer:
      "Yes. We source, coordinate logistics, and manage white‑glove installation to deliver a cohesive final reveal.",
  },
  {
    question: "Can you work with remote or international clients?",
    answer:
      "We support remote design and manage local procurement on your behalf, with virtual check‑ins throughout.",
  },
  {
    question: "How are consultation fees applied?",
    answer:
      "Consultation fees cover the strategy session and are credited toward the project if you proceed.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Bank transfer is the primary method for design fees and curated procurement.",
  },
  {
    question: "Do you offer product sourcing without full design?",
    answer:
      "Yes. We can curate select pieces or styling sets when full‑scope design is not required.",
  },
  {
    question: "How do I schedule an on‑site inspection?",
    answer:
      "Select an inspection tier, submit your details, and we confirm availability via WhatsApp.",
  },
  {
    question: "Can you handle renovations or build coordination?",
    answer:
      "We partner with vetted contractors and collaborate on timelines to keep the design intent consistent.",
  },
  {
    question: "What if I need design changes mid‑project?",
    answer:
      "We document revisions and confirm any scope or cost adjustments before work continues.",
  },
  {
    question: "How do shipping fees work for store orders?",
    answer:
      "Shipping is calculated by location at checkout based on Lagos Island, Lagos Mainland, or outside Lagos.",
  },
];

function FaqPage() {
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
          <p className="text-xs uppercase tracking-[0.4em] text-ash">FAQ</p>
          <h1 className="text-4xl font-semibold sm:text-5xl">
            Clear answers for a confident design journey.
          </h1>
          <p className="max-w-2xl text-base text-ash sm:text-lg">
            We believe transparency is part of a luxury experience. Here are the
            most common questions we receive.
          </p>
        </Motion.div>

        <div className="grid gap-4">
          {faqs.map((item, index) => (
            <Motion.div
              key={item.question}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
              className="rounded-3xl border border-ash/30 bg-linen p-6"
            >
              <p className="text-lg font-semibold text-obsidian">
                {item.question}
              </p>
              <p className="mt-3 text-sm text-ash">{item.answer}</p>
            </Motion.div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default FaqPage;
