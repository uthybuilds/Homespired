import supabase from "./supabaseClient.js";
const storageMode = import.meta.env.VITE_STORAGE_MODE || "local";
let __cloudHydrated = false;
const __isCloud = () =>
  storageMode === "cloud" && import.meta.env.VITE_E2E_BYPASS_AUTH !== "true";
let __userId = null;
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
const getLocalCartFallback = () => {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(cartKey);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveLocalCartFallback = (items) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(cartKey, JSON.stringify(items));
  localStorage.setItem(cartUpdatedKey, String(Date.now()));
  __dispatchStorage();
  window.dispatchEvent(new Event("cart-updated"));
};

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

async function __loadCartFromCloud() {
  if (!__isCloud()) return;
  if (__userId) {
    const { data, error } = await supabase
      .from("carts")
      .select("*")
      .eq("user_id", __userId)
      .maybeSingle();
    if (!error) {
      __memStore[cartKey] = Array.isArray(data?.items) ? data.items : [];
      __memStore[cartUpdatedKey] = Date.now();
      __dispatchStorage();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cart-updated"));
      }
    }
    return;
  }
  const items = getLocalCartFallback();
  __memStore[cartKey] = items;
  __memStore[cartUpdatedKey] = Date.now();
  __dispatchStorage();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cart-updated"));
  }
}

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
    const custByEmail = new Map(
      (Array.isArray(cust) ? cust : []).map((c) => [
        (c.email || "").toLowerCase(),
        {
          name: c.name || "",
          email: c.email || "",
          phone: c.phone || "",
          address: c.address || "",
          city: c.city || "",
          state: c.state || "",
        },
      ]),
    );
    if (Array.isArray(ord)) {
      __memStore[ordersKey] = ord.map((x) => {
        const top = {
          name: x.name || "",
          email: x.email || "",
          phone: x.phone || "",
          address: x.address || "",
          city: x.city || "",
          state: x.state || "",
        };
        const mergedEmail = (
          x.customer?.email ||
          top.email ||
          ""
        ).toLowerCase();
        const fromBook =
          mergedEmail && custByEmail.has(mergedEmail)
            ? custByEmail.get(mergedEmail)
            : null;
        const customer = {
          name: x.customer?.name || top.name || fromBook?.name || "",
          email: x.customer?.email || top.email || fromBook?.email || "",
          phone: x.customer?.phone || top.phone || fromBook?.phone || "",
          address:
            x.customer?.address || top.address || fromBook?.address || "",
          city: x.customer?.city || top.city || fromBook?.city || "",
          state: x.customer?.state || top.state || fromBook?.state || "",
        };
        return {
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
          customer,
          notes: x.notes || "",
          createdAt: x.created_at
            ? new Date(x.created_at).getTime()
            : Date.now(),
          updatedAt: x.updated_at
            ? new Date(x.updated_at).getTime()
            : Date.now(),
        };
      });
    }
    if (Array.isArray(req)) {
      __memStore[requestsKey] = req.map((x) => ({
        id: x.id,
        type: x.payload?.type || x.type || "request",
        payload: x.payload || {},
        status: x.status || x.payload?.status || "Pending",
        number: x.number ?? x.payload?.requestNumber ?? null,
        requestNumber: x.payload?.requestNumber ?? x.number ?? null,
        requestRef: x.payload?.requestRef || "",
        optionId: x.payload?.optionId || "",
        optionTitle: x.payload?.optionTitle || "",
        price: Number(x.payload?.price || 0),
        redirectOnly: x.payload?.redirectOnly ?? false,
        customer: x.payload?.customer || {},
        notes: x.payload?.notes || "",
        proofUrl: x.payload?.proofUrl || "",
        createdAt: x.created_at
          ? new Date(x.created_at).getTime()
          : x.payload?.createdAt
            ? new Date(x.payload.createdAt).getTime()
            : Date.now(),
        updatedAt: x.updated_at
          ? new Date(x.updated_at).getTime()
          : x.payload?.updatedAt
            ? new Date(x.payload.updatedAt).getTime()
            : x.payload?.createdAt
              ? new Date(x.payload.createdAt).getTime()
              : Date.now(),
      }));
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

if (__isCloud()) {
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      supabase.auth.signOut({ scope: "local" });
      __userId = null;
      __loadCartFromCloud();
      return;
    }
    __userId = data?.session?.user?.id || null;
    __loadCartFromCloud();
  });
  supabase.auth.onAuthStateChange((_event, session) => {
    __userId = session?.user?.id || null;
    __loadCartFromCloud();
  });
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
  if (__isCloud()) {
    return Array.isArray(__memStore[cartKey]) ? __memStore[cartKey] : [];
  }
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
  if (__isCloud()) {
    __memStore[cartKey] = items;
    __memStore[cartUpdatedKey] = Date.now();
    if (__userId) {
      supabase
        .from("carts")
        .upsert(
          [{ user_id: __userId, items, updated_at: new Date().toISOString() }],
          {
            onConflict: "user_id",
          },
        );
    } else {
      saveLocalCartFallback(items);
    }
    __dispatchStorage();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cart-updated"));
    }
  } else {
    localStorage.setItem(cartKey, JSON.stringify(items));
    localStorage.setItem(cartUpdatedKey, String(Date.now()));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cart-updated"));
    }
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
  if (__isCloud()) {
    return __memStore[settingsKey] || defaultSettings;
  }
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
  if (__isCloud()) {
    return __memStore[lastEmailKey] || "";
  }
  const raw = localStorage.getItem(lastEmailKey);
  return raw || "";
};

export const setLastKnownEmail = (email) => {
  if (!email) return;
  if (__isCloud()) {
    __memStore[lastEmailKey] = email;
    return;
  }
  localStorage.setItem(lastEmailKey, email);
};

