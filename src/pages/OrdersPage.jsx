import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { getOrders } from "../utils/catalogStore.js";
import supabase from "../utils/supabaseClient.js";

function OrdersPage() {
  const bypassAuth = import.meta.env.VITE_E2E_BYPASS_AUTH === "true";
  const testEmail = import.meta.env.VITE_E2E_TEST_EMAIL || "test@example.com";
  const [session, setSession] = useState(() =>
    bypassAuth ? { user: { email: testEmail } } : null,
  );

  useEffect(() => {
    if (bypassAuth) {
      return undefined;
    }
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
  }, [bypassAuth]);

  const orders = useMemo(() => {
    const allOrders = getOrders();
    const email = session?.user?.email?.toLowerCase() || "";
    return email
      ? allOrders.filter(
          (order) => order.customer?.email?.toLowerCase() === email,
        )
      : [];
  }, [session]);

  return (
    <div className="min-h-screen bg-linen text-obsidian">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-24 pt-32">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-ash">Orders</p>
          <h1 className="text-4xl font-semibold sm:text-5xl">
            Track your signature pieces and styling kits.
          </h1>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-3xl border border-ash/30 bg-porcelain p-10 text-center">
            <h2 className="text-2xl font-semibold">No orders yet.</h2>
            <p className="mt-3 text-sm text-ash">
              When you purchase a signature piece, it will appear here.
            </p>
            <NavLink
              to="/shop"
              className="mt-6 inline-flex rounded-none bg-obsidian px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-porcelain transition"
            >
              Visit the Store
            </NavLink>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col gap-4 rounded-3xl border border-ash/30 bg-porcelain p-6 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-ash">
                    {order.label}
                  </p>
                  <p className="mt-2 text-sm text-ash">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : ""}
                  </p>
                </div>
                <p className="text-sm font-semibold text-obsidian">
                  {order.status}
                </p>
                <p className="text-sm text-ash">
                  ₦{Number(order.total || 0).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default OrdersPage;
