import { NavLink } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-porcelain text-obsidian">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col items-start gap-8 px-6 pb-24 pt-32">
        <p className="text-xs uppercase tracking-[0.4em] text-ash">404</p>
        <h1 className="text-4xl font-semibold sm:text-5xl">
          This space is not available.
        </h1>
        <p className="max-w-2xl text-base text-ash sm:text-lg">
          The page you’re looking for has moved or no longer exists. Explore our
          portfolio, signature store, or book a consultation.
        </p>
        <div className="flex flex-wrap gap-3">
          <NavLink
            to="/portfolio"
            className="rounded-full bg-obsidian px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-porcelain transition"
          >
            View Portfolio
          </NavLink>
          <NavLink
            to="/shop"
            className="rounded-full border border-ash px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-obsidian transition"
          >
            Visit Store
          </NavLink>
          <NavLink
            to="/consultations"
            className="rounded-full border border-ash px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-obsidian transition"
          >
            Book Consultation
          </NavLink>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default NotFoundPage;
