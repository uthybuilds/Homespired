import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import {
  addToCart,
  getCatalog,
  trackAnalytics,
} from "../utils/catalogStore.js";
import supabase from "../utils/supabaseClient.js";

const Motion = motion;

function ShopPage() {
  const [catalog, setCatalog] = useState(() => getCatalog());
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [session, setSession] = useState(null);
  const adminEmail = "uthmanajanaku@gmail.com";

  const categories = useMemo(() => {
    const unique = Array.from(new Set(catalog.map((item) => item.category)));
    return ["All", ...unique];
  }, [catalog]);

  const filtered = useMemo(() => {
    return catalog.filter((item) => {
      const matchesCategory =
        activeCategory === "All" || item.category === activeCategory;
      const matchesQuery =
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, catalog, query]);

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

  useEffect(() => {
    trackAnalytics("storeViews");
  }, []);

  useEffect(() => {
    const isCloud = import.meta.env.VITE_STORAGE_MODE === "cloud";
    if (!isCloud) return;
    let isMounted = true;
    (async () => {
      const { data } = await supabase
        .from("catalog")
        .select("*")
        .order("created_at", { ascending: false });
      if (!isMounted) return;
      if (Array.isArray(data)) {
        setCatalog(
          data.map((x) => ({
            id: x.id,
            name: x.name,
            price: Number(x.price || 0),
            category: x.category,
            image: x.image_url || x.image,
            description: x.description,
            inventory: Number(x.inventory || 0),
          })),
        );
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const refresh = () => {
      if (!isMounted) return;
      setCatalog(getCatalog());
    };
    // Initial refresh in case cloud hydration completed before mount
    refresh();
    window.addEventListener("storage", refresh);
    return () => {
      isMounted = false;
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const isAdmin =
    session?.user?.email?.toLowerCase() === adminEmail.toLowerCase();

  return (
    <div className="min-h-screen bg-porcelain text-obsidian">
      <Navbar />
      <Motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-24 pt-32"
      >
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-ash">
            Signature Store
          </p>
          <h1 className="text-4xl font-semibold sm:text-5xl">
            A curated store for signature pieces and styling.
          </h1>
          <p className="max-w-2xl text-base text-ash sm:text-lg">
            Every piece is uploaded by the studio in the admin dashboard for
            real‑time catalog updates.
          </p>
        </div>

        <div className="grid gap-6 rounded-3xl border border-ash/30 bg-linen p-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-ash">
              Signature Store
            </p>
            <p className="text-lg font-semibold text-obsidian">
              Filter by category or search the catalog.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="search"
              placeholder="Search products"
              className="w-full rounded-full border border-ash/40 bg-white/70 px-4 py-2 text-sm text-obsidian focus:border-obsidian focus:outline-none sm:w-60"
            />
            {isAdmin ? (
              <NavLink
                to="/admin"
                className="rounded-full bg-obsidian px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-porcelain transition"
              >
                Admin Dashboard
              </NavLink>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`rounded-full border px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
                activeCategory === category
                  ? "border-obsidian bg-obsidian text-porcelain"
                  : "border-ash text-obsidian"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-ash/30 bg-linen p-10 text-center">
            <h2 className="text-2xl font-semibold">
              No products available yet.
            </h2>
            <p className="mt-3 text-sm text-ash">
              We’re curating the first collection. Please check back soon.
            </p>
            {isAdmin ? (
              <NavLink
                to="/admin"
                className="mt-6 inline-flex rounded-full bg-obsidian px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-porcelain transition"
              >
                Go to Admin Dashboard
              </NavLink>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product) => (
              <article
                key={product.id}
                className="flex h-full flex-col overflow-hidden rounded-3xl border border-ash/30 bg-porcelain shadow-[0_24px_40px_rgba(0,0,0,0.06)]"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-56 w-full object-cover"
                />
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-ash">
                      {product.category}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-obsidian">
                      {product.name}
                    </h3>
                    <p className="mt-2 text-sm text-ash">
                      {product.description}
                    </p>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <p className="text-sm font-semibold text-obsidian">
                      ₦{Number(product.price).toLocaleString()}
                    </p>
                    <div className="flex gap-2">
                      <NavLink
                        to={`/shop/${product.id}`}
                        className="rounded-full border border-ash px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-obsidian transition"
                      >
                        View
                      </NavLink>
                      <button
                        onClick={() => addToCart(product)}
                        disabled={Number(product.inventory || 0) === 0}
                        className="rounded-full bg-obsidian px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-porcelain transition disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {Number(product.inventory || 0) === 0
                          ? "Out of Stock"
                          : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Motion.main>
      <Footer />
    </div>
  );
}

export default ShopPage;
