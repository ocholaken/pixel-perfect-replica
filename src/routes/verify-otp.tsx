import { createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ClipboardEvent, FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../lib/supabaseClient";

export const Route = createFileRoute("/verify-otp")({
  validateSearch: (search) => ({ type: search.type === "recovery" ? "recovery" : "signup" }),
  component: VerifyOtp,
});

function VerifyOtp() {
  const navigate = useNavigate();
  const { type } = Route.useSearch();
  const location = useRouterState({ select: (state) => state.location });
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const verifying = useRef(false);

  useEffect(() => {
    const pendingEmail = sessionStorage.getItem("pendingEmail") ?? "";
    setEmail(pendingEmail);
    if (!pendingEmail) setError("Your verification email is missing. Please start again.");
  }, [location.href]);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);

  const verify = async (code: string) => {
    if (!email || code.length !== 6 || verifying.current) return;
    verifying.current = true;
    setLoading(true);
    setError("");
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type,
    });
    setLoading(false);
    verifying.current = false;
    if (verifyError) {
      setError("Wrong code. Try again.");
      setDigits(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
      return;
    }
    setVerified(true);
    toast.success(type === "signup" ? "Account verified!" : "Code verified!");
    window.setTimeout(() => {
      navigate({ to: type === "signup" ? "/login" : "/reset-password", search: type === "signup" ? { verified: true } : undefined });
    }, 1500);
  };

  const updateDigit = (index: number, value: string) => {
    const nextValue = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = nextValue;
    setDigits(next);
    if (nextValue && index < 5) inputs.current[index + 1]?.focus();
    const code = next.join("");
    if (code.length === 6) void verify(code);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) inputs.current[index - 1]?.focus();
  };

  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = Array.from({ length: 6 }, (_, index) => pasted[index] ?? "");
    setDigits(next);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
    if (pasted.length === 6) void verify(pasted);
  };

  const resend = async () => {
    if (seconds > 0 || !email) return;
    const { error: resendError } = await supabase.auth.resend({ email, type: type === "recovery" ? "recovery" : "signup" });
    if (resendError) {
      setError(resendError.message);
      return;
    }
    setSeconds(60);
    toast.success("A new verification code was sent.");
  };

  return (
    <motion.main initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.4 }} className="flex min-h-screen items-center justify-center bg-[#fefaf3] p-4">
      <section className="w-full max-w-[480px] rounded-[32px] border border-[#e8d5b5] bg-white p-8 text-center shadow-[0_25px_80px_rgba(201,168,106,0.18)] md:p-10">
        {verified ? (
          <>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-white"><Check size={34} /></motion.div>
            <h1 className="mt-5 font-serif text-4xl">Verified!</h1>
          </>
        ) : (
          <>
            <p className="mb-5 text-[11px] font-semibold tracking-[0.4em] text-[#c9a86a]">GRACE PATISSERIE</p>
            <h1 className="font-serif text-[42px]">Enter Verification Code</h1>
            <p className="mt-3 text-sm text-[#6b6b6b]">We sent a 6-digit code to {email || "your email"}.</p>
            {error && <div className="mt-5 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</div>}
            <div className="mt-7 flex justify-center gap-2" onPaste={handlePaste}>
              {digits.map((digit, index) => (
                <input key={index} ref={(input) => { inputs.current[index] = input; }} value={digit} inputMode="numeric" autoComplete={index === 0 ? "one-time-code" : "off"} aria-label={`Verification digit ${index + 1}`} maxLength={1} disabled={loading} onChange={(event) => updateDigit(index, event.target.value)} onKeyDown={(event) => handleKeyDown(index, event)} onFocus={(event) => event.currentTarget.select()} className="h-14 w-11 rounded-[12px] border border-[#d4b77a]/60 text-center text-xl font-semibold outline-none focus:border-[#c9a86a] focus:ring-4 focus:ring-[#c9a86a]/10" />
              ))}
            </div>
            <button type="button" disabled={seconds > 0} onClick={resend} className="mt-6 text-sm font-medium text-[#c9a86a] disabled:text-gray-400">{seconds > 0 ? `Resend code in ${seconds}s` : "Resend code"}</button>
          </>
        )}
      </section>
    </motion.main>
  );
}
