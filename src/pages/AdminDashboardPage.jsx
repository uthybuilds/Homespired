import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import {
  addDiscount,
  addCatalogItem,
  adjustInventory,
  defaultSettings,
  getAnalytics,
  getCatalog,
  getCustomers,
  getDiscounts,
  getOrders,
  getRequests,
  getSettings,
  removeCatalogItem,
  removeDiscount,
  saveSettings,
  updateRequest,
  updateDiscount,
  updateOrder,
} from "../utils/catalogStore.js";
import { invokeEdgeFunction } from "../utils/supabaseClient.js";

const categories = [
  "Furniture",
  "Lighting",
  "Textiles",
  "Art",
  "Styling Kits",
  "Custom Commissions",
];

const initialForm = {
  name: "",
  price: "",
  category: categories[0],
  imageUrl: "",
  imageData: "",
  description: "",
  inventory: "",
};

function AdminDashboardPage() {
  const [catalog, setCatalog] = useState(() => getCatalog());
  const [orders, setOrders] = useState(() => getOrders());
  const [requests, setRequests] = useState(() => getRequests());
  const [customers, setCustomers] = useState(() => getCustomers());
  const [discounts, setDiscounts] = useState(() => getDiscounts());
  const [analytics, setAnalytics] = useState(() => getAnalytics());
  const [form, setForm] = useState(initialForm);
  const [settings, setSettings] = useState(() => getSettings());
  const [savedSettings, setSavedSettings] = useState(() => getSettings());
  const [settingsStatus, setSettingsStatus] = useState({
    type: "idle",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageStatus, setImageStatus] = useState({
    type: "idle",
    message: "",
  });
  const [discountForm, setDiscountForm] = useState({
    code: "",
    type: "percent",
    value: "",
    minSubtotal: "",
    expiresAt: "",
    active: true,
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const optimizeImage = (file) =>
    new Promise((resolve, reject) => {
      const MAX_DIMENSION = 1600;
      const MAX_FILE_SIZE = 1200 * 1024;
      const START_QUALITY = 0.8;
      const MIN_QUALITY = 0.5;
      const image = new Image();
      const objectUrl = URL.createObjectURL(file);

      const blobToDataUrl = (blob) =>
        new Promise((done, fail) => {
          const reader = new FileReader();
          reader.onload = () => done(reader.result);
          reader.onerror = () => fail(new Error("Image encoding failed."));
          reader.readAsDataURL(blob);
        });

      image.onload = async () => {
        const ratio = Math.min(
          1,
          MAX_DIMENSION / Math.max(image.width, image.height),
        );
        const width = Math.max(1, Math.round(image.width * ratio));
        const height = Math.max(1, Math.round(image.height * ratio));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Image processing failed."));
          return;
        }
        ctx.drawImage(image, 0, 0, width, height);
        let quality = START_QUALITY;
        const makeBlob = () =>
          new Promise((done) => canvas.toBlob(done, "image/jpeg", quality));
        let blob = await makeBlob();
        while (blob && blob.size > MAX_FILE_SIZE && quality > MIN_QUALITY) {
          quality = Math.max(MIN_QUALITY, quality - 0.08);
          blob = await makeBlob();
        }
        if (!blob) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Image processing failed."));
          return;
        }
        try {
          const dataUrl = await blobToDataUrl(blob);
          URL.revokeObjectURL(objectUrl);
          resolve({
            dataUrl,
            width,
            height,
            size: blob.size,
          });
        } catch (error) {
          URL.revokeObjectURL(objectUrl);
          reject(error);
        }
      };
      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Image load failed."));
      };
      image.src = objectUrl;
    });

  const handleImageFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageStatus({ type: "loading", message: "Optimizing image..." });
    try {
      const result = await optimizeImage(file);
      setForm((prev) => ({
        ...prev,
        imageData: result.dataUrl,
        imageUrl: "",
      }));
      setImageStatus({
        type: "success",
        message: `Saved ${Math.round(result.width)}×${Math.round(
          result.height,
        )} at ${Math.round(result.size / 1024)}KB.`,
      });
    } catch (error) {
      setImageStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Upload failed.",
      });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const resolvedImage = form.imageData || form.imageUrl.trim();
    const nextItem = {
      id: `${Date.now()}`,
      name: form.name.trim(),
      price: Number(form.price),
      category: form.category,
      image: resolvedImage,
      description: form.description.trim(),
      inventory: Number(form.inventory || 0),
    };
    if (!nextItem.name || !nextItem.price || !nextItem.image) {
      setIsSubmitting(false);
      return;
    }
    setCatalog(addCatalogItem(nextItem));
    setForm(initialForm);
    setImageStatus({ type: "idle", message: "" });
    setIsSubmitting(false);
  };

  const handleRemove = (id) => {
    setCatalog(removeCatalogItem(id));
  };

  const settingsErrors = useMemo(() => {
    const whatsapp = settings.whatsappNumber.trim();
    const bankName = settings.bankName.trim();
    const accountName = settings.accountName.trim();
    const accountNumber = settings.accountNumber.trim();
    const whatsappValid = /^\d{10,15}$/.test(whatsapp);
    const accountNumberValid = /^\d{10}$/.test(accountNumber);
    return {
      whatsappNumber: !whatsapp
        ? "WhatsApp number is required."
        : whatsappValid
          ? ""
          : "Use digits only, 10–15 characters.",
      bankName: bankName ? "" : "Bank name is required.",
      accountName: accountName ? "" : "Account name is required.",
      accountNumber: !accountNumber
        ? "Account number is required."
        : accountNumberValid
          ? ""
          : "Account number must be 10 digits.",
    };
  }, [
    settings.accountName,
    settings.accountNumber,
    settings.bankName,
    settings.whatsappNumber,
  ]);

  const hasSettingsErrors = Object.values(settingsErrors).some(Boolean);

  const handleSettingChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setSettingsStatus({ type: "idle", message: "" });
  };

  const updateInspectionPrice = (id, price) => {
    setSettings((prev) => ({
      ...prev,
      inspectionOptions: prev.inspectionOptions.map((option) =>
        option.id === id ? { ...option, price: Number(price) } : option,
      ),
    }));
    setSettingsStatus({ type: "idle", message: "" });
  };

  const updateConsultationPrice = (id, price) => {
    setSettings((prev) => ({
      ...prev,
      consultationOptions: prev.consultationOptions.map((option) =>
        option.id === id ? { ...option, price: Number(price) } : option,
      ),
    }));
    setSettingsStatus({ type: "idle", message: "" });
  };

  const updateClassPrice = (id, price) => {
    setSettings((prev) => ({
      ...prev,
      classOptions: (prev.classOptions || []).map((option) =>
        option.id === id ? { ...option, price: Number(price) } : option,
      ),
    }));
    setSettingsStatus({ type: "idle", message: "" });
  };

  const updateShippingPrice = (id, price) => {
    setSettings((prev) => ({
      ...prev,
      shippingZones: prev.shippingZones.map((zone) =>
        zone.id === id ? { ...zone, price: Number(price) } : zone,
      ),
    }));
    setSettingsStatus({ type: "idle", message: "" });
  };

  const isSettingsDirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(savedSettings),
    [settings, savedSettings],
  );

  const handleSaveSettings = () => {
    if (hasSettingsErrors) {
      setSettingsStatus({
        type: "error",
        message: "Fix the highlighted fields before saving.",
      });
      return;
    }
    saveSettings(settings);
    setSavedSettings(settings);
    setSettingsStatus({ type: "success", message: "Settings saved." });
  };

  useEffect(() => {
    const sync = () => {
      setCatalog(getCatalog());
      setOrders(getOrders());
      setRequests(getRequests());
      setCustomers(getCustomers());
      setDiscounts(getDiscounts());
      setAnalytics(getAnalytics());
    };
    window.addEventListener("storage", sync);
    window.addEventListener("requests-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("requests-updated", sync);
    };
  }, []);

  const sendPaymentConfirmation = async (order) => {
    const email = order.customer?.email;
    if (!email) return;
    const lines = [
      "Payment Confirmed",
      order.label || order.number || order.id,
      "",
      `Customer: ${order.customer?.name || "Guest"}`,
      `Email: ${email}`,
      order.customer?.phone ? `Phone: ${order.customer.phone}` : null,
      "",
      `Total: ₦${Number(order.total || 0).toLocaleString()}`,
      order.deliveryDate ? `Delivery Date: ${order.deliveryDate}` : null,
      order.deliveryTime ? `Delivery Time: ${order.deliveryTime}` : null,
      order.proofUrl ? `Payment Proof: ${order.proofUrl}` : null,
    ].filter(Boolean);
    try {
      await invokeEdgeFunction("form-delivery", {
        type: "payment_confirmed",
        payload: {
          requestType: "Payment Confirmed",
          orderRef: order.label || order.number || order.id,
          clientName: order.customer?.name || "Guest",
          clientEmail: email,
          clientPhone: order.customer?.phone || "",
          total: Number(order.total || 0),
          deliveryDate: order.deliveryDate || "",
          deliveryTime: order.deliveryTime || "",
          proofUrl: order.proofUrl || "",
          lines,
        },
      });
    } catch {
      return;
    }
  };

  const sendRequestConfirmation = async (request) => {
    const email = request.customer?.email;
    if (!email) return;
    const typeLabel =
      request.type === "inspection"
        ? "Inspection"
        : request.type === "class"
          ? "Class"
          : "Consultation";
    const lines = [
      "Payment Confirmed",
      request.requestRef || request.id,
      "",
      `Client: ${request.customer?.name || "Guest"}`,
      `Email: ${email}`,
      request.customer?.phone ? `Phone: ${request.customer.phone}` : null,
      "",
      `${typeLabel} Request`,
      request.optionTitle ? `Package: ${request.optionTitle}` : null,
      `Total: ₦${Number(request.price || 0).toLocaleString()}`,
      request.proofUrl ? `Payment Proof: ${request.proofUrl}` : null,
    ].filter(Boolean);
    try {
      await invokeEdgeFunction("form-delivery", {
        type: "payment_confirmed",
        payload: {
          requestType: "Payment Confirmed",
          orderRef: request.requestRef || request.id,
          clientName: request.customer?.name || "Guest",
          clientEmail: email,
          clientPhone: request.customer?.phone || "",
          total: Number(request.price || 0),
          proofUrl: request.proofUrl || "",
          lines,
        },
      });
    } catch {
      return;
    }
  };

  const handleOrderStatusChange = async (orderId, nextStatus) => {
    const current = orders.find((order) => order.id === orderId);
    if (!current) return;
    if (nextStatus === "Cancelled" && current.status !== "Cancelled") {
      adjustInventory(current.items || [], "increase");
    }
    const next = updateOrder(orderId, {
      status: nextStatus,
    });
    setOrders(next);
    if (nextStatus === "Confirmed" && current.status !== "Confirmed") {
      const updated = next.find((order) => order.id === orderId);
      if (updated) {
        await sendPaymentConfirmation(updated);
      }
    }
  };

  const handleRequestStatusChange = async (requestId, nextStatus) => {
    const current = requests.find((request) => request.id === requestId);
    if (!current) return;
    const next = updateRequest(requestId, {
      status: nextStatus,
    });
    setRequests(next);
    if (nextStatus === "Confirmed" && current.status !== "Confirmed") {
      const updated = next.find((request) => request.id === requestId);
      if (updated) {
        await sendRequestConfirmation(updated);
      }
    }
  };

  const buildInvoiceText = (order) => {
    const lines = [
      order.label || order.number || order.id,
      "",
      "Customer",
      `Name: ${order.customer?.name || ""}`,
      `Email: ${order.customer?.email || ""}`,
      `Phone: ${order.customer?.phone || ""}`,
      order.customer?.address ? `Address: ${order.customer.address}` : null,
      order.customer?.city ? `City: ${order.customer.city}` : null,
      order.customer?.state ? `State: ${order.customer.state}` : null,
      "",
      "Items",
      ...(order.items || []).map(
        (item) =>
          `${item.name} x${item.quantity} — ₦${(
            Number(item.price) * item.quantity
          ).toLocaleString()}`,
      ),
      "",
      `Subtotal: ₦${Number(order.subtotal || 0).toLocaleString()}`,
      `Shipping: ₦${Number(order.shipping || 0).toLocaleString()}`,
      order.discountAmount
        ? `Discount: -₦${Number(order.discountAmount).toLocaleString()}`
        : null,
      `Total: ₦${Number(order.total || 0).toLocaleString()}`,
      order.deliveryDate ? `Delivery Date: ${order.deliveryDate}` : null,
      order.deliveryTime ? `Delivery Time: ${order.deliveryTime}` : null,
      order.proofUrl ? `Payment Proof: ${order.proofUrl}` : null,
    ].filter(Boolean);
    return lines.join("\n");
  };

  const handleCopyInvoice = async (order) => {
    try {
      await navigator.clipboard.writeText(buildInvoiceText(order));
    } catch {
      return;
    }
  };

  const handleDiscountSubmit = (event) => {
    event.preventDefault();
    const code = discountForm.code.trim();
    const value = Number(discountForm.value);
    if (!code || !value) return;
    const payload = {
      code,
      type: discountForm.type,
      value,
      minSubtotal: discountForm.minSubtotal
        ? Number(discountForm.minSubtotal)
        : null,
      expiresAt: discountForm.expiresAt
        ? new Date(discountForm.expiresAt).getTime()
        : null,
      active: Boolean(discountForm.active),
      createdAt: Date.now(),
    };
    const exists = discounts.some(
      (discount) => discount.code.toLowerCase() === code.toLowerCase(),
    );
    setDiscounts(exists ? updateDiscount(code, payload) : addDiscount(payload));
    setDiscountForm({
      code: "",
      type: "percent",
      value: "",
      minSubtotal: "",
      expiresAt: "",
      active: true,
    });
  };

  const handleToggleDiscount = (code) => {
    const current = discounts.find(
      (discount) => discount.code.toLowerCase() === code.toLowerCase(),
    );
    if (!current) return;
    setDiscounts(updateDiscount(code, { active: !current.active }));
  };

  const handleRemoveDiscount = (code) => {
    setDiscounts(removeDiscount(code));
  };

  const orderStatusOptions = [
    "Pending",
    "Confirmed",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  const requestStatusOptions = ["Pending", "Confirmed", "Declined"];

  const getRequestTypeLabel = (requestType) =>
    requestType === "inspection"
      ? "Inspection"
      : requestType === "class"
        ? "Class"
        : "Consultation";

  const sortedOrders = useMemo(() => {
    return [...orders].sort(
      (a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0),
    );
  }, [orders]);

  const sortedRequests = useMemo(() => {
    return [...requests].sort(
      (a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0),
    );
  }, [requests]);

  const customerStats = useMemo(() => {
    return customers.map((customer) => {
      const related = orders.filter(
        (order) =>
          order.customer?.email?.toLowerCase() ===
          customer.email?.toLowerCase(),
      );
      const totalSpend = related.reduce(
        (sum, order) => sum + Number(order.total || 0),
        0,
      );
      const lastOrderAt = related.reduce(
        (latest, order) => Math.max(latest, Number(order.createdAt || 0)),
        0,
      );
      return {
        ...customer,
        orderCount: related.length,
        totalSpend,
        lastOrderAt: lastOrderAt || null,
      };
    });
  }, [customers, orders]);

  const lowInventory = useMemo(() => {
    const threshold = Number(settings.inventoryAlertThreshold || 0);
    if (!threshold) return [];
    return catalog.filter((item) => Number(item.inventory || 0) <= threshold);
  }, [catalog, settings.inventoryAlertThreshold]);

  const topProducts = useMemo(() => {
    const map = new Map();
    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const current = map.get(item.id) || {
          name: item.name,
          quantity: 0,
          revenue: 0,
        };
        const next = {
          name: item.name,
          quantity: current.quantity + Number(item.quantity || 0),
          revenue:
            current.revenue +
            Number(item.quantity || 0) * Number(item.price || 0),
        };
        map.set(item.id, next);
      });
    });
    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orders]);

  const conversionRate = analytics.storeViews
    ? Math.round((analytics.checkouts / analytics.storeViews) * 1000) / 10
    : 0;

  return (
    <div className="min-h-screen bg-porcelain text-obsidian">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-24 pt-32">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-ash">Admin</p>
          <h1 className="text-4xl font-semibold sm:text-5xl">
            Manage catalog, pricing, and inventory in one place.
          </h1>
        </div>

        {isSettingsDirty ? (
          <div className="rounded-3xl border border-ash/30 bg-linen p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-obsidian">
                  Save all changes
                </p>
                <p className="text-xs text-ash">
                  Apply updates across business settings and service pricing.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={hasSettingsErrors}
                className="rounded-full bg-obsidian px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-porcelain transition disabled:cursor-not-allowed disabled:opacity-70"
              >
                Save All Changes
              </button>
            </div>
          </div>
        ) : null}

        <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-ash/30 bg-linen p-6">
              <h2 className="text-xl font-semibold text-obsidian">
                Product Catalog
              </h2>
              <p className="mt-2 text-sm text-ash">
                Your store pulls directly from these admin uploads.
              </p>
              <div className="mt-6 grid gap-4">
                {catalog.length === 0 ? (
                  <div className="rounded-2xl border border-ash/30 bg-porcelain p-6 text-sm text-ash">
                    Upload your first product to activate the signature store.
                  </div>
                ) : (
                  catalog.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-4 rounded-2xl border border-ash/30 bg-porcelain p-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-16 rounded-2xl object-cover"
                        />
                        <div>
                          <p className="text-sm font-semibold text-obsidian">
                            {item.name}
                          </p>
                          <p className="text-xs text-ash">{item.category}</p>
                          <p className="text-xs text-ash">
                            ₦{item.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="rounded-full border border-ash px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-obsidian transition"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-ash/30 bg-porcelain p-6 shadow-[0_24px_40px_rgba(0,0,0,0.06)]"
          >
            <h2 className="text-xl font-semibold text-obsidian">
              Upload Product
            </h2>
            <p className="mt-2 text-sm text-ash">
              Add new items with images, pricing, and inventory counts.
            </p>
            <div className="mt-6 space-y-4">
              <input
                value={form.name}
                onChange={(event) => handleChange("name", event.target.value)}
                type="text"
                placeholder="Product name"
                className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian focus:border-obsidian focus:outline-none"
              />
              <input
                value={form.price}
                onChange={(event) => handleChange("price", event.target.value)}
                type="number"
                placeholder="Price"
                className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian focus:border-obsidian focus:outline-none"
              />
              <select
                value={form.category}
                onChange={(event) =>
                  handleChange("category", event.target.value)
                }
                className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian focus:border-obsidian focus:outline-none"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFile}
                  className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian focus:border-obsidian focus:outline-none"
                />
                <p className="text-xs text-ash">
                  Auto-resized to max 1600px and optimized to ~1.2MB.
                </p>
                {imageStatus.message ? (
                  <p
                    className={`text-xs ${
                      imageStatus.type === "error" ? "text-red-500" : "text-ash"
                    }`}
                  >
                    {imageStatus.message}
                  </p>
                ) : null}
                {form.imageData ? (
                  <img
                    src={form.imageData}
                    alt="Upload preview"
                    className="h-20 w-20 rounded-2xl object-cover"
                  />
                ) : null}
              </div>
              <input
                value={form.imageUrl}
                onChange={(event) =>
                  handleChange("imageUrl", event.target.value)
                }
                type="url"
                placeholder="Image URL (optional)"
                className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian focus:border-obsidian focus:outline-none"
              />
              <textarea
                value={form.description}
                onChange={(event) =>
                  handleChange("description", event.target.value)
                }
                rows="4"
                placeholder="Short description"
                className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian focus:border-obsidian focus:outline-none"
              />
              <input
                value={form.inventory}
                onChange={(event) =>
                  handleChange("inventory", event.target.value)
                }
                type="number"
                placeholder="Inventory count"
                className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian focus:border-obsidian focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full rounded-full bg-obsidian px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-porcelain transition disabled:cursor-not-allowed disabled:opacity-70"
            >
              Publish Product
            </button>
          </form>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-ash/30 bg-linen p-6">
            <h2 className="text-xl font-semibold text-obsidian">
              Business Settings
            </h2>
            <p className="mt-2 text-sm text-ash">
              Update payments, WhatsApp routing, and service pricing.
            </p>
            <div className="mt-6 grid gap-4">
              <input
                value={settings.whatsappNumber}
                onChange={(event) =>
                  handleSettingChange("whatsappNumber", event.target.value)
                }
                type="text"
                placeholder="WhatsApp number"
                className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian focus:border-obsidian focus:outline-none"
              />
              {settingsErrors.whatsappNumber && (
                <p className="text-xs text-red-600">
                  {settingsErrors.whatsappNumber}
                </p>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  value={settings.bankName}
                  onChange={(event) =>
                    handleSettingChange("bankName", event.target.value)
                  }
                  type="text"
                  placeholder="Bank name"
                  className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian focus:border-obsidian focus:outline-none"
                />
                <input
                  value={settings.accountName}
                  onChange={(event) =>
                    handleSettingChange("accountName", event.target.value)
                  }
                  type="text"
                  placeholder="Account name"
                  className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian focus:border-obsidian focus:outline-none"
                />
              </div>
              {settingsErrors.bankName && (
                <p className="text-xs text-red-600">
                  {settingsErrors.bankName}
                </p>
              )}
              {settingsErrors.accountName && (
                <p className="text-xs text-red-600">
                  {settingsErrors.accountName}
                </p>
              )}
              <input
                value={settings.accountNumber}
                onChange={(event) =>
                  handleSettingChange("accountNumber", event.target.value)
                }
                type="text"
                placeholder="Account number"
                className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian focus:border-obsidian focus:outline-none"
              />
              {settingsErrors.accountNumber && (
                <p className="text-xs text-red-600">
                  {settingsErrors.accountNumber}
                </p>
              )}
              <input
                value={settings.inventoryAlertThreshold}
                onChange={(event) =>
                  handleSettingChange(
                    "inventoryAlertThreshold",
                    Number(event.target.value),
                  )
                }
                type="number"
                min="0"
                placeholder="Inventory alert threshold"
                className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian focus:border-obsidian focus:outline-none"
              />
              {hasSettingsErrors && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                  Complete the required fields to activate payments and WhatsApp
                  routing.
                </div>
              )}
              {settingsStatus.message && (
                <div
                  className={`rounded-2xl border px-4 py-3 text-xs ${
                    settingsStatus.type === "error"
                      ? "border-red-200 bg-red-50 text-red-700"
                      : settingsStatus.type === "success"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-ash/30 bg-linen text-ash"
                  }`}
                >
                  {settingsStatus.message}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-ash/30 bg-porcelain p-6 shadow-[0_24px_40px_rgba(0,0,0,0.06)]">
            <h3 className="text-lg font-semibold text-obsidian">
              Service Pricing
            </h3>
            <div className="mt-4 space-y-6">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-ash">
                  Inspection Pricing
                </p>
                {settings.inspectionOptions.map((option) => (
                  <div
                    key={option.id}
                    className="flex flex-col gap-3 rounded-2xl border border-ash/30 bg-linen p-4"
                  >
                    <div className="text-sm font-semibold text-obsidian">
                      {option.title}
                    </div>
                    <input
                      value={option.redirectOnly ? "" : option.price}
                      onChange={(event) =>
                        updateInspectionPrice(option.id, event.target.value)
                      }
                      type="number"
                      disabled={option.redirectOnly}
                      className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian focus:border-obsidian focus:outline-none disabled:opacity-60"
                    />
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-ash">
                  Consultation Pricing
                </p>
                {settings.consultationOptions.map((option) => (
                  <div
                    key={option.id}
                    className="flex flex-col gap-3 rounded-2xl border border-ash/30 bg-linen p-4"
                  >
                    <div className="text-sm font-semibold text-obsidian">
                      {option.title}
                    </div>
                    <input
                      value={option.price}
                      onChange={(event) =>
                        updateConsultationPrice(option.id, event.target.value)
                      }
                      type="number"
                      className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian focus:border-obsidian focus:outline-none"
                    />
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-ash">
                  Class Pricing
                </p>
                {(settings.classOptions || []).map((option) => (
                  <div
                    key={option.id}
                    className="flex flex-col gap-3 rounded-2xl border border-ash/30 bg-linen p-4"
                  >
                    <div className="text-sm font-semibold text-obsidian">
                      {option.title}
                    </div>
                    <input
                      value={option.price}
                      onChange={(event) =>
                        updateClassPrice(option.id, event.target.value)
                      }
                      type="number"
                      className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian focus:border-obsidian focus:outline-none"
                    />
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-ash">
                  Shipping Pricing
                </p>
                {settings.shippingZones.map((zone) => (
                  <div
                    key={zone.id}
                    className="flex flex-col gap-3 rounded-2xl border border-ash/30 bg-linen p-4"
                  >
                    <div className="text-sm font-semibold text-obsidian">
                      {zone.label}
                    </div>
                    <input
                      value={zone.price}
                      onChange={(event) =>
                        updateShippingPrice(zone.id, event.target.value)
                      }
                      type="number"
                      className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian focus:border-obsidian focus:outline-none"
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSettings(defaultSettings);
                  setSettingsStatus({ type: "idle", message: "" });
                }}
                className="w-full rounded-full border border-ash px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-obsidian transition"
              >
                Reset to Default Settings
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-ash/30 bg-porcelain p-6">
          <h2 className="text-xl font-semibold text-obsidian">Orders</h2>
          <p className="mt-2 text-sm text-ash">
            Track every order, update statuses, and restock on cancellation.
          </p>
          <div className="mt-6 grid gap-4">
            {sortedOrders.length === 0 ? (
              <div className="rounded-2xl border border-ash/30 bg-linen p-6 text-sm text-ash">
                Orders will appear here after checkout.
              </div>
            ) : (
              sortedOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-ash/30 bg-linen p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-ash">
                        {order.label || order.number || order.id}
                      </p>
                      <p className="mt-2 text-sm text-ash">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString()
                          : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <select
                        value={order.status || "Pending"}
                        onChange={(event) =>
                          handleOrderStatusChange(order.id, event.target.value)
                        }
                        className="rounded-full border border-ash/40 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-obsidian focus:border-obsidian focus:outline-none"
                      >
                        {orderStatusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() =>
                          handleOrderStatusChange(order.id, "Cancelled")
                        }
                        disabled={order.status === "Cancelled"}
                        className="rounded-full border border-ash px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-obsidian transition disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Cancel & Restock
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyInvoice(order)}
                        className="rounded-full border border-ash px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-obsidian transition"
                      >
                        Copy Invoice
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-ash sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-ash">
                        Customer
                      </p>
                      <p className="mt-2 text-sm text-obsidian">
                        {order.customer?.name || "Guest"}
                      </p>
                      <p className="text-xs text-ash">
                        {order.customer?.email || ""}
                      </p>
                      <p className="text-xs text-ash">
                        {order.customer?.phone || ""}
                      </p>
                      <p className="text-xs text-ash">
                        {[
                          order.customer?.address,
                          order.customer?.city,
                          order.customer?.state,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-ash">
                        Totals
                      </p>
                      <p className="mt-2 text-sm text-obsidian">
                        ₦{Number(order.total || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-ash">
                        Subtotal: ₦
                        {Number(order.subtotal || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-ash">
                        Shipping: ₦
                        {Number(order.shipping || 0).toLocaleString()}
                      </p>
                      {order.discountAmount ? (
                        <p className="text-xs text-ash">
                          Discount: -₦
                          {Number(order.discountAmount).toLocaleString()}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-ash">
                    <p className="text-xs uppercase tracking-[0.3em] text-ash">
                      Items
                    </p>
                    {(order.items || []).map((item) => (
                      <div
                        key={`${order.id}-${item.id}`}
                        className="flex items-center justify-between rounded-2xl border border-ash/30 bg-porcelain px-4 py-2"
                      >
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <span>
                          ₦
                          {(
                            Number(item.price || 0) * Number(item.quantity || 0)
                          ).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-ash">
                    {order.deliveryDate ? (
                      <span>Delivery date: {order.deliveryDate}</span>
                    ) : null}
                    {order.deliveryTime ? (
                      <span>Delivery time: {order.deliveryTime}</span>
                    ) : null}
                    {order.proofUrl ? (
                      <a
                        href={order.proofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        View payment proof
                      </a>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-ash/30 bg-porcelain p-6">
          <h2 className="text-xl font-semibold text-obsidian">Requests</h2>
          <p className="mt-2 text-sm text-ash">
            Review consultation, class, and inspection submissions.
          </p>
          <div className="mt-6 grid gap-4">
            {sortedRequests.length === 0 ? (
              <div className="rounded-2xl border border-ash/30 bg-linen p-6 text-sm text-ash">
                Requests will appear here after form submissions.
              </div>
            ) : (
              sortedRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-2xl border border-ash/30 bg-linen p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-ash">
                        {request.requestRef || request.id}
                      </p>
                      <p className="mt-2 text-sm text-ash">
                        {request.createdAt
                          ? new Date(request.createdAt).toLocaleString()
                          : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <select
                        value={request.status || "Pending"}
                        onChange={(event) =>
                          handleRequestStatusChange(
                            request.id,
                            event.target.value,
                          )
                        }
                        className="rounded-full border border-ash/40 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-obsidian focus:border-obsidian focus:outline-none"
                      >
                        {requestStatusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      {request.proofUrl ? (
                        <a
                          href={request.proofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border border-ash px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-obsidian transition"
                        >
                          View Proof
                        </a>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-ash sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-ash">
                        Client
                      </p>
                      <p className="mt-2 text-sm text-obsidian">
                        {request.customer?.name || "Guest"}
                      </p>
                      <p className="text-xs text-ash">
                        {request.customer?.email || ""}
                      </p>
                      <p className="text-xs text-ash">
                        {request.customer?.phone || ""}
                      </p>
                      <p className="text-xs text-ash">
                        {[
                          request.customer?.address,
                          request.customer?.city,
                          request.customer?.state,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-ash">
                        Request
                      </p>
                      <p className="mt-2 text-sm text-obsidian">
                        {getRequestTypeLabel(request.type)}
                      </p>
                      <p className="text-xs text-ash">
                        {request.optionTitle || ""}
                      </p>
                      <p className="text-xs text-ash">
                        Total: ₦{Number(request.price || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {request.notes ? (
                    <div className="mt-4 text-sm text-ash">
                      <p className="text-xs uppercase tracking-[0.3em] text-ash">
                        Notes
                      </p>
                      <p className="mt-2">{request.notes}</p>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-ash/30 bg-linen p-6">
            <h2 className="text-xl font-semibold text-obsidian">Customers</h2>
            <p className="mt-2 text-sm text-ash">
              Saved profiles from signups and checkouts.
            </p>
            <div className="mt-6 grid gap-4">
              {customerStats.length === 0 ? (
                <div className="rounded-2xl border border-ash/30 bg-porcelain p-6 text-sm text-ash">
                  Customers will appear here after signup or checkout.
                </div>
              ) : (
                customerStats.map((customer) => (
                  <div
                    key={customer.email || customer.name}
                    className="rounded-2xl border border-ash/30 bg-porcelain p-5"
                  >
                    <p className="text-sm font-semibold text-obsidian">
                      {customer.name || "Guest"}
                    </p>
                    <div className="mt-2 text-xs text-ash">
                      <p>{customer.email}</p>
                      <p>{customer.phone}</p>
                      <p>
                        {[customer.address, customer.city, customer.state]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-ash">
                      <span>Orders: {customer.orderCount}</span>
                      <span>
                        Spend: ₦{Number(customer.totalSpend).toLocaleString()}
                      </span>
                      {customer.lastOrderAt ? (
                        <span>
                          Last order:{" "}
                          {new Date(customer.lastOrderAt).toLocaleDateString()}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-ash/30 bg-porcelain p-6 shadow-[0_24px_40px_rgba(0,0,0,0.06)]">
            <h2 className="text-xl font-semibold text-obsidian">Discounts</h2>
            <p className="mt-2 text-sm text-ash">
              Create codes for fixed or percentage promotions.
            </p>
            <form onSubmit={handleDiscountSubmit} className="mt-6 space-y-4">
              <input
                value={discountForm.code}
                onChange={(event) =>
                  setDiscountForm((prev) => ({
                    ...prev,
                    code: event.target.value,
                  }))
                }
                type="text"
                placeholder="Code"
                className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-2 text-sm text-obsidian focus:border-obsidian focus:outline-none"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  value={discountForm.type}
                  onChange={(event) =>
                    setDiscountForm((prev) => ({
                      ...prev,
                      type: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-2 text-sm text-obsidian focus:border-obsidian focus:outline-none"
                >
                  <option value="percent">Percent</option>
                  <option value="fixed">Fixed</option>
                </select>
                <input
                  value={discountForm.value}
                  onChange={(event) =>
                    setDiscountForm((prev) => ({
                      ...prev,
                      value: event.target.value,
                    }))
                  }
                  type="number"
                  placeholder="Value"
                  className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-2 text-sm text-obsidian focus:border-obsidian focus:outline-none"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={discountForm.minSubtotal}
                  onChange={(event) =>
                    setDiscountForm((prev) => ({
                      ...prev,
                      minSubtotal: event.target.value,
                    }))
                  }
                  type="number"
                  placeholder="Minimum subtotal"
                  className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-2 text-sm text-obsidian focus:border-obsidian focus:outline-none"
                />
                <input
                  value={discountForm.expiresAt}
                  onChange={(event) =>
                    setDiscountForm((prev) => ({
                      ...prev,
                      expiresAt: event.target.value,
                    }))
                  }
                  type="date"
                  className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-2 text-sm text-obsidian focus:border-obsidian focus:outline-none"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-ash">
                <input
                  checked={discountForm.active}
                  onChange={(event) =>
                    setDiscountForm((prev) => ({
                      ...prev,
                      active: event.target.checked,
                    }))
                  }
                  type="checkbox"
                  className="h-4 w-4 rounded border-ash"
                />
                Active
              </label>
              <button
                type="submit"
                className="w-full rounded-full bg-obsidian px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-porcelain transition"
              >
                Save Discount
              </button>
            </form>
            <div className="mt-6 space-y-3">
              {discounts.length === 0 ? (
                <div className="rounded-2xl border border-ash/30 bg-linen p-4 text-sm text-ash">
                  No discounts added yet.
                </div>
              ) : (
                discounts.map((discount) => (
                  <div
                    key={discount.code}
                    className="flex flex-col gap-3 rounded-2xl border border-ash/30 bg-linen p-4 text-sm text-ash"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-[0.3em] text-ash">
                        {discount.code}
                      </span>
                      <span className="text-xs text-ash">
                        {discount.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-sm text-obsidian">
                      {discount.type === "percent"
                        ? `${discount.value}% off`
                        : `₦${Number(discount.value).toLocaleString()} off`}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-ash">
                      {discount.minSubtotal ? (
                        <span>
                          Min ₦{Number(discount.minSubtotal).toLocaleString()}
                        </span>
                      ) : null}
                      {discount.expiresAt ? (
                        <span>
                          Expires{" "}
                          {new Date(discount.expiresAt).toLocaleDateString()}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleDiscount(discount.code)}
                        className="rounded-full border border-ash px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-obsidian transition"
                      >
                        {discount.active ? "Disable" : "Enable"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveDiscount(discount.code)}
                        className="rounded-full border border-ash px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-obsidian transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-ash/30 bg-linen p-6">
            <h2 className="text-xl font-semibold text-obsidian">Analytics</h2>
            <p className="mt-2 text-sm text-ash">
              Track store performance and conversion.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-ash/30 bg-porcelain p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-ash">
                  Store Views
                </p>
                <p className="mt-2 text-lg font-semibold text-obsidian">
                  {analytics.storeViews || 0}
                </p>
              </div>
              <div className="rounded-2xl border border-ash/30 bg-porcelain p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-ash">
                  Cart Adds
                </p>
                <p className="mt-2 text-lg font-semibold text-obsidian">
                  {analytics.cartAdds || 0}
                </p>
              </div>
              <div className="rounded-2xl border border-ash/30 bg-porcelain p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-ash">
                  Checkouts
                </p>
                <p className="mt-2 text-lg font-semibold text-obsidian">
                  {analytics.checkouts || 0}
                </p>
              </div>
              <div className="rounded-2xl border border-ash/30 bg-porcelain p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-ash">
                  Conversion
                </p>
                <p className="mt-2 text-lg font-semibold text-obsidian">
                  {conversionRate}%
                </p>
                {analytics.lastCheckoutAt ? (
                  <p className="mt-1 text-xs text-ash">
                    Last checkout{" "}
                    {new Date(analytics.lastCheckoutAt).toLocaleDateString()}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="mt-6 space-y-2 text-sm text-ash">
              <p className="text-xs uppercase tracking-[0.3em] text-ash">
                Top Products
              </p>
              {topProducts.length === 0 ? (
                <p>No sales data yet.</p>
              ) : (
                topProducts.map((product) => (
                  <div
                    key={product.name}
                    className="flex items-center justify-between rounded-2xl border border-ash/30 bg-porcelain px-4 py-2"
                  >
                    <span>{product.name}</span>
                    <span>
                      ₦{Number(product.revenue).toLocaleString()} ·{" "}
                      {product.quantity} sold
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-ash/30 bg-porcelain p-6 shadow-[0_24px_40px_rgba(0,0,0,0.06)]">
            <h2 className="text-xl font-semibold text-obsidian">
              Inventory Alerts
            </h2>
            <p className="mt-2 text-sm text-ash">
              Low-stock pieces based on your alert threshold.
            </p>
            <div className="mt-6 space-y-3 text-sm text-ash">
              {lowInventory.length === 0 ? (
                <div className="rounded-2xl border border-ash/30 bg-linen p-4">
                  No low-stock alerts right now.
                </div>
              ) : (
                lowInventory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl border border-ash/30 bg-linen px-4 py-2"
                  >
                    <span>{item.name}</span>
                    <span>{Number(item.inventory || 0)} left</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default AdminDashboardPage;