export const saveSettings = (settings) => {
  if (__isCloud()) {
    __memStore[settingsKey] = settings;
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("settings-updated"));
    }
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
    return;
  }
  localStorage.setItem(settingsKey, JSON.stringify(settings));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("settings-updated"));
  }
};

export const getOrders = () => {
  if (__isCloud()) {
    return Array.isArray(__memStore[ordersKey]) ? __memStore[ordersKey] : [];
  }
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
  if (__isCloud()) {
    __memStore[ordersKey] = Array.isArray(orders) ? orders : [];
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
    return;
  }
  localStorage.setItem(ordersKey, JSON.stringify(orders));
};

export const getRequests = () => {
  if (__isCloud()) {
    return Array.isArray(__memStore[requestsKey])
      ? __memStore[requestsKey]
      : [];
  }
  const raw = localStorage.getItem(requestsKey);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const buildRequestPayload = (request) => {
  const base =
    request?.payload && typeof request.payload === "object"
      ? request.payload
      : {};
  return {
    ...base,
    type: request?.type || base.type || null,
    optionId: request?.optionId || base.optionId || null,
    optionTitle: request?.optionTitle || base.optionTitle || "",
    price: Number(request?.price ?? base.price ?? 0),
    customer: request?.customer || base.customer || {},
    notes: request?.notes ?? base.notes ?? "",
    proofUrl: request?.proofUrl ?? base.proofUrl ?? "",
    requestRef: request?.requestRef || base.requestRef || "",
    requestNumber:
      request?.requestNumber ?? request?.number ?? base.requestNumber ?? null,
    redirectOnly: request?.redirectOnly ?? base.redirectOnly ?? false,
    createdAt: request?.createdAt ?? base.createdAt ?? null,
    updatedAt: request?.updatedAt ?? base.updatedAt ?? null,
  };
};

export const saveRequests = (requests) => {
  if (__isCloud()) {
    __memStore[requestsKey] = Array.isArray(requests) ? requests : [];
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("requests-updated"));
    }
    const rows = requests.map((r) => ({
      id: r.id,
      type: r.type || "request",
      payload: buildRequestPayload(r),
      status: r.status || "Pending",
      number: r.number ?? r.requestNumber ?? null,
      created_at: r.createdAt ? new Date(r.createdAt).toISOString() : null,
      updated_at: r.updatedAt ? new Date(r.updatedAt).toISOString() : null,
    }));
    supabase.from("requests").upsert(rows, { onConflict: "id" });
    return;
  }
  localStorage.setItem(requestsKey, JSON.stringify(requests));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("requests-updated"));
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
        payload: buildRequestPayload(request),
        status: request.status || "Pending",
        number: request.number ?? request.requestNumber ?? null,
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
          payload: buildRequestPayload(row),
          status: row.status || "Pending",
          number: row.number ?? row.requestNumber ?? null,
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
  if (__isCloud()) {
    return Array.isArray(__memStore[customersKey])
      ? __memStore[customersKey]
      : [];
  }
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
  if (__isCloud()) {
    __memStore[customersKey] = Array.isArray(customers) ? customers : [];
    const rows = customers.map((c) => ({
      email: c.email,
      name: c.name || "",
      phone: c.phone || "",
      address: c.address || "",
      city: c.city || "",
      state: c.state || "",
    }));
    supabase.from("customers").upsert(rows, { onConflict: "email" });
    return;
  }
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
      supabase.from("profiles").upsert([
        {
          email: c.email,
          name: c.name || "",
          phone: c.phone || "",
          address: c.address || "",
          city: c.city || "",
          state: c.state || "",
          updated_at: new Date().toISOString(),
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
  if (__isCloud()) {
    return Array.isArray(__memStore[discountsKey])
      ? __memStore[discountsKey]
      : [];
  }
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
  if (__isCloud()) {
    __memStore[discountsKey] = Array.isArray(discounts) ? discounts : [];
    const rows = discounts.map((d) => ({
      code: d.code,
      type: d.type,
      value: d.value,
      min_subtotal: d.minSubtotal || 0,
      expires_at: d.expiresAt ? new Date(d.expiresAt).toISOString() : null,
      active: d.active !== false,
    }));
    supabase.from("discounts").upsert(rows, { onConflict: "code" });
    return;
  }
  localStorage.setItem(discountsKey, JSON.stringify(discounts));
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
  if (__isCloud()) {
    return (
      __memStore[analyticsKey] || {
        storeViews: 0,
        cartAdds: 0,
        checkouts: 0,
        lastCheckoutAt: null,
      }
    );
  }
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
  if (__isCloud()) {
    __memStore[analyticsKey] = analytics;
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
    return;
  }
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
  if (__isCloud()) {
    return __memStore[cartUpdatedKey] || null;
  }
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

export const nextCounter = async (key) => {
  const fallback = () => {
    if (key === "order") return getNextOrderNumber();
    if (key === "request") return getNextRequestNumber();
    const genericKey = `homespired_counter_${key}_v1`;
    const raw = localStorage.getItem(genericKey);
    const next = Number(raw || 0) + 1;
    localStorage.setItem(genericKey, String(next));
    return next;
  };
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    return fallback();
  }
  const { data: sessionData } = await supabase.auth.getSession();
  const email = sessionData?.session?.user?.email?.toLowerCase() || "";
  const isAdmin = email === "uthmanajanaku@gmail.com";
  if (!isAdmin) {
    return fallback();
  }
  const { data, error } = await supabase.rpc("next_counter", { p_key: key });
  if (error) {
    return fallback();
  }
  return Number(data);
};
