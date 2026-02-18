import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import supabase from "../utils/supabaseClient.js";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const adminEmail = "uthmanajanaku@gmail.com";
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "loading", message: "Signing in..." });
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    if (error) {
      setStatus({ type: "error", message: error.message });
      return;
    }
    setStatus({ type: "success", message: "Signed in successfully." });
    const userEmail = data?.user?.email?.toLowerCase() || "";
    const isAdmin = userEmail === adminEmail.toLowerCase();
    const destination =
      location.state?.from?.pathname || (isAdmin ? "/admin" : "/account");
    navigate(destination, { replace: true });
  };

  return (
    <div className="min-h-screen bg-porcelain text-obsidian">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-24 pt-32">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-ash">Login</p>
          <h1 className="text-4xl font-semibold sm:text-5xl">
            Welcome back to Homespired.
          </h1>
          <p className="max-w-2xl text-base text-ash sm:text-lg">
            Access your account, orders, and saved collections.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-ash/30 bg-linen p-8 shadow-[0_24px_40px_rgba(0,0,0,0.06)]"
          >
            <div className="space-y-4">
              <input
                value={form.email}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, email: event.target.value }))
                }
                type="email"
                placeholder="Email address"
                required
                className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian focus:border-obsidian focus:outline-none"
              />
              <div className="relative">
                <input
                  value={form.password}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                  type={isPasswordVisible ? "text" : "password"}
                  placeholder="Password"
                  required
                  className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 pr-12 text-sm text-obsidian focus:border-obsidian focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible((prev) => !prev)}
                  aria-label={
                    isPasswordVisible ? "Hide password" : "Show password"
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ash transition"
                >
                  {isPasswordVisible ? (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      aria-hidden="true"
                    >
                      <path d="M3 12c1.8-4.2 6-7 9-7s7.2 2.8 9 7c-1.8 4.2-6 7-9 7s-7.2-2.8-9-7Zm9 4a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      aria-hidden="true"
                    >
                      <path d="M4.3 3.3 20.7 19.7l-1.4 1.4-3-3a9.3 9.3 0 0 1-4.3 1.2c-3 0-7.2-2.8-9-7a12.1 12.1 0 0 1 3.7-4.7L2.9 4.7l1.4-1.4Zm7.7 5.7a3 3 0 0 0-3 3c0 .5.1 1 .3 1.4l3.9 3.9c.4.2.9.3 1.4.3a3 3 0 0 0 3-3c0-.5-.1-1-.3-1.4l-3.9-3.9c-.4-.2-.9-.3-1.4-.3Zm0-4c3 0 7.2 2.8 9 7a11.9 11.9 0 0 1-2.8 3.8l-1.5-1.5a9.5 9.5 0 0 0 2-2.3c-1.5-3.2-4.9-5-6.7-5a6.1 6.1 0 0 0-2.6.6L7.7 5.7A8.6 8.6 0 0 1 12 5Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs text-ash">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4" />
                Remember me
              </label>
              <NavLink to="/forgot-password" className="underline">
                Forgot password?
              </NavLink>
            </div>
            {status.message && (
              <div
                className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
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
              className="mt-6 w-full rounded-full bg-obsidian px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-porcelain transition disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status.type === "loading" ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="rounded-3xl border border-ash/30 bg-porcelain p-8">
            <h2 className="text-2xl font-semibold text-obsidian">
              New to Homespired?
            </h2>
            <p className="mt-3 text-sm text-ash">
              Create an account to save projects, manage your orders, and access
              concierge support.
            </p>
            <NavLink
              to="/signup"
              className="mt-6 inline-flex rounded-full border border-ash px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-obsidian transition"
            >
              Create Account
            </NavLink>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default LoginPage;
