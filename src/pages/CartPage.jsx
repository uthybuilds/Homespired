import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import {
  clearCart,
  getCart,
  isCartAbandoned,
  removeFromCart,
  updateCartQuantity,
} from "../utils/catalogStore.js";

function CartPage() {
  const [items, setItems] = useState(() => getCart());
  const isAbandoned = isCartAbandoned();

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );
  }, [items]);

  const handleQuantity = (id, value) => {
    setItems(updateCartQuantity(id, value));
  };

  const handleRemove = (id) => {
    setItems(removeFromCart(id));
  };

  return (
    <div className="min-h-screen bg-porcelain text-obsidian">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-24 pt-32">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-ash">Cart</p>
          <h1 className="text-4xl font-semibold sm:text-5xl">
            Review your curated selections.
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-ash/30 bg-linen p-10 text-center">
            <h2 className="text-2xl font-semibold">Your cart is empty.</h2>
            <p className="mt-3 text-sm text-ash">
              Browse the signature store to add curated pieces.
            </p>
            <NavLink
              to="/shop"
              className="mt-6 inline-flex rounded-full bg-obsidian px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-porcelain transition"
            >
              Explore Store
            </NavLink>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              {isAbandoned ? (
                <div className="rounded-2xl border border-ash/30 bg-porcelain px-4 py-3 text-sm text-ash">
                  You left items in your cart. Complete your order to reserve
                  your pieces.
                </div>
              ) : null}
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 rounded-3xl border border-ash/30 bg-linen p-6 sm:flex-row sm:items-center"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-24 w-24 rounded-2xl object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-obsidian">
                      {item.name}
                    </p>
                    <p className="mt-1 text-xs text-ash">{item.category}</p>
                    <p className="mt-2 text-sm text-ash">
                      ₦{Number(item.price).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(event) =>
                        handleQuantity(item.id, Number(event.target.value))
                      }
                      className="w-20 rounded-2xl border border-ash/40 bg-white/70 px-3 py-2 text-sm text-obsidian focus:border-obsidian focus:outline-none"
                    />
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="rounded-full border border-ash px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-obsidian transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-3xl border border-ash/30 bg-porcelain p-6">
              <h2 className="text-xl font-semibold text-obsidian">Summary</h2>
              <div className="mt-4 flex items-center justify-between text-sm text-ash">
                <span>Subtotal</span>
                <span>₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-ash">
                <span>Delivery</span>
                <span>Calculated at checkout</span>
              </div>
              <NavLink
                to="/checkout"
                className="mt-6 flex w-full items-center justify-center rounded-full bg-obsidian px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-porcelain transition"
              >
                Continue to Checkout
              </NavLink>
              <button
                type="button"
                onClick={() => setItems(clearCart())}
                className="mt-3 flex w-full items-center justify-center rounded-full border border-ash px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-obsidian transition"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default CartPage;
