import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useToast } from "../components/useToast.js";
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
  saveCatalog,
  saveDiscounts,
  saveCustomers,
  saveOrders,
  saveRequests,
  saveAnalytics,
} from "../utils/catalogStore.js";
import supabase, { invokeEdgeFunction } from "../utils/supabaseClient.js";

const categories = [
  "Furniture",
  "Lighting",
  "Textiles",
  "Art",
  "Styling Kits",
  "Custom Commissions",
];

const navSections = [
  { id: "overview", label: "Overview" },
  { id: "catalog", label: "Catalog" },
  { id: "upload", label: "Upload" },
  { id: "settings", label: "Settings" },
  { id: "pricing", label: "Pricing" },
  { id: "orders", label: "Orders" },
  { id: "requests", label: "Requests" },
  { id: "customers", label: "Customers" },
  { id: "discounts", label: "Discounts" },
  { id: "analytics", label: "Analytics" },
  { id: "inventory", label: "Inventory" },
  { id: "reviews", label: "Reviews" },
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
  const { pushToast } = useToast();
  const [catalog, setCatalog] = useState(() => getCatalog());
  const [session, setSession] = useState(null);
  const [orders, setOrders] = useState(() => getOrders());
  const [requests, setRequests] = useState(() => getRequests());
  const [customers, setCustomers] = useState(() => getCustomers());
  const [discounts, setDiscounts] = useState(() => getDiscounts());
  const [analytics, setAnalytics] = useState(() => getAnalytics());
  const [form, setForm] = useState(initialForm);
  const [settings, setSettings] = useState(() => getSettings());
  const [savedSettings, setSavedSettings] = useState(() => getSettings());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [pendingOrderStatus, setPendingOrderStatus] = useState({});
  const [pendingRequestStatus, setPendingRequestStatus] = useState({});
  const [discountForm, setDiscountForm] = useState({
    code: "",
    type: "percent",
    value: "",
    minSubtotal: "",
    expiresAt: "",
    active: true,
  });

  const [isImporting, setIsImporting] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    category: categories[0],
    image: "",
    description: "",
    inventory: "",
  });
  const [adminReviews, setAdminReviews] = useState([]);

  const importLocalToCloud = async () => {
    try {
      setIsImporting(true);
      saveCatalog(getCatalog());
      saveDiscounts(getDiscounts());
      saveCustomers(getCustomers());
      saveOrders(getOrders());
      saveRequests(getRequests());
      saveSettings(getSettings());
      saveAnalytics(getAnalytics());
      pushToast({
        type: "success",
        message: "Local data imported to cloud.",
      });
    } catch (error) {
      pushToast({
        type: "error",
        message: error?.message || "Import failed.",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isAdmin =
    session?.user?.email?.toLowerCase() === "uthmanajanaku@gmail.com";

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
    if (import.meta.env.VITE_STORAGE_MODE !== "cloud") return;
    let isMounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("catalog")
        .select("*")
        .order("created_at", { ascending: false });
      if (!isMounted) return;
      if (!error && Array.isArray(data)) {
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
    (async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });
      if (!isMounted) return;
      setAdminReviews(Array.isArray(data) ? data : []);
      const channel = supabase
        .channel("admin-reviews")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "reviews" },
          (payload) => {
            setAdminReviews((prev) => [payload.new, ...prev]);
          },
        )
        .subscribe();
      return () => {
        try {
          supabase.removeChannel(channel);
        } catch (e) {
          void e;
        }
      };
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const nextSection = window.location.hash.replace("#", "");
      if (navSections.some((section) => section.id === nextSection)) {
        setActiveSection(nextSection);
        return;
      }
      setActiveSection("overview");
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const handleSectionChange = (nextSection) => {
    setActiveSection(nextSection);
    setIsMenuOpen(false);
    if (window.location.hash !== `#${nextSection}`) {
      window.history.replaceState(null, "", `#${nextSection}`);
    }
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
    try {
      const result = await optimizeImage(file);
      setForm((prev) => ({
        ...prev,
        imageData: result.dataUrl,
        imageUrl: "",
      }));
      pushToast({
        type: "success",
        message: `Image optimized: ${Math.round(result.width)}×${Math.round(
          result.height,
        )} at ${Math.round(result.size / 1024)}KB.`,
      });
    } catch (error) {
      pushToast({
        type: "error",
        message: error instanceof Error ? error.message : "Upload failed.",
      });
    }
  };

  const handleSubmit = async (event) => {
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
      pushToast({
        type: "error",
        message: "Add a name, price, and image before publishing.",
      });
      return;
    }
    setCatalog(addCatalogItem(nextItem));
    if (import.meta.env.VITE_STORAGE_MODE === "cloud") {
      const { error } = await supabase.from("catalog").upsert([
        {
          id: nextItem.id,
          name: nextItem.name,
          price: nextItem.price,
          category: nextItem.category,
          image_url: nextItem.image,
          description: nextItem.description,
          inventory: nextItem.inventory ?? 0,
        },
      ]);
      if (error) {
        pushToast({
          type: "error",
          message: "Cloud save failed. Check your login and try again.",
        });
      }
    }
    setForm(initialForm);
    setIsSubmitting(false);
    pushToast({ type: "success", message: "Product published." });
  };

  const handleRemove = async (id) => {
    setCatalog(removeCatalogItem(id));
    if (import.meta.env.VITE_STORAGE_MODE === "cloud") {
      const { error } = await supabase.from("catalog").delete().eq("id", id);
      if (error) {
        pushToast({
          type: "error",
          message: isAdmin
            ? "Cloud delete failed. Try again."
            : "Cloud delete failed. Sign in as admin.",
        });
      } else {
        pushToast({ type: "success", message: "Product removed." });
      }
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({
      name: item.name,
      price: String(item.price),
      category: item.category,
      image: item.image,
      description: item.description,
      inventory: String(item.inventory ?? 0),
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const next = catalog.map((p) =>
      p.id === editingId
        ? {
            ...p,
            name: editForm.name.trim(),
            price: Number(editForm.price || 0),
            category: editForm.category,
            image: editForm.image.trim(),
            description: editForm.description.trim(),
            inventory: Number(editForm.inventory || 0),
          }
        : p,
    );
    saveCatalog(next);
    setCatalog(next);
    if (import.meta.env.VITE_STORAGE_MODE === "cloud") {
      const row = next.find((x) => x.id === editingId);
      if (row) {
        const { error } = await supabase.from("catalog").upsert([
          {
            id: row.id,
            name: row.name,
            price: row.price,
            category: row.category,
            image_url: row.image,
            description: row.description,
            inventory: row.inventory ?? 0,
          },
        ]);
        if (error) {
          pushToast({
            type: "error",
            message: isAdmin
              ? "Cloud save failed. Try again."
              : "Cloud save failed. Sign in as admin.",
          });
        } else {
          pushToast({ type: "success", message: "Product updated." });
        }
      }
    }
    setEditingId("");
  };

  const removeReview = async (id) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) {
      pushToast({
        type: "error",
        message: isAdmin ? "Delete failed. Try again." : "Sign in as admin.",
      });
      return;
    }
    setAdminReviews((prev) => prev.filter((r) => r.id !== id));
    pushToast({ type: "success", message: "Review removed." });
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
  };

  const normalizeNumberInput = (value) => (value === "" ? "" : Number(value));

  const updateInspectionPrice = (id, price) => {
    setSettings((prev) => ({
      ...prev,
      inspectionOptions: prev.inspectionOptions.map((option) =>
        option.id === id
          ? { ...option, price: normalizeNumberInput(price) }
          : option,
      ),
    }));
  };

  const updateConsultationPrice = (id, price) => {
    setSettings((prev) => ({
      ...prev,
      consultationOptions: prev.consultationOptions.map((option) =>
        option.id === id
          ? { ...option, price: normalizeNumberInput(price) }
          : option,
      ),
    }));
  };

  const updateClassPrice = (id, price) => {
    setSettings((prev) => ({
      ...prev,
      classOptions: (prev.classOptions || []).map((option) =>
        option.id === id
          ? { ...option, price: normalizeNumberInput(price) }
          : option,
      ),
    }));
  };

  const updateShippingPrice = (id, price) => {
    setSettings((prev) => ({
      ...prev,
      shippingZones: prev.shippingZones.map((zone) =>
        zone.id === id ? { ...zone, price: normalizeNumberInput(price) } : zone,
      ),
    }));
  };
  const savedBusinessFields = useMemo(
    () => ({
      whatsappNumber: savedSettings.whatsappNumber,
      bankName: savedSettings.bankName,
      accountName: savedSettings.accountName,
      accountNumber: savedSettings.accountNumber,
      inventoryAlertThreshold: savedSettings.inventoryAlertThreshold,
    }),
    [savedSettings],
  );

  const currentBusinessFields = useMemo(
    () => ({
      whatsappNumber: settings.whatsappNumber,
      bankName: settings.bankName,
      accountName: settings.accountName,
      accountNumber: settings.accountNumber,
      inventoryAlertThreshold: settings.inventoryAlertThreshold,
    }),
    [settings],
  );

  const isBusinessDirty = useMemo(
    () =>
      JSON.stringify(currentBusinessFields) !==
      JSON.stringify(savedBusinessFields),
    [currentBusinessFields, savedBusinessFields],
  );

  const savedPricingFields = useMemo(
    () => ({
      inspectionOptions: savedSettings.inspectionOptions,
      consultationOptions: savedSettings.consultationOptions,
      classOptions: savedSettings.classOptions,
      shippingZones: savedSettings.shippingZones,
    }),
    [savedSettings],
  );

  const currentPricingFields = useMemo(
    () => ({
      inspectionOptions: settings.inspectionOptions,
      consultationOptions: settings.consultationOptions,
      classOptions: settings.classOptions,
      shippingZones: settings.shippingZones,
    }),
    [settings],
  );

  const isPricingDirty = useMemo(
    () =>
      JSON.stringify(currentPricingFields) !==
      JSON.stringify(savedPricingFields),
    [currentPricingFields, savedPricingFields],
  );

  const handleSaveBusinessSettings = () => {
    if (hasSettingsErrors) {
      pushToast({
        type: "error",
        message: "Fix the highlighted fields before saving.",
      });
      return;
    }
    saveSettings(settings);
    setSavedSettings(settings);
    pushToast({ type: "success", message: "Business settings saved." });
  };

  const handleSavePricingSettings = () => {
    saveSettings(settings);
    setSavedSettings(settings);
    pushToast({ type: "success", message: "Pricing settings saved." });
  };

  const resetSettingsToDefaults = () => {
    setSettings(defaultSettings);
    pushToast({
      type: "success",
      message: "Defaults restored. Save to apply.",
    });
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

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.total || 0), 0),
    [orders],
  );

  const pendingOrdersCount = useMemo(
    () => orders.filter((order) => order.status === "Pending").length,
    [orders],
  );

  const pendingRequestsCount = useMemo(
    () => requests.filter((request) => request.status === "Pending").length,
    [requests],
  );

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
      <div className="relative">
        <div className="mx-auto w-full max-w-6xl px-6 pb-24 pt-28">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.4em] text-ash">
                Admin Studio
              </p>
              <h1 className="text-4xl font-semibold sm:text-5xl">
                Dashboard overview
              </h1>
              <p className="max-w-2xl text-sm text-ash sm:text-base">
                Manage catalog, pricing, orders, and customer touchpoints.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className="rounded-full border border-ash px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-obsidian transition lg:hidden"
            >
              Menu
            </button>
          </div>

          <div className="mt-10 flex flex-col gap-10 lg:flex-row">
            <aside className="hidden w-56 shrink-0 lg:block">
              <div className="sticky top-28 space-y-4">
                <p className="text-[11px] uppercase tracking-[0.3em] text-ash">
                  Navigate
                </p>
                <nav className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-ash">
                  {navSections.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => handleSectionChange(section.id)}
                      className="block w-full rounded-full border border-ash/30 bg-porcelain px-4 py-2 text-left text-[11px] text-obsidian transition hover:border-ash"
                    >
                      {section.label}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            <main className="flex-1 space-y-10">
              {activeSection === "overview" ? (
                <section id="overview" className="space-y-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={importLocalToCloud}
                      disabled={isImporting}
                      className="rounded-full border border-ash/30 bg-porcelain px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-obsidian transition hover:border-ash disabled:opacity-60"
                    >
                      {isImporting
                        ? "Importing…"
                        : "Import local data to cloud"}
                    </button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-3xl border border-ash/30 bg-porcelain p-5">
                      <p className="text-xs uppercase tracking-[0.3em] text-ash">
                        Total Revenue
                      </p>
                      <p className="mt-3 text-2xl font-semibold text-obsidian">
                        ₦{Number(totalRevenue || 0).toLocaleString()}
                      </p>
                      <p className="mt-2 text-xs text-ash">
                        {orders.length} total orders
                      </p>
                    </div>
                    <div className="rounded-3xl border border-ash/30 bg-porcelain p-5">
                      <p className="text-xs uppercase tracking-[0.3em] text-ash">
                        Orders
                      </p>
                      <p className="mt-3 text-2xl font-semibold text-obsidian">
                        {orders.length}
                      </p>
                      <p className="mt-2 text-xs text-ash">
                        {pendingOrdersCount} pending
                      </p>
                    </div>
                    <div className="rounded-3xl border border-ash/30 bg-porcelain p-5">
                      <p className="text-xs uppercase tracking-[0.3em] text-ash">
                        Requests
                      </p>
                      <p className="mt-3 text-2xl font-semibold text-obsidian">
                        {requests.length}
                      </p>
                      <p className="mt-2 text-xs text-ash">
                        {pendingRequestsCount} pending
                      </p>
                    </div>
                    <div className="rounded-3xl border border-ash/30 bg-porcelain p-5">
                      <p className="text-xs uppercase tracking-[0.3em] text-ash">
                        Conversion
                      </p>
                      <p className="mt-3 text-2xl font-semibold text-obsidian">
                        {conversionRate}%
                      </p>
                      <p className="mt-2 text-xs text-ash">
                        {analytics.storeViews || 0} store views
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-ash/30 bg-linen p-5">
                      <p className="text-xs uppercase tracking-[0.3em] text-ash">
                        Low Inventory
                      </p>
                      <p className="mt-3 text-2xl font-semibold text-obsidian">
                        {lowInventory.length}
                      </p>
                      <p className="mt-2 text-xs text-ash">
                        Items below threshold
                      </p>
                    </div>
                    <div className="rounded-3xl border border-ash/30 bg-linen p-5">
                      <p className="text-xs uppercase tracking-[0.3em] text-ash">
                        Customers
                      </p>
                      <p className="mt-3 text-2xl font-semibold text-obsidian">
                        {customerStats.length}
                      </p>
                      <p className="mt-2 text-xs text-ash">Saved profiles</p>
                    </div>
                  </div>
                </section>
              ) : null}

              {activeSection === "catalog" ? (
                <section
                  id="catalog"
                  className="rounded-3xl border border-ash/30 bg-linen p-6"
                >
                  <h2 className="text-xl font-semibold text-obsidian">
                    Product Catalog
                  </h2>
                  <p className="mt-2 text-sm text-ash">
                    Your store pulls directly from these admin uploads.
                  </p>
                  <div className="mt-6 grid gap-4">
                    {catalog.length === 0 ? (
                      <div className="rounded-2xl border border-ash/30 bg-porcelain p-6 text-sm text-ash">
                        Upload your first product to activate the signature
                        store.
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
                                {editingId === item.id ? (
                                  <input
                                    value={editForm.name}
                                    onChange={(e) =>
                                      setEditForm((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                      }))
                                    }
                                    type="text"
                                    className="rounded-md border border-ash/40 px-2 py-1 text-sm"
                                  />
                                ) : (
                                  item.name
                                )}
                              </p>
                              <p className="text-xs text-ash">
                                {editingId === item.id ? (
                                  <select
                                    value={editForm.category}
                                    onChange={(e) =>
                                      setEditForm((prev) => ({
                                        ...prev,
                                        category: e.target.value,
                                      }))
                                    }
                                    className="rounded-md border border-ash/40 px-2 py-1 text-xs"
                                  >
                                    {categories.map((c) => (
                                      <option key={c} value={c}>
                                        {c}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  item.category
                                )}
                              </p>
                              <p className="text-xs text-ash">
                                {editingId === item.id ? (
                                  <input
                                    value={editForm.price}
                                    onChange={(e) =>
                                      setEditForm((prev) => ({
                                        ...prev,
                                        price: e.target.value,
                                      }))
                                    }
                                    type="number"
                                    className="w-28 rounded-md border border-ash/40 px-2 py-1 text-xs"
                                  />
                                ) : (
                                  `₦${Number(item.price).toLocaleString()}`
                                )}
                              </p>
                              <p className="text-xs text-ash">
                                {editingId === item.id ? (
                                  <input
                                    value={editForm.inventory}
                                    onChange={(e) =>
                                      setEditForm((prev) => ({
                                        ...prev,
                                        inventory: e.target.value,
                                      }))
                                    }
                                    type="number"
                                    className="w-28 rounded-md border border-ash/40 px-2 py-1 text-xs"
                                  />
                                ) : (
                                  `${Number(item.inventory || 0)} in stock`
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {editingId === item.id ? (
                              <>
                                <button
                                  type="button"
                                  onClick={saveEdit}
                                  className="rounded-full bg-obsidian px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-porcelain transition"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingId("")}
                                  className="rounded-full border border-ash px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-obsidian transition"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => startEdit(item)}
                                className="rounded-full border border-ash px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-obsidian transition"
                              >
                                Edit
                              </button>
                            )}
                            <button
                              onClick={() => handleRemove(item.id)}
                              className="rounded-full border border-ash px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-obsidian transition"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              ) : null}

              {activeSection === "upload" ? (
                <section
                  id="upload"
                  className="rounded-3xl border border-ash/30 bg-porcelain p-6 shadow-[0_24px_40px_rgba(0,0,0,0.06)]"
                >
                  <h2 className="text-xl font-semibold text-obsidian">
                    Upload Product
                  </h2>
                  <p className="mt-2 text-sm text-ash">
                    Add new items with images, pricing, and inventory counts.
                  </p>
                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <input
                      value={form.name}
                      onChange={(event) =>
                        handleChange("name", event.target.value)
                      }
                      type="text"
                      placeholder="Product name"
                      className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian focus:border-obsidian focus:outline-none"
                    />
                    <input
                      value={form.price}
                      onChange={(event) =>
                        handleChange("price", event.target.value)
                      }
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
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-full bg-obsidian px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-porcelain transition disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      Publish Product
                    </button>
                  </form>
                </section>
              ) : null}

              {activeSection === "settings" ? (
                <section
                  id="settings"
                  className="rounded-3xl border border-ash/30 bg-linen p-6"
                >
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
                        handleSettingChange(
                          "whatsappNumber",
                          event.target.value,
                        )
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
                          event.target.value,
                        )
                      }
                      type="number"
                      min="0"
                      placeholder="Inventory alert threshold"
                      className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian focus:border-obsidian focus:outline-none"
                    />
                    {hasSettingsErrors && (
                      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                        Complete the required fields to activate payments and
                        WhatsApp routing.
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveBusinessSettings}
                    disabled={!isBusinessDirty || hasSettingsErrors}
                    className="mt-6 w-full rounded-full bg-obsidian px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-porcelain transition disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Save Business Settings
                  </button>
                </section>
              ) : null}

              {activeSection === "pricing" ? (
                <section
                  id="pricing"
                  className="rounded-3xl border border-ash/30 bg-porcelain p-6 shadow-[0_24px_40px_rgba(0,0,0,0.06)]"
                >
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
                              updateInspectionPrice(
                                option.id,
                                event.target.value,
                              )
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
                              updateConsultationPrice(
                                option.id,
                                event.target.value,
                              )
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
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={handleSavePricingSettings}
                        disabled={!isPricingDirty}
                        className="w-full rounded-full bg-obsidian px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-porcelain transition disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        Save Pricing
                      </button>
                      <button
                        type="button"
                        onClick={resetSettingsToDefaults}
                        className="w-full rounded-full border border-ash px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-obsidian transition"
                      >
                        Reset Defaults
                      </button>
                    </div>
                  </div>
                </section>
              ) : null}

              {activeSection === "orders" ? (
                <section
                  id="orders"
                  className="rounded-3xl border border-ash/30 bg-porcelain p-6"
                >
                  <h2 className="text-xl font-semibold text-obsidian">
                    Orders
                  </h2>
                  <p className="mt-2 text-sm text-ash">
                    Track every order, update statuses, and restock on
                    cancellation.
                  </p>
                  <div className="mt-6 grid gap-4">
                    {sortedOrders.length === 0 ? (
                      <div className="rounded-2xl border border-ash/30 bg-linen p-6 text-sm text-ash">
                        Orders will appear here after checkout.
                      </div>
                    ) : (
                      sortedOrders.map((order) => {
                        const orderStatus =
                          pendingOrderStatus[order.id] ||
                          order.status ||
                          "Pending";
                        return (
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
                                  value={orderStatus}
                                  onChange={async (event) => {
                                    const nextStatus = event.target.value;
                                    if (nextStatus === order.status) {
                                      setPendingOrderStatus((prev) => {
                                        const next = { ...prev };
                                        delete next[order.id];
                                        return next;
                                      });
                                      return;
                                    }
                                    setPendingOrderStatus((prev) => ({
                                      ...prev,
                                      [order.id]: nextStatus,
                                    }));
                                    await handleOrderStatusChange(
                                      order.id,
                                      nextStatus,
                                    );
                                    setPendingOrderStatus((prev) => {
                                      const next = { ...prev };
                                      delete next[order.id];
                                      return next;
                                    });
                                    pushToast({
                                      type: "success",
                                      message: "Order status saved.",
                                    });
                                  }}
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
                                  onClick={async () => {
                                    await handleOrderStatusChange(
                                      order.id,
                                      orderStatus,
                                    );
                                    setPendingOrderStatus((prev) => {
                                      const next = { ...prev };
                                      delete next[order.id];
                                      return next;
                                    });
                                    pushToast({
                                      type: "success",
                                      message: "Order status saved.",
                                    });
                                  }}
                                  disabled={!pendingOrderStatus[order.id]}
                                  className="rounded-full bg-obsidian px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-porcelain transition"
                                >
                                  Save Status
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await handleOrderStatusChange(
                                      order.id,
                                      "Cancelled",
                                    );
                                    pushToast({
                                      type: "success",
                                      message: "Order cancelled and restocked.",
                                    });
                                  }}
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
                                    {Number(
                                      order.discountAmount,
                                    ).toLocaleString()}
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
                                      Number(item.price || 0) *
                                      Number(item.quantity || 0)
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
                        );
                      })
                    )}
                  </div>
                </section>
              ) : null}

              {activeSection === "requests" ? (
                <section
                  id="requests"
                  className="rounded-3xl border border-ash/30 bg-porcelain p-6"
                >
                  <h2 className="text-xl font-semibold text-obsidian">
                    Requests
                  </h2>
                  <p className="mt-2 text-sm text-ash">
                    Review consultation, class, and inspection submissions.
                  </p>
                  <div className="mt-6 grid gap-4">
                    {sortedRequests.length === 0 ? (
                      <div className="rounded-2xl border border-ash/30 bg-linen p-6 text-sm text-ash">
                        Requests will appear here after form submissions.
                      </div>
                    ) : (
                      sortedRequests.map((request) => {
                        const requestStatus =
                          pendingRequestStatus[request.id] ||
                          request.status ||
                          "Pending";
                        return (
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
                                    ? new Date(
                                        request.createdAt,
                                      ).toLocaleString()
                                    : ""}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-3">
                                <select
                                  value={requestStatus}
                                  onChange={(event) =>
                                    setPendingRequestStatus((prev) => ({
                                      ...prev,
                                      [request.id]: event.target.value,
                                    }))
                                  }
                                  className="rounded-full border border-ash/40 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-obsidian focus:border-obsidian focus:outline-none"
                                >
                                  {requestStatusOptions.map((option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await handleRequestStatusChange(
                                      request.id,
                                      requestStatus,
                                    );
                                    setPendingRequestStatus((prev) => {
                                      const next = { ...prev };
                                      delete next[request.id];
                                      return next;
                                    });
                                    pushToast({
                                      type: "success",
                                      message: "Request status saved.",
                                    });
                                  }}
                                  className="rounded-full bg-obsidian px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-porcelain transition"
                                >
                                  Save Status
                                </button>
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
                                  Total: ₦
                                  {Number(request.price || 0).toLocaleString()}
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
                        );
                      })
                    )}
                  </div>
                </section>
              ) : null}

              {activeSection === "customers" ? (
                <section
                  id="customers"
                  className="rounded-3xl border border-ash/30 bg-linen p-6"
                >
                  <h2 className="text-xl font-semibold text-obsidian">
                    Customers
                  </h2>
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
                              Spend: ₦
                              {Number(customer.totalSpend).toLocaleString()}
                            </span>
                            {customer.lastOrderAt ? (
                              <span>
                                Last order:{" "}
                                {new Date(
                                  customer.lastOrderAt,
                                ).toLocaleDateString()}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              ) : null}

              {activeSection === "discounts" ? (
                <section
                  id="discounts"
                  className="overflow-hidden rounded-3xl border border-ash/30 bg-porcelain p-6 shadow-[0_24px_40px_rgba(0,0,0,0.06)]"
                >
                  <h2 className="text-xl font-semibold text-obsidian">
                    Discounts
                  </h2>
                  <p className="mt-2 text-sm text-ash">
                    Create codes for fixed or percentage promotions.
                  </p>
                  <form
                    onSubmit={handleDiscountSubmit}
                    className="mt-6 space-y-4 max-w-lg mx-auto"
                  >
                    <label className="space-y-1 text-[10px] uppercase tracking-[0.3em] text-ash">
                      <span>Code</span>
                      <input
                        value={discountForm.code}
                        onChange={(event) =>
                          setDiscountForm((prev) => ({
                            ...prev,
                            code: event.target.value,
                          }))
                        }
                        type="text"
                        className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-2 text-sm text-obsidian focus:border-obsidian focus:outline-none"
                      />
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="space-y-1 text-[10px] uppercase tracking-[0.3em] text-ash">
                        <span>Type</span>
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
                      </label>
                      <label className="space-y-1 text-[10px] uppercase tracking-[0.3em] text-ash">
                        <span>Value</span>
                        <input
                          value={discountForm.value}
                          onChange={(event) =>
                            setDiscountForm((prev) => ({
                              ...prev,
                              value: event.target.value,
                            }))
                          }
                          type="number"
                          className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-2 text-sm text-obsidian focus:border-obsidian focus:outline-none"
                        />
                      </label>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="space-y-1 text-[10px] uppercase tracking-[0.3em] text-ash">
                        <span>Minimum subtotal</span>
                        <input
                          value={discountForm.minSubtotal}
                          onChange={(event) =>
                            setDiscountForm((prev) => ({
                              ...prev,
                              minSubtotal: event.target.value,
                            }))
                          }
                          type="number"
                          className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-2 text-sm text-obsidian focus:border-obsidian focus:outline-none"
                        />
                      </label>
                      <label className="space-y-1 text-[10px] uppercase tracking-[0.3em] text-ash">
                        <span>Expiry date</span>
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
                      </label>
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
                                Min ₦
                                {Number(discount.minSubtotal).toLocaleString()}
                              </span>
                            ) : null}
                            {discount.expiresAt ? (
                              <span>
                                Expires{" "}
                                {new Date(
                                  discount.expiresAt,
                                ).toLocaleDateString()}
                              </span>
                            ) : null}
                          </div>
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleDiscount(discount.code)
                              }
                              className="rounded-full border border-ash px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-obsidian transition"
                            >
                              {discount.active ? "Disable" : "Enable"}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveDiscount(discount.code)
                              }
                              className="rounded-full border border-ash px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-obsidian transition"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              ) : null}

              {activeSection === "analytics" ? (
                <section
                  id="analytics"
                  className="rounded-3xl border border-ash/30 bg-linen p-6"
                >
                  <h2 className="text-xl font-semibold text-obsidian">
                    Analytics
                  </h2>
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
                          {new Date(
                            analytics.lastCheckoutAt,
                          ).toLocaleDateString()}
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
                </section>
              ) : null}

              {activeSection === "inventory" ? (
                <section
                  id="inventory"
                  className="rounded-3xl border border-ash/30 bg-porcelain p-6 shadow-[0_24px_40px_rgba(0,0,0,0.06)]"
                >
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
                </section>
              ) : null}

              {activeSection === "reviews" ? (
                <section
                  id="reviews"
                  className="rounded-3xl border border-ash/30 bg-linen p-6"
                >
                  <h2 className="text-xl font-semibold text-obsidian">
                    Product Reviews
                  </h2>
                  <p className="mt-2 text-sm text-ash">
                    Manage user reviews across products.
                  </p>
                  <div className="mt-6 grid gap-4">
                    {adminReviews.length === 0 ? (
                      <div className="rounded-2xl border border-ash/30 bg-porcelain p-6 text-sm text-ash">
                        No reviews yet.
                      </div>
                    ) : (
                      adminReviews.map((rev) => {
                        const prod = catalog.find(
                          (p) => p.id === rev.product_id,
                        );
                        return (
                          <div
                            key={rev.id}
                            className="flex flex-col gap-3 rounded-2xl border border-ash/30 bg-porcelain p-5 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <p className="text-sm font-semibold text-obsidian">
                                {rev.name} · {rev.rating}★
                              </p>
                              <p className="text-xs text-ash">
                                {prod
                                  ? `${prod.name} · ${prod.category}`
                                  : rev.product_id}
                              </p>
                              <p className="mt-1 text-sm text-obsidian">
                                {rev.comment}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeReview(rev.id)}
                              className="rounded-full border border-ash px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-obsidian transition"
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>
              ) : null}
            </main>
          </div>
        </div>
      </div>
      {isMenuOpen ? (
        <button
          type="button"
          onClick={() => setIsMenuOpen(false)}
          className="fixed inset-0 z-40 bg-obsidian/70 backdrop-blur-sm lg:hidden"
          aria-label="Close menu"
        />
      ) : null}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col gap-6 overflow-y-auto bg-porcelain px-6 pb-10 pt-10 shadow-[0_24px_60px_rgba(15,15,15,0.2)] transition-transform lg:hidden ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.3em] text-ash">Menu</p>
          <button
            type="button"
            onClick={() => setIsMenuOpen(false)}
            className="rounded-full border border-ash px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-obsidian"
          >
            Close
          </button>
        </div>
        <nav className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-ash">
          {navSections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => handleSectionChange(section.id)}
              className="block w-full rounded-full border border-ash/30 bg-white/70 px-4 py-3 text-left text-[11px] text-obsidian transition hover:border-ash"
            >
              {section.label}
            </button>
          ))}
        </nav>
      </aside>
      <Footer />
    </div>
  );
}

export default AdminDashboardPage;
