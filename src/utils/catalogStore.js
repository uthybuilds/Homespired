import supabase from "./supabaseClient.js";
const storageMode = import.meta.env.VITE_STORAGE_MODE || "local";
let __cloudHydrated = false;
const __isCloud = () =>
  storageMode === "cloud" && import.meta.env.VITE_E2E_BYPASS_AUTH !== "true";
const __dispatchStorage = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("storage"));
  }
};

const catalogKey = "homespired_catalog_v1";
const cartKey = "homespired_cart_v1";
const settingsKey = "homespired_settings_v1";
const ordersKey = "homespired_orders_v1";
const requestsKey = "homespired_requests_v1";
const customersKey = "homespired_customers_v1";
const reviewsKey = "homespired_reviews_v1";
const discountsKey = "homespired_discounts_v1";
const analyticsKey = "homespired_analytics_v1";
const orderNumberKey = "homespired_order_number_v1";
const requestNumberKey = "homespired_request_number_v1";
const cartUpdatedKey = "homespired_cart_updated_v1";
const lastEmailKey = "homespired_last_email_v1";

// In-memory store when running in strict cloud mode to avoid any localStorage writes
const __memStore = {
  [catalogKey]: [],
  [cartKey]: [],
  [settingsKey]: null,
  [ordersKey]: [],
  [requestsKey]: [],
  [customersKey]: [],
  [reviewsKey]: [],
  [discountsKey]: [],
  [analyticsKey]: null,
  [orderNumberKey]: 0,
  [requestNumberKey]: 0,
  [cartUpdatedKey]: null,
  [lastEmailKey]: "",
};

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

