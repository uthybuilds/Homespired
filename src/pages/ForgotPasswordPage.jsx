import { useState } from "react";
import { NavLink } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useToast } from "../components/useToast.js";
import supabase from "../utils/supabaseClient.js";

function ForgotPasswordPage() {
  const { pushToast } = useToast();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "loading", message: "" });
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/confirm-email?type=recovery`,
    });
    if (error) {
      setStatus({ type: "idle", message: "" });
      pushToast({ type: "error", message: error.message });
      return;
    }
    setStatus({ type: "success", message: "" });
    pushToast({
      type: "success",
      message: "Check your email for the password reset link.",
    });
  };

  return (
    <div className="min-h-screen bg-porcelain text-obsidian">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-24 pt-32">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-ash">
            Password Reset
          </p>
          <h1 className="text-4xl font-semibold sm:text-5xl">
            Reset your Homespired password.
          </h1>
          <p className="max-w-2xl text-base text-ash sm:text-lg">
            Enter your email address and we’ll send a secure reset link.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-w-xl rounded-3xl border border-ash/30 bg-linen p-8 shadow-[0_24px_40px_rgba(0,0,0,0.06)]"
        >
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email address"
            required
            className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian focus:border-obsidian focus:outline-none"
          />
          {status.type === "success" ? (
            <NavLink
              to={`/confirm-email?type=recovery&email=${encodeURIComponent(
                email.trim(),
              )}`}
              className="mt-4 inline-flex rounded-none border border-ash px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-obsidian transition"
            >
              Enter Code
            </NavLink>
          ) : null}
          <button
            type="submit"
            disabled={status.type === "loading"}
            className="mt-6 w-full rounded-none bg-obsidian px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-porcelain transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status.type === "loading" ? "Sending..." : "Send Reset Link"}
          </button>
          <NavLink to="/login" className="mt-4 inline-block text-xs text-ash">
            Return to login
          </NavLink>
        </form>
      </main>
      <Footer />
    </div>
  );
}

export default ForgotPasswordPage;
