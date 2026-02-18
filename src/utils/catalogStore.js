const catalogKey = "homespired_catalog_v1";
const cartKey = "homespired_cart_v1";
const settingsKey = "homespired_settings_v1";
const ordersKey = "homespired_orders_v1";
const customersKey = "homespired_customers_v1";
const reviewsKey = "homespired_reviews_v1";
const discountsKey = "homespired_discounts_v1";
const analyticsKey = "homespired_analytics_v1";
const orderNumberKey = "homespired_order_number_v1";
const requestNumberKey = "homespired_request_number_v1";
const cartUpdatedKey = "homespired_cart_updated_v1";

export const defaultSettings = {
  whatsappNumber: "09026561373",
  bankName: "Providus Bank",
  accountName: "Designs by Homespired",
  accountNumber: "1305131099",
  inspectionOptions: [
    {
      id: "lagos-island-inspection",
      title: "Lagos Island Inspection",
      price: 200000,
      summary:
        "On-site inspection and measured assessment for refined design direction.",
      redirectOnly: false,
    },
    {
      id: "lagos-mainland-inspection",
      title: "Lagos Mainland Inspection",
      price: 150000,
      summary: "In-person walkthrough with tailored recommendations and scope.",
      redirectOnly: false,
    },
    {
      id: "outside-lagos-inspection",
      title: "Outside Lagos Inspection",
      price: 0,
      summary:
        "Speak with a representative to schedule travel and scope pricing.",
      redirectOnly: true,
    },
  ],
  consultationOptions: [
    {
      id: "bespoke-advisory",
      title: "The Bespoke Advisory",
      price: 100000,
      summary:
        "Focused guidance, concept direction, and styling recommendations.",
    },
    {
      id: "signature-experience",
      title: "The Signature Experience",
      price: 250000,
      summary:
        "Comprehensive design support with curated sourcing and layout planning.",
    },
    {
      id: "luxe-transformation",
      title: "The Luxe Transformation",
      price: 500000,
      summary:
        "Full-scope transformation with bespoke details and elevated finishes.",
    },
  ],
  classOptions: [
    {
      id: "class-physical",
      title: "Physical Class",
      price: 1000000,
      summary: "Hands-on interior design training in a studio setting.",
    },
    {
      id: "class-online",
      title: "Online Class",
      price: 600000,
      summary: "Live online sessions with guided coursework and support.",
    },
  ],
  shippingZones: [
    { id: "lagos-island", label: "Lagos Island", price: 5000 },
    { id: "lagos-mainland", label: "Lagos Mainland", price: 3500 },
    { id: "outside-lagos", label: "Outside Lagos", price: 15000 },
  ],
  inventoryAlertThreshold: 3,
};

export const getCatalog = () => {
  const raw = localStorage.getItem(catalogKey);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveCatalog = (items) => {
  localStorage.setItem(catalogKey, JSON.stringify(items));
};

export const addCatalogItem = (item) => {
  const next = [item, ...getCatalog()];
  saveCatalog(next);
  return next;
};

export const removeCatalogItem = (id) => {
  const next = getCatalog().filter((item) => item.id !== id);
  saveCatalog(next);
  return next;
};

export const getCart = () => {
  const raw = localStorage.getItem(cartKey);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveCart = (items) => {
  localStorage.setItem(cartKey, JSON.stringify(items));
  localStorage.setItem(cartUpdatedKey, String(Date.now()));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cart-updated"));
  }
};

export const addToCart = (item) => {
  const cart = getCart();
  const catalog = getCatalog();
  const product = catalog.find((entry) => entry.id === item.id);
  const inventory = Number(product?.inventory ?? item.inventory ?? 0);
  const existing = cart.find((entry) => entry.id === item.id);
  const nextQuantity = (existing?.quantity || 0) + 1;
  if (inventory > 0 && nextQuantity > inventory) {
    return cart;
  }
  const next = existing
    ? cart.map((entry) =>
        entry.id === item.id ? { ...entry, quantity: nextQuantity } : entry,
      )
    : [{ ...item, quantity: 1 }, ...cart];
  saveCart(next);
  trackAnalytics("cartAdds");
  return next;
};

export const updateCartQuantity = (id, quantity) => {
  const cart = getCart();
  const catalog = getCatalog();
  const product = catalog.find((entry) => entry.id === id);
  const inventory = Number(product?.inventory ?? 0);
  const next = cart
    .map((entry) => {
      if (entry.id !== id) return entry;
      const safeQuantity = Math.max(1, quantity);
      if (inventory > 0) {
        return { ...entry, quantity: Math.min(safeQuantity, inventory) };
      }
      return { ...entry, quantity: safeQuantity };
    })
    .filter((entry) => entry.quantity > 0);
  saveCart(next);
  return next;
};

export const adjustInventory = (items, direction) => {
  const catalog = getCatalog();
  const delta = direction === "increase" ? 1 : -1;
  const next = catalog.map((product) => {
    const ordered = items.find((entry) => entry.id === product.id);
    if (!ordered) return product;
    const current = Number(product.inventory || 0);
    const updated = Math.max(0, current + delta * ordered.quantity);
    return { ...product, inventory: updated };
  });
  saveCatalog(next);
  return next;
};

export const removeFromCart = (id) => {
  const next = getCart().filter((entry) => entry.id !== id);
  saveCart(next);
  return next;
};

export const clearCart = () => {
  saveCart([]);
  return [];
};

export const getSettings = () => {
  const raw = localStorage.getItem(settingsKey);
  if (!raw) return defaultSettings;
  try {
    const parsed = JSON.parse(raw);
    return {
      ...defaultSettings,
      ...parsed,
      inspectionOptions:
        parsed?.inspectionOptions ?? defaultSettings.inspectionOptions,
      consultationOptions:
        parsed?.consultationOptions ?? defaultSettings.consultationOptions,
      classOptions: parsed?.classOptions ?? defaultSettings.classOptions,
      shippingZones: parsed?.shippingZones ?? defaultSettings.shippingZones,
    };
  } catch {
    return defaultSettings;
  }
};

export const saveSettings = (settings) => {
  localStorage.setItem(settingsKey, JSON.stringify(settings));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("settings-updated"));
  }
};

