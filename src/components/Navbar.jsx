import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logoMark from "../homespiredlogo1.jpeg";
import { getCart } from "../utils/catalogStore.js";
import supabase from "../utils/supabaseClient.js";

const Motion = motion;

function Navbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [session, setSession] = useState(null);
  const adminEmail = "uthmanajanaku@gmail.com";
  const navLinks = [
    { label: "Portfolio", to: "/portfolio" },
    { label: "Signature Pieces", to: "/shop" },
    { label: "Consultations", to: "/consultations" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
  ];

  useEffect(() => {
    const syncCart = () => setCartItems(getCart());
    syncCart();
    window.addEventListener("cart-updated", syncCart);
    window.addEventListener("storage", syncCart);
    return () => {
      window.removeEventListener("cart-updated", syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  useEffect(() => {
    let isActive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!isActive) return;
      setSession(data.session);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isActive) return;
      setSession(nextSession);
    });
    return () => {
      isActive = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0),
    [cartItems],
  );
  const isAuthenticated = Boolean(session);
  const isAdmin =
    session?.user?.email?.toLowerCase() === adminEmail.toLowerCase();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    setIsUserMenuOpen(false);
    navigate("/", { replace: true });
  };

  return createPortal(
    <header
      className="fixed inset-x-0 top-0 z-40 bg-black/30 backdrop-blur-xl"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        transform: "translateZ(0)",
      }}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-5">
        <NavLink to="/" className="flex shrink-0 items-center gap-3 pr-4">
          <img
            src={logoMark}
            alt="Homespired logo"
            className="h-10 w-10 rounded-full object-cover"
          />
          <span className="text-xs uppercase tracking-[0.3em] text-white lg:text-sm lg:tracking-[0.35em]">
            Homespired
          </span>
        </NavLink>
        <nav className="hidden items-center gap-6 text-sm text-white md:flex lg:gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `whitespace-nowrap transition ${
                  isActive ? "text-white" : "text-white/80"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-4 text-white lg:gap-5">
          <NavLink
            to="/cart"
            className="relative rounded-full border border-white/50 bg-white/10 p-2 transition hover:border-white"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M6.5 6h14l-1.6 8.5a2 2 0 0 1-2 1.5H9.1a2 2 0 0 1-2-1.6L5.4 4H2V2h4a1 1 0 0 1 1 .8L7.3 6Zm3 14a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm7 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
            </svg>
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-semibold text-obsidian">
                {cartCount}
              </span>
            ) : null}
          </NavLink>
          {isAuthenticated ? (
            <>
              {isAdmin ? (
                <NavLink
                  to="/admin"
                  className="hidden whitespace-nowrap rounded-full border border-white/50 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] transition hover:border-white md:inline-flex"
                >
                  Dashboard
                </NavLink>
              ) : null}
              <div className="relative hidden md:inline-flex">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 whitespace-nowrap rounded-full border border-white/50 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white"
                >
                  Account
                  <span className="text-xs">▾</span>
                </button>
                <AnimatePresence>
                  {isUserMenuOpen ? (
                    <Motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-3 w-52 rounded-2xl border border-white/10 bg-black/80 p-4 text-xs text-white backdrop-blur-xl"
                    >
                      <div className="flex flex-col gap-3">
                        <NavLink
                          to="/account"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="uppercase tracking-[0.25em] text-white/70 transition hover:text-white"
                        >
                          Profile
                        </NavLink>
                        <NavLink
                          to="/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="uppercase tracking-[0.25em] text-white/70 transition hover:text-white"
                        >
                          Orders
                        </NavLink>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="text-left uppercase tracking-[0.25em] text-white/70 transition hover:text-white"
                        >
                          Sign Out
                        </button>
                      </div>
                    </Motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                aria-label="Account"
                className="hidden rounded-full border border-white/50 bg-white/10 p-2 transition hover:border-white md:inline-flex"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z" />
                </svg>
              </NavLink>
            </>
          )}
          {!isAdmin ? (
            <NavLink
              to="/consultations"
              className="hidden whitespace-nowrap rounded-full bg-black/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_10px_24px_rgba(0,0,0,0.35)] transition hover:bg-black hover:text-white md:inline-flex"
            >
              Book Appointment
            </NavLink>
          ) : null}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-full border border-white/50 bg-white/10 p-2 text-white transition hover:border-white md:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z" />
            </svg>
          </button>
        </div>
      </div>
      {isOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-[9999] bg-black text-white md:hidden"
              style={{ backgroundColor: "#000", opacity: 1 }}
            >
              <div className="flex h-full flex-col gap-6 px-6 py-8">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.3em] text-white">
                    Menu
                  </p>
                  <button
                    type="button"
                    aria-label="Close menu"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full border border-white/60 p-2 text-white"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4 text-white"
                      aria-hidden="true"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M6 6l12 12M18 6l-12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/80">
                    Explore
                  </p>
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={() => setIsOpen(false)}
                      className="text-sm font-semibold uppercase tracking-[0.3em] text-white"
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </div>
                <div className="flex flex-col gap-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/80">
                    Account
                  </p>
                  {isAuthenticated ? (
                    <>
                      <NavLink
                        to="/account"
                        onClick={() => setIsOpen(false)}
                        className="text-sm font-semibold uppercase tracking-[0.3em] text-white"
                      >
                        Profile
                      </NavLink>
                      <NavLink
                        to="/orders"
                        onClick={() => setIsOpen(false)}
                        className="text-sm font-semibold uppercase tracking-[0.3em] text-white"
                      >
                        Orders
                      </NavLink>
                      {isAdmin ? (
                        <NavLink
                          to="/admin"
                          onClick={() => setIsOpen(false)}
                          className="text-sm font-semibold uppercase tracking-[0.3em] text-white"
                        >
                          Admin Dashboard
                        </NavLink>
                      ) : null}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="text-left text-sm font-semibold uppercase tracking-[0.3em] text-white"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <NavLink
                        to="/login"
                        onClick={() => setIsOpen(false)}
                        className="text-sm font-semibold uppercase tracking-[0.3em] text-white"
                      >
                        Sign In
                      </NavLink>
                      <NavLink
                        to="/signup"
                        onClick={() => setIsOpen(false)}
                        className="text-sm font-semibold uppercase tracking-[0.3em] text-white"
                      >
                        Create Account
                      </NavLink>
                    </>
                  )}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </header>,
    document.documentElement,
  );
}

export default Navbar;