async function __hydrateFromCloud() {
  if (!__isCloud() || __cloudHydrated) return;
  __cloudHydrated = true;
  try {
    const [
      { data: cat },
      { data: disc },
      { data: cust },
      { data: ord },
      { data: req },
      { data: set },
      { data: ana },
      { data: rev },
    ] = await Promise.all([
      supabase
        .from("catalog")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("discounts")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("requests")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("settings").select("*").limit(1).maybeSingle(),
      supabase.from("analytics").select("*").limit(1).maybeSingle(),
      supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);
    if (Array.isArray(cat)) {
      const mapped = cat.map((x) => ({
        id: x.id,
        name: x.name,
        price: Number(x.price || 0),
        category: x.category,
        image: x.image_url || x.image,
        description: x.description,
        inventory: Number(x.inventory || 0),
      }));
      __memStore[catalogKey] = mapped;
    }
    if (Array.isArray(disc)) {
      __memStore[discountsKey] = disc.map((x) => ({
        code: x.code,
        type: x.type,
        value: Number(x.value || 0),
        minSubtotal: Number(x.min_subtotal || 0),
        expiresAt: x.expires_at ? new Date(x.expires_at).getTime() : null,
        active: x.active !== false,
        createdAt: x.created_at ? new Date(x.created_at).getTime() : Date.now(),
      }));
    }
    if (Array.isArray(cust)) {
      __memStore[customersKey] = cust.map((x) => ({
        name: x.name || "",
        email: x.email,
        phone: x.phone || "",
        address: x.address || "",
        city: x.city || "",
        state: x.state || "",
        createdAt: x.created_at ? new Date(x.created_at).getTime() : Date.now(),
      }));
    }
    if (Array.isArray(ord)) {
      __memStore[ordersKey] = ord.map((x) => ({
        id: x.id,
        number: x.number,
        items: x.items || [],
        subtotal: Number(x.subtotal || 0),
        shipping: Number(x.shipping || 0),
        total: Number(x.total || 0),
        discountCode: x.discount_code || "",
        discountAmount: Number(x.discount_amount || 0),
        zoneId: x.zone_id || "",
        status: x.status || "Pending",
        customer: x.customer || {},
        notes: x.notes || "",
        createdAt: x.created_at ? new Date(x.created_at).getTime() : Date.now(),
        updatedAt: x.updated_at ? new Date(x.updated_at).getTime() : Date.now(),
      }));
    }
    if (Array.isArray(req)) {
      localStorage.setItem(
        requestsKey,
        JSON.stringify(
          req.map((x) => ({
            id: x.id,
            type: x.type || "request",
            payload: x.payload || {},
            status: x.status || "Pending",
            number: x.number || null,
            createdAt: x.created_at
              ? new Date(x.created_at).getTime()
              : Date.now(),
            updatedAt: x.updated_at
              ? new Date(x.updated_at).getTime()
              : Date.now(),
          })),
        ),
      );
    }
    const mergedSettings = set
      ? {
          ...defaultSettings,
          whatsappNumber: set.whatsapp_number || defaultSettings.whatsappNumber,
          bankName: set.bank_name || defaultSettings.bankName,
          accountName: set.account_name || defaultSettings.accountName,
          accountNumber: set.account_number || defaultSettings.accountNumber,
          inspectionOptions:
            set.inspection_options || defaultSettings.inspectionOptions,
          consultationOptions:
            set.consultation_options || defaultSettings.consultationOptions,
          classOptions: set.class_options || defaultSettings.classOptions,
          shippingZones: set.shipping_zones || defaultSettings.shippingZones,
          inventoryAlertThreshold: Number(
            set.inventory_alert_threshold ??
              defaultSettings.inventoryAlertThreshold,
          ),
        }
      : defaultSettings;
    __memStore[settingsKey] = mergedSettings;
    const mergedAnalytics = ana
      ? {
          storeViews: Number(ana.store_views || 0),
          cartAdds: Number(ana.cart_adds || 0),
          checkouts: Number(ana.checkouts || 0),
          lastCheckoutAt: ana.last_checkout_at
            ? new Date(ana.last_checkout_at).getTime()
            : null,
        }
      : { storeViews: 0, cartAdds: 0, checkouts: 0, lastCheckoutAt: null };
    __memStore[analyticsKey] = mergedAnalytics;
    if (Array.isArray(rev)) {
      __memStore[reviewsKey] = rev.map((x) => ({
        productId: x.product_id,
        name: x.name || "",
        rating: Number(x.rating || 0),
        comment: x.comment || "",
        createdAt: x.created_at ? new Date(x.created_at).getTime() : Date.now(),
      }));
    }
    __dispatchStorage();
  } catch (_err) {
    void _err;
  }
}

if (__isCloud()) {
  __hydrateFromCloud();
}

export const getCatalog = () => {
  if (__isCloud()) {
    return Array.isArray(__memStore[catalogKey]) ? __memStore[catalogKey] : [];
  }
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
  if (__isCloud()) {
    __memStore[catalogKey] = items;
    __dispatchStorage();
    const rows = items.map((x) => ({
      id: x.id,
      name: x.name,
      price: x.price,
      category: x.category,
      image_url: x.image || x.imageUrl,
      description: x.description,
      inventory: x.inventory ?? 0,
    }));
    supabase.from("catalog").upsert(rows, { onConflict: "id" });
  } else {
    localStorage.setItem(catalogKey, JSON.stringify(items));
  }
};

export const addCatalogItem = (item) => {
  const next = [item, ...getCatalog()];
  saveCatalog(next);
  if (__isCloud()) {
    supabase.from("catalog").upsert([
      {
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.category,
        image_url: item.image || item.imageUrl,
        description: item.description,
        inventory: item.inventory ?? 0,
      },
    ]);
  }
  return next;
};

export const removeCatalogItem = (id) => {
  const next = getCatalog().filter((item) => item.id !== id);
  saveCatalog(next);
  if (__isCloud()) {
    supabase.from("catalog").delete().eq("id", id);
  }
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

export const getLastKnownEmail = () => {
  const raw = localStorage.getItem(lastEmailKey);
  return raw || "";
};

export const setLastKnownEmail = (email) => {
  if (!email) return;
  localStorage.setItem(lastEmailKey, email);
};

export const saveSettings = (settings) => {
  localStorage.setItem(settingsKey, JSON.stringify(settings));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("settings-updated"));
  }
  if (__isCloud()) {
    supabase.from("settings").upsert([
      {
        id: "default",
        whatsapp_number: settings.whatsappNumber,
        bank_name: settings.bankName,
        account_name: settings.accountName,
        account_number: settings.accountNumber,
        inspection_options: settings.inspectionOptions,
        consultation_options: settings.consultationOptions,
        class_options: settings.classOptions,
        shipping_zones: settings.shippingZones,
        inventory_alert_threshold: settings.inventoryAlertThreshold,
      },
    ]);
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
  if (__isCloud()) {
    const rows = orders.map((o) => ({
      id: o.id,
      number: o.number,
      items: o.items,
      subtotal: o.subtotal,
      shipping: o.shipping,
      total: o.total,
      discount_code: o.discountCode || null,
      discount_amount: o.discountAmount || 0,
      zone_id: o.zoneId || null,
      status: o.status || "Pending",
      customer: o.customer || {},
      notes: o.notes || "",
      created_at: o.createdAt ? new Date(o.createdAt).toISOString() : null,
      updated_at: o.updatedAt ? new Date(o.updatedAt).toISOString() : null,
    }));
    supabase.from("orders").upsert(rows, { onConflict: "id" });
  }
};

export const getRequests = () => {
  const raw = localStorage.getItem(requestsKey);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveRequests = (requests) => {
  localStorage.setItem(requestsKey, JSON.stringify(requests));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("requests-updated"));
  }
  if (__isCloud()) {
    const rows = requests.map((r) => ({
      id: r.id,
      type: r.type || "request",
      payload: r.payload || {},
      status: r.status || "Pending",
      number: r.number || null,
      created_at: r.createdAt ? new Date(r.createdAt).toISOString() : null,
      updated_at: r.updatedAt ? new Date(r.updatedAt).toISOString() : null,
    }));
    supabase.from("requests").upsert(rows, { onConflict: "id" });
  }
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
  if (__isCloud()) {
    supabase.from("orders").insert([
      {
        id: order.id,
        number: order.number,
        items: order.items,
        subtotal: order.subtotal,
        shipping: order.shipping,
        total: order.total,
        discount_code: order.discountCode || null,
        discount_amount: order.discountAmount || 0,
        zone_id: order.zoneId || null,
        status: order.status || "Pending",
        customer: order.customer || {},
        notes: order.notes || "",
      },
    ]);
  }
  return next;
};

