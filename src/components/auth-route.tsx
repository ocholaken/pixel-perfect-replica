import { Navigate, useRouterState } from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useRouterState({ select: (state) => state.location });
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setAuthenticated(Boolean(data.session?.user));
        setLoading(false);
      }
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setAuthenticated(Boolean(session?.user));
        setLoading(false);
      }
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-[#fefaf3]" role="status">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#e8d5b5] border-t-[#c9a86a]" />
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/account" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
