import { useCallback, useMemo, useState } from "react";
import { ToastContext } from "./useToast.js";

const getToastStyle = (type) => {
  if (type === "success") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (type === "error") {
    return "border-red-200 bg-red-50 text-red-700";
  }
  return "border-ash/30 bg-porcelain text-ash";
};

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    ({ message, type = "info", duration = 4000 }) => {
      const id = `${Date.now()}-${Math.round(Math.random() * 100000)}`;
      const next = { id, message, type };
      setToasts((prev) => {
        const hasMatch = prev.some(
          (toast) => toast.message === message && toast.type === type,
        );
        if (hasMatch) return prev;
        return [...prev, next];
      });
      if (duration > 0) {
        window.setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast],
  );

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex w-full max-w-xs flex-col gap-3 sm:right-6 sm:top-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-2xl border px-4 py-3 text-sm shadow-[0_18px_40px_rgba(15,15,15,0.12)] ${getToastStyle(
              toast.type,
            )}`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
