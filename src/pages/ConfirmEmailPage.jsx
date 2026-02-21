import { useEffect, useState } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useToast } from "../components/useToast.js";
import supabase from "../utils/supabaseClient.js";

function ConfirmEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const mode = searchParams.get("type");
  const code = searchParams.get("code");
  const prefillEmail = searchParams.get("email") || "";
  const [status, setStatus] = useState(() =>
    code
      ? { type: "loading", message: "Confirming your session..." }
      : { type: "idle", message: "" },
  );
  const [email, setEmail] = useState(prefillEmail);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const canResetPassword = mode === "recovery" && (code || isOtpVerified);

  useEffect(() => {
    if (!code) return;
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setStatus({ type: "idle", message: "" });
        pushToast({ type: "error", message: error.message });
        return;
      }
      setStatus({ type: "idle", message: "" });
      pushToast({
        type: "success",
        message:
          mode === "recovery"
            ? "Set a new password to complete the reset."
            : "Your email is confirmed.",
      });
      if (mode === "recovery") {
        setIsOtpVerified(true);
      }
      if (mode !== "recovery") {
        setTimeout(() => navigate("/login"), 1500);
      }
    });
  }, [code, mode, navigate, pushToast]);

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    if (!email.trim()) {
      pushToast({ type: "error", message: "Enter your email to continue." });
      return;
    }
    if (otp.trim().length !== 8) {
      pushToast({ type: "error", message: "Enter the 8-digit code." });
      return;
    }
    setStatus({ type: "loading", message: "" });
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp.trim(),
      type: mode === "recovery" ? "recovery" : "signup",
    });
    if (error) {
      setStatus({ type: "idle", message: "" });
      pushToast({ type: "error", message: error.message });
      return;
    }
    setStatus({ type: "idle", message: "" });
    pushToast({
      type: "success",
      message:
        mode === "recovery"
          ? "Code verified. Set a new password."
          : "Email confirmed. You can sign in now.",
    });
    if (mode === "recovery") {
      setIsOtpVerified(true);
      return;
    }
    setTimeout(() => navigate("/login"), 1500);
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setStatus({ type: "loading", message: "" });
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStatus({ type: "idle", message: "" });
      pushToast({ type: "error", message: error.message });
      return;
    }
    setStatus({ type: "idle", message: "" });
    pushToast({
      type: "success",
      message: "Password updated. You can now sign in.",
    });
    setTimeout(() => navigate("/login"), 1500);
  };

  return (
    <div className="min-h-screen bg-linen text-obsidian">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-24 pt-32">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-ash">
            {mode === "recovery" ? "Reset Password" : "Confirm Email"}
          </p>
          <h1 className="text-4xl font-semibold sm:text-5xl">
            {mode === "recovery"
              ? canResetPassword
                ? "Create a new password for your Homespired account."
                : "Enter the 8-digit code to reset your password."
              : "Check your email to confirm your account."}
          </h1>
          <p className="max-w-2xl text-base text-ash sm:text-lg">
            {mode === "recovery"
              ? canResetPassword
                ? "After setting a new password, you will be redirected to sign in."
                : "Use the 8-digit code from your email to continue."
              : "Enter the 8-digit code from your email to activate your account."}
          </p>
        </div>

        <form
          onSubmit={canResetPassword ? handleResetPassword : handleVerifyOtp}
          className="max-w-xl rounded-3xl border border-ash/30 bg-porcelain p-8 shadow-[0_24px_40px_rgba(0,0,0,0.06)]"
        >
          {canResetPassword ? (
            <div className="space-y-4">
              <div className="relative">
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="New password"
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
          ) : (
            <div className="space-y-4">
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                placeholder="Email address"
                required
                className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian focus:border-obsidian focus:outline-none"
              />
              <input
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 8))
                }
                inputMode="numeric"
                placeholder="8-digit code"
                required
                className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian focus:border-obsidian focus:outline-none"
              />
              <div className="flex flex-wrap gap-3 text-xs text-ash">
                <NavLink to="/login" className="underline">
                  Back to sign in
                </NavLink>
              </div>
            </div>
          )}
          {canResetPassword ? (
            <button
              type="submit"
              disabled={status.type === "loading"}
              className="mt-6 w-full rounded-none bg-obsidian px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-porcelain transition disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status.type === "loading"
                ? "Updating Password..."
                : "Update Password"}
            </button>
          ) : (
            <button
              type="submit"
              disabled={status.type === "loading"}
              className="mt-6 w-full rounded-none bg-obsidian px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-porcelain transition disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status.type === "loading" ? "Verifying..." : "Verify Code"}
            </button>
          )}
        </form>
      </main>
      <Footer />
    </div>
  );
}

export default ConfirmEmailPage;
