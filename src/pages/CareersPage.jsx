import { NavLink } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

const roles = [];

function CareersPage() {
  return (
    <div className="min-h-screen bg-porcelain text-obsidian">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-24 pt-32">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-ash">Careers</p>
          <h1 className="text-4xl font-semibold sm:text-5xl">
            Join a studio dedicated to refined, modern living.
          </h1>
          <p className="max-w-2xl text-base text-ash sm:text-lg">
            We are a collaborative studio committed to craft, calm, and
            excellence. Explore open roles below.
          </p>
        </div>

        {roles.length === 0 ? (
          <div className="rounded-3xl border border-ash/30 bg-linen p-10 text-center">
            <h2 className="text-2xl font-semibold">
              No open roles at the moment.
            </h2>
            <p className="mt-3 text-sm text-ash">
              Share your portfolio and we will reach out when new roles open.
            </p>
            <NavLink
              to="/contact"
              className="mt-6 inline-flex rounded-full border border-ash px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-obsidian transition"
            >
              Contact Recruitment
            </NavLink>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {roles.map((role) => (
              <div
                key={role.title}
                className="rounded-3xl border border-ash/30 bg-linen p-6"
              >
                <h2 className="text-xl font-semibold text-obsidian">
                  {role.title}
                </h2>
                <p className="mt-2 text-sm text-ash">{role.location}</p>
                <p className="mt-1 text-sm text-ash">{role.type}</p>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default CareersPage;