export const addRequest = (request) => {
  const next = [request, ...getRequests()];
  saveRequests(next);
  if (__isCloud()) {
    supabase.from("requests").insert([
      {
        id: request.id,
        type: request.type || "request",
        payload: request.payload || {},
        status: request.status || "Pending",
        number: request.number || null,
      },
    ]);
  }
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
  if (__isCloud()) {
    const row = next.find((o) => o.id === orderId);
    if (row) {
      supabase.from("orders").upsert([
        {
          id: row.id,
          number: row.number,
          items: row.items,
          subtotal: row.subtotal,
          shipping: row.shipping,
          total: row.total,
          discount_code: row.discountCode || null,
          discount_amount: row.discountAmount || 0,
          zone_id: row.zoneId || null,
          status: row.status || "Pending",
          customer: row.customer || {},
          notes: row.notes || "",
          updated_at: row.updatedAt
            ? new Date(row.updatedAt).toISOString()
            : new Date().toISOString(),
        },
      ]);
    }
  }
  return next;
};

export const updateRequest = (requestId, updates) => {
  const next = getRequests().map((request) =>
    request.id === requestId
      ? {
          ...request,
          ...updates,
          updatedAt:
            updates.updatedAt === undefined ? Date.now() : updates.updatedAt,
        }
      : request,
  );
  saveRequests(next);
  if (__isCloud()) {
    const row = next.find((r) => r.id === requestId);
    if (row) {
      supabase.from("requests").upsert([
        {
          id: row.id,
          type: row.type || "request",
          payload: row.payload || {},
          status: row.status || "Pending",
          number: row.number || null,
          updated_at: row.updatedAt
            ? new Date(row.updatedAt).toISOString()
            : new Date().toISOString(),
        },
      ]);
    }
  }
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
  if (__isCloud()) {
    const rows = customers.map((c) => ({
      email: c.email,
      name: c.name || "",
      phone: c.phone || "",
      address: c.address || "",
      city: c.city || "",
      state: c.state || "",
    }));
    supabase.from("customers").upsert(rows, { onConflict: "email" });
  }
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
  if (__isCloud()) {
    const c = next.find(
      (entry) =>
        entry.email?.toLowerCase() === nextCustomer.email?.toLowerCase(),
    );
    if (c) {
      supabase.from("customers").upsert([
        {
          email: c.email,
          name: c.name || "",
          phone: c.phone || "",
          address: c.address || "",
          city: c.city || "",
          state: c.state || "",
        },
      ]);
    }
  }
  return next;
};

