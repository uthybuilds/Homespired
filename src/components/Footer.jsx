import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { getSettings, normalizeWhatsAppNumber } from "../utils/catalogStore.js";
import logoMark from "../homespiredlogo1.jpeg";

function Footer() {
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

  const whatsappNumber = normalizeWhatsAppNumber(settings.whatsappNumber);
  return (
    <footer className="bg-obsidian text-porcelain">
      <div className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <img
                src={logoMark}
                alt="Homespired logo"
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-porcelain/70">
                  Homespired
                </p>
                <p className="text-sm text-porcelain/80">
                  Futuristic interiors crafted with sculptural form and refined
                  material palettes.
                </p>
              </div>
            </div>
            <p className="max-w-md text-sm text-porcelain/70">
              From curated consultations to signature collections, we guide a
              seamless design journey shaped by calm, precision, and warmth.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-3 text-sm text-porcelain/80">
              <p className="text-xs uppercase tracking-[0.3em] text-porcelain/60">
                Studio
              </p>
              <NavLink to="/about" className="transition">
                About
              </NavLink>
              <NavLink to="/process" className="transition">
                Process
              </NavLink>
              <NavLink to="/press" className="transition">
                Press
              </NavLink>
            </div>
            <div className="flex flex-col gap-3 text-sm text-porcelain/80">
              <p className="text-xs uppercase tracking-[0.3em] text-porcelain/60">
                Services
              </p>
              <NavLink to="/portfolio" className="transition">
                Portfolio
              </NavLink>
              <NavLink to="/shop" className="transition">
                Signature Store
              </NavLink>
              <NavLink to="/consultations" className="transition">
                Consultations
              </NavLink>
            </div>
            <div className="flex flex-col gap-3 text-sm text-porcelain/80">
              <p className="text-xs uppercase tracking-[0.3em] text-porcelain/60">
                Support
              </p>
              <a href="/#newsletter" className="transition">
                Newsletter
              </a>
              <NavLink to="/faq" className="transition">
                FAQ
              </NavLink>
              <NavLink to="/privacy" className="transition">
                Privacy
              </NavLink>
              <NavLink to="/terms" className="transition">
                Terms
              </NavLink>
              <NavLink to="/contact" className="transition">
                Contact
              </NavLink>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-porcelain/20 pt-6 text-xs text-porcelain/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Homespired Studio. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/homespired.ng/"
                target="_blank"
                rel="noreferrer"
                aria-label="Homespired Instagram"
                className="rounded-none border border-porcelain/30 p-2 transition"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17" cy="7" r="1" />
                </svg>
              </a>
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Homespired WhatsApp"
                className="rounded-none border border-porcelain/30 p-2 transition"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  aria-hidden="true"
                  fill="currentColor"
                >
                  <path d="M20.5 3.5A10 10 0 0 0 3.1 17.9L2 22l4.3-1.1A10 10 0 0 0 20.5 3.5Zm-8.5 17a8 8 0 0 1-4.1-1.1l-.3-.2-2.4.6.6-2.3-.2-.3A8 8 0 1 1 12 20.5Zm4.4-5.6c-.2-.1-1.3-.6-1.5-.7-.2-.1-.3-.1-.4.1-.1.2-.6.7-.7.8-.1.1-.2.2-.4.1-1-.4-1.8-1-2.5-1.7-.7-.7-1.3-1.6-1.7-2.5-.1-.2 0-.3.1-.4l.6-.7c.1-.1.1-.2.1-.4s-.5-1.3-.7-1.5c-.2-.5-.5-.4-.7-.4h-.6c-.2 0-.4.1-.5.3-.5.5-.8 1.2-.8 1.9 0 .5.1 1 .3 1.4.6 1.2 1.4 2.4 2.4 3.3 1.1 1.1 2.3 1.9 3.7 2.4.4.1.9.2 1.3.2.7 0 1.4-.3 1.9-.8.2-.1.3-.3.3-.5v-.6c0-.3 0-.6-.2-.8Z" />
                </svg>
              </a>
            </div>
            <NavLink to="/refunds" className="transition">
              Refund Policy
            </NavLink>
            <NavLink to="/shipping" className="transition">
              Shipping
            </NavLink>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
