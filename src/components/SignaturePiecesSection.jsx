import { NavLink } from "react-router-dom";

const pieces = [
  {
    title: "Signature Styling",
    description:
      "Tailored composition, layered textures, and sculptural silhouettes for a refined finish.",
    detail:
      "Includes styling edit, final placement, and photography-ready setup.",
  },
  {
    title: "Furniture Procurement",
    description:
      "Curated sourcing, delivery coordination, and final placement for cohesion.",
    detail: "Access to trade partners, bespoke pieces, and artisan finishes.",
  },
  {
    title: "Art & Accessories",
    description:
      "Statement art curation, custom objects, and subtle luxury accents.",
    detail: "Framing guidance, palette mapping, and seasonal refresh options.",
  },
];

function SignaturePiecesSection() {
  return (
    <section id="signature" className="bg-linen py-24 text-obsidian">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-ash">
              Signature Pieces
            </p>
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Curated pieces and styling that elevate every room with intention.
            </h2>
            <p className="text-base text-ash sm:text-lg">
              Each collection is aligned with the Homespired palette, ensuring
              materials and silhouettes feel cohesive across the home.
            </p>
          </div>
          <div className="flex gap-3">
            <NavLink
              to="/shop"
              className="rounded-full border border-ash px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-obsidian transition"
            >
              Explore Collections
            </NavLink>
            <NavLink
              to="/advisory"
              className="rounded-full bg-obsidian px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-porcelain transition"
            >
              Request Styling
            </NavLink>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {pieces.map((piece) => (
            <div
              key={piece.title}
              className="rounded-3xl border border-ash/30 bg-porcelain p-6 shadow-[0_24px_40px_rgba(0,0,0,0.06)]"
            >
              <h3 className="text-xl font-semibold text-obsidian">
                {piece.title}
              </h3>
              <p className="mt-3 text-sm text-ash">{piece.description}</p>
              <p className="mt-3 text-sm text-ash">{piece.detail}</p>
              <NavLink
                to="/shop"
                className="mt-6 inline-flex rounded-full border border-ash px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-obsidian transition"
              >
                View Collection
              </NavLink>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SignaturePiecesSection;
