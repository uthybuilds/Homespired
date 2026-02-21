import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useToast } from "../components/useToast.js";
import { getCustomers, upsertCustomer } from "../utils/catalogStore.js";
import supabase from "../utils/supabaseClient.js";

function AccountPage() {
  const { pushToast } = useToast();
  const [sessionEmail, setSessionEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [addressForm, setAddressForm] = useState({
    address: "",
    city: "",
    state: "",
  });

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      const email = data?.session?.user?.email || "";
      setSessionEmail(email);
      if (!email) return;
      const customer = getCustomers().find(
        (entry) => entry.email?.toLowerCase() === email.toLowerCase(),
      );
      if (customer) {
        setAddressForm({
          address: customer.address || "",
          city: customer.city || "",
          state: customer.state || "",
        });
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddressChange = (field, value) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressSubmit = async (event) => {
    event.preventDefault();
    if (!sessionEmail) {
      pushToast({
        type: "error",
        message: "Sign in to update your delivery address.",
      });
      return;
    }
    setIsSaving(true);
    const existing = getCustomers().find(
      (entry) => entry.email?.toLowerCase() === sessionEmail.toLowerCase(),
    );
    upsertCustomer({
      name: existing?.name || "",
      email: sessionEmail,
      phone: existing?.phone || "",
      address: addressForm.address,
      city: addressForm.city,
      state: addressForm.state,
      lastOrderAt: existing?.lastOrderAt,
      createdAt: existing?.createdAt,
    });
    setIsSaving(false);
    pushToast({ type: "success", message: "Address updated." });
  };

  return (
    <div className="min-h-screen bg-porcelain text-obsidian">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-24 pt-32">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-ash">Account</p>
          <h1 className="text-4xl font-semibold sm:text-5xl">
            Manage your Homespired profile and preferences.
          </h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-3xl border border-ash/30 bg-linen p-6">
            <h2 className="text-xl font-semibold text-obsidian">
              Profile Details
            </h2>
            <p className="mt-2 text-sm text-ash">
              Update your name, email, and account credentials.
            </p>
            <NavLink
              to="/contact"
              className="mt-6 inline-flex rounded-none bg-obsidian px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-porcelain transition"
            >
              Contact Support
            </NavLink>
          </section>
          <section className="rounded-3xl border border-ash/30 bg-linen p-6">
            <h2 className="text-xl font-semibold text-obsidian">
              Delivery Addresses
            </h2>
            <p className="mt-2 text-sm text-ash">
              Save delivery details for signature pieces and styling kits.
            </p>
            <form onSubmit={handleAddressSubmit} className="mt-6 space-y-3">
              <input
                value={addressForm.address}
                onChange={(event) =>
                  handleAddressChange("address", event.target.value)
                }
                type="text"
                placeholder="Address"
                className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-2 text-sm text-obsidian focus:border-obsidian focus:outline-none"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={addressForm.city}
                  onChange={(event) =>
                    handleAddressChange("city", event.target.value)
                  }
                  type="text"
                  placeholder="City"
                  className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-2 text-sm text-obsidian focus:border-obsidian focus:outline-none"
                />
                <input
                  value={addressForm.state}
                  onChange={(event) =>
                    handleAddressChange("state", event.target.value)
                  }
                  type="text"
                  placeholder="State"
                  className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-2 text-sm text-obsidian focus:border-obsidian focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex rounded-none border border-ash px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-obsidian transition disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? "Saving..." : "Update Address"}
              </button>
            </form>
          </section>
          <section className="rounded-3xl border border-ash/30 bg-linen p-6">
            <h2 className="text-xl font-semibold text-obsidian">
              Concierge Access
            </h2>
            <p className="mt-2 text-sm text-ash">
              Request private styling guidance and priority appointment slots.
            </p>
            <NavLink
              to="/consultations"
              className="mt-6 inline-flex rounded-none border border-ash px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-obsidian transition"
            >
              Book Consultation
            </NavLink>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default AccountPage;
