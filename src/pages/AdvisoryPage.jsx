import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { getSettings } from "../utils/catalogStore.js";

const Motion = motion;

function AdvisoryPage() {
  const [settings, setSettings] = useState(() => getSettings());

  useEffect(() => {
    const sync = () => setSettings(getSettings());
    window.addEventListener("settings-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("settings-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <div className="min-h-screen bg-porcelain text-obsidian">
      <Navbar />
      <Motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-24 pt-32"
      >
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-ash">
            Advisory Sessions
          </p>
          <h1 className="text-4xl font-semibold sm:text-5xl">
            Choose a consultation package for your project.
          </h1>
          <p className="max-w-2xl text-base text-ash sm:text-lg">
            Each tier includes pricing and request details.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {settings.consultationOptions.map((option, index) => (
            <Motion.div
              key={option.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.6,
                ease: "easeOut",
                delay: index * 0.05,
              }}
              className="flex flex-col justify-between gap-6 rounded-3xl border border-ash/30 bg-linen p-6 shadow-[0_24px_40px_rgba(0,0,0,0.06)]"
            >
              <div className="space-y-3">
                <h2 className="text-xl font-semibold">{option.title}</h2>
                <p className="text-sm text-ash">{option.summary}</p>
                <p className="text-sm font-semibold text-obsidian">
                  ₦{Number(option.price).toLocaleString()}
                </p>
              </div>
              <NavLink
                to={`/advisory/${option.id}`}
                className="rounded-none bg-obsidian px-5 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-porcelain transition"
              >
                View Details
              </NavLink>
            </Motion.div>
          ))}
        </div>
      </Motion.main>
      <Footer />
    </div>
  );
}

export default AdvisoryPage;
