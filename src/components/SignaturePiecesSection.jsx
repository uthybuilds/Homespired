import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { getCatalog } from "../utils/catalogStore.js";
import supabase from "../utils/supabaseClient.js";
import furnitureVideo from "../Furniture/furniture.mp4";
import artOne from "../Art/art1.jpeg";
import artTwo from "../Art/art2.jpeg";
import artThree from "../Art/art3.jpeg";
import artFour from "../Art/art 4.jpeg";
import artFive from "../Art/art 5.jpeg";

function SignaturePiecesSection() {
  const [catalog, setCatalog] = useState(() => getCatalog());
  const artImages = useMemo(
    () => [artOne, artTwo, artThree, artFour, artFive].filter(Boolean),
    [],
  );
  const [artActiveIndex, setArtActiveIndex] = useState(null);
  const [artLoadedIndices, setArtLoadedIndices] = useState([]);

  useEffect(() => {
    const hasCloudEnv = Boolean(
      import.meta.env.VITE_SUPABASE_URL &&
      import.meta.env.VITE_SUPABASE_ANON_KEY,
    );
    if (!hasCloudEnv) return;
    let isMounted = true;
    (async () => {
      const { data } = await supabase
        .from("catalog")
        .select("*")
        .order("created_at", { ascending: false });
      if (!isMounted) return;
      if (Array.isArray(data) && data.length > 0) {
        setCatalog(
          data.map((item) => ({
            id: item.id,
            name: item.name,
            price: Number(item.price || 0),
            category: item.category,
            image: item.image_url || item.image,
            description: item.description,
            inventory: Number(item.inventory || 0),
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
    const sync = () => {
      if (!isMounted) return;
      setCatalog(getCatalog());
    };
    sync();
    window.addEventListener("storage", sync);
    return () => {
      isMounted = false;
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    if (artImages.length === 0) return undefined;
    let isActive = true;
    artImages.forEach((src, index) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        if (!isActive) return;
        setArtLoadedIndices((prev) =>
          prev.includes(index) ? prev : [...prev, index],
        );
        setArtActiveIndex((prev) => (prev === null ? index : prev));
      };
    });
    return () => {
      isActive = false;
    };
  }, [artImages]);

  useEffect(() => {
    if (artLoadedIndices.length < 2 || artActiveIndex === null)
      return undefined;
    const timer = setInterval(() => {
      setArtActiveIndex((prev) => {
        if (prev === null) return artLoadedIndices[0];
        const currentPos = artLoadedIndices.indexOf(prev);
        const nextPos =
          currentPos === -1 ? 0 : (currentPos + 1) % artLoadedIndices.length;
        return artLoadedIndices[nextPos];
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [artActiveIndex, artLoadedIndices]);

  const normalizeCategory = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z]/g, "");

  const furnitureItems = useMemo(() => {
    return catalog.filter((item) => {
      const normalized = normalizeCategory(item.category);
      return normalized === "furniture" || normalized.startsWith("furn");
    });
  }, [catalog]);

  const featuredFurniture = furnitureItems.slice(0, 6);
  const artItems = useMemo(() => {
    return catalog.filter((item) => {
      const normalized = normalizeCategory(item.category);
      return normalized === "art" || normalized.startsWith("art");
    });
  }, [catalog]);
  const featuredArt = artItems.slice(0, 6);

  return (
    <section id="shop" className="bg-porcelain py-20 text-obsidian sm:py-24">
      <div className="flex w-full flex-col gap-10">
        <div className="w-full lg:px-6">
          <div className="relative w-full overflow-hidden bg-obsidian lg:mx-auto lg:max-w-6xl lg:rounded-3xl lg:border lg:border-obsidian">
            <video
              src={furnitureVideo}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/35" />
            <div className="relative z-10 mx-auto flex min-h-[52vh] w-full max-w-6xl flex-col items-center justify-center gap-6 px-6 py-12 text-center text-white sm:min-h-[60vh] sm:py-14">
              <p className="text-3xl font-semibold uppercase tracking-[0.25em] sm:text-5xl">
                Furniture
              </p>
              <NavLink
                to="/shop?category=Furniture"
                className="rounded-none bg-white px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-black transition"
              >
                Shop Now
              </NavLink>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl px-6">
          {featuredFurniture.length === 0 ? (
            <div className="rounded-3xl border border-ash/30 bg-linen p-10 text-center">
              <h2 className="text-2xl font-semibold">
                Furniture collection is coming soon.
              </h2>
              <p className="mt-3 text-sm text-ash">
                New pieces will appear here as the catalog is updated.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredFurniture.map((product) => (
                <article
                  key={product.id}
                  className="flex h-full flex-col overflow-hidden rounded-3xl border border-ash/30 bg-porcelain shadow-[0_24px_40px_rgba(0,0,0,0.06)]"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-56 w-full object-cover sm:h-64"
                  />
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <h3 className="text-lg font-semibold text-obsidian sm:text-xl">
                      {product.name}
                    </h3>
                    <p className="text-sm text-ash">{product.description}</p>
                    <p className="mt-auto text-sm font-semibold text-obsidian">
                      ₦{Number(product.price).toLocaleString()}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="w-full lg:px-6">
          <div className="relative w-full overflow-hidden bg-obsidian lg:mx-auto lg:max-w-6xl lg:rounded-3xl lg:border lg:border-obsidian">
            <div className="absolute inset-0">
              {artImages.map((src, index) => (
                <div
                  key={src}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    artActiveIndex === index ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {artLoadedIndices.includes(index) && src ? (
                    <img
                      src={src}
                      alt=""
                      loading={index === 0 ? "eager" : "lazy"}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
              ))}
              <div className="absolute inset-0 bg-black/35" />
            </div>
            <div className="relative z-10 mx-auto flex min-h-[52vh] w-full max-w-6xl flex-col items-center justify-center gap-6 px-6 py-12 text-center text-white sm:min-h-[60vh] sm:py-14">
              <p className="text-3xl font-semibold uppercase tracking-[0.25em] sm:text-5xl">
                Art
              </p>
              <NavLink
                to="/shop?category=Art"
                className="rounded-none bg-white px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-black transition"
              >
                Shop Now
              </NavLink>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl px-6">
          {featuredArt.length === 0 ? (
            <div className="rounded-3xl border border-ash/30 bg-linen p-10 text-center">
              <h2 className="text-2xl font-semibold">
                Art collection is coming soon.
              </h2>
              <p className="mt-3 text-sm text-ash">
                New pieces will appear here as the catalog is updated.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredArt.map((product) => (
                <article
                  key={product.id}
                  className="flex h-full flex-col overflow-hidden rounded-3xl border border-ash/30 bg-porcelain shadow-[0_24px_40px_rgba(0,0,0,0.06)]"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-56 w-full object-cover sm:h-64"
                  />
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <h3 className="text-lg font-semibold text-obsidian sm:text-xl">
                      {product.name}
                    </h3>
                    <p className="text-sm text-ash">{product.description}</p>
                    <p className="mt-auto text-sm font-semibold text-obsidian">
                      ₦{Number(product.price).toLocaleString()}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default SignaturePiecesSection;
