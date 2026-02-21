import { useState } from "react";
import { invokeEdgeFunction } from "../utils/supabaseClient.js";

function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "idle", message: "" });

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "loading", message: "Submitting..." });
    const ok = await sendSignup(email, setStatus);
    if (ok) {
      setEmail("");
    }
  };

  return (
    <section
      id="newsletter"
      className="flex min-h-[70vh] items-center bg-porcelain py-16 text-obsidian sm:min-h-0 sm:py-24"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-8 px-6 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
        <div className="max-w-2xl space-y-3">
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Get studio updates first.
          </h2>
        </div>
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-3xl border border-ash/30 bg-linen p-5 shadow-[0_24px_40px_rgba(0,0,0,0.06)] sm:p-6"
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
            className="mt-4 w-full rounded-none bg-obsidian px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-porcelain transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status.type === "loading" ? "Submitting..." : "Subscribe"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default NewsletterSection;
