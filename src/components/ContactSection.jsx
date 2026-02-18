import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { invokeEdgeFunction } from "../utils/supabaseClient.js";
import { getSettings } from "../utils/catalogStore.js";

const Motion = motion;

function ContactSection() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState({ type: "idle", message: "" });
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

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "loading", message: "Sending request..." });
    const lines = [
      "Contact Request",
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      form.phone ? `Phone: ${form.phone}` : null,
      form.message ? `Message: ${form.message}` : null,
    ].filter(Boolean);
    const { error } = await invokeEdgeFunction("form-delivery", {
      type: "contact_request",
      payload: {
        requestType: "Contact Request",
        clientName: form.name,
        clientEmail: form.email,
        clientPhone: form.phone || "",
        message: form.message || "",
        lines,
      },
    });
    if (error) {
      let message = error.message || "Could not send. Please try again.";
      const body = error.context?.body;
      if (typeof body === "string") {
        try {
          const parsed = JSON.parse(body);
          if (parsed?.error) {
            message = parsed.error;
          }
        } catch {
          if (body) {
            message = body;
          }
        }
      }
      setStatus({
        type: "error",
        message,
      });
      return;
    }
    setStatus({
      type: "success",
      message: "Message received. We will confirm shortly.",
    });
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <section id="contact" className="bg-linen py-24 text-obsidian">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 lg:flex-row lg:items-start">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex-1 space-y-4"
        >
          <p className="text-xs uppercase tracking-[0.4em] text-ash">Contact</p>
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Let’s design a space that feels unmistakably yours.
          </h2>
          <p className="text-base text-ash sm:text-lg">
            Share your project details and our team will follow up with next
            steps, timelines, and a tailored scope.
          </p>
          <div className="space-y-2 text-sm text-ash">
            <p>hello@homespired.ng</p>
            <p>WhatsApp: {settings.whatsappNumber}</p>
            <p>Instagram: @homespired.ng</p>
            <p>Lagos, Nigeria</p>
          </div>
        </Motion.div>
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="flex-1 rounded-3xl border border-ash/30 bg-porcelain p-6 shadow-[0_24px_40px_rgba(0,0,0,0.06)]"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Full name"
              value={form.name}
              onChange={(event) => handleChange("name", event.target.value)}
              required
              className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian focus:border-obsidian focus:outline-none"
            />
            <input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(event) => handleChange("email", event.target.value)}
              required
              className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian focus:border-obsidian focus:outline-none"
            />
            <input
              type="text"
              placeholder="Phone number"
              value={form.phone}
              onChange={(event) => handleChange("phone", event.target.value)}
              className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian focus:border-obsidian focus:outline-none"
            />
            <textarea
              rows="4"
              placeholder="Tell us about your project"
              value={form.message}
              onChange={(event) => handleChange("message", event.target.value)}
              className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian focus:border-obsidian focus:outline-none"
            />
            {status.message && (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm ${
                  status.type === "error"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : status.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-ash/30 bg-linen text-ash"
                }`}
              >
                {status.message}
              </div>
            )}
            <button
              type="submit"
              disabled={status.type === "loading"}
              className="w-full rounded-full bg-obsidian px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-porcelain transition disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status.type === "loading" ? "Sending..." : "Send Request"}
            </button>
          </form>
        </Motion.div>
      </div>
    </section>
  );
}

export default ContactSection;
