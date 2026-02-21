import { NavLink } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

const articles = [];

function BlogPage() {
  return (
    <div className="min-h-screen bg-linen text-obsidian">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-24 pt-32">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-ash">Journal</p>
          <h1 className="text-4xl font-semibold sm:text-5xl">
            Design notes from the studio.
          </h1>
          <p className="max-w-2xl text-base text-ash sm:text-lg">
            Ideas, project notes, and styling tips from our team.
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="rounded-3xl border border-ash/30 bg-porcelain p-10 text-center">
            <h2 className="text-2xl font-semibold">
              Journal updates are coming soon.
            </h2>
            <p className="mt-3 text-sm text-ash">
              For press or studio requests, reach out to the team.
            </p>
            <NavLink
              to="/contact"
              className="mt-6 inline-flex rounded-none border border-ash px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-obsidian transition"
            >
              Contact the Studio
            </NavLink>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {articles.map((article) => (
              <article
                key={article.title}
                className="rounded-3xl border border-ash/30 bg-porcelain p-6 shadow-[0_24px_40px_rgba(0,0,0,0.06)]"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-ash">
                  {article.date}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-obsidian">
                  {article.title}
                </h2>
                <p className="mt-3 text-sm text-ash">{article.excerpt}</p>
              </article>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default BlogPage;
