import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../lib/supabaseClient";

export const Route = createFileRoute("/reset-password")({ component: ResetPassword });

function ResetPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmation") ?? "");
    if (password.length < 8) {
      setError("Password needs 8+ characters");
      return;
    }
    if (password !== confirmation) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      toast.error(updateError.message);
      return;
    }
    toast.success("Password updated successfully");
    navigate({ to: "/login", search: { reset: true } });
  };

  const inputClass = "w-full rounded-[14px] border border-[#d4b77a]/60 bg-white py-3.5 pl-12 pr-12 text-[15px] outline-none transition-all focus:border-[#c9a86a] focus:ring-4 focus:ring-[#c9a86a]/10";
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fefaf3] p-4">
      <form onSubmit={submit} className="w-full max-w-[480px] rounded-[32px] border border-[#e8d5b5] border-t-[3px] border-t-[#c9a86a] bg-white p-8 shadow-[0_25px_80px_rgba(201,168,106,0.18)] md:p-10">
        <p className="mb-5 text-center text-[11px] font-semibold tracking-[0.4em] text-[#c9a86a]">SWEET SERENITY</p>
        <h1 className="text-center font-serif text-[42px] text-black">Reset Password</h1>
        {error && <div className="mt-6 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700" role="alert">{error}</div>}
        <div className="mt-8 space-y-5">
          <label><span className="mb-2.5 block text-center text-[11px] font-bold tracking-[0.15em]">NEW PASSWORD</span><span className="relative block"><Lock className="absolute left-4 top-1/2 w-5 -translate-y-1/2 text-[#c9a86a]/60" /><input name="password" type={showPassword ? "text" : "password"} className={inputClass} placeholder="••••••••" /><button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c9a86a]" onClick={() => setShowPassword((value) => !value)} aria-label="Show password">{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></span></label>
          <label><span className="mb-2.5 block text-center text-[11px] font-bold tracking-[0.15em]">CONFIRM PASSWORD</span><span className="relative block"><Lock className="absolute left-4 top-1/2 w-5 -translate-y-1/2 text-[#c9a86a]/60" /><input name="confirmation" type={showPassword ? "text" : "password"} className={inputClass} placeholder="••••••••" /></span></label>
          <button type="submit" disabled={loading} className="h-[52px] w-full rounded-full bg-[#c9a86a] font-serif tracking-[0.15em] text-white shadow-[0_10px_25px_rgba(201,168,106,0.35)] disabled:opacity-70">{loading ? "UPDATING..." : "UPDATE PASSWORD"}</button>
        </div>
      </form>
    </main>
  );
}
