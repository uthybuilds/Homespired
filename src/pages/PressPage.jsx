import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

const pressMentions = [
  {
    outlet: "Elle Decor Nigeria",
    title: "A Lagos residence that redefines quiet luxury",
    date: "June 2025",
  },
  {
    outlet: "Design Indaba",
    title: "The rise of sculptural interiors in West Africa",
    date: "November 2024",
  },
  {
    outlet: "Architectural Digest",
    title: "Homespired’s layered approach to modern living",
    date: "March 2024",
  },
];

function PressPage() {
  return (
    <div className="min-h-screen bg-linen text-obsidian">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-24 pt-32">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-ash">Press</p>
          <h1 className="text-4xl font-semibold sm:text-5xl">
            Editorial features and global recognition.
          </h1>
          <p className="max-w-2xl text-base text-ash sm:text-lg">
            Homespired projects have been featured for their refined approach to
            materiality, lighting, and calm modern luxury.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {pressMentions.map((press) => (
            <article
              key={press.title}
              className="rounded-3xl border border-ash/30 bg-porcelain p-6 shadow-[0_24px_40px_rgba(0,0,0,0.06)]"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-ash">
                {press.outlet}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-obsidian">
                {press.title}
              </h2>
              <p className="mt-3 text-sm text-ash">{press.date}</p>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default PressPage;
