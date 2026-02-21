import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useToast } from "../components/useToast.js";
import supabase, { invokeEdgeFunction } from "../utils/supabaseClient.js";
import {
  addOrder,
  adjustInventory,
  clearCart,
  findActiveDiscount,
  getCart,
  getCustomers,
  getLastKnownEmail,
  getSettings,
  getNextOrderNumber,
  normalizeWhatsAppNumber,
  setLastKnownEmail,
  trackAnalytics,
  upsertCustomer,
  nextCounter,
} from "../utils/catalogStore.js";

function CheckoutPage() {
  const { pushToast } = useToast();
  const [items, setItems] = useState(() => getCart());
  const [settings, setSettings] = useState(() => getSettings());
  const [shippingZone, setShippingZone] = useState(
    () => getSettings().shippingZones?.[0]?.id || "",
  );
  const [form, setForm] = useState(() => {
    const email = getLastKnownEmail();
    const customer = email
      ? getCustomers().find(
          (entry) => entry.email?.toLowerCase() === email.toLowerCase(),
        )
      : null;
    return {
      name: customer?.name || "",
      email,
      phone: customer?.phone || "",
      address: customer?.address || "",
      city: customer?.city || "",
      state: customer?.state || "",
      notes: "",
    };
  });
  // removed delivery date/time inputs per requirement
  const [proof, setProof] = useState(null);
  const [proofName, setProofName] = useState("");
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [discountCode, setDiscountCode] = useState("");
  const disableRedirect = import.meta.env.VITE_E2E_DISABLE_REDIRECT === "true";

  useEffect(() => {
    const isCloud = import.meta.env.VITE_STORAGE_MODE === "cloud";
    if (!isCloud) return;
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const email = data?.session?.user?.email || "";
      if (!mounted || !email) return;
      if (!form.email) {
        setForm((prev) => ({ ...prev, email }));
      }
      setLastKnownEmail(email);
    })();
    return () => {
      mounted = false;
    };
  }, [form.email]);

  useEffect(() => {
    const isCloud = import.meta.env.VITE_STORAGE_MODE === "cloud";
    const email = form.email?.trim();
    const shouldFetch =
      isCloud &&
      email &&
      email.includes("@") &&
      (!form.name || !form.phone || !form.address || !form.city || !form.state);
    let active = true;
    (async () => {
      if (!shouldFetch) return;
      try {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", email.toLowerCase())
          .maybeSingle();
        if (active && data) {
          setForm((prev) => ({
            ...prev,
            name: prev.name || data.name || "",
            phone: prev.phone || data.phone || "",
            address: prev.address || data.address || "",
            city: prev.city || data.city || "",
            state: prev.state || data.state || "",
          }));
          return;
        }
        const { data: cust } = await supabase
          .from("customers")
          .select("*")
          .eq("email", email.toLowerCase())
          .maybeSingle();
        if (!active || !cust) return;
        setForm((prev) => ({
          ...prev,
          name: prev.name || cust.name || "",
          phone: prev.phone || cust.phone || "",
          address: prev.address || cust.address || "",
          city: prev.city || cust.city || "",
          state: prev.state || cust.state || "",
        }));
      } catch (e) {
        void e;
      }
    })();
    return () => {
      active = false;
    };
  }, [form.address, form.city, form.email, form.name, form.phone, form.state]);

  useEffect(() => {
    const isCloud = import.meta.env.VITE_STORAGE_MODE === "cloud";
    if (!isCloud) return;
    const syncFromCustomers = () => {
      const email = form.email?.trim().toLowerCase();
      if (!email) return;
      const customer = getCustomers().find(
        (entry) => entry.email?.toLowerCase() === email,
      );
      if (!customer) return;
      setForm((prev) => ({
        ...prev,
        name: prev.name || customer.name || "",
        phone: prev.phone || customer.phone || "",
        address: prev.address || customer.address || "",
        city: prev.city || customer.city || "",
        state: prev.state || customer.state || "",
      }));
    };
    window.addEventListener("storage", syncFromCustomers);
    return () => {
      window.removeEventListener("storage", syncFromCustomers);
    };
  }, [form.email]);

  useEffect(() => {
    const isCloud = import.meta.env.VITE_STORAGE_MODE === "cloud";
    const email = form.email?.trim();
    if (!isCloud || !email || !email.includes("@")) return;
    const handle = window.setTimeout(() => {
      const payload = {
        name: form.name || "",
        email,
        phone: form.phone || "",
        address: form.address || "",
        city: form.city || "",
        state: form.state || "",
      };
      upsertCustomer(payload);
    }, 800);
    return () => window.clearTimeout(handle);
  }, [form.name, form.phone, form.address, form.city, form.state, form.email]);

  useEffect(() => {
    const sync = () => setSettings(getSettings());
    window.addEventListener("settings-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("settings-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const autoZone = useMemo(() => {
    const state = form.state.trim().toLowerCase();
    const city = form.city.trim().toLowerCase();
    if (!state && !city) return "";
    if (state && !state.includes("lagos")) {
      return "outside-lagos";
    }
    if (city.includes("island")) return "lagos-island";
    if (city.includes("mainland")) return "lagos-mainland";
    if (state.includes("lagos")) return "lagos-mainland";
    return "";
  }, [form.city, form.state]);

  const total = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );
  }, [items]);

  const effectiveZone = autoZone || shippingZone;

  const shippingCost = useMemo(() => {
    const zone = settings.shippingZones.find(
      (item) => item.id === effectiveZone,
    );
    return zone ? Number(zone.price) : 0;
  }, [settings, effectiveZone]);

  const activeDiscount = useMemo(
    () => findActiveDiscount(discountCode.trim()),
    [discountCode],
  );
  const discountAmount = useMemo(() => {
    if (!activeDiscount) return 0;
    if (activeDiscount.minSubtotal && total < activeDiscount.minSubtotal) {
      return 0;
    }
    if (activeDiscount.type === "percent") {
      return Math.round((total * activeDiscount.value) / 100);
    }
    if (activeDiscount.type === "fixed") {
      return Math.round(activeDiscount.value);
    }
    return 0;
  }, [activeDiscount, total]);
  const grandTotal = Math.max(0, total + shippingCost - discountAmount);

  const handleFormChange = (field, value) => {
    if (field !== "email") {
      setForm((prev) => ({ ...prev, [field]: value }));
      return;
    }
    const email = value.trim().toLowerCase();
    const customer = email
      ? getCustomers().find((entry) => entry.email?.toLowerCase() === email)
      : null;
    if (value) {
      setLastKnownEmail(value);
    }
    setForm((prev) => ({
      ...prev,
      email: value,
      name: customer?.name || prev.name,
      phone: customer?.phone || prev.phone,
      address: customer?.address || prev.address,
      city: customer?.city || prev.city,
      state: customer?.state || prev.state,
    }));
  };

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Image encoding failed."));
      reader.readAsDataURL(file);
    });

  const uploadViaSupabase = async (file) => {
    const dataUrl = await readFileAsDataUrl(file);
    const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!match) return "";
    const [, contentType, base64] = match;
    const filename = file?.name || `proof-${Date.now()}.jpg`;
    const { data, error } = await invokeEdgeFunction("upload-proof", {
      filename,
      contentType,
      base64,
    });
    if (error || !data?.url) return "";
    return data.url;
  };

  const uploadToCloudinary = async (file, includeFolder) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      return "";
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    if (includeFolder) {
      formData.append("folder", "homespired-orders");
    }
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData },
    );
    const data = await response.json().catch(() => ({}));
    if (!data?.error && response.ok && data?.secure_url) {
      return data.secure_url;
    }
    return "";
  };

  const uploadProof = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    if (cloudName && uploadPreset) {
      try {
        const withFolder = await uploadToCloudinary(file, true);
        if (withFolder) return withFolder;
        const withoutFolder = await uploadToCloudinary(file, false);
        if (withoutFolder) return withoutFolder;
      } catch {
        return await uploadViaSupabase(file);
      }
    }
    return await uploadViaSupabase(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const whatsappNumber = normalizeWhatsAppNumber(settings.whatsappNumber);
    if (!whatsappNumber) {
      pushToast({
        type: "error",
        message: "Add a WhatsApp number in admin settings to continue.",
      });
      return;
    }
    if (
      !settings.bankName ||
      !settings.accountName ||
      !settings.accountNumber
    ) {
      pushToast({
        type: "error",
        message: "Complete bank details in admin settings to continue.",
      });
      return;
    }
    if (!proof) {
      pushToast({
        type: "error",
        message: "Upload your payment proof to continue.",
      });
      return;
    }
    try {
      setStatus({ type: "loading", message: "" });
      const proofUrl = await uploadProof(proof);
      if (!proofUrl) {
        throw new Error("Payment proof upload failed. Please try again.");
      }
      const isCloud =
        import.meta.env.VITE_STORAGE_MODE === "cloud" &&
        import.meta.env.VITE_E2E_BYPASS_AUTH !== "true";
      const orderNumber = isCloud
        ? await nextCounter("order")
        : getNextOrderNumber();
      const orderId = `order-${Date.now()}`;
      const itemsLines = items.map(
        (item) =>
          `- ${item.name} x${item.quantity} — ₦${(
            Number(item.price) * item.quantity
          ).toLocaleString()}`,
      );
      const zoneLabel =
        settings.shippingZones.find((zone) => zone.id === shippingZone)
          ?.label || "";
      const messageLines = [
        "HOMESPIRED STUDIO",
        `Order ${orderNumber}`,
        "",
        "Customer",
        `Name: ${form.name}`,
        `Phone: ${form.phone}`,
        `Email: ${form.email}`,
        `Address: ${form.address}`,
        zoneLabel ? `Delivery Zone: ${zoneLabel}` : null,
        "",
        "Order Details",
        ...itemsLines,
        "",
        "Charges",
        `Subtotal: ₦${total.toLocaleString()}`,
        `Shipping${zoneLabel ? ` (${zoneLabel})` : ""}: ₦${shippingCost.toLocaleString()}`,
        discountAmount
          ? `Discount: -₦${discountAmount.toLocaleString()}`
          : null,
        `Total Paid: ₦${grandTotal.toLocaleString()}`,
        "",
        `Payment Proof: ${proofUrl}`,
        null,
        null,
        form.notes ? `Notes: ${form.notes}` : null,
      ].filter((line) => line !== null && line !== undefined);
      addOrder({
        id: orderId,
        number: orderNumber,
        label: `Order ${orderNumber}`,
        status: "Pending",
        items,
        subtotal: total,
        shipping: shippingCost,
        discountCode: activeDiscount?.code || "",
        discountAmount,
        total: grandTotal,
        zoneId: shippingZone,
        zoneLabel,
        proofUrl,
        deliveryDate: "",
        deliveryTime: "",
        customer: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          state: form.state,
        },
        createdAt: Date.now(),
      });
      adjustInventory(items, "decrease");
      clearCart();
      setItems([]);
      trackAnalytics("checkouts");
      upsertCustomer({
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        lastOrderAt: Date.now(),
      });
      const message = messageLines.join("\n");
      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        message,
      )}`;
      setStatus({ type: "idle", message: "" });
      pushToast({
        type: "success",
        message: "Order placed. We will confirm shortly.",
      });
      setForm({
        name: "",
        email: form.email,
        phone: "",
        address: "",
        city: "",
        state: "",
        notes: "",
      });
      setProof(null);
      setProofName("");
      setDiscountCode("");
      if (disableRedirect) {
        window.__e2eLastRedirect = url;
        return;
      }
      window.location.href = url;
    } catch (error) {
      setStatus({ type: "idle", message: "" });
      pushToast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Payment proof upload failed. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-linen text-obsidian">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-24 pt-32">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-ash">
            Checkout
          </p>
          <h1 className="text-4xl font-semibold sm:text-5xl">
            Complete your purchase with ease.
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-ash/30 bg-porcelain p-10 text-center">
            <h2 className="text-2xl font-semibold">Your cart is empty.</h2>
            <p className="mt-3 text-sm text-ash">
              Add signature pieces before continuing to checkout.
            </p>
            <NavLink
              to="/shop"
              className="mt-6 inline-flex rounded-none bg-obsidian px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-porcelain transition"
            >
              Visit Store
            </NavLink>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-ash/30 bg-porcelain p-8 shadow-[0_24px_40px_rgba(0,0,0,0.06)]"
            >
              <h2 className="text-xl font-semibold text-obsidian">
                Delivery Details
              </h2>
              <div className="mt-6 space-y-4 max-w-lg mx-auto">
                <input
                  value={form.name}
                  onChange={(event) =>
                    handleFormChange("name", event.target.value)
                  }
                  type="text"
                  placeholder="Full name"
                  required
                  className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian focus:border-obsidian focus:outline-none"
                />
                <input
                  value={form.email}
                  onChange={(event) =>
                    handleFormChange("email", event.target.value)
                  }
                  type="email"
                  placeholder="Email address"
                  required
                  className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian focus:border-obsidian focus:outline-none"
                />
                <input
                  value={form.phone}
                  onChange={(event) =>
                    handleFormChange("phone", event.target.value)
                  }
                  type="text"
                  placeholder="Phone number"
                  required
                  className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian focus:border-obsidian focus:outline-none"
                />
                <input
                  value={form.address}
                  onChange={(event) =>
                    handleFormChange("address", event.target.value)
                  }
                  type="text"
                  placeholder="Delivery address"
                  required
                  className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian focus:border-obsidian focus:outline-none"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    value={form.city}
                    onChange={(event) =>
                      handleFormChange("city", event.target.value)
                    }
                    type="text"
                    placeholder="City"
                    className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian focus:border-obsidian focus:outline-none"
                  />
                  <input
                    value={form.state}
                    onChange={(event) =>
                      handleFormChange("state", event.target.value)
                    }
                    type="text"
                    placeholder="State"
                    className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian focus:border-obsidian focus:outline-none"
                  />
                </div>
                <select
                  value={effectiveZone}
                  onChange={(event) => setShippingZone(event.target.value)}
                  disabled={Boolean(autoZone)}
                  className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian focus:border-obsidian focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {settings.shippingZones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.label} - ₦{Number(zone.price).toLocaleString()}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-ash">
                  {autoZone
                    ? "Delivery fee is set from your city or state."
                    : "Select the delivery zone that matches your address."}
                </p>
                <textarea
                  value={form.notes}
                  onChange={(event) =>
                    handleFormChange("notes", event.target.value)
                  }
                  rows="3"
                  placeholder="Delivery notes"
                  className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian focus:border-obsidian focus:outline-none"
                />
                <div className="rounded-2xl border border-dashed border-ash/40 bg-white/70 px-4 py-4">
                  <p className="mb-2 text-xs uppercase tracking-[0.3em] text-ash">
                    Upload proof of payment
                  </p>
                  <label
                    htmlFor="checkout-proof-upload"
                    className="flex w-full cursor-pointer items-center justify-between rounded-2xl border border-ash/40 bg-white/80 px-4 py-3 text-sm text-obsidian"
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {proofName || "Tap to upload proof"}
                    </span>
                    <span className="text-xs uppercase tracking-[0.2em] text-ash">
                      Upload
                    </span>
                  </label>
                  <input
                    id="checkout-proof-upload"
                    type="file"
                    accept="image/*"
                    required
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      setProof(file);
                      setProofName(file?.name || "");
                    }}
                    className="sr-only"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={status.type === "loading"}
                className="mt-6 w-full rounded-none bg-obsidian px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-porcelain transition disabled:cursor-not-allowed disabled:opacity-70"
              >
                {status.type === "loading"
                  ? "Uploading Proof..."
                  : "Confirm Payment via WhatsApp"}
              </button>
            </form>

            <div className="rounded-3xl border border-ash/30 bg-porcelain p-6">
              <h2 className="text-xl font-semibold text-obsidian">
                Order Summary
              </h2>
              <div className="mt-4 space-y-3 text-sm text-ash">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between"
                  >
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>
                      ₦{(Number(item.price) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between text-sm font-semibold text-obsidian">
                <span>Subtotal</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-ash">
                <span>Shipping</span>
                <span>₦{shippingCost.toLocaleString()}</span>
              </div>
              {activeDiscount ? (
                <div className="mt-2 flex items-center justify-between text-sm text-ash">
                  <span>
                    Discount{" "}
                    {activeDiscount.minSubtotal &&
                    total < activeDiscount.minSubtotal
                      ? "(Minimum not met)"
                      : `(${activeDiscount.code})`}
                  </span>
                  <span>
                    {discountAmount
                      ? `-₦${discountAmount.toLocaleString()}`
                      : "₦0"}
                  </span>
                </div>
              ) : null}
              <div className="mt-3 flex items-center justify-between text-sm font-semibold text-obsidian">
                <span>Total</span>
                <span>₦{grandTotal.toLocaleString()}</span>
              </div>
              <div className="mt-4 space-y-2">
                <input
                  value={discountCode}
                  onChange={(event) => setDiscountCode(event.target.value)}
                  type="text"
                  placeholder="Discount code"
                  className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-2 text-sm text-obsidian focus:border-obsidian focus:outline-none"
                />
                {discountCode && !activeDiscount ? (
                  <p className="text-xs text-red-600">
                    Invalid or inactive discount code.
                  </p>
                ) : null}
                {activeDiscount &&
                activeDiscount.minSubtotal &&
                total < activeDiscount.minSubtotal ? (
                  <p className="text-xs text-ash">
                    Minimum subtotal ₦
                    {Number(activeDiscount.minSubtotal).toLocaleString()}{" "}
                    required.
                  </p>
                ) : null}
              </div>
              <p className="mt-3 text-xs text-ash">
                Transfer the total to the account below, then upload proof.
              </p>
              <div className="mt-4 rounded-2xl border border-ash/30 bg-linen p-4 text-sm text-obsidian">
                <p className="text-xs uppercase tracking-[0.3em] text-ash">
                  Bank Details
                </p>
                <div className="mt-3 space-y-1">
                  {settings.bankName &&
                  settings.accountName &&
                  settings.accountNumber ? (
                    <>
                      <p>{settings.bankName}</p>
                      <p>{settings.accountName}</p>
                      <p>{settings.accountNumber}</p>
                    </>
                  ) : (
                    <p className="text-sm text-ash">
                      Bank details will appear once they are saved in the admin
                      settings.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default CheckoutPage;
