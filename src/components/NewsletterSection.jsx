import { useState } from "react";
import { invokeEdgeFunction } from "../utils/supabaseClient.js";

const newsletterReloadKey = "homespired_newsletter_reload_count_v1";

function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [popupEmail, setPopupEmail] = useState("");
  const [popupStatus, setPopupStatus] = useState({ type: "idle", message: "" });
  const [isPopupOpen, setIsPopupOpen] = useState(() => {
    const forcePopup = import.meta.env.VITE_E2E_DISABLE_REDIRECT === "true";
    if (forcePopup) return true;
    const rawCount = localStorage.getItem(newsletterReloadKey);
    const nextCount = Number(rawCount || 0) + 1;
    localStorage.setItem(newsletterReloadKey, String(nextCount));
    return nextCount % 30 === 1;
  });

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const resolveErrorMessage = (error) => {
    let message = error?.message || "Could not send. Please try again.";
    const body = error?.context?.body;
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
    return message;
  };

  const sendSignup = async (value, setNextStatus) => {
    const lines = ["Newsletter Signup", `Email: ${value}`];
    const { error } = await invokeEdgeFunction("form-delivery", {
      type: "newsletter_signup",
      payload: {
        requestType: "Newsletter Signup",
        subscriberEmail: value,
        lines,
      },
    });
    if (error) {
      setNextStatus({
        type: "error",
        message: resolveErrorMessage(error),
      });
      return false;
    }
    setNextStatus({
      type: "success",
      message: "Thanks for subscribing. We will keep you updated.",
    });
    return true;
  };

  const handleSubmit = async (event, source) => {
    event.preventDefault();
    if (source === "popup") {
      setPopupStatus({ type: "loading", message: "Submitting..." });
      const ok = await sendSignup(popupEmail, setPopupStatus);
      if (ok) {
        setPopupEmail("");
        closePopup();
      }
      return;
    }
    setStatus({ type: "loading", message: "Submitting..." });
    const ok = await sendSignup(email, setStatus);
    if (ok) {
      setEmail("");
    }
  };

  return (
    <section className="bg-porcelain py-24 text-obsidian">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-ash">
            Newsletter
          </p>
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Be the first to receive studio updates and new releases.
          </h2>
          <p className="text-base text-ash sm:text-lg">
            Join our mailing list for curated interior insights and project
            updates.
          </p>
        </div>
        <form
          onSubmit={(event) => handleSubmit(event, "section")}
          className="w-full max-w-md rounded-3xl border border-ash/30 bg-linen p-6 shadow-[0_24px_40px_rgba(0,0,0,0.06)]"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email address"
            className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian placeholder:text-obsidian focus:border-obsidian focus:outline-none"
          />
          {status.message && (
            <div
              className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                status.type === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : status.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-ash/30 bg-porcelain text-ash"
              }`}
            >
              {status.message}
            </div>
          )}
          <button
            type="submit"
            disabled={status.type === "loading"}
            className="mt-4 w-full rounded-full bg-obsidian px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-porcelain transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status.type === "loading" ? "Submitting..." : "Subscribe"}
          </button>
        </form>
      </div>

      {isPopupOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-5 py-10 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-[32px] bg-porcelain/90 text-obsidian shadow-[0_45px_90px_rgba(0,0,0,0.35)]">
            <button
              type="button"
              onClick={closePopup}
              aria-label="Close newsletter popup"
              className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/40 text-xl text-white"
            >
              ×
            </button>
            <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[1.2fr_1fr]">
              <div className="space-y-5 text-white">
                <p className="text-xs uppercase tracking-[0.4em] text-white/70">
                  Newsletter
                </p>
                <h3 className="text-3xl font-semibold sm:text-4xl text-white">
                  Stay in the loop with Homespired.
                </h3>
                <p className="text-sm text-white/70 sm:text-base">
                  Subscribe for exclusive updates, launches, and studio insights
                  curated for your next interior project.
                </p>
                <form
                  onSubmit={(event) => handleSubmit(event, "popup")}
                  className="space-y-4"
                >
                  <input
                    type="email"
                    required
                    value={popupEmail}
                    onChange={(event) => setPopupEmail(event.target.value)}
                    placeholder="Email address"
                    className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian placeholder:text-black focus:border-obsidian focus:outline-none"
                  />
                  {popupStatus.message && (
                    <div
                      className={`rounded-2xl border px-4 py-3 text-sm ${
                        popupStatus.type === "error"
                          ? "border-red-200 bg-red-50 text-red-700"
                          : popupStatus.type === "success"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-ash/30 bg-porcelain text-ash"
                      }`}
                    >
                      {popupStatus.message}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={popupStatus.type === "loading"}
                    className="w-full rounded-full bg-obsidian px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-porcelain transition disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {popupStatus.type === "loading"
                      ? "Submitting..."
                      : "Subscribe"}
                  </button>
                </form>
              </div>
              <div className="flex flex-col justify-between gap-6 rounded-[26px] border border-ash/30 bg-porcelain/80 p-6">
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                    What you get
                  </p>
                  <div className="grid gap-3 text-xs text-ash">
                    <div className="rounded-2xl border border-ash/30 bg-white/70 px-4 py-3">
                      Studio updates and behind-the-scenes moments.
                    </div>
                    <div className="rounded-2xl border border-ash/30 bg-white/70 px-4 py-3">
                      New collection drops and private previews.
                    </div>
                    <div className="rounded-2xl border border-ash/30 bg-white/70 px-4 py-3">
                      Design tips for refined, functional interiors.
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-ash/30 bg-white/70 px-4 py-3 text-xs text-ash">
                  No spam. Unsubscribe anytime.
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default NewsletterSection;
