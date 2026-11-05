import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { Mail } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export const Route = createFileRoute("/forgot-password")({ component: ForgotPassword });

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const cleanEmail = email.trim().toLowerCase();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(cleanEmail);
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    sessionStorage.setItem("pendingEmail", cleanEmail);
    navigate({ to: "/verify-otp", search: { type: "recovery" } });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fefaf3] p-4">
      <form onSubmit={submit} className="w-full max-w-[480px] rounded-[32px] border border-[#e8d5b5] bg-white p-8 text-center shadow-[0_25px_80px_rgba(201,168,106,0.18)] md:p-10">
        <p className="mb-5 text-[11px] font-semibold tracking-[0.4em] text-[#c9a86a]">GRACE PATISSERIE</p>
        <h1 className="font-serif text-[42px]">Forgot Password</h1>
        <p className="mt-3 text-sm text-[#6b6b6b]">Enter your email to receive a 6-digit recovery code.</p>
        {error && <div className="mt-5 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</div>}
        <label className="mt-8 block">
          <span className="mb-2.5 block text-[11px] font-bold tracking-[0.15em]">EMAIL</span>
          <span className="relative block"><Mail className="absolute left-4 top-1/2 w-5 -translate-y-1/2 text-[#c9a86a]/60" /><input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-[14px] border border-[#d4b77a]/60 py-3.5 pl-12 pr-4 outline-none focus:border-[#c9a86a] focus:ring-4 focus:ring-[#c9a86a]/10" placeholder="you@email.com" /></span>
        </label>
        <button disabled={loading} className="mt-7 h-[52px] w-full rounded-full bg-[#c9a86a] font-serif tracking-[0.15em] text-white shadow-[0_10px_25px_rgba(201,168,106,0.35)] disabled:opacity-70" type="submit">{loading ? "SENDING..." : "SEND CODE"}</button>
      </form>
    </main>
  );
}
