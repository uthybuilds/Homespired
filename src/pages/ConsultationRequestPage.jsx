import { useEffect, useMemo, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useToast } from "../components/useToast.js";
import {
  addRequest,
  getNextRequestNumber,
  getSettings,
  getCustomers,
  getLastKnownEmail,
  normalizeWhatsAppNumber,
  setLastKnownEmail,
  upsertCustomer,
  nextCounter,
} from "../utils/catalogStore.js";
import supabase, { invokeEdgeFunction } from "../utils/supabaseClient.js";

function ConsultationRequestPage({ type }) {
  const { optionId } = useParams();
  const { pushToast } = useToast();
  const [settings, setSettings] = useState(() => getSettings());
  const [form, setForm] = useState(() => {
    const email = getLastKnownEmail();
    const customer = email
      ? getCustomers().find(
          (entry) => entry.email?.toLowerCase() === email.toLowerCase(),
        )
      : null;
    return {
      name: customer?.name || "",
      phone: customer?.phone || "",
      email,
      address: customer?.address || "",
      city: customer?.city || "",
      state: customer?.state || "",
      notes: "",
    };
  });
  const [proof, setProof] = useState(null);
  const [proofName, setProofName] = useState("");
  const [status, setStatus] = useState({ type: "idle", message: "" });
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

  const option = useMemo(() => {
    const source =
      type === "inspection"
        ? settings.inspectionOptions
        : type === "class"
          ? settings.classOptions
          : settings.consultationOptions;
    return source.find((item) => item.id === optionId) || null;
  }, [optionId, settings, type]);

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

  const uploadProof = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      return "";
    }
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", "homespired-orders");
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData },
      );
      const data = await response.json().catch(() => ({}));
      if (data?.error || !response.ok || !data?.secure_url) {
        return "";
      }
      return data.secure_url;
    } catch {
      return "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!option) {
      pushToast({ type: "error", message: "Package not found." });
      return;
    }
    if (!option.redirectOnly) {
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
    }

    try {
      setStatus({
        type: "loading",
        message: "",
      });
      const isCloud =
        import.meta.env.VITE_STORAGE_MODE === "cloud" &&
        import.meta.env.VITE_E2E_BYPASS_AUTH !== "true";
      const requestNumber = isCloud
        ? await nextCounter("request")
        : getNextRequestNumber();
      const requestRef = `Request ${requestNumber}`;
      const price = Number(option.price || 0);
      if (option.redirectOnly) {
        const whatsappNumber = normalizeWhatsAppNumber(settings.whatsappNumber);
        if (!whatsappNumber) {
          setStatus({ type: "idle", message: "" });
          pushToast({
            type: "error",
            message:
              "Add a valid WhatsApp number in admin settings to continue.",
          });
          return;
        }
        const location = [form.city, form.state].filter(Boolean).join(", ");
        const whatsappLines = [
          "HOMESPIRED STUDIO",
          `${type === "inspection" ? "Inspection" : type === "class" ? "Class" : "Consultation"} Request — ${requestRef}`,
          "",
          "Client",
          `Name: ${form.name}`,
          `Phone: ${form.phone}`,
          form.email ? `Email: ${form.email}` : null,
          form.address ? `Address: ${form.address}` : null,
          location ? `City/State: ${location}` : null,
          "",
          "Request",
          `Package: ${option.title}`,
          form.notes ? `Notes: ${form.notes}` : null,
          "",
          "Next Step",
          "Please advise travel date, location access, and pricing.",
        ].filter((line) => line !== null && line !== undefined);
        const message = whatsappLines.join("\n");
        const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
          message,
        )}`;
        addRequest({
          id: `request-${Date.now()}`,
          requestNumber,
          requestRef,
          type,
          optionId: option.id,
          optionTitle: option.title,
          price,
          redirectOnly: true,
          status: "Pending",
          customer: {
            name: form.name,
            phone: form.phone,
            email: form.email,
            address: form.address,
            city: form.city,
            state: form.state,
          },
          notes: form.notes,
          proofUrl: "",
          createdAt: Date.now(),
        });
        upsertCustomer({
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          state: form.state,
          lastOrderAt: Date.now(),
        });
        setStatus({ type: "idle", message: "" });
        pushToast({
          type: "success",
          message: "Request ready. We will confirm shortly.",
        });
        if (disableRedirect) {
          window.__e2eLastRedirect = url;
          return;
        }
        window.location.href = url;
        return;
      }

      const proofUrl = await uploadProof(proof);
      const lines = [
        `${type === "inspection" ? "Inspection" : type === "class" ? "Class" : "Consultation"} Request`,
        `Request Ref: ${requestRef}`,
        `Package: ${option.title}`,
        `Customer: ${form.name}`,
        `Phone: ${form.phone}`,
        form.email ? `Email: ${form.email}` : null,
        form.address ? `Address: ${form.address}` : null,
        form.city ? `City: ${form.city}` : null,
        form.state ? `State: ${form.state}` : null,
        form.notes ? `Notes: ${form.notes}` : null,
        `Total: ₦${price.toLocaleString()}`,
        `Payment Proof: ${proofUrl}`,
      ].filter(Boolean);
      const { error } = await invokeEdgeFunction("form-delivery", {
        type: type === "class" ? "class_request" : "consultation_request",
        payload: {
          requestType:
            type === "inspection"
              ? "Inspection Request"
              : type === "class"
                ? "Class Enrollment"
                : "Consultation Request",
          requestRef,
          packageTitle: option.title,
          price,
          clientName: form.name,
          clientEmail: form.email || "",
          clientPhone: form.phone,
          address: form.address || "",
          city: form.city || "",
          state: form.state || "",
          notes: form.notes || "",
          proofUrl: proofUrl || "",
          lines,
        },
      });
      if (error) {
        let message = error.message || "Could not send. Please try again.";
        const body = error.context?.body;
        if (typeof body === "string") {
          try {
            const parsed = JSON.parse(body);
            if (parsed?.error) {
              message = parsed.error;
            }
          } catch {
            if (body) {
              message = body;
            }
          }
        }
        setStatus({
          type: "error",
          message,
        });
        return;
      }
      addRequest({
        id: `request-${Date.now()}`,
        requestNumber,
        requestRef,
        type,
        optionId: option.id,
        optionTitle: option.title,
        price,
        redirectOnly: false,
        status: "Pending",
        customer: {
          name: form.name,
          phone: form.phone,
          email: form.email,
          address: form.address,
          city: form.city,
          state: form.state,
        },
        notes: form.notes,
        proofUrl,
        createdAt: Date.now(),
      });
      upsertCustomer({
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        lastOrderAt: Date.now(),
      });
      setStatus({ type: "idle", message: "" });
      pushToast({
        type: "success",
        message:
          type === "class"
            ? "Request received"
            : "Request received. We will confirm shortly.",
      });
      setForm({
        name: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        notes: "",
      });
      setProof(null);
      setProofName("");
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

  if (!option) {
    return (
      <div className="min-h-screen bg-porcelain text-obsidian">
        <Navbar />
        <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 pb-24 pt-32">
          <h1 className="text-3xl font-semibold">
            This package is not available.
          </h1>
          <p className="text-base text-ash">
            Return to the category list to choose another option.
          </p>
          <NavLink
            to={
              type === "inspection"
                ? "/inspections"
                : type === "class"
                  ? "/classes"
                  : "/advisory"
            }
            className="inline-flex rounded-full bg-obsidian px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-porcelain transition"
          >
            Back to Packages
          </NavLink>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-porcelain text-obsidian">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-24 pt-32">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-ash">
            {type === "inspection"
              ? "On-site Inspection"
              : type === "class"
                ? "Interior Design Class"
                : "Advisory Session"}
          </p>
          <h1 className="text-4xl font-semibold sm:text-5xl">{option.title}</h1>
          <p className="max-w-2xl text-base text-ash sm:text-lg">
            {option.summary}
          </p>
        </div>

        <section className="grid gap-8 rounded-3xl border border-ash/30 bg-porcelain p-8 shadow-[0_24px_40px_rgba(0,0,0,0.06)] lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-ash/30 bg-linen p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-ash">
                {option.redirectOnly ? "Request Submission" : "Bank Transfer"}
              </p>
              {option.redirectOnly ? (
                <div className="mt-4 space-y-2 text-sm text-ash">
                  <p>Submit your details and we will confirm availability.</p>
                </div>
              ) : (
                <div className="mt-4 space-y-2 text-sm text-obsidian">
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
                  <p className="pt-3 text-sm font-semibold text-obsidian">
                    Total: ₦{Number(option.price).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-3 text-sm text-ash">
              <p>
                {option.redirectOnly
                  ? "Provide project details so we can confirm availability."
                  : "Upload your payment proof and we will confirm your request."}
              </p>
              <p>
                For urgent requests, message our studio directly after
                submission.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              value={form.name}
              onChange={(event) => handleFormChange("name", event.target.value)}
              type="text"
              placeholder="Full name"
              required
              className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian focus:border-obsidian focus:outline-none"
            />
            <input
              value={form.phone}
              onChange={(event) =>
                handleFormChange("phone", event.target.value)
              }
              type="tel"
              placeholder="Phone number"
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
            {type !== "class" ? (
              <>
                <input
                  value={form.address}
                  onChange={(event) =>
                    handleFormChange("address", event.target.value)
                  }
                  type="text"
                  placeholder="Project address"
                  required={!option.redirectOnly}
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
              </>
            ) : null}
            <textarea
              value={form.notes}
              onChange={(event) =>
                handleFormChange("notes", event.target.value)
              }
              rows="3"
              placeholder={
                type === "class"
                  ? "Tell us about your goals"
                  : "Tell us about your project"
              }
              required={!option.redirectOnly}
              className="w-full rounded-2xl border border-ash/40 bg-white/70 px-4 py-3 text-sm text-obsidian focus:border-obsidian focus:outline-none"
            />
            {!option.redirectOnly && (
              <div className="rounded-2xl border border-dashed border-ash/40 bg-white/70 px-4 py-4">
                <p className="mb-2 text-xs uppercase tracking-[0.3em] text-ash">
                  Upload proof of payment
                </p>
                <label
                  htmlFor="payment-proof-upload"
                  className="flex w-full cursor-pointer items-center justify-between rounded-2xl border border-ash/40 bg-white/80 px-4 py-3 text-sm text-obsidian"
                >
                  <span>{proofName || "Tap to upload payment proof"}</span>
                  <span className="text-xs uppercase tracking-[0.2em] text-ash">
                    Upload
                  </span>
                </label>
                <input
                  id="payment-proof-upload"
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
            )}
            <button
              type="submit"
              disabled={status.type === "loading"}
              className="w-full rounded-full bg-obsidian px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-porcelain transition disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status.type === "loading"
                ? "Processing..."
                : option.redirectOnly
                  ? "Send Request"
                  : "Confirm Payment"}
            </button>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default ConsultationRequestPage;