export const getReviews = () => {
  if (__isCloud()) {
    return Array.isArray(__memStore[reviewsKey]) ? __memStore[reviewsKey] : [];
  }
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
  if (__isCloud()) {
    __memStore[reviewsKey] = next;
    supabase.from("reviews").insert([
      {
        product_id: review.productId,
        name: review.name || "",
        rating: Number(review.rating || 0),
        comment: review.comment || "",
      },
    ]);
    __dispatchStorage();
  } else {
    localStorage.setItem(reviewsKey, JSON.stringify(next));
  }
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
  if (__isCloud()) {
    const rows = discounts.map((d) => ({
      code: d.code,
      type: d.type,
      value: d.value,
      min_subtotal: d.minSubtotal || 0,
      expires_at: d.expiresAt ? new Date(d.expiresAt).toISOString() : null,
      active: d.active !== false,
    }));
    supabase.from("discounts").upsert(rows, { onConflict: "code" });
  }
};

export const addDiscount = (discount) => {
  const next = [discount, ...getDiscounts()];
  saveDiscounts(next);
  if (__isCloud()) {
    supabase.from("discounts").insert([
      {
        code: discount.code,
        type: discount.type,
        value: discount.value,
        min_subtotal: discount.minSubtotal || 0,
        expires_at: discount.expiresAt
          ? new Date(discount.expiresAt).toISOString()
          : null,
        active: discount.active !== false,
      },
    ]);
  }
  return next;
};

export const removeDiscount = (code) => {
  const next = getDiscounts().filter(
    (discount) => discount.code.toLowerCase() !== code.toLowerCase(),
  );
  saveDiscounts(next);
  if (__isCloud()) {
    supabase.from("discounts").delete().eq("code", code);
  }
  return next;
};

export const updateDiscount = (code, updates) => {
  const next = getDiscounts().map((discount) =>
    discount.code.toLowerCase() === code.toLowerCase()
      ? { ...discount, ...updates }
      : discount,
  );
  saveDiscounts(next);
  if (__isCloud()) {
    const row = next.find((d) => d.code.toLowerCase() === code.toLowerCase());
    if (row) {
      supabase.from("discounts").upsert([
        {
          code: row.code,
          type: row.type,
          value: row.value,
          min_subtotal: row.minSubtotal || 0,
          expires_at: row.expiresAt
            ? new Date(row.expiresAt).toISOString()
            : null,
          active: row.active !== false,
        },
      ]);
    }
  }
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
  if (__isCloud()) {
    supabase.from("analytics").upsert([
      {
        id: "default",
        store_views: analytics.storeViews || 0,
        cart_adds: analytics.cartAdds || 0,
        checkouts: analytics.checkouts || 0,
        last_checkout_at: analytics.lastCheckoutAt
          ? new Date(analytics.lastCheckoutAt).toISOString()
          : null,
      },
    ]);
  }
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
