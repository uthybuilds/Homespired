import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import supabase from "../utils/supabaseClient.js";

function RequireAuth({ children, allowedEmails = [], disallowedEmails = [] }) {
  const bypassAuth = import.meta.env.VITE_E2E_BYPASS_AUTH === "true";
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(!bypassAuth);
  const location = useLocation();

  useEffect(() => {
    if (bypassAuth) {
      return undefined;
    }
    let isActive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!isActive) return;
      setSession(data.session);
      setIsLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isActive) return;
      setSession(nextSession);
      setIsLoading(false);
    });
    return () => {
      isActive = false;
      data.subscription.unsubscribe();
    };
  }, [bypassAuth]);

  if (bypassAuth) {
    return children;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-porcelain text-obsidian">
        <p className="text-sm uppercase tracking-[0.3em] text-ash">
          Loading session
        </p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (allowedEmails.length > 0) {
    const userEmail = session.user?.email?.toLowerCase() || "";
    const isAllowed = allowedEmails.some(
      (email) => email.toLowerCase() === userEmail,
    );
    if (!isAllowed) {
      return <Navigate to="/" replace />;
    }
  }
  if (disallowedEmails.length > 0) {
    const userEmail = session.user?.email?.toLowerCase() || "";
    const isDisallowed = disallowedEmails.some(
      (email) => email.toLowerCase() === userEmail,
    );
    if (isDisallowed) {
      return <Navigate to="/admin" replace />;
    }
  }

  return children;
}

export default RequireAuth;
