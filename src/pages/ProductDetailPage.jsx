import { useMemo, useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import {
  addReview,
  addToCart,
  getCatalog,
  getProductReviews,
} from "../utils/catalogStore.js";

function ProductDetailPage() {
  const { productId } = useParams();
  const catalog = useMemo(() => getCatalog(), []);
  const product = catalog.find((item) => item.id === productId);
  const [reviews, setReviews] = useState(() => getProductReviews(productId));
  const [reviewForm, setReviewForm] = useState({
    name: "",
    rating: 5,
    comment: "",
  });

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  }, [reviews]);

  if (!product) {
    return (
      <div className="min-h-screen bg-porcelain text-obsidian">
        <Navbar />
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-24 pt-32">
          <h1 className="text-4xl font-semibold sm:text-5xl">
            Product not found.
          </h1>
          <p className="max-w-2xl text-base text-ash sm:text-lg">
            This piece may have been removed or is no longer available.
          </p>
          <NavLink
            to="/shop"
            className="inline-flex rounded-full bg-obsidian px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-porcelain transition"
          >
            Back to Store
          </NavLink>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-porcelain text-obsidian">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-24 pt-32">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <img
            src={product.image}
            alt={product.name}
            className="h-105 w-full rounded-3xl object-cover"
          />
          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.3em] text-ash">
              {product.category}
            </p>
            <h1 className="text-4xl font-semibold sm:text-5xl">
              {product.name}
            </h1>
            <p className="text-base text-ash sm:text-lg">
              {product.description}
            </p>
            <p className="text-sm font-semibold text-obsidian">
              ₦{Number(product.price).toLocaleString()}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => addToCart(product)}
                disabled={Number(product.inventory || 0) === 0}
                className="rounded-full bg-obsidian px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-porcelain transition"
              >
                {Number(product.inventory || 0) === 0
                  ? "Out of Stock"
                  : "Add to Cart"}
              </button>
              <NavLink
                to="/checkout"
                className="rounded-full border border-ash px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-obsidian transition"
              >
                Buy Now
              </NavLink>
            </div>
            <div className="rounded-3xl border border-ash/30 bg-linen p-6 text-sm text-ash">
              Inventory: {product.inventory || 0} · Delivered with white‑glove
              care and curated styling guidance.
            </div>
            <div className="rounded-3xl border border-ash/30 bg-linen p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-ash">
                    Reviews
                  </p>
                  <p className="mt-2 text-sm text-ash">
                    {reviews.length === 0
                      ? "No reviews yet."
                      : `${averageRating.toFixed(1)} average · ${reviews.length} review${
                          reviews.length === 1 ? "" : "s"
                        }`}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-3">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-2xl border border-ash/30 bg-porcelain p-4"
                  >
                    <div className="flex items-center justify-between text-xs text-ash">
                      <span>{review.name}</span>
                      <span>{review.rating} / 5</span>
                    </div>
                    <p className="mt-2 text-sm text-obsidian">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
              <form
                className="mt-6 space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!reviewForm.name || !reviewForm.comment) return;
                  const next = addReview({
                    id: `${Date.now()}`,
                    productId,
                    name: reviewForm.name.trim(),
                    rating: Number(reviewForm.rating),
                    comment: reviewForm.comment.trim(),
                    createdAt: Date.now(),
                  });
                  setReviews(
                    next.filter((review) => review.productId === productId),
                  );
                  setReviewForm({ name: "", rating: 5, comment: "" });
                }}
              >
                <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
                  <input
                    value={reviewForm.name}
                    onChange={(event) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                    type="text"
                    placeholder="Your name"
                    className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-2 text-sm text-obsidian focus:border-obsidian focus:outline-none"
                  />
                  <select
                    value={reviewForm.rating}
                    onChange={(event) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        rating: Number(event.target.value),
                      }))
                    }
                    className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-2 text-sm text-obsidian focus:border-obsidian focus:outline-none"
                  >
                    {[5, 4, 3, 2, 1].map((value) => (
                      <option key={value} value={value}>
                        {value} Stars
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={reviewForm.comment}
                  onChange={(event) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      comment: event.target.value,
                    }))
                  }
                  rows="3"
                  placeholder="Share your experience"
                  className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-2 text-sm text-obsidian focus:border-obsidian focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-full bg-obsidian px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-porcelain transition"
                >
                  Post Review
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ProductDetailPage;