export const getOrders = () => {
  const raw = localStorage.getItem(ordersKey);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveOrders = (orders) => {
  localStorage.setItem(ordersKey, JSON.stringify(orders));
};

export const getNextOrderNumber = () => {
  const raw = localStorage.getItem(orderNumberKey);
  const next = Number(raw || 0) + 1;
  localStorage.setItem(orderNumberKey, String(next));
  return next;
};

export const getNextRequestNumber = () => {
  const raw = localStorage.getItem(requestNumberKey);
  const next = Number(raw || 0) + 1;
  localStorage.setItem(requestNumberKey, String(next));
  return next;
};

export const addOrder = (order) => {
  const next = [order, ...getOrders()];
  saveOrders(next);
  return next;
};

export const updateOrder = (orderId, updates) => {
  const next = getOrders().map((order) =>
    order.id === orderId
      ? {
          ...order,
          ...updates,
          updatedAt:
            updates.updatedAt === undefined ? Date.now() : updates.updatedAt,
        }
      : order,
  );
  saveOrders(next);
  return next;
};

export const getCustomers = () => {
  const raw = localStorage.getItem(customersKey);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveCustomers = (customers) => {
  localStorage.setItem(customersKey, JSON.stringify(customers));
};

export const upsertCustomer = (nextCustomer) => {
  const customers = getCustomers();
  const existing = customers.find(
    (entry) => entry.email?.toLowerCase() === nextCustomer.email?.toLowerCase(),
  );
  const next = existing
    ? customers.map((entry) =>
        entry.email?.toLowerCase() === nextCustomer.email?.toLowerCase()
          ? { ...entry, ...nextCustomer }
          : entry,
      )
    : [{ ...nextCustomer, createdAt: Date.now() }, ...customers];
  saveCustomers(next);
  return next;
};

export const getReviews = () => {
  const raw = localStorage.getItem(reviewsKey);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const addReview = (review) => {
  const next = [review, ...getReviews()];
  localStorage.setItem(reviewsKey, JSON.stringify(next));
  return next;
};

export const getProductReviews = (productId) => {
  return getReviews().filter((review) => review.productId === productId);
};

export const getDiscounts = () => {
  const raw = localStorage.getItem(discountsKey);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveDiscounts = (discounts) => {
  localStorage.setItem(discountsKey, JSON.stringify(discounts));
};

export const addDiscount = (discount) => {
  const next = [discount, ...getDiscounts()];
  saveDiscounts(next);
  return next;
};

export const removeDiscount = (code) => {
  const next = getDiscounts().filter(
    (discount) => discount.code.toLowerCase() !== code.toLowerCase(),
  );
  saveDiscounts(next);
  return next;
};

export const updateDiscount = (code, updates) => {
  const next = getDiscounts().map((discount) =>
    discount.code.toLowerCase() === code.toLowerCase()
      ? { ...discount, ...updates }
      : discount,
  );
  saveDiscounts(next);
  return next;
};

export const findActiveDiscount = (code) => {
  if (!code) return null;
  const now = Date.now();
  return (
    getDiscounts().find((discount) => {
      if (!discount.active) return false;
      if (discount.expiresAt && now > discount.expiresAt) return false;
      return discount.code.toLowerCase() === code.toLowerCase();
    }) || null
  );
};

export const getAnalytics = () => {
  const raw = localStorage.getItem(analyticsKey);
  if (!raw) {
    return {
      storeViews: 0,
      cartAdds: 0,
      checkouts: 0,
      lastCheckoutAt: null,
    };
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      storeViews: parsed.storeViews || 0,
      cartAdds: parsed.cartAdds || 0,
      checkouts: parsed.checkouts || 0,
      lastCheckoutAt: parsed.lastCheckoutAt || null,
    };
  } catch {
    return {
      storeViews: 0,
      cartAdds: 0,
      checkouts: 0,
      lastCheckoutAt: null,
    };
  }
};

export const saveAnalytics = (analytics) => {
  localStorage.setItem(analyticsKey, JSON.stringify(analytics));
};

export const trackAnalytics = (field) => {
  const analytics = getAnalytics();
  const next = {
    ...analytics,
    [field]: (analytics[field] || 0) + 1,
  };
  if (field === "checkouts") {
    next.lastCheckoutAt = Date.now();
  }
  saveAnalytics(next);
  return next;
};

export const getCartUpdatedAt = () => {
  const raw = localStorage.getItem(cartUpdatedKey);
  return raw ? Number(raw) : null;
};

export const isCartAbandoned = () => {
  const lastUpdated = getCartUpdatedAt();
  if (!lastUpdated) return false;
  return Date.now() - lastUpdated > 1000 * 60 * 60 * 24;
};

export const normalizeWhatsAppNumber = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0") && digits.length === 11) {
    return `234${digits.slice(1)}`;
  }
  if (digits.startsWith("00")) {
    return digits.slice(2);
  }
  return digits;
};
