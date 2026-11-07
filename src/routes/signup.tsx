import { createFileRoute, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "../lib/supabaseClient";

export const Route = createFileRoute("/signup")({ component: SignUp });

function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [authNotice, setAuthNotice] = useState<{ kind: "error" | "success"; message: string; login?: boolean } | null>(null);
  const [phoneHint, setPhoneHint] = useState("");
  const navigate = useNavigate();
  const location = useRouterState({ select: (state) => state.location });
  const from = (location.state as { from?: { pathname?: string; href?: string } } | undefined)?.from;
  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setAuthNotice(null);
    setErrors({});
    try {
      const cleanEmail = String(email || "").trim().toLowerCase();
      const cleanName = String(fullName || "").trim();
      const cleanPassword = String(password || "");
      const cleanConfirmation = String(confirmPassword || "");
      const rawPhone = String(phone || "").trim();
      const nextErrors: Record<string, string> = {};

      if (!cleanName || cleanName.length < 3) nextErrors.name = "Enter your full name (at least 3 letters)";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) nextErrors.email = "Enter a valid email";
      if (cleanPassword.length < 8) nextErrors.password = "Password must be 8+ characters";
      if (cleanPassword !== cleanConfirmation) nextErrors.confirmation = "Passwords do not match";

      let cleanedPhone = rawPhone;
      if (/[@.]|\.com$/i.test(rawPhone)) {
        nextErrors.phone = "Phone cannot be an email — enter a real phone number";
        cleanedPhone = "";
      } else {
        if (/^[oO]/.test(cleanedPhone)) {
          cleanedPhone = cleanedPhone.slice(1);
          setPhoneHint("Did you mean 0740...? Fixed for you");
        }
        cleanedPhone = cleanedPhone.replace(/\D/g, "");
        if (cleanedPhone.startsWith("254")) cleanedPhone = `+${cleanedPhone}`;
        else if (cleanedPhone.startsWith("0")) cleanedPhone = `+254${cleanedPhone.slice(1)}`;
        else if (cleanedPhone.startsWith("7") || cleanedPhone.startsWith("1")) cleanedPhone = `+254${cleanedPhone}`;
        if (!/^\+?\d{10,15}$/.test(cleanedPhone)) nextErrors.phone = "Add a real phone number — 10 digits, e.g. 0740381046";
      }
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return;

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: { data: { full_name: cleanName } },
      });
      if (error) {
        const message = `${error.message ?? ""} ${(error as { code?: string }).code ?? ""}`.toLowerCase();
        if (message.includes("already exists") || message.includes("already registered") || message.includes("user_already_exists") || (error as { status?: number }).status === 422) {
          const notice = "This email already has an atelier account — please Welcome Back and sign in";
          setAuthNotice({ kind: "error", message: notice, login: true });
          toast.error(notice);
        } else if (message.includes("rate limit") || message.includes("exceeded")) {
          toast.error("Too many attempts. Please wait before trying again.");
        } else {
          setAuthNotice({ kind: "error", message: error.message });
          toast.error(error.message);
        }
        return;
      }

      if (data.user && data.user.identities?.length === 0) {
        const notice = "This email already has an account. Please login instead.";
        setAuthNotice({ kind: "error", message: notice, login: true });
        toast.error(notice);
        window.setTimeout(() => navigate({ to: "/login", search: { exists: true } }), 1200);
        return;
      }

      if (!data.user) {
        setAuthNotice({ kind: "error", message: "We could not create your account. Please try again." });
        return;
      }

      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").upsert([{
          id: data.user.id,
          email: cleanEmail,
          full_name: cleanName,
          phone: cleanedPhone,
          role: "customer",
        }], { onConflict: "id" });
        if (profileError) console.error("Profile creation failed:", profileError);
      }

      sessionStorage.setItem("pendingEmail", cleanEmail);
      sessionStorage.setItem("pendingName", cleanName);
      toast.success("Account created! Please login.");
      navigate({ to: "/login", search: { created: true } });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setAuthNotice({ kind: "error", message: `Error: ${message}` });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = "w-full bg-[#fefaf3] text-black placeholder:text-gray-400 border border-[#e8d5b5] focus:border-[#c9a86a] focus:ring-4 focus:ring-[#c9a86a]/10 rounded-[14px] pl-12 pr-4 py-3.5 text-[15px] outline-none transition-all";

  if (success) return (
    <main className="min-h-screen bg-[#fefaf3] flex items-center justify-center p-4">
      <section className="w-full max-w-[560px] rounded-[24px] border border-[#e8d5b5] bg-white px-8 py-12 text-center shadow-[0_25px_80px_rgba(201,168,106,0.18)]" role="status">
        <p className="mb-5 text-[11px] font-semibold tracking-[0.4em] text-[#c9a86a]">SWEET SERENITY</p>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#c9a86a] text-3xl text-white shadow-[0_12px_30px_rgba(201,168,106,0.35)]">✓</div>
        <h1 className="mt-5 font-serif text-[42px] text-black">Welcome to the Atelier</h1>
        <p className="mt-2 text-sm text-[#6b6b6b]">Your account is crafted. Please sign in.</p>
        <div className="mt-5 rounded-[14px] border border-green-200 bg-green-50 px-4 py-3 font-medium text-green-700">Account created successfully! Please sign in to continue.</div>
      </section>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#fefaf3] flex items-center justify-center p-4 py-12 relative overflow-hidden">
      <div className="absolute top-[-50px] right-[-50px] w-[400px] h-[400px] rounded-full bg-[#c9a86a]/20 blur-[80px]" />
      <div className="absolute top-[12%] right-[9%] w-20 h-20 rounded-full bg-[#c9a86a]/20 blur-sm" />
      <div className="absolute bottom-[18%] left-[10%] w-32 h-32 rounded-full bg-[#f9e8c9] border border-[#c9a86a]/20" />

      <form onSubmit={submit} noValidate className="relative w-full max-w-[560px] bg-white border border-[#e8d5b5] rounded-[24px] shadow-[0_25px_80px_rgba(201,168,106,0.18)] p-8 md:p-10">
        <p className="text-center text-[11px] tracking-[0.4em] text-[#c9a86a] font-semibold mb-5">SWEET SERENITY</p>
        <h1 className="font-serif text-[42px] font-normal text-black text-center leading-none tracking-tight">Join the Atelier</h1>
        <p className="text-center text-[14px] text-[#6b6b6b] mt-3">Create your account for a sweeter experience</p>
        <div className="mx-auto mt-5 w-16 h-px bg-[#c9a86a]/50" />

        {authNotice && <div className="mt-6 rounded-[14px] border border-[#e8d5b5] bg-[#fefaf3] px-4 py-3 text-center text-sm text-black" role="alert"><p>{authNotice.message}</p>{authNotice.login && <Link to="/account" className="inline-block mt-3 font-medium text-[#c9a86a] underline underline-offset-4">Go to Login</Link>}</div>}
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="block text-center text-[11px] tracking-[0.15em] font-bold text-black uppercase mb-2.5">Full Name</span>
            <span className="relative block"><User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#c9a86a]/60" /><input name="name" autoComplete="name" aria-describedby="name-error" value={fullName} onChange={(event) => setFullName(event.target.value)} className={`${fieldClass} ${errors.name ? "border-red-300" : ""}`} placeholder="Your full name" /></span>
            {errors.name && <span id="name-error" className="block mt-2 text-center text-sm text-black">{errors.name}</span>}
          </label>
          <label>
            <span className="block text-center text-[11px] tracking-[0.15em] font-bold text-black uppercase mb-2.5">Email</span>
            <span className="relative block"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#c9a86a]/60" /><input name="email" type="email" autoComplete="email" aria-describedby="email-error" value={email} onChange={(event) => setEmail(event.target.value)} className={`${fieldClass} ${errors.email ? "border-red-300" : ""}`} placeholder="you@email.com" /></span>
            {errors.email && <span id="email-error" className="block mt-2 text-center text-sm text-black">{errors.email}</span>}
          </label>
          <label>
            <span className="block text-center text-[11px] tracking-[0.15em] font-bold text-black uppercase mb-2.5">Phone</span>
            <span className="relative block"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#c9a86a]/60" /><input name="phone" type="tel" autoComplete="tel" aria-describedby="phone-error" value={phone} onChange={(event) => setPhone(event.target.value)} className={`${fieldClass} ${errors.phone ? "border-red-300" : ""}`} placeholder="+254 740 381 046" /></span>
            {phoneHint && <span className="block mt-2 text-center text-xs text-[#c9a86a]">{phoneHint}</span>}
            {errors.phone && <span id="phone-error" className="block mt-2 text-center text-sm text-black">{errors.phone}</span>}
          </label>
          <label>
            <span className="block text-center text-[11px] tracking-[0.15em] font-bold text-black uppercase mb-2.5">Password</span>
            <span className="relative block"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#c9a86a]/60" /><input name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} aria-describedby="password-feedback password-error" className={`${fieldClass} pr-12 ${errors.password ? "border-red-300" : ""}`} placeholder="••••••••" /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c9a86a]" onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></span>
            {password && <div id="password-feedback" className="mt-2 text-center text-xs text-[#c9a86a]">{strength <= 1 ? "Weak" : strength <= 2 ? "Fair" : strength === 3 ? "Good" : "Strong"} password</div>}
            {errors.password && <span id="password-error" className="block mt-2 text-center text-sm text-black">{errors.password}</span>}
          </label>
          <label>
            <span className="block text-center text-[11px] tracking-[0.15em] font-bold text-black uppercase mb-2.5">Confirm Password</span>
            <span className="relative block"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#c9a86a]/60" /><input name="confirmation" type={showConfirmation ? "text" : "password"} autoComplete="new-password" aria-describedby="confirmation-error" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className={`${fieldClass} pr-12 ${errors.confirmation ? "border-red-300" : ""}`} placeholder="••••••••" /><button type="button" aria-label={showConfirmation ? "Hide confirmed password" : "Show confirmed password"} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c9a86a]" onClick={() => setShowConfirmation(value => !value)}>{showConfirmation ? <EyeOff size={19} /> : <Eye size={19} />}</button></span>
            {errors.confirmation && <span id="confirmation-error" className="block mt-2 text-center text-sm text-black">{errors.confirmation}</span>}
          </label>
        </div>
        <button className="mt-7 w-full h-[52px] rounded-full bg-[#c9a86a] text-white font-serif text-[15px] tracking-[0.15em] shadow-[0_10px_25px_rgba(201,168,106,0.35)] transition-all duration-300 hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-70" disabled={loading} type="submit">{loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}</button>
        <p className="mt-6 text-center text-[14px] text-black">Already have an account? <Link to="/account" className="font-medium text-[#c9a86a] underline decoration-[#c9a86a] underline-offset-4">Sign In</Link></p>
      </form>
    </main>
  );
}
